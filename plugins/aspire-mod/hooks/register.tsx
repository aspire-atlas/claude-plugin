// The Aspire mod: a progress bar and a band above the prompt, and an agents
// panel, for Claude Code.
//
// It stays inert until an Aspire event: a prompt typed as /aspire or
// /aspire:aspire, the aspire skill run through the Skill tool, the skill
// reporting progress, an Atlas connector tool answering, or an aspire:* agent
// starting. Before that every hook passes the event
// straight on and records nothing. After that it reads what already passes
// through the session (Atlas get_status results, subagent starts and ends,
// model response timing, the context fill) and draws it. It registers one tool,
// aspire_progress, that the aspire skill calls to move the bar; the tool only
// updates what the bar shows. It makes no network calls, starts no processes,
// reads and writes no files, and changes no tool call, prompt, or agent.
// It also brands the sites Claude Code draws itself (the Atlas tool row and group, the question dialog, the spinner, the line that closes a turn,
// the hint under the prompt, its own command's output), display only; SECURITY.md lists them and CLAUDE.md sets the rule.
//
// Several triggers, because one is not enough everywhere. There is no
// skill.prompt hook, since Claude Code's built-in guard can hold that event
// back from installed mods: a typed /aspire is seen as the prompt itself, the
// model's run as the Skill tool call, and any other expansion (a preload) by
// the skill's first progress report.
//
// Early-access API (function hooks): written and tested on Claude Code 2.1.295 and 2.1.299.
//
// The bar, the band and the panel are adapted from two mods in claude-kit,
// https://github.com/johnnyvizz/claude-kit: savvy-progress (the progress bar and
// the agents panel) and session-band (the band), used under the MIT License:
//
//   MIT License
//
//   Copyright (c) 2026 johnnyvizz
//
//   Permission is hereby granted, free of charge, to any person obtaining a copy
//   of this software and associated documentation files (the "Software"), to deal
//   in the Software without restriction, including without limitation the rights
//   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//   copies of the Software, and to permit persons to whom the Software is
//   furnished to do so, subject to the following conditions:
//
//   The above copyright notice and this permission notice shall be included in all
//   copies or substantial portions of the Software.
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//   SOFTWARE.
//
// The steps behind the progress bar (the agent's task list, the estimate for the
// step in flight, and the Progress section's view) are adapted from plain-view in
// claude-code-mods, https://github.com/ice-lfernandes/claude-code-mods, used under
// the MIT License (hooks/plan.ts):
//
//   MIT License
//
//   Copyright (c) 2026 Lucas Fernandes
//
//   Permission is hereby granted, free of charge, to any person obtaining a copy
//   of this software and associated documentation files (the "Software"), to deal
//   in the Software without restriction, including without limitation the rights
//   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//   copies of the Software, and to permit persons to whom the Software is
//   furnished to do so, subject to the following conditions:
//
//   The above copyright notice and this permission notice shall be included in all
//   copies or substantial portions of the Software.
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//   SOFTWARE.
//
// What changed from the kit: the bar reports the aspire skill (the
// aspire_progress tool, or a baseline from Atlas get_status before the skill
// reports) instead of savvy-flow, with the organization's name as its title
// and no planned-task layer; the band's cost shows Atlas token costs from
// get_status (./atlas-usage.ts) instead of Claude's own cost; the cache
// countdown and its warning notifications (a helper app, Claude Code's push notification, the desktop
// session file read) are gone; the panel drops savvy-flow's plan, its step
// tool, the Claude price table and every cost figure, and its Russian and
// Hebrew strings (English only); the characters moved to ./characters.ts.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { AgentRun, AtlasCreditsReading, AtlasReading, BandStats, Coach, Item, Notice, OrgState, Panel, Progress, Seen, Trigger, TriggerKind, Turn } from '../types'
import { creditsOf, creditsView, fmtAtlasUsage, fmtCredits, isAtlasStatusCall, isAtlasToolName, isOrgSelected, readAtlasCredits, readAtlasOrg, readAtlasUsage } from './atlas-usage'
import { ASPIRE, characterOf } from './characters'
import type { Character } from './characters'
import { AGENT_CHARACTERS } from './costumes'
import { logoSvg, spinnerSvg, terminalMark } from './logo'
import { GROUPS, ROSTER } from './roster'
import type { RosterEntry } from './roster'
import { clip, fmtTime, fmtTokens, modelName, windowOf } from './format'
import { applyTask, countCall, doingOf, endTurn, isTaskTool, planOf, startTurn, stepsOf as stepsFromItems, touch } from './plan'
import { barText, coachOf, isReportLeading, mergeProgress, orgStateFrom, percentOf, shownOf, titleOf } from './progress'
import type { ProgressInput } from './progress'
import { ARTIFACT_URL_RE, artifactUrl, ASPIRE_PROMPT, ASPIRE_SKILL, atlasServers, isAspireAgent, isAtlasTool, isCheckpointTool, loggedLinks, MAX_LOGGED, MAX_PUBLISHED, published, serverOf, shortTool, slackDraft, str, withoutRunId } from './triggers'
import { BAR_ROW_H, DOC_ICON, DONE, METER_FIT, METER_LAYOUT_MAX, meterSvg, SLACK_MARK } from './render-bar'
import { BAND_CRAB_W, COACH_H, coachLabel, coachSvg, crabSvg, dotSvg, MAX_SPEED, MIN_SECONDS, MIN_TOKENS, NOTICE_H, noticeSvg, noticeText } from './render-band'
import { ctxOf, elapsed, fmtCount, HEADER_H, headerSvg, norm, planBodySvg, planH, PROGRESS_H, progressBodySvg, ROW_H, runModel, spanOf, SUB_H, subHeaderSvg, TAIL, TASK_H } from './render-pane'
import { agentSvg, agentTasks, agentTasksH, agentTasksSvg, CARD_H, cardSvg, CREDIT_H, creditsCardSvg, ctxBar, noTasksText, NOTE_H, noteSvg, STATUS_GLYPH, stepsOf } from './render-cards'

const BLANK_SEEN: Seen = {
  prompts: 0,
  skillTools: 0,
  progressReports: 0,
  atlasResults: 0,
  statusReads: 0,
  lastStatusAt: null,
  agents: 0,
}
const BLANK_ORG: OrgState = { name: null, checkpoints: 0 }

const isActive = atom({ plugin: 'aspire-mod', key: 'isActive' } as const, false)
const trigger = atom({ plugin: 'aspire-mod', key: 'trigger' } as const, null as Trigger | null)
const seen = atom({ plugin: 'aspire-mod', key: 'seen' } as const, BLANK_SEEN)
const progress = atom({ plugin: 'aspire-mod', key: 'progress' } as const, null as Progress | null)
const turn = atom({ plugin: 'aspire-mod', key: 'turn' } as const, null as Turn | null)
const items = atom({ plugin: 'aspire-mod', key: 'items' } as const, [] as Item[])
const org = atom({ plugin: 'aspire-mod', key: 'org' } as const, BLANK_ORG)
const atlas = atom({ plugin: 'aspire-mod', key: 'atlas' } as const, null as AtlasReading | null)
const creditsAtom = atom({ plugin: 'aspire-mod', key: 'credits' } as const, null as AtlasCreditsReading | null)
const stats = atom({ plugin: 'aspire-mod', key: 'stats' } as const, { turn: 0, speed: null, context: 0 } as BandStats)
const isBandHidden = atom({ plugin: 'aspire-mod', key: 'isBandHidden' } as const, false)
const agents = atom({ plugin: 'aspire-mod', key: 'agents' } as const, [] as AgentRun[])
/** The cards that start open; the agent roster's groups start collapsed. */
const DEFAULT_OPEN = ['progress', 'running', 'finished', 'agents']
const panel = atom({ plugin: 'aspire-mod', key: 'panel' } as const, { isAutoOpened: false, open: DEFAULT_OPEN, leaving: null } as Panel)
const now = atom({ plugin: 'aspire-mod', key: 'now' } as const, 0)
/** The "queued in the prompt box" notice above the prompt (desktop); null when none shows. */
const notice = atom({ plugin: 'aspire-mod', key: 'notice' } as const, null as Notice | null)
/** How long the notice stays, in milliseconds. */
const NOTICE_MS = 6000
/** The prompt coach card above the bar; null when none shows. Set only by the skill's progress report. */
const coach = atom({ plugin: 'aspire-mod', key: 'coach' } as const, null as Coach | null)
/** The progress line last put under the prompt (undefined when none), kept in session state so a module reload still knows to clear it. */
const statusLine = atom({ plugin: 'aspire-mod', key: 'statusLine' } as const, null as string | null)
/** How long the coach card stays without a new report, in milliseconds. */
const COACH_MS = 5 * 60 * 1000

// The panel's command is `/aspire-agents-info`, written as a literal where it is
// registered and matched (the validator reads literals). Not `/aspire agents`,
// the skill's own list of agents, and not a prefix of any skill command.
const PANE = 'aspire-agents'
const PANE_TITLE = 'Aspire agents'
const MAX_RUNS = 200
// The progress tool as the model calls it: mcp__<plugin>__<name>.
export const PROGRESS_TOOL = 'mcp__aspire-mod__aspire_progress'
export const STEP_TOOL = 'mcp__aspire-mod__aspire_step'

