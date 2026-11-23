#!/usr/bin/env bun
// bun run eval:first-run: play each first-run scenario through the plugin in this checkout, as a new person would,
// and measure the way to the first result. How it works, what it needs, and what it never does:
// scripts/eval/first-run/README.md.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { ATLAS_READS, fill, parseStream, toolPrefix } from '../lib'
import { runTurn, startingSession, type TurnOptions } from '../session'
import type { AnswerRule } from '../answers'
import {
  FIRST_RUN_HARNESS_VERSION, FIRST_RUN_REFUSED, FIRST_RUN_WRITES, compareRuns, creditsUsed, forBaseline, measure, reachedValue,
  readStatus, renderRun, startProblems, type FirstRunResults, type ScenarioResult, type Start, type StatusRead,
} from './lib'

const HERE = import.meta.dir
const ROOT = resolve(HERE, '../../..')
const PLUGIN = join(ROOT, 'plugins/aspire')
const RUNS = join(HERE, '.runs')
const BASELINES = join(HERE, 'baselines')

const USAGE = `bun run eval:first-run --label <before|after|name> [options]

  --label <name>           What the run measures, such as before or after (required for a run)
  --only <code[,code]>     Run only these scenarios (FR1 to FR7)
  --model <model>          Model for the scenarios (default: the CLI's own default). Run once per model.
  --probe-model <model>    Model for the get_status readings before and after each scenario (default: haiku)
  --baseline               Store the results under scripts/eval/first-run/baselines/<date>-<label>-<model>/
  --compare <a> <b>        Print before and after for two runs or baselines, and run nothing
  --max-rounds <n>         Replies the harness will type before it gives up on value (default: 6)
  --max-asks <n>           Pickers the harness will answer in one scenario (default: 20)
  --timeout-min <n>        Minutes one turn may take (default: 30)
  --out <dir>              Keep the run in this folder instead of a new one under scripts/eval/first-run/.runs/
  --dry-run                Print what would run, and run nothing`

type Scenario = {
  code: string; persona: string; flow: string; start: Start; firstMessage: string; reply: string; answers?: AnswerRule[]
}
type Config = { version: string; valueTools: string[]; answers: AnswerRule[]; scenarios: Scenario[] }
type ScenarioLocal = { organization?: string; brand?: string; website?: string; handle?: string; competitor?: string }
type Local = { mcp?: { url: string; name?: string; tokenEnv?: string }; scenarios?: Record<string, ScenarioLocal> }
type Options = {
  label: string | null; only: string[] | null; model: string | null; probeModel: string; baseline: boolean
  compare: [string, string] | null; maxRounds: number; maxAsks: number; timeoutMin: number; out: string | null; dryRun: boolean
}

function fail(message: string): never {
  console.error(`eval:first-run: ${message}`)
  process.exit(2)
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    label: null, only: null, model: null, probeModel: 'haiku', baseline: false, compare: null,
    maxRounds: 6, maxAsks: 20, timeoutMin: 30, out: null, dryRun: false,
  }
  const value = (i: number, flag: string) => (argv[i] && !argv[i].startsWith('--') ? argv[i] : fail(`${flag} needs a value`))
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i]
    if (flag === '--help' || flag === '-h') {
      console.log(USAGE)
      process.exit(0)
    } else if (flag === '--label') options.label = value(++i, flag)
    else if (flag === '--only') options.only = value(++i, flag).split(',').map(code => code.trim().toUpperCase())
    else if (flag === '--model') options.model = value(++i, flag)
    else if (flag === '--probe-model') options.probeModel = value(++i, flag)
    else if (flag === '--baseline') options.baseline = true
    else if (flag === '--compare') options.compare = [value(++i, flag), value(++i, flag)]
    else if (flag === '--max-rounds') options.maxRounds = Number(value(++i, flag))
    else if (flag === '--max-asks') options.maxAsks = Number(value(++i, flag))
    else if (flag === '--timeout-min') options.timeoutMin = Number(value(++i, flag))
    else if (flag === '--out') options.out = resolve(value(++i, flag))
    else if (flag === '--dry-run') options.dryRun = true
    else fail(`unknown option ${flag}\n\n${USAGE}`)
  }
  if (!Number.isInteger(options.maxRounds) || options.maxRounds < 0) fail('--max-rounds takes a whole number')
  if (!Number.isInteger(options.maxAsks) || options.maxAsks < 0) fail('--max-asks takes a whole number')
  if (!(options.timeoutMin > 0)) fail('--timeout-min takes a number of minutes')
  if (!options.compare && !options.dryRun && !options.label) fail('--label is required: say what the run measures, such as before or after')
  if (options.label && !/^[a-z0-9-]+$/i.test(options.label)) fail('--label takes letters, digits and hyphens')
  return options
}

const today = () => new Date().toISOString().slice(0, 10)
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'z').toLowerCase()
const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'))

function commit(): string {
  const git = (...args: string[]) => {
    const run = Bun.spawnSync(['git', '-C', ROOT, ...args])
    return run.exitCode === 0 ? run.stdout.toString().trim() : ''
  }
  const head = git('rev-parse', 'HEAD') || 'unknown'
  return git('status', '--porcelain', '--', 'plugins') ? `${head}+changes` : head
}

