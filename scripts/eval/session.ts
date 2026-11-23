// One turn of a rerun, driven through the Agent SDK instead of `claude -p`. A headless `claude -p` session has
// no AskUserQuestion tool, so the flow skips its setup picker and its storyline question. Through the SDK the
// tool is there, and each call comes to the handler below, which answers it from the answer list
// (questions.json) the way the tool's own picker would. The plugin, the prompt, Claude Code's own system
// prompt and the tool lists are the ones a person's session gets: nothing tells the flow it is under test.

import { appendFileSync, writeFileSync } from 'node:fs'
import { query, type Options, type PermissionResult } from '@anthropic-ai/claude-agent-sdk'
import { answersFor, type AnswerRule } from './answers'
import { ANSWER_EVENT, ASK_TOOL, TURN_START_EVENT, findPage, parseConnectorList, parseStream, summarizeTurn, type Declined, type Event, type Turn } from './lib'

/** What the session is told when the harness leaves a picker unanswered. */
const WHY: Record<Declined, string> = { finished: 'the run had finished', limit: 'the harness had answered its limit of pickers' }

export type TurnOptions = {
  prompt: string
  cwd: string
  /** The turn's transcript: one JSON line per message of the session, plus one line per picker answered. */
  out: string
  timeoutMin: number
  resume: string | null
  plugin: string
  /** A connector file to load in place of every other connector. It holds the token, so it goes by path. */
  mcpConfig: string | null
  allowedTools: string[]
  disallowedTools: string[]
  model: string | null
  answers: AnswerRule[]
  /** Pickers this turn may still answer before the harness stops it. */
  maxAsks: number
  /**
   * When the run has what it came for, from the transcript so far. The next picker after that is left
   * unanswered and ends the turn. Without it, the run is done once it has published its page.
   */
  isDone?: (events: Event[]) => boolean
  /** Adds the time each line arrived (`_t`, milliseconds) and a first line marking when the turn started. */
  stamp?: boolean
}

/**
 * Runs one turn and returns it as the transcript reader sees it. The handler answers a picker while the run
 * is still working toward its page. Once a page is published, or an agent has returned its result with a page
 * file, the next picker is the flow's offer of more work: the handler leaves it unanswered and ends the turn there.
 */
export async function runTurn(options: TurnOptions): Promise<Turn> {
  const events: Event[] = []
  const record = (event: Event) => {
    if (options.stamp) event = { ...event, _t: Date.now() }
    events.push(event)
    appendFileSync(options.out, JSON.stringify(event) + '\n')
  }
  writeFileSync(options.out, '')
  writeFileSync(`${options.out}.err`, '')
  if (options.stamp) record({ type: TURN_START_EVENT })
  let asks = 0
  // Whether the run has its page. It is worked out from the transcript at a picker, and it stays true once it is.
  let done = false

  const canUseTool = async (name: string, input: Record<string, unknown>, context: { toolUseID: string }): Promise<PermissionResult> => {
    // Only the picker comes here to be answered. Any other tool that reaches the handler is one the tool
    // lists did not allow, which `claude -p` refuses without asking.
    if (name !== ASK_TOOL) return { behavior: 'deny', message: 'This tool is not allowed in an eval rerun.' }
    // A packet with no page is not the end: its proposals and questions still stand between the run and its page.
    if (!done && options.isDone) done = options.isDone(events)
    else if (!done) {
      const page = findPage(summarizeTurn(events))
      done = Boolean(page.link) || (page.finished && Boolean(page.file))
    }
    const declined: Declined | null = done ? 'finished' : asks >= options.maxAsks ? 'limit' : null
    if (declined) {
      record({ type: ANSWER_EVENT, tool_use_id: context.toolUseID, declined })
      return { behavior: 'deny', message: `The eval run ends here: ${WHY[declined]}.`, interrupt: true }
    }
    asks += 1
    const answers = answersFor(input, options.answers)
    record({ type: ANSWER_EVENT, tool_use_id: context.toolUseID, answers })
    return {
      behavior: 'allow',
      updatedInput: { ...input, answers: Object.fromEntries(Object.entries(answers).map(([question, given]) => [question, given.answer])) },
    }
  }

  const abort = new AbortController()
  const timer = setTimeout(() => abort.abort(), options.timeoutMin * 60_000)
  const sdkOptions: Options = {
    cwd: options.cwd,
    abortController: abort,
    // The `claude` on the PATH, so the reruns and the grading sessions run the same Claude Code.
    pathToClaudeCodeExecutable: Bun.which('claude') ?? undefined,
    // Claude Code's own system prompt, as `claude -p` and a person's session have it. Left out, the SDK sends none.
    systemPrompt: { type: 'preset', preset: 'claude_code' },
    plugins: [{ type: 'local', path: options.plugin }],
    permissionMode: 'acceptEdits',
    allowedTools: options.allowedTools,
    disallowedTools: options.disallowedTools,
    // The connector file goes as a path: the SDK's own `mcpServers` would put the token on the command line.
    extraArgs: options.mcpConfig ? { 'strict-mcp-config': null, 'mcp-config': options.mcpConfig } : {},
    stderr: data => appendFileSync(`${options.out}.err`, data),
    canUseTool,
    ...(options.resume ? { resume: options.resume } : {}),
    ...(options.model ? { model: options.model } : {}),
  }
  try {
    for await (const message of query({ prompt: options.prompt, options: sdkOptions })) record(message as Event)
  } catch (error) {
    // A turn that timed out, or that the handler ended at a picker, stops here. What was recorded still counts.
    appendFileSync(`${options.out}.err`, `\n${error instanceof Error ? error.message : String(error)}\n`)
  } finally {
    clearTimeout(timer)
  }
  return summarizeTurn(events)
}

/**
 * Every connector and tool a rerun would start with, by name. `claude mcp list` covers the ones added to Claude Code;
 * the ones that come with the signed-in account only show when a session starts, so a session is started and
 * stopped at its first line, before it asks the model anything.
 */
export async function startingSession(cwd: string, plugin: string): Promise<{ connectors: string[]; tools: string[] }> {
  const names = new Set(parseConnectorList(Bun.spawnSync(['claude', 'mcp', 'list'], { cwd }).stdout.toString()))
  const child = Bun.spawn(['claude', '-p', '--output-format', 'stream-json', '--verbose', '--plugin-dir', plugin], {
    cwd, stdin: new Blob(['ok']), stdout: 'pipe', stderr: 'ignore',
  })
  const timer = setTimeout(() => child.kill(), 60_000)
  let seen = ''
  let tools: string[] = []
  for await (const chunk of child.stdout) {
    seen += new TextDecoder().decode(chunk)
    const init = parseStream(seen).find(event => event.type === 'system' && event.subtype === 'init')
    if (!init) continue
    for (const server of init.mcp_servers ?? []) names.add(server.name)
    tools = init.tools ?? []
    break
  }
  clearTimeout(timer)
  child.kill()
  return { connectors: [...names], tools }
}