// ---------------------------------------------------------------------------
// Switching on, and the state helpers the hooks share. Every hook and every $.state call stays in this file:
// `claude plugin validate` reads a state call only against an atom made in the same file. The drawings are in
// render-*.ts and the pure matching helpers in triggers.ts.

// The one timer: running agents' clocks. Started when
// the mod switches on, never before; a reload starts it again from session.start.
let ticker: { cancel: () => void } | null = null

// Whether the AbovePrompt slot is drawn at all on this surface. A render hook
// never writes $.state (drawing is pure), so the count is a module variable: it
// starts over on a hot reload and on /clear, and the next render counts again.
// `crab` is the bar's agent counter character: drawn at random from the agents' crabs when the bar loads or a new run starts.
const band: { renders: number; surface: string | null; crab: Character | null } = { renders: 0, surface: null, crab: null }
const pickCrab = (): Character => AGENT_CHARACTERS[Math.floor(Math.random() * AGENT_CHARACTERS.length)] as Character

async function tick($: EngineInterface): Promise<void> {
  const at = await $.clock.now()
  await syncStatus($)
  const t = await read($, turn)
  if ((await read($, agents)).some(a => a.status === 'running') || (t && t.end === undefined)) await update($, now, () => at)
}

function startTicking($: EngineInterface): void {
  if (ticker) return
  ticker = $.clock.every(1000, () => {
    tick($).catch(() => undefined)
  })
}

// Turns count from the one that ran /aspire. A typed /aspire switches the mod on
// before its turn starts, so turn.start counts it; the Skill tool or an agent
// switches it on mid-turn, so the main loop's next model request counts it.
async function activate($: EngineInterface, kind: TriggerKind, detail: string): Promise<void> {
  if (!(await read($, isActive))) {
    const at = await $.clock.now()
    await update($, trigger, t => t ?? { kind, detail: clip(detail, 80), at })
    await update($, isActive, () => true)
  }
  startTicking($)
}

type Count = 'prompts' | 'skillTools' | 'progressReports' | 'atlasResults' | 'agents'

// One case per key, with no computed member, so nothing $ reaches uses brackets.
function bump(s: Seen, key: Count): Seen {
  switch (key) {
    case 'prompts':
      return { ...s, prompts: s.prompts + 1 }
    case 'skillTools':
      return { ...s, skillTools: s.skillTools + 1 }
    case 'progressReports':
      return { ...s, progressReports: s.progressReports + 1 }
    case 'atlasResults':
      return { ...s, atlasResults: s.atlasResults + 1 }
    case 'agents':
      return { ...s, agents: s.agents + 1 }
  }
}

// Named so no other binding in this file shares it: the plugin directory resolves a helper that takes $ by its
// name, and blocked 4.1.0 and 4.1.1 while `count` was also a number parameter in the drawing code.
async function countSeen($: EngineInterface, key: Count): Promise<void> {
  await update($, seen, s => bump(s, key))
}

async function reset($: EngineInterface): Promise<void> {
  ticker?.cancel()
  ticker = null
  await update($, isActive, () => false)
  await update($, trigger, () => null)
  await update($, seen, () => BLANK_SEEN)
  await update($, progress, () => null)
  await update($, coach, () => null)
  await update($, org, () => BLANK_ORG)
  await update($, turn, () => null)
  await update($, items, () => [])
  await update($, atlas, () => null)
  await update($, creditsAtom, () => null)
  await update($, stats, () => ({ turn: 0, speed: null, context: 0 }))
  await update($, isBandHidden, () => false)
  band.renders = 0
  band.surface = null
  band.crab = null
  published.clear()
  loggedLinks.clear()
  atlasServers.clear()
  await setStatus($, undefined, true)
  await update($, agents, () => [])
  await update($, panel, () => ({ isAutoOpened: false, open: DEFAULT_OPEN, leaving: null }))
}

// The progress line under the prompt, for when the band is not drawn. One per plugin; cleared as soon as the band shows or the run ends.
async function setStatus($: EngineInterface, text: string | undefined, force = false): Promise<void> {
  try {
    if (!force && (text ?? null) === (await read($, statusLine))) return
    // The state holds JSON, so "no line" is null there.
    await update($, statusLine, () => text ?? null)
    $.ui.status(text)
  } catch {
    // A convenience.
  }
}
async function syncStatus($: EngineInterface): Promise<void> {
  try {
    const p = (await isOn($)) ? await read($, progress) : null
    const isFallback = !!p && !p.isFinished && band.renders === 0 && !(await read($, isBandHidden))
    if (!isFallback || !p) return await setStatus($, undefined)
    const total = Math.max(p.total, p.tasks.length)
    const done = Math.min(total, Math.max(p.done, p.tasks.filter(t => t.isDone).length))
    const ratio = total ? done / total : 0
    const cells = Math.min(10, Math.max(1, total))
    const filled = Math.round(cells * ratio)
    const text = [
      p.title ? `${p.title}:` : 'Progress:',
      total ? `step ${done} of ${total}` : 'working',
      p.phase ? `, ${p.phase}` : '',
      total ? ` ${'▰'.repeat(filled)}${'▱'.repeat(cells - filled)} ${Math.round(ratio * 100)}%` : '',
    ].join(' ').replace(/ ,/g, ',').replace(/ +/g, ' ')
    await setStatus($, clip(text, 160))
  } catch {
    // A convenience.
  }
}

/** Panel rows still `running` that the engine no longer lists end here: done when it says completed, failed otherwise. */
async function reconcileAgents($: EngineInterface): Promise<void> {
  try {
    if (!(await read($, agents)).some(a => a.status === 'running')) return
    const listed = await $.agent.list()
    const byId = new Map(listed.map(a => [a.id, a.status]))
    const at = await $.clock.now()
    await update($, agents, list =>
      list.map((a): AgentRun => {
        // A row with no engine agent id is keyed by its tool call's id, which the list never holds: leave it to the turn events.
        if (a.status !== 'running' || a.agentId === undefined) return a
        const st = byId.get(a.agentId)
        if (st === 'running' || st === 'pending' || st === 'waiting' || st === 'idle') return a
        return { ...a, status: st === 'completed' ? 'done' : 'failed', endedAt: a.endedAt ?? at }
      }),
    )
  } catch {
    // An engine without $.agent.list: the rows keep what the turn events said.
  }
}

async function isOn($: EngineInterface): Promise<boolean> {
  try {
    return await read($, isActive)
  } catch {
    return false
  }
}

/** The /aspire flow now reporting progress (the skill has not finished it), or null: what the question dialog and the spinner speak of. */
async function flowOf($: EngineInterface): Promise<Progress | null> {
  try {
    if (!(await read($, isActive))) return null
    const p = await read($, progress)
    return p && !p.isFinished ? p : null
  } catch {
    return null
  }
}

async function refreshContext($: EngineInterface): Promise<void> {
  const { context } = await $.session.usage()
  if (typeof context.percent === 'number') {
    const percent = context.percent
    await update($, stats, s => ({ ...s, context: percent }))
  }
}

// Opens the agents pane, or closes it when it is up; true when it ends up open.
async function togglePane($: EngineInterface): Promise<boolean> {
  const isOpen = (await $.ui.panes()).some(p => p.id === PANE)
  if (isOpen) {
    await $.ui.close({ id: PANE })
    return false
  }
  await reconcileAgents($)
  const at = await $.clock.now()
  await update($, now, () => at)
  await $.ui.open({ id: PANE, title: PANE_TITLE })
  return true
}

// ---------------------------------------------------------------------------
// `/aspire-agents-info status`: whether the mod is on and what it has seen.

/** A trigger saved under a kind this version no longer has (`skill`, from the removed skill.prompt hook) reads as this. */
const OLD_TRIGGER_LABEL = 'the aspire skill'

const TRIGGER_LABEL: Record<TriggerKind, string> = {
  prompt: 'a typed /aspire',
  'skill-tool': 'the Skill tool running the aspire skill',
  progress: 'a progress report from the skill',
  'atlas-tool': 'an Atlas tool result',
  agent: 'an aspire agent starting',
}