function resolveRun(name: string): FirstRunResults {
  const latest = name === 'latest' && existsSync(RUNS) ? join(RUNS, readdirSync(RUNS).sort().at(-1) ?? '', 'results.json') : ''
  const candidates = [latest, join(BASELINES, name, 'results.json'), join(RUNS, name, 'results.json'), join(name, 'results.json'), name]
  const path = candidates.find(candidate => candidate && existsSync(candidate) && statSync(candidate).isFile())
  return path ? readJson(path) : fail(`no run or baseline named "${name}"`)
}

/** What every turn of a run is started with (session.ts), less the prompt, the transcript file and the session to resume. */
type Session = Omit<TurnOptions, 'prompt' | 'out' | 'resume' | 'maxAsks'>

/**
 * One reading of the test organization: `get_status` and nothing else, on a small model. It runs in its own session,
 * so the scenario's transcript, time and tokens hold none of it.
 */
async function probe(session: Session, atlas: string, organization: string | undefined, out: string, model: string): Promise<StatusRead | null> {
  const prompt = [
    `Call the ${atlas}get_status tool.`,
    ...(organization ? [`If the organization it selected is not the one named "${organization}", call it again with that organization's id as asOrganizationId.`] : []),
    'Then reply with only the word DONE. Do not call any other tool.',
  ].join(' ')
  const turn = await runTurn({
    ...session, allowedTools: [atlas + 'get_status'], answers: [], model, prompt, out, resume: null, maxAsks: 0,
  })
  const reads = turn.toolUses.filter(use => use.name === atlas + 'get_status').map(use => readStatus(turn.toolResults[use.id]?.text ?? ''))
  return reads.filter((read): read is StatusRead => read !== null).at(-1) ?? null
}