const ago = (ms: number): string => {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  return m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h ${m % 60} min ago`
}

async function statusText($: EngineInterface): Promise<string> {
  const at = await $.clock.now()
  const isOnNow = await isOn($)
  const t = await read($, trigger)
  const s = await read($, seen)
  const reading = await read($, atlas)
  const o = await read($, org)
  // Credit and usage figures only for the selected organization (creditsOf).
  const credits = creditsOf(o, (await read($, creditsAtom))?.credits ?? null)
  const p = await read($, progress)
  let version = 'unknown'
  try {
    version = (await $.session.version()).version
  } catch {
    // An engine without $.session.version: the rest still stands.
  }
  let surfaces = 'unknown'
  try {
    surfaces = (await $.session.surfaces()).join(', ') || 'none'
  } catch {
    // As above.
  }

  const state = !isOnNow
    ? 'Aspire mod: loaded, off. It switches on when /aspire runs, an Atlas tool answers, or an aspire agent starts.'
    : t
      ? `Aspire mod: on since ${ago(at - t.at)}, switched on by ${TRIGGER_LABEL[t.kind] ?? OLD_TRIGGER_LABEL} (${t.detail}).`
      : 'Aspire mod: on.'
  const counts =
    `Seen: ${fmtCount(s.prompts, '/aspire prompt', '/aspire prompts')}, ` +
    `${fmtCount(s.skillTools, 'Skill tool call', 'Skill tool calls')}, ${fmtCount(s.progressReports, 'progress report', 'progress reports')}, ` +
    `${fmtCount(s.atlasResults, 'Atlas result', 'Atlas results')}, ${fmtCount(s.agents, 'agent', 'agents')}.`
  const status =
    s.lastStatusAt === null
      ? 'Last get_status: none yet.'
      : `Last get_status ${ago(at - s.lastStatusAt)}: ${credits ? `${fmtCredits(credits.remaining)} credits left` : reading && isOrgSelected(o) ? `${fmtAtlasUsage(reading.costs)} Atlas tokens` : 'no credits in it'}, organization ${o.name ?? 'not picked yet'}.`
  const at2 = await $.clock.now()
  const shown = shownOf(p, o, await read($, agents), planOf(await read($, turn), await read($, items), at2))
  const bar = isOnNow ? `Bar: ${titleOf(o)}, ${shown.label}, ${percentOf(shown)} (${shown.source === 'skill' ? 'reported by the skill' : shown.source === 'plan' ? "from the agent's own steps" : shown.source === 'agents' ? 'from the running agents' : 'initializing, no report from the skill yet'}).` : 'Bar: not shown until the mod is on.'
  const b = band
  const drawn = b.renders > 0 ? `Band: drawn ${b.renders} times, last on ${b.surface ?? 'unknown'}.` : 'Band: never drawn on this surface.'
  return [state, counts, status, bar, drawn, `Claude Code ${version} on ${surfaces}.`].join('\n')
}

// Opens the agents pane and leaves it open when it already is.
async function openPane($: EngineInterface): Promise<void> {
  await reconcileAgents($)
  const at = await $.clock.now()
  await update($, now, () => at)
  await $.ui.open({ id: PANE, title: PANE_TITLE })
}

// ---------------------------------------------------------------------------

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    try {
      await $.command.register({
        name: 'aspire-agents-info',
        description:
          'Show or hide the Aspire agents panel once /aspire has run; `band` shows or hides the bar above the prompt; `status` says whether the Aspire mod is on and what it has seen',
        argumentHint: '[open|band|status]',
        immediate: true,
      })
    } catch {
      // The command is a convenience; the session goes on without it.
    }
    try {
      // Behind ToolSearch like an MCP tool: in every session's deferred list, loaded only by the skill.
      await $.tool.register({
        name: 'aspire_progress',
        description:
          'Report the /aspire skill\'s progress to the Aspire progress bar above the prompt. It only draws the bar: it reads and changes nothing else. ' +
          'Call it at the start of each step with done (steps finished) and total (steps planned), with phase naming the step in a few words, ' +
          'and once at the end with finished: true. Fields left out keep their previous value; a new title starts a new run. ' +
          'Optional coach: { verdict, step? } draws the prompt coach card above the bar (verdict: one short line, 140 characters at most; step: a round label such as "Round 1 of 3", 30 at most); coach: null or finished: true clears it, and it clears itself after five minutes. Text only: it changes nothing else. ' +
          'For the main session only: a call from a subagent is ignored. ' +
          'The result ends with `band: visible`, `not-drawn`, `hidden-by-user` or `unknown`. When it is not `visible`, show the progress another way.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'What the run is, a few words (for example "Onboarding").' },
            total: { type: 'integer', minimum: 0, description: 'Steps planned.' },
            done: { type: 'integer', minimum: 0, description: 'Steps finished so far.' },
            phase: { type: 'string', description: 'The step in progress, a few words.' },
            tasks: {
              type: 'array',
              description: 'The planned steps in order; optional.',
              items: {
                type: 'object',
                properties: { title: { type: 'string' }, done: { type: 'boolean' } },
                required: ['title'],
              },
            },
            finished: { type: 'boolean', description: 'True once the run is over.' },
            coach: {
              type: ['object', 'null'],
              description: 'The prompt coach card above the bar; null clears it.',
              properties: {
                verdict: { type: 'string', maxLength: 140, description: 'One short line, for example "3 of 6 inputs for Ad reuse: missing window, reader, save".' },
                step: { type: 'string', maxLength: 30, description: 'Optional round label, for example "Round 1 of 3".' },
              },
              required: ['verdict'],
            },
          },
        },
      })
    } catch {
      // Without the tool the bar falls back to the get_status baseline.
    }
    try {
      await $.tool.register({
        name: 'aspire_step',
        description:
          'Report an Aspire agent\'s own steps to the agents panel. It only draws a bar on that agent\'s row: it reads and changes nothing else. ' +
          'Right after reading the brief, call it with total (your plan in 3 to 8 steps) and done: 0; call it again with done and a note ' +
          '(the step in progress, a few words) as each step finishes. For agents only: a call from the main session is ignored.',
        inputSchema: {
          type: 'object',
          properties: {
            total: { type: 'integer', minimum: 1, description: 'Steps planned; may change if the plan changes.' },
            done: { type: 'integer', minimum: 0, description: 'Steps finished so far.' },
            note: { type: 'string', description: 'The step in progress, a few words.' },
          },
        },
      })
    } catch {
      // Agents show their context fill instead.
    }
    try {
      // A reload (or a resumed process) keeps $.state: pick the timer back up.
      if (await isOn($)) startTicking($)
    } catch {
      // The timer is a convenience.
    }
    return started
  })

  // A /clear starts a new conversation: the mod goes back to sleep until /aspire runs again.
  on('session.end', async ($, e, next) => {
    if (e.reason === 'clear') await reset($).catch(() => undefined)
    return next(e)
  })

  // Switch on: a prompt typed as /aspire or /aspire:aspire. The prompt passes on
  // unchanged; switching on first lets turn.start count the /aspire turn.
  on('prompt.submit', async ($, e, next) => {
    try {
      if ((await read($, notice)) !== null) await update($, notice, () => null)
      if (typeof e.text === 'string' && ASPIRE_PROMPT.test(e.text)) {
        await activate($, 'prompt', e.text.trim().split(/\s/, 1)[0] ?? '/aspire')
        await countSeen($, 'prompts')
      }
    } catch {
      // Switching on is a convenience: the prompt goes on whatever happens here.
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  // Switch on: the model ran the aspire skill through the Skill tool. The call
  // and its result pass through unchanged.
  on('tool.call', { tool: 'Skill' }, async ($, e, next) => {
    const result = await next(e)
    try {
      if (result.deny !== undefined || result.isError) return result
      const skill = (e as { skill?: unknown }).skill
      if (typeof skill === 'string' && ASPIRE_SKILL.test(skill.trim().replace(/^\//, ''))) {
        await activate($, 'skill-tool', skill.trim())
        await countSeen($, 'skillTools')
      }
    } catch {
      // As above.
    }
    return result
  }).catch(($, e, next) => next(e))

  // The skill's progress. The bar is the main session's: a call from a subagent
  // carries its agentId and changes nothing, so no agent can rename, finish, or
  // reset it.
  on('tool.call', { tool: PROGRESS_TOOL }, async ($, e) => {
    if (e.agentId) return { result: 'ignored: only the main session reports Aspire progress' }
    try {
      await activate($, 'progress', 'aspire_progress')
      await countSeen($, 'progressReports')
      const before = await read($, progress)
      const p = await update($, progress, prev => mergeProgress(prev, e as unknown as ProgressInput))
      if (!before || before.isFinished || before.title !== p?.title) band.crab = null
      // The coach card: a finished run or a new title clears it; then this report's own `coach` field sets or clears it.
      if (!before || before.isFinished || before.title !== p?.title || p?.isFinished) await update($, coach, () => null)
      const asked = coachOf((e as unknown as ProgressInput).coach)
      if (asked === null) await update($, coach, () => null)
      else if (asked && !p?.isFinished) {
        const id = await $.clock.now()
        await update($, coach, () => ({ ...asked, id }))
        $.clock.after(COACH_MS, () => {
          update($, coach, prev => (prev && prev.id === id ? null : prev)).catch(() => undefined)
        })
      }
      await syncStatus($)
      const shown = shownOf(p, await read($, org), await read($, agents), planOf(await read($, turn), await read($, items), await $.clock.now()))
      const b = band
      const hidden = await read($, isBandHidden)
      const visibility = hidden ? 'hidden-by-user' : b.renders > 0 ? `visible on ${b.surface ?? 'unknown'}` : 'not-drawn'
      return { result: `ok: ${shown.label}, ${percentOf(shown)}; band: ${visibility}` }
    } catch {
      return { result: 'ok; band: unknown' }
    }
  }).catch(() => ({ result: 'ok; band: unknown' }))

  // An agent's own steps, drawn on its row in the panel. The call runs in the
  // agent's loop, so agentId names it; the main session and an unknown agent
  // change nothing, and it never switches the mod on.
  on('tool.call', { tool: STEP_TOOL }, async ($, e) => {
    const agentId = (e as { agentId?: string }).agentId
    if (!agentId) return { result: 'ignored: only agents report steps' }
    try {
      if (!(await isOn($))) return { result: 'ok' }
      const input = e as unknown as { total?: unknown; done?: unknown; note?: unknown }
      const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.round(v)) : undefined)
      const note = typeof input.note === 'string' ? clip(input.note.trim(), 40) : undefined
      let isKnown = false
      await update($, agents, list =>
        list.map(a => {
          if (a.agentId !== agentId) return a
          isKnown = true
          // An agent that keeps a task list: that list is its steps.
          if (a.items?.length) return a
          const total = num(input.total) ?? a.stepTotal ?? 0
          const done = num(input.done) ?? a.stepDone ?? 0
          return { ...a, stepTotal: total, stepDone: total ? Math.min(total, done) : done, stepNote: note === undefined ? a.stepNote : note || undefined }
        }),
      )
      return { result: isKnown ? 'ok' : 'ok: not listed in the panel' }
    } catch {
      return { result: 'ok' }
    }
  }).catch(() => ({ result: 'ok' }))

  // Atlas tool results: any one switches the mod on; a get_status result also
  // gives the token costs, the organization, and the onboarding baseline. The
  // call and its result are never changed; a get_status without token costs
  // clears the figure, so the band never shows one the latest call did not give.
  on('tool.call', { tool: /^mcp__/ }, async ($, e, next) => {
    const result = await next(e)
    try {
      if (result.deny !== undefined || result.isError) return result
      const tool = String(e.tool)
      if (tool === PROGRESS_TOOL || tool === STEP_TOOL || isCheckpointTool(tool)) return result
      const payload = { result: result.result, text: result.text }
      const isStatus = isAtlasStatusCall(tool, payload)
      if (!isStatus && !isAtlasToolName(tool)) return result
      if (serverOf(tool)) atlasServers.add(serverOf(tool))
      await activate($, 'atlas-tool', shortTool(tool))
      await countSeen($, 'atlasResults')
      if (isStatus) {
        const at = await $.clock.now()
        const costs = readAtlasUsage(payload)
        const credits = readAtlasCredits(payload)
        const reading = readAtlasOrg(payload)
        // The call names its organization flat or under `input`.
        const asked = (e as { asOrganizationId?: unknown; input?: { asOrganizationId?: unknown } })
        const isOrgNamed = typeof asked.asOrganizationId === 'string' || typeof asked.input?.asOrganizationId === 'string'
        // A result that is only get_status's default (several organizations, none named) is not a pick and
        // leaves the held organization alone; so it must leave that organization's costs and credits alone too,
        // or the figures of the default organization would replace, and then be hidden against, the picked one's.
        const holdsPick = (await read($, org)).name !== null
        const isPick = reading?.name !== undefined && (reading.orgCount <= 1 || isOrgNamed)
        // Kept only for a reading that is the default: it parsed, several organizations, none named. An
        // unparseable result, or a named call whose result has no name, clears the figures as before.
        // When the default's credits are the held organization's own (same id), they are that organization's fresh figures: taken, not kept.
        const held = (await read($, creditsAtom))?.credits
        const isHeldOrg = credits?.organizationId !== undefined && credits.organizationId === held?.organizationId
        const isKept = holdsPick && !isPick && reading !== null && reading.orgCount > 1 && !isOrgNamed && !isHeldOrg
        await update($, atlas, prev => (isKept ? prev : costs ? { costs, at } : null))
        await update($, creditsAtom, prev => (isKept ? prev : credits ? { credits, at } : null))
        await update($, seen, s => ({ ...s, statusReads: s.statusReads + 1, lastStatusAt: at }))
        await update($, org, prev => orgStateFrom(prev, reading, isOrgNamed))
      }
    } catch {
      // The bar is a convenience: the call's result stands as it came.
    }
    return result
  }).catch(($, e, next) => next(e))

  // An Atlas tool's row in the transcript (`mcp__<server>__search_posts` and the like): the animated Aspire mark on the left and the call's
  // name on the right, on the desktop. Display only: the call, its input and its result are untouched, the terminal and every
  // other tool keep Claude Code's own row, and a row that is not drawn here is passed on as it came.
  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    const tool = String(e.props.tool)
    const ui = $.ui.resolve(e)
    const Svg = e.surface !== 'terminal' && 'Svg' in ui ? ui.Svg : null
    const Raster = e.surface === 'terminal' && 'Raster' in ui ? ui.Raster : null
    if ((!Svg && !Raster) || !isAtlasTool(tool) || !(await isOn($))) return next(e)
    const { Box, Text } = ui
    // The terminal draws no Svg: the small cell mark beside Claude Code's own row, which keeps its description and result.
    if (!Svg && Raster) {
      const theirs = await next(e)
      return (
        <Box flexDirection="row" gap={1}>
          <Raster key="aspire-mark" {...terminalMark()} />
          {theirs}
        </Box>
      )
    }
    if (!Svg) return next(e)
    const name = shortTool(tool).replace(/_/g, ' ')
    const state = e.props.isInterrupted ? 'interrupted' : e.props.isErrored ? 'failed' : e.props.isRunning ? 'running' : ''
    // Every Atlas tool takes a `context`: a sentence on why the call is made, which the row shows as its description, less its run id.
    const input = e.props.input !== null && typeof e.props.input === 'object' ? (e.props.input as Readonly<Record<string, unknown>>) : {}
    const description = str(withoutRunId(str(input.context) ?? ''))
    return (
      <Box flexDirection="row" gap={1}>
        <Svg source={e.props.isRunning ? spinnerSvg(18) : logoSvg(18, false)} alt="Aspire Atlas" width={18} height={18} />
        <Box flexDirection="column" flexGrow={1} flexShrink={1} minWidth={0}>
          <Box flexDirection="row" gap={1}>
            <Text bold>Aspire Atlas</Text>
            <Text dimColor>{name}</Text>
            {state ? <Text color={e.props.isErrored || e.props.isInterrupted ? 'red' : undefined} dimColor={state === 'running'}>{state}</Text> : null}
          </Box>
          {description ? <Text dimColor wrap="wrap">{clip(description, 200)}</Text> : null}
        </Box>
      </Box>
    )
  })

  // The rest of the brand, on the sites Claude Code already draws. Each one is display only and runs only while the mod is on; the ones
  // that speak of a flow (the question dialog, the spinner) run only while an /aspire flow is reporting progress. Each keeps Claude
  // Code's own drawing and adds the Aspire mark or a few words to it, and a site another mod already redrew is passed on as it came.

  // The question dialog: the Aspire mark and the flow's phase above Claude Code's dialog, which must stay in the tree exactly once.
  on('ui.render', { component: 'AskUserQuestion' }, async ($, e, next) => {
    const flow = await flowOf($)
    if (!flow) return next(e)
    const ui = $.ui.resolve(e)
    const { Box, Text } = ui
    const Svg = e.surface !== 'terminal' && 'Svg' in ui ? ui.Svg : null
    const theirs = await next(e)
    // Anything but an engine reference (a node another mod already drew, nothing at all) passes as it came: only the engine drawing is wrapped.
    if (!theirs || typeof theirs !== 'object' || (theirs as { type?: string }).type !== 'engine') return theirs
    return (
      <Box flexDirection="column">
        <Box flexDirection="row" gap={1}>
          {Svg ? <Svg source={logoSvg(18, false)} alt="Aspire Atlas" width={18} height={18} /> : <Text color="cyan">◆</Text>}
          <Text bold>Aspire Atlas</Text>
          {flow.phase ? <Text dimColor>{flow.phase}</Text> : null}
        </Box>
        {theirs}
      </Box>
    )
  })

  // The line that animates while Claude works: Claude Code's own word and animation, then the brand and the flow's step.
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    const flow = await flowOf($)
    if (!flow) return next(e)
    const tail = ` · Aspire Atlas${flow.phase ? ` · ${flow.phase}` : ''}`
    const own = e.props.suffix ?? ''
    if (own.includes(' · Aspire Atlas')) return next(e)
    return next({ ...e, props: { ...e.props, suffix: `${own}${tail}` } })
  })

  // The line that closes a turn (terminal): Claude Code's own line, then where the running flow stands.
  on('ui.render', { component: 'TurnDuration' }, async ($, e, next) => {
    const flow = await flowOf($)
    if (!flow || flow.total === 0 || !(await isOn($))) return next(e)
    const theirs = await next(e)
    if (!theirs) return theirs
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="row">
        {theirs}
        <Text dimColor>{` · Aspire Atlas · step ${Math.min(flow.done + 1, flow.total)} of ${flow.total}`}</Text>
      </Box>
    )
  })

  // A collapsed run of Atlas calls: the mark beside Claude Code's own group row, which keeps its descriptions, results and failures. A
  // group that holds any other tool, and a group the person expanded, keep Claude Code's own drawing alone. Checkpoints in the run
  // are passed over, so they neither brand a group nor stop one being branded.
  on('ui.render', { component: 'ToolGroup' }, async ($, e, next) => {
    const calls = e.props.calls.filter(c => !isCheckpointTool(String(c.tool)))
    if (e.props.isExpanded || calls.length === 0 || !calls.every(c => isAtlasTool(String(c.tool))) || !(await isOn($))) return next(e)
    const ui = $.ui.resolve(e)
    const { Box } = ui
    const Svg = e.surface !== 'terminal' && 'Svg' in ui ? ui.Svg : null
    const Raster = e.surface === 'terminal' && 'Raster' in ui ? ui.Raster : null
    if (!Svg && !Raster) return next(e)
    const theirs = await next(e)
    if (!theirs) return theirs
    const running = calls.some(c => c.isRunning)
    return (
      <Box flexDirection="row" gap={1}>
        {Svg ? <Svg source={running ? spinnerSvg(18) : logoSvg(18, false)} alt="Aspire Atlas" width={18} height={18} /> : Raster ? <Raster key="aspire-mark" {...terminalMark()} /> : null}
        {theirs}
      </Box>
    )
  })

  // The hint under the prompt (terminal): Claude Code's own line, then the way back to the guide, once the mod is on and the prompt is idle.
  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    const hint = typeof e.props.hint === 'string' ? e.props.hint : ''
    if (!hint || hint.includes('/aspire help') || e.props.isDraft || e.props.isWorking || !(await isOn($))) return next(e)
    return next({ ...e, props: { ...e.props, hint: `${hint} · /aspire help` } })
  })

  // What the plugin's own command printed: the mark beside Claude Code's own drawing of it.
  on('ui.render', { component: 'CommandOutput' }, async ($, e, next) => {
    if (e.props.command !== 'aspire-agents-info' || e.props.isErrored || !(await isOn($))) return next(e)
    const ui = $.ui.resolve(e)
    const { Box } = ui
    const Svg = e.surface !== 'terminal' && 'Svg' in ui ? ui.Svg : null
    const Raster = e.surface === 'terminal' && 'Raster' in ui ? ui.Raster : null
    if (!Svg && !Raster) return next(e)
    const theirs = await next(e)
    if (!theirs) return theirs
    return (
      <Box flexDirection="row" gap={1}>
        {Svg ? <Svg source={logoSvg(22, false)} alt="Aspire Atlas" width={22} height={22} /> : Raster ? <Raster key="aspire-mark" {...terminalMark()} /> : null}
        {theirs}
      </Box>
    )
  })

  // A published Artifact: remember its title and description from the call, for the card that draws its result row. An
  // observer: the call and its result pass through unchanged, and nothing is stored but those strings.
  on('tool.call', { tool: 'Artifact' }, async ($, e, next) => {
    try {
      const input = e as unknown as Readonly<Record<string, unknown>>
      const isPublish = (input.action === undefined || input.action === 'publish') && input.asset !== true && !input.from_url
      if (isPublish && (await isOn($)) && typeof e.tool_use_id === 'string') {
        published.set(e.tool_use_id, { title: str(input.title), description: str(input.description), file: str(input.file_path) })
        if (published.size > MAX_PUBLISHED) published.delete(published.keys().next().value as string)
      }
    } catch {
      // The card is a convenience.
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'aspire-agents-info' }, async ($, e) => {
    try {
      const arg = e.args.trim()
      if (arg === 'status') return { text: await statusText($) }
      if (!(await isOn($))) return { text: 'The Aspire agents panel starts once /aspire runs in this session.' }
      if (arg === 'band') {
        const hidden = !(await read($, isBandHidden))
        await update($, isBandHidden, () => hidden)
        return { text: hidden ? 'Aspire band hidden.' : 'Aspire band shown.' }
      }
      if (arg === 'open') {
        await reconcileAgents($)
        const at = await $.clock.now()
        await update($, now, () => at)
        await $.ui.open({ id: PANE, title: PANE_TITLE })
        return { text: 'Aspire agents panel opened.' }
      }
      return { text: (await togglePane($)) ? 'Aspire agents panel opened.' : 'Aspire agents panel closed.' }
    } catch {
      return { text: 'The Aspire agents panel could not be drawn here.' }
    }
  }).catch(() => ({ text: 'The Aspire agents panel could not be drawn here.' }))

  // A subagent's Artifact publish never draws a card in the main transcript; its hand-back arrives as text. Log each new
  // claude.ai artifact link in it once, as a dim line. An observer: the message is passed on unchanged and never consumed.
  on('session.receive', async ($, e, next) => {
    try {
      const kind = String(e.origin?.kind ?? '')
      if ((kind === 'task-notification' || kind === 'peer' || kind === 'peer-send-message') && typeof e.text === 'string' && (await isOn($))) {
        for (const url of new Set(e.text.match(ARTIFACT_URL_RE) ?? [])) {
          if (loggedLinks.has(url)) continue
          loggedLinks.add(url)
          if (loggedLinks.size > MAX_LOGGED) loggedLinks.delete(loggedLinks.values().next().value as string)
          $.ui.log(`◆ Aspire · Artifact published: ${url}`)
        }
      }
    } catch {
      // The line is a convenience.
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('turn.start', async ($, e, next) => {
    try {
      if (await isOn($)) {
        await update($, stats, s => ({ ...s, turn: s.turn + 1 }))
        // A new request: a fresh turn for the steps, and the agent's task list kept only while a task is open.
        const at = await $.clock.now()
        const fresh = startTurn(await read($, turn), await read($, items), typeof e.text === 'string' ? e.text : '', at)
        await update($, turn, () => fresh.turn)
        await update($, items, () => fresh.items)
        await update($, now, () => at)
        await reconcileAgents($)
      }
    } catch {
      // The steps are a convenience: the turn starts whatever happens here.
    }
    return next(e)
  })

  // The agent's own task list and tool calls, for the steps behind the bar. An observer: the call
  // and its result pass through unchanged, and the call is never run twice.
  on('tool.call', async ($, e, next) => {
    if (!(await isOn($))) return next(e)
    const tool = String(e.tool)
    if (tool === PROGRESS_TOOL || tool === STEP_TOOL) return next(e)
    const input = e as unknown as Readonly<Record<string, unknown>>
    // An agent that keeps a task list: its steps and the bar on its row in the panel.
    const agentId = e.agentId
    if (agentId) {
      if (!isTaskTool(tool)) {
        // Not a task call: note what the agent is doing, for its open row while it keeps no list. Display only.
        try {
          await update($, agents, list => list.map(a => (a.agentId === agentId ? { ...a, doing: doingOf(tool, input), calls: (a.calls ?? 0) + 1 } : a)))
        } catch {
          // The row is a convenience.
        }
        return next(e)
      }
      const result = await next(e)
      try {
        const refused = (result.result as { success?: unknown } | undefined)?.success === false
        if (result.deny === undefined && !result.isError && !refused) {
          await update($, agents, list =>
            list.map((a): AgentRun => {
              if (a.agentId !== agentId) return a
              const own = applyTask(a.items ?? [], tool, input, result.result)
              const steps = stepsFromItems(own)
              return { ...a, items: own, stepTotal: steps.total, stepDone: steps.done, stepNote: steps.note || undefined }
            }),
          )
        }
      } catch {
        // The row is a convenience: the call's result stands as it came.
      }
      return result
    }
    if (isTaskTool(tool)) {
      const result = await next(e)
      try {
        // TaskUpdate reports a refused change in its result ({ success: false }).
        const refused = (result.result as { success?: unknown } | undefined)?.success === false
        if (result.deny === undefined && !result.isError && !refused) await update($, items, list => applyTask(list, tool, input, result.result))
      } catch {
        // As above.
      }
      return result
    }
    let isCounted = false
    try {
      const t = await read($, turn)
      isCounted = !!t && t.end === undefined
      if (isCounted) {
        await update($, turn, v => (v ? touch(v, tool, input, null) : v))
        await update($, items, countCall)
      }
    } catch {
      // As above.
    }
    const result = await next(e)
    try {
      if (isCounted) await update($, turn, v => (v ? touch(v, tool, input, result.deny === undefined && !result.isError) : v))
    } catch {
      // As above.
    }
    return result
  }).catch(($, e, next) => next(e))

  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    try {
      if (started.deny !== undefined) return started
      const isAspire = isAspireAgent(e.subagentType, e.provider?.plugin)
      if (!isAspire && !(await isOn($))) return started
      if (isAspire) await activate($, 'agent', e.subagentType)

      const at = await $.clock.now()
      await update($, agents, list => {
        const round = 1 + list.filter(a => e.description && norm(a.description) === norm(e.description)).length
        const run: AgentRun = {
          id: started.agentId ?? e.tool_use_id,
          agentId: started.agentId,
          type: e.subagentType,
          description: e.description,
          model: started.model,
          status: 'running',
          startedAt: at,
          contextTokens: 0,
          contextMax: windowOf(started.model),
          round,
        }
        return [...list.filter(a => a.id !== run.id), run].slice(-MAX_RUNS)
      })
      await update($, now, () => at)
      await countSeen($, 'agents')

      // The panel opens by itself once per session, for the first aspire:* agent.
      if (isAspire && !(await read($, panel)).isAutoOpened) {
        await update($, panel, p => ({ ...p, isAutoOpened: true }))
        void $.ui.open({ id: PANE, title: PANE_TITLE }).catch(() => undefined)
      }
    } catch {
      // The panel is a convenience: the agent runs whatever happens here.
    }
    return started
  }).catch(($, e, next) => next(e))

  // Each model request: the main loop's output speed and context; a subagent's
  // model, effort and context fill.
  on('turn.step', async function* ($, e, next) {
    if (!(await isOn($))) return yield* next(e)

    const stream = next(e)
    let startedAt: number | null = null
    for await (const chunk of stream) {
      // Timed from the response's first item, so time to first token is left out.
      if (startedAt === null && e.agentId === undefined) startedAt = await $.clock.now().catch(() => null)
      yield chunk
    }
    const result = await stream.result

    try {
      const usage = result.usage
      if (e.agentId === undefined) {
        await update($, stats, s => (s.turn === 0 ? { ...s, turn: 1 } : s))
        if (usage && startedAt !== null) {
          const tokens = usage.output_tokens
          const seconds = ((await $.clock.now()) - startedAt) / 1000
          const speed = tokens / seconds
          if (tokens >= MIN_TOKENS && seconds >= MIN_SECONDS && speed <= MAX_SPEED) {
            await update($, stats, s => ({ ...s, speed: Math.round(speed) }))
          }
        }
        await refreshContext($)
      } else if (usage) {
        const agentId = e.agentId
        const model = usage.model || e.model
        await update($, agents, list =>
          list.map((a): AgentRun =>
            a.agentId !== agentId
              ? a
              : {
                  ...a,
                  model,
                  effort: typeof e.effort === 'string' ? e.effort : a.effort,
                  status: 'running',
                  endedAt: undefined,
                  contextTokens:
                    (usage.input_tokens || 0) +
                    (usage.cache_read_input_tokens || 0) +
                    (usage.cache_creation_input_tokens || 0) +
                    (usage.output_tokens || 0),
                  contextMax: windowOf(model),
                },
          ),
        )
      }
    } catch {
      // Readings are best effort; the response is already through.
    }
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    try {
      if (!(await isOn($))) return result
      const at = await $.clock.now()
      if (e.agentId === undefined) {
        await update($, turn, v => (v && v.end === undefined ? endTurn(v, e.reason, at) : v))
        await refreshContext($)
        await syncStatus($)
      } else {
        const agentId = e.agentId
        await update($, agents, list =>
          list.map((a): AgentRun =>
            a.agentId !== agentId
              ? a
              : { ...a, status: e.reason === 'answer' ? 'done' : 'failed', endedAt: at, model: e.usage?.model || a.model },
          ),
        )
        await update($, now, () => at)
      }
    } catch {
      // Readings are best effort.
    }
    return result
  })

  // The result row of a published Artifact (the ToolResult under the `Artifact(...)` row; the ToolUse row is left as it is): a
  // card with an icon on the left that opens the page, and on the right its title, description and a reminder to share it.
  // Any other tool's result, an Artifact call that is not a publish, and an error are passed on untouched. Display only: the
  // one press drafts a Slack prompt in the prompt box and never sends it.
  on('ui.render', { component: 'ToolResult' }, async ($, e, next) => {
    if (e.props.tool !== 'Artifact' || e.props.isErrored || !(await isOn($))) return next(e)
    const out = (e.props.output !== null && typeof e.props.output === 'object' && !Array.isArray(e.props.output) ? e.props.output : {}) as Readonly<Record<string, unknown>>
    const url = artifactUrl(e.props.output)
    const meta = published.get(e.props.tool_use_id)
    if (!url || !/^https:\/\//.test(url) || out.opened === true || !meta) return next(e)
    const title = str(out.title) ?? meta.title ?? (meta.file ? meta.file.replace(/^.*\//, '').replace(/\.[^.]+$/, '') : undefined) ?? 'Artifact'
    const description = str(out.description) ?? meta.description
    const ui = $.ui.resolve(e)
    const { Box, Button, Text, Link } = ui
    // The card's icon on the desktop is the animated document, with the Slack mark beside the share Button. An Svg takes no press
    // and a Button or Link holds text only, so the page opens from the title and the share press stays on the text Button; the
    // terminal keeps a text glyph.
    const Svg = e.surface !== 'terminal' && 'Svg' in ui ? ui.Svg : null
    // The icon is the card's full height: border, title, the description's wrapped lines (about 70 characters a line), the
    // reminder and the button row, in CSS pixels, since an Svg takes a size and not a percentage.
    const iconH = 2 + 22 + (description ? Math.min(4, Math.ceil(clip(description, 240).length / 70)) * 20 : 0) + 52 + 10
    const share = () => {
      void $.prompt.fill({ origin: { kind: 'plugin', name: 'aspire-mod' }, text: slackDraft(url), mode: 'replace' } as never).catch(() => undefined)
      $.ui.toast('◆ Aspire · A Slack message is drafted in the prompt box. Press Enter to ask Claude to share it.', { timeoutMs: 6000 })
    }
    return (
      <Box flexDirection="row" gap={2} borderStyle="round" borderColor={ASPIRE} paddingX={1}>
        <Box flexDirection="column">
          {Svg ? <Svg source={DOC_ICON} alt="Artifact" width={Math.round((iconH * 40) / 46)} height={iconH} /> : <Text color={ASPIRE} bold>◆</Text>}
        </Box>
        <Box flexDirection="column" flexGrow={1} flexShrink={1} minWidth={0}>
          <Link href={url}>
            <Text bold wrap="truncate-end">{title}</Text>
          </Link>
          {description ? <Text wrap="wrap">{clip(description, 240)}</Text> : null}
          {/* A light info box: the friendly reminder, then the share control (the Slack mark and the Button; a Button holds text only, so the
              mark itself cannot take the press), in the Aspire teal on a dim border (a fixed fill could not follow light and dark). */}
          <Box flexDirection="row" alignItems="center" width="100%" gap={1} borderStyle="round" borderColor={ASPIRE} borderDimColor paddingX={1}>
            <Box flexGrow={1} flexShrink={1} minWidth={0}>
              <Text color={ASPIRE} wrap="wrap">ⓘ Friendly reminder: Share this artifact with your team.</Text>
            </Box>
            {Svg ? <Svg source={SLACK_MARK} alt="Slack" width={18} height={18} /> : null}
            <Button key="aspire-artifact-slack" label="Post to Slack" onPress={share} />
          </Box>
        </Box>
      </Box>
    )
  })

  // Above the prompt: the progress bar (from savvy-progress), then the band's
  // row (from session-band), then whatever other mods draw beneath.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // Counted before any early return, so the progress tool can tell whether this surface draws the slot at all.
    band.renders += 1
    band.surface = e.surface ?? null
    if (e.props.hasSurvey || !(await isOn($)) || (await read($, isBandHidden))) return next(e)
    // Claude Code's own placeholder ({ type: 'engine' }) is never nested: the desktop drops a band that nests it.
    const drawn = await Promise.resolve(next(e)).catch(() => null)
    const below = drawn && typeof drawn === 'object' && (drawn as { type?: string }).type !== 'engine' ? drawn : null

    const o = await read($, org)
    const list = await read($, agents)
    const clockNow = Math.max(await read($, now), (await read($, turn))?.startedAt ?? 0)
    const shown = shownOf(await read($, progress), o, list, planOf(await read($, turn), await read($, items), clockNow))
    const title = titleOf(o)
    const percent = percentOf(shown)

    const ui = $.ui.resolve(e)
    const { Box, Button, Text } = ui
    // The terminal's element table has an Svg that draws nothing: test the surface too.
    const Svg = e.surface !== 'terminal' && 'Svg' in ui ? ui.Svg : null

    // One row of Buttons on every surface, each holding the bar's own items (title, bar and step, agents, panel icon). The desktop
    // used to draw the row as an Svg with blank absolute Buttons over it; the host ignores absolute, so those Buttons stacked
    // below the Svg, made the band taller than its rows (it scrolled) and sat out of sight. Items inside the Buttons cannot drift.
    const cols = e.props.bodyColumns
    const titleW = Math.max(8, Math.min(30, title.length + 2, Math.floor((cols || 100) / 3)))
    const fixedW = shown.label.length + percent.length + 4 + String(list.length).length + 2 * 4 + 2
    const textBarW = Math.min(40, (cols || 100) - titleW - fixedW)
    const barColor = shown.isFinished ? DONE : ASPIRE
    // Pressing the title drafts the organization change in the prompt, as pressing an agent drafts its start: the person reads it
    // and presses Enter, and the skill asks which organization with a question.
    const changeOrg = () =>
      void $.prompt.fill({ origin: { kind: 'plugin', name: 'aspire-mod' }, text: '/aspire:aspire org', mode: 'replace' } as never).catch(() => undefined)
    // The desktop draws the bar itself as an Svg (the dithered fill and step pill), between a title Button and an agents Button.
    // An Svg takes no press and the host ignores absolute, so nothing lies over it: the presses sit on the Buttons beside it.
    if (band.crab === null) band.crab = pickCrab()
    // The bar is laid out for most of the columns the row's other items leave (8px a column, as the notice and coach rows use; see
    // meterSvg), and the host fits it whole at one scale (`meet`), so a misjudged width neither distorts it nor wraps the row.
    // The percent, crab, count and panel icon sit together in a right group that ends at the icon.
    const countText = `×${list.length}`
    const fixedCols = title.length + percent.length + countText.length + 22
    // The layout width is the bar's real size, and a long dithered fill must stay under the host's 131072-character cap
    // on an Svg's source, so a very wide band lays out no wider than METER_LAYOUT_MAX.
    const meterW = Math.min(METER_LAYOUT_MAX, Math.max(60, Math.round(((cols || 100) - fixedCols) * 8 * METER_FIT)))
    const barRow = (
      <Box flexDirection="row" width="100%" gap={2}>
        {Svg ? <Svg source={dotSvg(shown)} alt="" width={12} height={BAR_ROW_H} /> : null}
        <Button key="aspire-org" label={Svg ? title : `● ${title}`} plain onPress={changeOrg} />
        <Box flexGrow={1} flexShrink={1} minWidth={0}>
          {Svg ? <Svg source={meterSvg(shown, meterW)} alt={`${shown.label}, ${percent}`} height={BAR_ROW_H} /> : null}
        </Box>
        <Box flexDirection="row" flexShrink={0} gap={1}>
          <Button
            key="aspire-agents"
            label={`${Svg || textBarW < 6 ? '' : `${barText(shown.ratio, textBarW)} `}${Svg ? '' : `${shown.label} `}${percent}${Svg ? '' : ' 🦀'}${Svg ? '' : ` ${countText}`}`}
            plain
            onPress={() => void togglePane($)}
          />
          {Svg ? <Svg source={crabSvg(band.crab)} alt="Aspire crab" width={Math.ceil(BAND_CRAB_W + 4)} height={BAR_ROW_H} /> : null}
          {Svg ? <Button key="aspire-agent-count" label={countText} plain onPress={() => void togglePane($)} /> : null}
          <Button key="aspire-open-panel" label="◨" plain onPress={() => void openPane($).catch(() => undefined)} />
        </Box>
      </Box>
    )

    // The queued notice sits above the bar row, desktop only: a single Svg row (no press, nothing overlaid).
    const queued = Svg ? await read($, notice) : null
    const noticeW = Math.max(240, Math.min(720, Math.round((cols || 100) * 8)))
    const noticeRow =
      Svg && queued ? (
        <Svg
          key="aspire-queued"
          source={noticeSvg(characterOf({ type: queued.type, model: '' }), queued.name, noticeW)}
          alt={`Aspire: ${noticeText(queued.name)}`}
          width={noticeW}
          height={NOTICE_H}
        />
      ) : null

    // The prompt coach card sits above the notice and the bar: an Svg row on the desktop, one Text line elsewhere.
    const coached = await read($, coach)
    const coachRow = !coached ? null : Svg ? (
      <Svg
        key="aspire-coach"
        source={coachSvg(coached.verdict, coached.step, noticeW)}
        alt={`Aspire prompt coach: ${coachLabel(coached.verdict, coached.step)}`}
        width={noticeW}
        height={COACH_H}
      />
    ) : (
      <Text key="aspire-coach">{`Prompt coach: ${coached.verdict}`}</Text>
    )

    return (
      <Box flexDirection="column">
        {coachRow}
        {noticeRow}
        {barRow}
        {below}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const ui = $.ui.resolve(e)
    const { Box, Text, Button } = ui
    const list = await read($, agents)
    const p: Panel = await read($, panel)
    const at = Math.max(await read($, now), ...list.map(a => a.startedAt), 0)

    const running = list.filter(a => a.status === 'running').reverse()
    const finished = list.filter(a => a.status !== 'running').reverse()
    const o = await read($, org)
    // No selected organization, or credits of another one: the card's empty state, never a figure.
    const view = creditsView(creditsOf(o, (await read($, creditsAtom))?.credits ?? null), isOrgSelected(o) ? (await read($, atlas))?.costs ?? null : null)
    const report = await read($, progress)
    const planTurn = await read($, turn)
    const plan = planOf(planTurn, await read($, items), Math.max(at, planTurn?.startedAt ?? 0))
    const shown = shownOf(report, o, list, plan)
    const title = titleOf(o)
    const percent = percentOf(shown)
    const tasks = (report?.tasks ?? []).slice(0, 8)
    const summary = `${view.title} ${view.big} ${view.sub}`.trim()
    const openKeys = Array.isArray(p.open) ? p.open : DEFAULT_OPEN
    const isOpen = (key: string): boolean => openKeys.includes(key)
    const toggle = (key: string) => () =>
      void update($, panel, prev => {
        const open = Array.isArray(prev.open) ? prev.open : DEFAULT_OPEN
        return { ...prev, open: open.includes(key) ? open.filter(k => k !== key) : [...open, key] }
      })

    // Pressing an agent drafts its start in the prompt box and does not send it: the person reads it and presses Enter.
    // The crab walks off its card first (about a second), then the draft lands in the prompt.
    const startAgent = (r: RosterEntry) => () =>
      void (async () => {
        if (e.surface === 'desktop') {
          await update($, panel, prev => ({ ...prev, leaving: r.type }))
          // The Pane handler is a render hook with no `next`, and a press runs outside any dispatch, so no signal reaches this wait;
          // whatever ends it, the crab is put back.
          try {
            await $.clock.sleep(900)
          } finally {
            await update($, panel, prev => ({ ...prev, leaving: null }))
          }
        }
        await $.prompt.fill({ origin: { kind: 'plugin', name: 'aspire-mod' }, text: `/aspire:aspire run ${r.type.replace(/^aspire:/, '')}`, mode: 'replace' } as never)
        // On the desktop, with the band drawn, the notice is a branded row above the bar with the agent's own crab; it clears itself.
        // Anywhere else (the terminal, a hidden band, no Svg) the SDK's plain-text toast carries it.
        const isShown = e.surface === 'desktop' && band.renders > 0 && !(await read($, isBandHidden)) && (await isOn($))
        if (isShown) {
          const id = await $.clock.now()
          await update($, notice, () => ({ type: r.type, name: r.name, id }))
          $.clock.after(NOTICE_MS, () => {
            update($, notice, prev => (prev && prev.id === id ? null : prev)).catch(() => undefined)
          })
        } else {
          $.ui.toast(`◆ Aspire · ${r.name} is queued in the prompt box. Press Enter to run it.`, { timeoutMs: NOTICE_MS })
        }
      })().catch(() => undefined)
    const stateOf = (entry: RosterEntry): string => {
      const runs = list.filter(a => a.type === entry.type)
      return runs.some(a => a.status === 'running') ? '●' : runs.length ? '✓' : '○'
    }

    // Each section: a header that opens and closes it, then rows (desktop drawings) or text (terminal and the rest).
    // A row may be a sub-accordion's header; its children follow only while it is open. The row's height is
    // `height`, never `h`: the plugin directory reserves h and Fragment in a .tsx file, which JSX compiles to.
    type Row = { id: string; height: number; alt: string; draw: (W: number, tail: number) => string; onPress?: () => void }
    type Section = { key: string; title: string; summary: string; rows: Row[]; text: () => JSX.Element }
    const empty = 'No agents yet. Aspire agents show here as they start.'
    // Pressing an agent opens its task list under it; pressing again closes it.
    const agentRows = (items: AgentRun[], state: string): Row[] =>
      items.flatMap((a): Row[] => {
        const key = `agent:${a.id}`
        const tasks = agentTasks(a)
        const isTasksOpen = isOpen(key)
        return [
          { id: a.id, height: ROW_H, alt: `${a.description}: ${modelName(a.model)}, ${state}, ${isTasksOpen ? 'tasks open' : 'tasks collapsed'}`, draw: (W, tail) => agentSvg(W, a, at, tail), onPress: toggle(key) },
          ...(isTasksOpen
            ? [{ id: `${a.id}-tasks`, height: agentTasksH(tasks), alt: `${a.description} tasks: ${tasks.map(t => `${t.kind === 'done' ? 'done' : t.kind === 'now' ? 'now' : 'to do'} ${t.text}`).join(', ') || 'none reported yet'}`, draw: (W: number, tail: number) => agentTasksSvg(W, a, tasks, tail) }]
            : []),
        ]
      })
    const cols = Math.max(24, e.props.bodyColumns || 40)
    const barW = Math.max(6, Math.min(20, cols - 34))
    const tasksOf = agentTasks
    const row = (a: AgentRun) => {
      const character = characterOf(a)
      const ctx = ctxOf(a)
      return (
        <Box key={a.id} flexDirection="column" marginBottom={1}>
          <Box flexDirection="row" gap={1}>
            <Text color={character.color}>▣</Text>
            <Text bold wrap="truncate-end">
              {a.description || a.type}
            </Text>
            <Text color={a.status === 'failed' ? 'red' : a.status === 'done' ? 'green' : character.color}>{STATUS_GLYPH[a.status]}</Text>
          </Box>
          <Text dimColor wrap="truncate-end">
            {'  '}
            {a.type} · {runModel(a)}
            {a.round > 1 ? ` · round ${a.round}` : ''}
          </Text>
          <Text wrap="truncate-end">
            {'  '}
            {a.status === 'done' ? (
              <Text color={character.color}>{ctxBar(100, barW)}</Text>
            ) : stepsOf(a) ? (
              <Text color={character.color}>{ctxBar(Math.round((stepsOf(a)?.ratio ?? 0) * 100), barW)}</Text>
            ) : (
              <Text dimColor>{ctxBar(ctx, barW)}</Text>
            )}
            <Text dimColor>
              {' '}
              {stepsOf(a) ? `${stepsOf(a)?.text} · ` : ''}ctx {ctx}% · {fmtTokens(a.contextTokens)} {fmtTime(elapsed(a, at))}
            </Text>
          </Text>
          <Button key={`agent-tasks-${a.id}`} label={`${isOpen(`agent:${a.id}`) ? '▾' : '▸'} Tasks${tasksOf(a).length ? ` · ${tasksOf(a).filter(t => t.kind === 'done').length}/${tasksOf(a).length}` : ''}`} plain onPress={toggle(`agent:${a.id}`)} />
          {isOpen(`agent:${a.id}`)
            ? tasksOf(a).length
              ? tasksOf(a).map((t, n) => (
                  <Text key={`${a.id}-${n}`} wrap="truncate-end" dimColor={t.kind === 'todo'} bold={t.kind === 'now'}>
                    {'  '}
                    {t.kind === 'done' ? '✓' : t.kind === 'now' ? '●' : '○'} {t.text}
                  </Text>
                ))
              : <Text dimColor wrap="truncate-end">{'  '}{noTasksText(a)}</Text>
            : null}
        </Box>
      )
    }

    const creditsBox = (
      <Box flexDirection="column" marginBottom={1}>
        <Text wrap="truncate-end">
          <Text dimColor>{view.title} </Text>
          <Text bold color={view.isOver ? 'red' : undefined}>{view.big}</Text> <Text dimColor>{[view.sub, view.tag].filter(Boolean).join(' · ')}</Text>
        </Text>
        {view.ratio > 0 || view.metaLeft ? (
          <Text wrap="truncate-end">
            <Text color={view.tone === 'critical' ? 'red' : view.tone === 'low' ? 'yellow' : ASPIRE}>{ctxBar(Math.round(view.ratio * 100), 12)}</Text> <Text dimColor>{[view.metaLeft, view.grants].filter(Boolean).join(' · ')}</Text>
          </Text>
        ) : null}
        {view.metaRight ? <Text dimColor wrap="truncate-end">{view.metaRight}</Text> : null}
      </Box>
    )

    const sections: Section[] = [
      {
        key: 'progress',
        title: 'Progress',
        summary: `${shown.label} · ${percent}`,
        rows:
          plan && !isReportLeading(report, plan)
            ? [{ id: 'progress', height: planH(plan), alt: `${title}: ${shown.label}, ${percent}`, draw: (W, tail) => planBodySvg(W, title, shown, plan, tail) }]
            : [
                { id: 'progress', height: PROGRESS_H + tasks.length * TASK_H, alt: `${title}: ${shown.label}, ${percent}`, draw: (W, tail) => progressBodySvg(W, title, shown, tasks, tail) },
              ],
        text: () =>
          plan && !isReportLeading(report, plan) ? (
            <Box flexDirection="column">
              <Text wrap="truncate-end">
                {plan.badge ? <Text color={plan.state === 'done' ? DONE : undefined} bold>{plan.state === 'done' ? '✓' : '■'} {plan.badge} </Text> : null}
                <Text bold>{plan.title}</Text> <Text dimColor>{plan.time}</Text>
              </Text>
              <Text wrap="truncate-end">
                <Text color={shown.isFinished ? DONE : ASPIRE}>{barText(shown.ratio, 12)}</Text> <Text bold>{shown.label}</Text> <Text dimColor>{percent}</Text>
              </Text>
              {plan.before ? <Text dimColor>{`✓ ${plan.before}`}</Text> : null}
              {plan.rows.map(r => (
                <Box key={r.text} flexDirection="column">
                  <Text wrap="truncate-end" dimColor={r.kind === 'next' || r.kind === 'later'} bold={r.kind === 'now'}>
                    {`${r.kind === 'done' ? '✓' : r.kind === 'now' ? '●' : r.kind === 'halted' ? '■' : '○'} ${r.text} · ${r.status}`}
                  </Text>
                  {r.kind === 'now' && r.doing ? <Text dimColor wrap="truncate-end">{'    '}{r.doing}</Text> : null}
                </Box>
              ))}
              {plan.after ? <Text dimColor>{`○ ${plan.after}`}</Text> : null}
              {plan.files ? <Text dimColor>{plan.files}</Text> : null}
            </Box>
          ) : (
            <Box flexDirection="column">
              <Text wrap="truncate-end">
                <Text color={shown.isFinished ? DONE : ASPIRE}>{barText(shown.ratio, 12)}</Text> <Text bold>{shown.label}</Text> <Text dimColor>{percent}</Text>
              </Text>
              {tasks.map(t => (
                <Text key={t.title} wrap="truncate-end" dimColor={!t.isDone}>
                  {t.isDone ? '✓' : '○'} {t.title}
                </Text>
              ))}
            </Box>
          ),
      },
      {
        key: 'running',
        title: `Running · ${running.length}`,
        summary: list.length ? `${fmtCount(list.length, 'agent', 'agents')} · ${fmtTime(spanOf(list, at))}` : '',
        rows: running.length
          ? agentRows(running, 'running')
          : [{ id: 'running-note', height: NOTE_H, alt: empty, draw: (W, tail) => noteSvg(W, list.length ? 'Nothing running right now.' : empty, tail) }],
        text: () => <Box flexDirection="column">{running.length ? running.map(row) : <Text dimColor>{list.length ? 'Nothing running right now.' : empty}</Text>}</Box>,
      },
      ...(finished.length
        ? [{ key: 'finished', title: `Finished · ${finished.length}`, summary: '', rows: agentRows(finished, 'finished'), text: () => <Box flexDirection="column">{finished.map(row)}</Box> }]
        : []),
      {
        key: 'agents',
        title: `Agents · ${ROSTER.length}`,
        summary: running.length ? `${running.length} running` : '',
        rows: GROUPS.flatMap((g): Row[] => {
          const entries = ROSTER.filter(r => r.group === g.key)
          const groupOpen = isOpen(`group:${g.key}`)
          return [
            { id: `group:${g.key}`, height: SUB_H, alt: `${g.title}, ${entries.length}, ${groupOpen ? 'open' : 'collapsed'}`, draw: (W, tail) => subHeaderSvg(W, g.title, String(entries.length), groupOpen, tail), onPress: toggle(`group:${g.key}`) },
            ...(groupOpen
              ? entries.map(r => ({ id: `start-${r.type}`, height: CARD_H, alt: `${r.name}: ${r.blurb}`, draw: (W: number, tail: number) => cardSvg(W, r, list, tail, p.leaving === r.type), onPress: startAgent(r) }))
              : []),
          ]
        }),
        text: () => (
          <Box flexDirection="column">
            {GROUPS.map(g => {
              const entries = ROSTER.filter(r => r.group === g.key)
              const groupOpen = isOpen(`group:${g.key}`)
              return (
                <Box key={g.key} flexDirection="column">
                  <Button key={`card-group:${g.key}`} label={`${groupOpen ? '▾' : '▸'} ${g.title} · ${entries.length}`} plain onPress={toggle(`group:${g.key}`)} />
                  {groupOpen
                    ? entries.map(r => (
                        <Button key={r.type} label={`${stateOf(r)} ${r.name}`} plain onPress={startAgent(r)}>
                          <Text color={characterOf({ type: r.type, model: '' }).color}>{stateOf(r)}</Text> <Text bold>{r.name}</Text> <Text dimColor>{r.blurb}</Text>
                        </Button>
                      ))
                    : null}
                </Box>
              )
            })}
          </Box>
        ),
      },
    ]

    if (e.surface === 'desktop' && 'Svg' in ui) {
      const { Svg } = ui
      const W = Math.max(240, Math.min(900, (e.props.bodyColumns || 40) * 8 - 8))
      // A Button holds text only and an Svg takes no press, so rows of blank Buttons lie over a drawing: a press anywhere on it fires.
      // Buttons are about 20px each, so the stack is clipped to the drawing's own height and width: otherwise a row's last Button
      // overshoots into the next row and its hover highlight lands off the row it belongs to.
      const pressable = (key: string, height: number, onPress: () => void) => (
        <Box position="absolute" top={0} left={0} width={W} height={height} overflow="hidden" flexDirection="column">
          {Array.from({ length: Math.ceil(height / 20) }, (_, n) => (
            <Button key={`${key}-${n}`} label={' '.repeat(Math.floor(W / 8))} plain onPress={onPress} />
          ))}
        </Box>
      )
      return (
        <Box flexDirection="column">
          <Svg source={creditsCardSvg(W, view)} alt={summary} width={W} height={CREDIT_H + 4} />
          {sections.map((c, si) => {
            const open = isOpen(c.key)
            return (
              <Box key={c.key} flexDirection="column">
                <Box flexDirection="column">
                  <Svg source={headerSvg(W, c.title, c.summary, open, true, 0)} alt={`${c.title}${c.summary ? `, ${c.summary}` : ''}, ${open ? 'open' : 'collapsed'}`} width={W} height={HEADER_H} />
                  {pressable(`card-${c.key}`, HEADER_H, toggle(c.key))}
                </Box>
                {open &&
                  c.rows.map((r, i) => {
                    const tail = i === c.rows.length - 1 ? TAIL : 0
                    return (
                      <Box key={r.id} flexDirection="column">
                        <Svg source={r.draw(W, tail)} alt={r.alt} width={W} height={r.height + tail} />
                        {r.onPress ? pressable(r.id, r.height, r.onPress) : null}
                      </Box>
                    )
                  })}
              </Box>
            )
          })}
        </Box>
      )
    }

    // Terminal and the other surfaces: the same sections in text rows.
    return (
      <Box flexDirection="column">
        {creditsBox}
        <Box flexDirection="column" gap={1}>
        {sections.map(c => {
          const open = isOpen(c.key)
          return (
            <Box key={c.key} flexDirection="column">
              <Button key={`card-${c.key}`} label={`${open ? '▾' : '▸'} ${c.title}${c.summary ? ` · ${c.summary}` : ''}`} plain onPress={toggle(c.key)} />
              {open ? c.text() : null}
            </Box>
          )
        })}
        </Box>
      </Box>
    )
  })
}