async function runScenario(scenario: Scenario, config: Config, local: Local, session: Session, atlas: string, dir: string, options: Options): Promise<ScenarioResult> {
  mkdirSync(dir, { recursive: true })
  const values = local.scenarios?.[scenario.code] ?? {}
  const base: ScenarioResult = { code: scenario.code, persona: scenario.persona, flow: scenario.flow, metrics: null, credits: null, problems: [] }

  console.error(`  ${scenario.code}: reading the starting state`)
  const before = await probe(session, atlas, values.organization, join(dir, 'probe-before.jsonl'), options.probeModel)
  const problems = startProblems(scenario.start, before)
  if (problems.length) return { ...base, problems: problems.map(problem => `not run: ${problem}`) }

  // This scenario's own answers come before the shared list.
  const answers = [...(scenario.answers ?? []), ...config.answers]
  const isDone = (events: Parameters<typeof reachedValue>[0]) => reachedValue(events, config.valueTools, atlas)
  const organization = values.organization ? ` Use the ${values.organization} organization.` : ''
  let prompt = scenario.firstMessage + organization
  let resume: string | null = null
  let asked = 0
  const files: string[] = []
  for (let replies = 0; ; replies++) {
    console.error(`  ${scenario.code}: turn ${replies + 1}`)
    const out = join(dir, `turn-${replies + 1}.jsonl`)
    files.push(out)
    const turn = await runTurn({
      ...session, answers, prompt, out, resume, isDone, stamp: true, maxAsks: Math.max(0, options.maxAsks - asked),
    })
    asked += turn.asks.filter(ask => ask.questions.some(question => question.answer !== null)).length
    resume = turn.sessionId ?? resume
    if (isDone(parseStream(readFileSync(out, 'utf8')))) break
    const declined = turn.asks.find(ask => ask.declined)?.declined
    if (declined === 'limit') {
      base.problems.push(`No value after ${options.maxAsks} pickers`)
      break
    }
    if (turn.failed || !resume) {
      base.problems.push(`The run stopped on turn ${replies + 1} before any value`)
      break
    }
    if (replies >= options.maxRounds) {
      base.problems.push(`No value after ${replies} typed replies`)
      break
    }
    prompt = fill(scenario.reply, values as Record<string, string>)
  }
  const metrics = measure(files.map(file => parseStream(readFileSync(file, 'utf8'))), config.valueTools, atlas)

  console.error(`  ${scenario.code}: reading the credits used`)
  const after = await probe(session, atlas, values.organization, join(dir, 'probe-after.jsonl'), options.probeModel)
  const credits = creditsUsed(before, after)
  if (credits === null) base.problems.push('Credits not measured: get_status gave no reading before and after')
  return { ...base, metrics, credits }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.compare) {
    process.stdout.write(compareRuns(resolveRun(options.compare[0]), resolveRun(options.compare[1])))
    return
  }
  const config: Config = readJson(join(HERE, 'personas.json'))
  const unknown = (options.only ?? []).filter(code => !config.scenarios.some(scenario => scenario.code === code))
  if (unknown.length) fail(`no scenario with code ${unknown.join(', ')}`)
  const chosen = config.scenarios.filter(scenario => !options.only || options.only.includes(scenario.code))

  const localPath = join(HERE, 'local.json')
  const local: Local = existsSync(localPath) ? readJson(localPath) : {}
  const connector = local.mcp?.name ?? 'Aspire Atlas'
  const atlas = toolPrefix(connector)
  if (options.dryRun) {
    for (const scenario of chosen) {
      const values = local.scenarios?.[scenario.code] ?? {}
      console.log(`${scenario.code} · ${scenario.persona} · starts with ${scenario.start.profile ? 'a brand Profile' : 'no brand Profile'}, ${scenario.start.instagram ? 'Instagram linked' : 'no Instagram link'}`)
      console.log(`  first message: ${scenario.firstMessage}${values.organization ? ` Use the ${values.organization} organization.` : ''}`)
      console.log(`  typed reply: ${fill(scenario.reply, values as Record<string, string>)}`)
    }
    console.log(`plugin: ${PLUGIN} at ${commit()}`)
    console.log(`Atlas: ${local.mcp?.url ?? 'not set in local.json'} as "${connector}"; value is the first result of ${config.valueTools.join(', ')}`)
    console.log(`${ATLAS_READS.length} reads and ${FIRST_RUN_WRITES.length} onboarding writes allowed; refused: ${FIRST_RUN_REFUSED.join(', ')}`)
    return
  }
  if (!existsSync(localPath)) fail('scripts/eval/first-run/local.json is missing. Copy local.example.json and fill it in (README.md).')
  if (!local.mcp?.url) fail('local.json needs mcp.url')
  const missing = chosen.filter(scenario => !local.scenarios?.[scenario.code]?.organization).map(scenario => scenario.code)
  if (missing.length) fail(`local.json names no test organization for ${missing.join(', ')}`)
  const token = local.mcp.tokenEnv ? process.env[local.mcp.tokenEnv] ?? fail(`set ${local.mcp.tokenEnv} to a token for the test organizations`) : ''

  const runDir = options.out ?? join(RUNS, stamp())
  mkdirSync(runDir, { recursive: true })
  // The connector file sits outside the checkout and is removed when the run ends: it holds the token.
  const secrets = join(tmpdir(), `eval-first-run-${process.pid}`)
  mkdirSync(secrets, { recursive: true, mode: 0o700 })
  const atlasMcp = join(secrets, 'atlas.json')
  writeFileSync(atlasMcp, JSON.stringify({ mcpServers: { [connector]: { type: 'http', url: local.mcp.url, ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}) } } }), { mode: 0o600 })

  // As in the page eval, the plugin's bundled connectors and every other connector on this machine are refused
  // whole, so a scenario reaches the test connector and nothing else.
  const work = join(runDir, 'work')
  mkdirSync(work, { recursive: true })
  const starting = await startingSession(work, PLUGIN)
  const refused = [...new Set(['plugin:aspire:Aspire Atlas', 'plugin:aspire:Aspire Atlas Organization Admin', 'plugin:aspire:Meta Ads',
    'Aspire Atlas', 'Aspire Atlas Organization Admin', 'claude.ai Aspire Atlas', ...starting.connectors])]
    .filter(name => name !== connector && name !== 'aspire-mod')
  const session: Session = {
    cwd: work, timeoutMin: options.timeoutMin, plugin: PLUGIN, mcpConfig: local.mcp.tokenEnv ? atlasMcp : null,
    allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash', 'Skill', 'Task', 'Agent', 'Artifact', 'ToolSearch',
      'WebSearch', 'WebFetch', ...[...ATLAS_READS, ...FIRST_RUN_WRITES].map(tool => atlas + tool)],
    disallowedTools: [...FIRST_RUN_REFUSED.map(tool => atlas + tool), ...refused.map(name => toolPrefix(name).slice(0, -2))],
    model: options.model, answers: [],
  }

  const results: FirstRunResults = {
    harness: FIRST_RUN_HARNESS_VERSION, date: today(), label: options.label!, commit: commit(), model: options.model ?? 'default',
    scenariosVersion: config.version, scenarios: [],
  }
  try {
    for (const scenario of chosen) {
      console.error(`${scenario.code} · ${scenario.persona}`)
      results.scenarios.push(await runScenario(scenario, config, local, session, atlas, join(runDir, scenario.code), options))
      writeFileSync(join(runDir, 'results.json'), JSON.stringify(results, null, 2) + '\n')
    }
  } finally {
    rmSync(secrets, { recursive: true, force: true })
  }
  const text = renderRun(results)
  writeFileSync(join(runDir, 'table.md'), text)
  process.stdout.write(text)
  console.error(`Run kept in ${runDir} (the folder is not committed).`)
  if (options.baseline) {
    const dir = join(BASELINES, `${results.date}-${results.label}-${results.model.replace(/[^a-z0-9.-]/gi, '-')}`)
    mkdirSync(dir, { recursive: true })
    const kept = forBaseline(results)
    writeFileSync(join(dir, 'results.json'), JSON.stringify(kept, null, 2) + '\n')
    writeFileSync(join(dir, 'table.md'), renderRun(kept))
    console.error(`Baseline stored in ${dir}. It holds numbers only: commit it.`)
  }
}

await main()
