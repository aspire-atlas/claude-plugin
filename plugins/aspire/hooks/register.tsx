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
import { creditsOf, isOrgSelected, creditsView, fmtAtlasUsage, fmtCredits, isAtlasStatusCall, isAtlasToolName, readAtlasCredits, readAtlasOrg, readAtlasUsage } from './atlas-usage'
import type { CreditsView } from './atlas-usage'
import { ACCENT, BRAND, DOC, NEUTRAL, SEMANTIC, THIRD_PARTY, pairCss } from './palette'
import { ASPIRE, COACH_CRAB, CRAB_CSS, breathOf, characterOf, crab } from './characters'
import type { Character } from './characters'
import { AGENT_CHARACTERS } from './costumes'
import { logoMarkup, logoSvg, spinnerSvg, terminalMark } from './logo'
import { GROUPS, ROSTER } from './roster'
import type { RosterEntry } from './roster'
import { clip, fitText, fmtTime, fmtTokens, modelName, textWidth, windowOf, xml } from './format'
import { applyTask, countCall, doingOf, endTurn, isTaskTool, planOf, startTurn, stepsOf as stepsFromItems, touch } from './plan'
import type { PlanView } from './plan'
import type { ProgressInput, Shown } from './progress'
import { barText, coachOf, isReportLeading, mergeProgress, orgStateFrom, percentOf, shownOf, titleOf } from './progress'

const PLUGIN = 'aspire'

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

const isActive = atom({ plugin: 'aspire', key: 'isActive' } as const, false)
const trigger = atom({ plugin: 'aspire', key: 'trigger' } as const, null as Trigger | null)
const seen = atom({ plugin: 'aspire', key: 'seen' } as const, BLANK_SEEN)
const progress = atom({ plugin: 'aspire', key: 'progress' } as const, null as Progress | null)
const turn = atom({ plugin: 'aspire', key: 'turn' } as const, null as Turn | null)
const items = atom({ plugin: 'aspire', key: 'items' } as const, [] as Item[])
const org = atom({ plugin: 'aspire', key: 'org' } as const, BLANK_ORG)
const atlas = atom({ plugin: 'aspire', key: 'atlas' } as const, null as AtlasReading | null)
const creditsAtom = atom({ plugin: 'aspire', key: 'credits' } as const, null as AtlasCreditsReading | null)
const stats = atom({ plugin: 'aspire', key: 'stats' } as const, { turn: 0, speed: null, context: 0 } as BandStats)
const isBandHidden = atom({ plugin: 'aspire', key: 'isBandHidden' } as const, false)
const agents = atom({ plugin: 'aspire', key: 'agents' } as const, [] as AgentRun[])
/** The cards that start open; the agent roster's groups start collapsed. */
const DEFAULT_OPEN = ['progress', 'running', 'finished', 'agents']
const panel = atom({ plugin: 'aspire', key: 'panel' } as const, { isAutoOpened: false, open: DEFAULT_OPEN, leaving: null } as Panel)
const now = atom({ plugin: 'aspire', key: 'now' } as const, 0)
/** The "queued in the prompt box" notice above the prompt (desktop); null when none shows. */
const notice = atom({ plugin: 'aspire', key: 'notice' } as const, null as Notice | null)
/** How long the notice stays, in milliseconds. */
const NOTICE_MS = 6000
/** The prompt coach card above the bar; null when none shows. Set only by the skill's progress report. */
const coach = atom({ plugin: 'aspire', key: 'coach' } as const, null as Coach | null)
/** The progress line last put under the prompt (undefined when none), kept in session state so a module reload still knows to clear it. */
const statusLine = atom({ plugin: 'aspire', key: 'statusLine' } as const, null as string | null)
/** How long the coach card stays without a new report, in milliseconds. */
const COACH_MS = 5 * 60 * 1000

/** The aspire skill: `/aspire`, `/aspire:aspire`, or the Skill tool's `aspire:aspire`. */
const ASPIRE_SKILL = /^(aspire:)?aspire$/
/** A prompt typed as `/aspire` or `/aspire:aspire`, with or without arguments; not `/aspire-agents-info`. */
const ASPIRE_PROMPT = /^\s*\/(aspire:)?aspire(?=\s|$)/
// The panel's command is `/aspire-agents-info`, written as a literal where it is
// registered and matched (the validator reads literals). Not `/aspire agents`,
// the skill's own list of agents, and not a prefix of any skill command.
const PANE = 'aspire-agents'
const PANE_TITLE = 'Aspire agents'
const MAX_RUNS = 200
// The progress tool as the model calls it: mcp__<plugin>__<name>.
const PROGRESS_TOOL = 'mcp__aspire__aspire_progress'
const STEP_TOOL = 'mcp__aspire__aspire_step'

// ---------------------------------------------------------------------------
// Switching on.

const isAspireAgent = (type: string, plugin: string | undefined): boolean => type.startsWith('aspire:') || plugin === PLUGIN

// The one timer: running agents' clocks. Started when
// the mod switches on, never before; a reload starts it again from session.start.
let ticker: { cancel: () => void } | null = null

// Whether the AbovePrompt slot is drawn at all on this surface. A render hook
// never writes $.state (drawing is pure), so the count is a module variable: it
// starts over on a hot reload and on /clear, and the next render counts again.
// `crab` is the bar's agent counter character: drawn at random from the agents' crabs when the bar loads or a new run starts.
const band: { renders: number; surface: string | null; crab: Character | null } = { renders: 0, surface: null, crab: null }
const pickCrab = (): Character => AGENT_CHARACTERS[Math.floor(Math.random() * AGENT_CHARACTERS.length)] as Character

const tick = async ($: EngineInterface): Promise<void> => {
  const at = await $.clock.now()
  await syncStatus($)
  const t = await read($, turn)
  if ((await read($, agents)).some(a => a.status === 'running') || (t && t.end === undefined)) await update($, now, () => at)
}

const startTicking = ($: EngineInterface): void => {
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

const count = ($: EngineInterface, key: Count) => update($, seen, s => ({ ...s, [key]: s[key] + 1 }))

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
const setStatus = async ($: EngineInterface, text: string | undefined, force = false): Promise<void> => {
  try {
    if (!force && (text ?? null) === (await read($, statusLine))) return
    // The state holds JSON, so "no line" is null there.
    await update($, statusLine, () => text ?? null)
    $.ui.status(text)
  } catch {
    // A convenience.
  }
}
const syncStatus = async ($: EngineInterface): Promise<void> => {
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
const reconcileAgents = async ($: EngineInterface): Promise<void> => {
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

const isOn = async ($: EngineInterface): Promise<boolean> => {
  try {
    return await read($, isActive)
  } catch {
    return false
  }
}

/** The /aspire flow now reporting progress (the skill has not finished it), or null: what the question dialog and the spinner speak of. */
const flowOf = async ($: EngineInterface): Promise<Progress | null> => {
  try {
    if (!(await read($, isActive))) return null
    const p = await read($, progress)
    return p && !p.isFinished ? p : null
  } catch {
    return null
  }
}

/** `get_status` from `mcp__<server>__get_status`, for the status line. */
const shortTool = (tool: string): string => tool.replace(/^mcp__.*__/, '')

/** `mcp__<server>__` of each connector that has answered as Aspire Atlas, for a server whose name does not say so. Names only. */
const atlasServers = new Set<string>()
const serverOf = (tool: string): string => /^(mcp__.+?__)/.exec(tool)?.[1] ?? ''
/** An Atlas connector tool (the progress and step tools are the mod's own and never count). */
const isAtlasTool = (tool: string): boolean => tool.startsWith('mcp__') && tool !== PROGRESS_TOOL && tool !== STEP_TOOL && (isAtlasToolName(tool) || atlasServers.has(serverOf(tool)))

// ---------------------------------------------------------------------------
// The Artifact card: the transcript's result row for a published Artifact.

/** What a publish call said about its page, by the call's id: the result carries the URL, the call carries the title and description. */
const published = new Map<string, { title?: string; description?: string; file?: string }>()
const MAX_PUBLISHED = 50
const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
const ARTIFACT_URL_RE = /https:\/\/claude\.ai\/(?:code\/)?artifact\/[A-Za-z0-9_-]+/g
/** Artifact links a subagent hand-back has already logged, bounded. */
const loggedLinks = new Set<string>()
const MAX_LOGGED = 100
const artifactUrl = (out: unknown, depth = 0): string | undefined => {
  if (typeof out === 'string') return out.match(ARTIFACT_URL_RE)?.[0]
  if (!out || typeof out !== 'object' || depth > 3) return undefined
  const direct = str((out as Record<string, unknown>).url)
  if (direct) return direct
  for (const v of Array.isArray(out) ? out : Object.values(out)) {
    const found = artifactUrl(v, depth + 1)
    if (found) return found
  }
  return undefined
}
const slackDraft = (url: string): string =>
  `Share this artifact on Slack: ${url}. Ask me with AskUserQuestion which channel or person, write a short message, show it, and post only after I confirm.`

// ---------------------------------------------------------------------------
// The progress bar (from savvy-progress): title, bar, percent, and the crab.

const DONE = SEMANTIC.done

// The classes each drawing's <style> block switches between light and dark, all from the palette.
const METER_CSS = pairCss({ k: ['fill', NEUTRAL.track], tk: ['fill', NEUTRAL.tick] })
const BAR_ROW_CSS = pairCss({ t: ['fill', NEUTRAL.ink], m: ['fill', NEUTRAL.soft], k: ['fill', NEUTRAL.track], tk: ['fill', NEUTRAL.tick] })
const BAND_CSS = pairCss({
  t: ['fill', NEUTRAL.ink],
  m: ['fill', NEUTRAL.soft],
  k: ['fill', NEUTRAL.track],
  tk: ['fill', NEUTRAL.tick],
  pk: ['stroke', NEUTRAL.soft],
  pf: ['fill', NEUTRAL.soft],
})
const PANE_THEME_CSS = pairCss({
  t: ['fill', NEUTRAL.ink],
  s: ['fill', NEUTRAL.subtle],
  m: ['fill', NEUTRAL.muted],
  k: ['fill', NEUTRAL.track],
  tk: ['fill', NEUTRAL.tick],
  ln: ['stroke', NEUTRAL.track],
  cv: ['stroke', NEUTRAL.muted],
  sw: ['fill', NEUTRAL.swatch],
  tile: ['fill', NEUTRAL.surface],
  er: ['stroke', SEMANTIC.error],
  ef: ['fill', SEMANTIC.error],
})
// The whole row is one SVG: the desktop wraps sibling elements onto new lines,
// so title, bar, percent, and the agent counter with its crab live in one
// drawing, with blank Buttons laid over it to take the presses.
const BAR_ROW_H = 22
/** The Artifact card's document icon, after the Claude Docs artifact icon: a page whose lines, letter and check draw in one after another, then rest, then repeat. */
const DOC_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="46" viewBox="0 0 40 46">
<style>
.pg{fill:${DOC.page.light};stroke:${DOC.pageEdge.light}}.ln{fill:${DOC.line.light}}.ls{fill:${DOC.faint.light}}.ab{fill:${DOC.accent.light}}.ck{fill:${DOC.check.light}}.cm{stroke:${DOC.checkMark.light}}
@media (prefers-color-scheme: dark){.pg{fill:${DOC.page.dark};stroke:${DOC.pageEdge.dark}}.ln{fill:${DOC.line.dark}}.ls{fill:${DOC.faint.dark}}.ab{fill:${DOC.accent.dark}}.ck{fill:${DOC.check.dark}}.cm{stroke:${DOC.checkMark.dark}}}
.d{transform-box:fill-box;transform-origin:0 50%;animation:dr 3.6s ease-out infinite both}
.d2{animation-delay:.25s}.d3{animation-delay:.5s}.d4{animation-delay:.75s}.d5{animation-delay:1s}
.pp{transform-box:fill-box;transform-origin:50% 50%;animation:pp 3.6s ease-out infinite both;animation-delay:.6s}
.fa{animation:fa 3.6s ease-out infinite both;animation-delay:.3s}
@keyframes dr{0%,4%{transform:scaleX(0)}22%,86%{transform:scaleX(1)}96%,100%{transform:scaleX(1);opacity:0}}
@keyframes pp{0%,10%{transform:scale(0)}26%{transform:scale(1.25)}34%,86%{transform:scale(1)}96%,100%{transform:scale(1);opacity:0}}
@keyframes fa{0%,6%{opacity:0}22%,86%{opacity:1}96%,100%{opacity:0}}
@media (prefers-reduced-motion: reduce){.d,.pp,.fa{animation:none}}
</style>
<rect class="pg" x="2" y="1" width="36" height="44" rx="7" stroke-width="0.6"/>
<rect class="ln d" x="9" y="7" width="14" height="3.4" rx="1.7"/>
<text class="ab fa" x="8.5" y="26" font-family="Georgia,serif" font-size="15" font-weight="600">A</text>
<rect class="ls d d2" x="19" y="15" width="13" height="2.6" rx="1.3"/>
<rect class="ls d d3" x="19" y="20.5" width="11" height="2.6" rx="1.3"/>
<rect class="ls d d3" x="9" y="28" width="23" height="2.6" rx="1.3"/>
<g class="pp"><circle class="ck" cx="11" cy="35.5" r="2.8"/><path class="cm" d="M9.6 35.6l1.1 1.1 2-2.2" fill="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></g>
<rect class="ls d d4" x="15.5" y="34.2" width="12" height="2.6" rx="1.3"/>
</svg>`
/** The Slack mark (four coloured pill pairs), its own brand colours in light and dark. */
const SLACK_MARK = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="60 60 150 150"><path fill="${THIRD_PARTY.slackRed}" d="M99.4,151.2c0,7.1-5.8,12.9-12.9,12.9c-7.1,0-12.9-5.8-12.9-12.9c0-7.1,5.8-12.9,12.9-12.9h12.9V151.2z"/><path fill="${THIRD_PARTY.slackRed}" d="M105.9,151.2c0-7.1,5.8-12.9,12.9-12.9s12.9,5.8,12.9,12.9v32.3c0,7.1-5.8,12.9-12.9,12.9s-12.9-5.8-12.9-12.9V151.2z"/><path fill="${THIRD_PARTY.slackBlue}" d="M118.8,99.4c-7.1,0-12.9-5.8-12.9-12.9c0-7.1,5.8-12.9,12.9-12.9s12.9,5.8,12.9,12.9v12.9H118.8z"/><path fill="${THIRD_PARTY.slackBlue}" d="M118.8,105.9c7.1,0,12.9,5.8,12.9,12.9s-5.8,12.9-12.9,12.9H86.5c-7.1,0-12.9-5.8-12.9-12.9s5.8-12.9,12.9-12.9H118.8z"/><path fill="${THIRD_PARTY.slackGreen}" d="M170.6,118.8c0-7.1,5.8-12.9,12.9-12.9c7.1,0,12.9,5.8,12.9,12.9s-5.8,12.9-12.9,12.9h-12.9V118.8z"/><path fill="${THIRD_PARTY.slackGreen}" d="M164.1,118.8c0,7.1-5.8,12.9-12.9,12.9c-7.1,0-12.9-5.8-12.9-12.9V86.5c0-7.1,5.8-12.9,12.9-12.9c7.1,0,12.9,5.8,12.9,12.9V118.8z"/><path fill="${THIRD_PARTY.slackYellow}" d="M151.2,170.6c7.1,0,12.9,5.8,12.9,12.9c0,7.1-5.8,12.9-12.9,12.9c-7.1,0-12.9-5.8-12.9-12.9v-12.9H151.2z"/><path fill="${THIRD_PARTY.slackYellow}" d="M151.2,164.1c-7.1,0-12.9-5.8-12.9-12.9c0-7.1,5.8-12.9,12.9-12.9h32.3c7.1,0,12.9,5.8,12.9,12.9c0,7.1-5.8,12.9-12.9,12.9H151.2z"/></svg>`
const BAR_H = 16
const CRAB_W = 0
const CELL = 3

// Deterministic noise so the dither does not shimmer between redraws.
const noise = (x: number, y: number): number => {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

/** Pixels twinkle in four out-of-phase groups; a finished bar settles to a slow glow. */
const twinkleCss = (shown: Shown): string => `.t0,.t1,.t2,.t3{animation:tw ${shown.isFinished ? 3.2 : 2.2}s ease-in-out infinite}
.t1{animation-duration:${shown.isFinished ? 3.8 : 2.8}s;animation-delay:-.7s}.t2{animation-duration:${shown.isFinished ? 4.4 : 1.9}s;animation-delay:-1.3s}.t3{animation-duration:${shown.isFinished ? 3.5 : 3.3}s;animation-delay:-.4s}
@keyframes tw{0%,100%{opacity:1}50%{opacity:${shown.isFinished ? 0.8 : 0.3}}}
@media (prefers-reduced-motion: reduce){.t0,.t1,.t2,.t3{animation:none}}`

/** The dithered bar and its step pill at (0,0): BAR_W wide, BAR_H tall. */
const meterGroup = (shown: Shown, BAR_W: number): string => {
  const color = shown.isFinished ? DONE : ASPIRE
  const fillW = Math.round(BAR_W * shown.ratio)

  // Dithered fill: sparse at the start, dense toward the head.
  const dots: string[] = []
  const cols = Math.floor(fillW / CELL)
  const rows = Math.floor(BAR_H / CELL)
  for (let c = 0; c < cols; c++) {
    const density = 0.35 + 0.6 * Math.pow(c / Math.max(1, cols), 1.2)
    for (let r = 0; r < rows; r++) {
      if (noise(c, r) < density) dots.push(`<rect class="t${Math.floor(noise(r, c) * 4)}" x="${c * CELL + 1}" y="${r * CELL + 1}" width="2" height="2"/>`)
    }
  }
  const ticks: string[] = []
  for (let i = 1; i < shown.total; i++) {
    const x = Math.round((BAR_W * i) / shown.total)
    if (x > fillW + 4) ticks.push(`<rect x="${x}" y="${BAR_H / 2 - 4}" width="1.5" height="8" rx="0.75"/>`)
  }

  const pill = fitText(shown.label, 11, Math.max(20, BAR_W - 18))
  const pillW = Math.min(BAR_W, Math.round(18 + textWidth(pill, 11)))
  const pillX = Math.max(0, Math.min(BAR_W - pillW, fillW - pillW))

  return `<defs><clipPath id="aspire-bar-clip"><rect x="0" y="0" width="${BAR_W}" height="${BAR_H}" rx="${BAR_H / 2}"/></clipPath><clipPath id="aspire-fill-clip"><rect x="0" y="0" width="${Math.max(fillW, BAR_H)}" height="${BAR_H}" rx="${BAR_H / 2}"/></clipPath></defs>
<rect class="k" width="${BAR_W}" height="${BAR_H}" rx="${BAR_H / 2}"/>
<g clip-path="url(#aspire-bar-clip)">
<g clip-path="url(#aspire-fill-clip)"><g fill="${color}">${dots.join('')}</g></g>
<g class="tk">${ticks.join('')}</g>
</g>
<rect x="${pillX}" width="${pillW}" height="${BAR_H}" rx="${BAR_H / 2}" fill="${color}"/>
<text x="${pillX + pillW / 2}" y="${BAR_H / 2 + 4}" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="600" fill="${BRAND.white}">${xml(pill)}</text>`
}

/** The bar row's shapes, without a style block: the band wraps them in their own, the panel's progress card in the panel's. */
const barShapes = (title: string, shown: Shown, W: number): string => {
  // The title takes what it needs, up to 40% of the row; the bar takes the rest.
  const label = fitText(title, 13, Math.max(60, W * 0.4))
  const BAR_X = Math.round(16 + textWidth(label, 13) + 12)
  const BAR_W = Math.max(60, W - BAR_X - 46 - CRAB_W)
  const color = shown.isFinished ? DONE : ASPIRE
  const y0 = (BAR_ROW_H - BAR_H) / 2

  return `<circle cx="5" cy="${BAR_ROW_H / 2}" r="4" fill="${color}"/>
<text class="t" x="16" y="${BAR_ROW_H / 2 + 4.5}" font-family="${FONT}" font-size="13" font-weight="500">${xml(label)}</text>
<g transform="translate(${BAR_X},${y0})">
${meterGroup(shown, BAR_W)}
</g>
<text class="m" x="${W - CRAB_W - 6}" y="${BAR_ROW_H / 2 + 4.5}" text-anchor="end" font-family="${FONT}" font-size="12.5" font-variant-numeric="tabular-nums">${percentOf(shown)}</text>
`
}

/** Wide enough that the host always clamps the drawing to the room the row leaves it, never grows it past that. */
const METER_SLOT_MAX = 4000
/** The widest layout the band's bar is drawn for: its dots stay well under the host's cap on an Svg's source. */
const METER_LAYOUT_MAX = 1000
/** How much of the estimated room the bar is laid out for: a little under 1, so a small misjudgement shrinks the bar a hair instead of leaving a visible gap. */
const METER_FIT = 0.95

/**
 * Only the dithered bar and its step pill, for the band's row, where Buttons carry the text either side of it.
 *
 * The host takes a drawing's own width up to its slot, and the band cannot know that room in pixels (a column's width differs by
 * font and screen). So the markup is laid out at `W`, the room estimated from the column count (METER_FIT), and declares a width past
 * any slot with `preserveAspectRatio="xMinYMid meet"`: the host clamps it to the room the row leaves and fits the whole drawing
 * inside it at one scale. `meet` never magnifies: a bar wider than the room shrinks a little, and one that falls short stays at its
 * natural size, so the pill's text is always 11px. (`slice` scaled the drawing up to cover the room, which enlarged the text and
 * cropped the pill's top and bottom whenever the guess ran low.)
 */
const meterSvg = (shown: Shown, W: number): string => `<svg xmlns="http://www.w3.org/2000/svg" width="${METER_SLOT_MAX}" height="${BAR_ROW_H}" viewBox="0 0 ${W} ${BAR_ROW_H}" preserveAspectRatio="xMinYMid meet">
<style>
${METER_CSS}
${twinkleCss(shown)}
</style>
<g transform="translate(0,${(BAR_ROW_H - BAR_H) / 2})">
${meterGroup(shown, W)}
</g>
</svg>`

// The band's right edge: the agent counter (a walking crab and the count) after the percent.
const BAND_CRAB_SCALE = 0.6
const BAND_CRAB_W = 36 * BAND_CRAB_SCALE
/** The crab and the count sit together at the row's right edge: this is the room they take, gaps included. */
/** The far right edge: the right-panel icon that opens the side panel. */
const EDGE_W = 30
const panelIcon = (x: number): string => {
  const y = (BAR_ROW_H - 14) / 2
  return `<g transform="translate(${x},${y})"><rect class="pk" x="0.75" y="0.75" width="18.5" height="12.5" rx="2.5" fill="none" stroke-width="1.5"/><path class="pf" d="M12 1.5h5.5a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H12z"/></g>`
}
const countWidth = (count: number): number => Math.ceil(8 + textWidth(`×${count}`, 12.5) + 4 + BAND_CRAB_W + 10)

/**
 * The queued notice: one Svg row with the pressed agent's own animated crab, and the text.
 * Light and dark values come from the media query; the crab's motion stops under prefers-reduced-motion (CRAB_CSS).
 */
const NOTICE_H = 26
const noticeText = (name: string): string => `${name} is queued in the prompt box. Press Enter to run it.`
const noticeSvg = (character: Character, name: string, W: number): string => {
  const scale = 0.7
  const textX = 10 + 36 * scale + 8
  const text = fitText(noticeText(name), 13, Math.max(40, W - textX - 8))
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${NOTICE_H}" viewBox="0 0 ${W} ${NOTICE_H}">
<style>
${pairCss({ nt: ['fill', NEUTRAL.ink] })}
</style>
${CRAB_CSS}
${crab(10, (NOTICE_H - 30 * scale) / 2, character, false, true, scale)}
<text class="nt" x="${textX}" y="${NOTICE_H / 2 + 4.5}" font-family="${FONT}" font-size="13" font-weight="500">${xml(text)}</text>
</svg>`
}

/**
 * The prompt coach card: one Svg row like the notice, with the coach crab, the round label (when there is one) and the verdict.
 * Same light and dark teal; the crab's motion stops under prefers-reduced-motion (CRAB_CSS).
 */
const COACH_H = 26
const coachLabel = (verdict: string, step: string | null): string => (step ? `${step} · ${verdict}` : verdict)
const coachSvg = (verdict: string, step: string | null, W: number): string => {
  const scale = 0.7
  const textX = 10 + 36 * scale + 8
  const text = fitText(coachLabel(verdict, step), 13, Math.max(40, W - textX - 8))
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${COACH_H}" viewBox="0 0 ${W} ${COACH_H}">
<style>
${pairCss({ ct: ['fill', NEUTRAL.ink] })}
</style>
${CRAB_CSS}
${crab(10, (COACH_H - 30 * scale) / 2, COACH_CRAB, false, true, scale)}
<text class="ct" x="${textX}" y="${COACH_H / 2 + 4.5}" font-family="${FONT}" font-size="13" font-weight="500">${xml(text)}</text>
</svg>`
}

/** The band's whole row in one drawing: title, bar, percent, and the agent counter with its crab. */
const bandSvg = (title: string, shown: Shown, W: number, count: number, character: Character): string => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${BAR_ROW_H}" viewBox="0 0 ${W} ${BAR_ROW_H}">
<style>
${BAND_CSS}
${twinkleCss(shown)}
</style>
${CRAB_CSS}
${barShapes(title, shown, W - EDGE_W - countWidth(count))}
${crab(W - EDGE_W - countWidth(count) + 10, (BAR_ROW_H - 30 * BAND_CRAB_SCALE) / 2, character, false, true, BAND_CRAB_SCALE)}
<text class="m" x="${W - EDGE_W - 8}" y="${BAR_ROW_H / 2 + 4.5}" text-anchor="end" font-family="${FONT}" font-size="12.5" font-variant-numeric="tabular-nums">×${count}</text>
${panelIcon(W - EDGE_W + 4)}
</svg>`

/** The bar's agent counter crab alone, for the band's row between the percent Button and the count Button: an animated, randomly drawn crab. */
const crabSvg = (character: Character): string => {
  const W = Math.ceil(BAND_CRAB_W + 4)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${BAR_ROW_H}" viewBox="0 0 ${W} ${BAR_ROW_H}">
${CRAB_CSS}
${crab(2, (BAR_ROW_H - 30 * BAND_CRAB_SCALE) / 2, character, false, true, BAND_CRAB_SCALE)}
</svg>`
}

/** The title's bullet as a tiny Svg (a Button holds only text, so its dot would be plain white): Aspire teal, the done green once finished. */
const dotSvg = (shown: Shown): string => {
  const fill = shown.isFinished ? `fill="${DONE}"` : `class="dt"`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="${BAR_ROW_H}" viewBox="0 0 12 ${BAR_ROW_H}">
<style>${pairCss({ dt: ['fill', ACCENT] })}</style>
<circle ${fill} cx="6" cy="${BAR_ROW_H / 2}" r="4"/>
</svg>`
}

const barSvg = (title: string, shown: Shown, W: number): string => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${BAR_ROW_H}" viewBox="0 0 ${W} ${BAR_ROW_H}">
<style>
${BAR_ROW_CSS}
${twinkleCss(shown)}
</style>
${barShapes(title, shown, W)}
</svg>`

// ---------------------------------------------------------------------------
// The band above the prompt (from session-band), now the bar's second row.

// Responses shorter than this are mostly tool-call stubs: their timing is noise.
const MIN_TOKENS = 20
// A response that arrived in one burst cannot be timed; such readings are dropped.
const MIN_SECONDS = 0.5
const MAX_SPEED = 1000

// Density by the band's width in cells, so the row shrinks instead of wrapping:
// 0 full; 1 no context bar; 2 compact turn/speed, short Atlas label; 3 no turn,
// smaller icons; 4 no speed. Thresholds are minimum bodyColumns for each tier.
const TIER_MIN = [96, 80, 64, 50] as const
const GAPS = [3, 2, 2, 1, 1] as const
const tierFor = (columns: number): number => {
  const i = TIER_MIN.findIndex(min => columns >= min)
  return i === -1 ? TIER_MIN.length : i
}

const refreshContext = async ($: EngineInterface): Promise<void> => {
  const { context } = await $.session.usage()
  if (typeof context.percent === 'number') {
    const percent = context.percent
    await update($, stats, s => ({ ...s, context: percent }))
  }
}

// ---------------------------------------------------------------------------
// The agents panel (from savvy-progress), English only.

const fmtCount = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const elapsed = (a: AgentRun, at: number): number => (a.endedAt ?? Math.max(at, a.startedAt)) - a.startedAt

const spanOf = (list: AgentRun[], at: number): number => {
  if (!list.length) return 0
  const start = Math.min(...list.map(a => a.startedAt))
  const end = Math.max(...list.map(a => a.endedAt ?? Math.max(at, a.startedAt)))
  return end - start
}

const runModel = (a: AgentRun): string => (a.effort ? `${modelName(a.model)} · ${a.effort}` : modelName(a.model))

const ctxOf = (a: AgentRun): number => (a.contextMax ? Math.min(100, Math.round((a.contextTokens / a.contextMax) * 100)) : 0)

const norm = (s: string): string => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif"

// The panel is one accordion, in the look of Claude's own sidebar: sections that show
// only their top edge (a thin line that curves down at both ends), a small title with a
// light chevron after it, a muted value on the right, and sub-accordions inside.
const ROW_H = 62
const HEADER_H = 40
const SUB_H = 28
const CARD_R = 12
const TAIL = 8

const PANE_CSS = `<style>
${PANE_THEME_CSS}
.live{animation:p 1.6s ease-in-out infinite}@keyframes p{50%{opacity:.3}}
@media (prefers-reduced-motion: reduce){.live{animation:none}}
</style>`

const svg = (W: number, H: number, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${PANE_CSS}${CRAB_CSS}${body}</svg>`

const statusMark = (x: number, y: number, status: string, color: string): string => {
  if (status === 'running') return `<circle class="live" cx="${x}" cy="${y}" r="3.5" fill="${color}"/>`
  if (status === 'done') return `<path d="M${x - 5} ${y}l3.5 3.5 6.5-7" fill="none" stroke="${DONE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
  return `<path d="M${x - 4} ${y - 4}l8 8M${x + 4} ${y - 4}l-8 8" class="er" stroke-width="1.8" stroke-linecap="round"/>`
}

/** One drawn row of the accordion; `edge` draws a section's top edge, `tail` is the space left under a section's last row. */
const rowSvg = (W: number, H: number, edge: boolean, tail: number, body: string): string =>
  svg(
    W,
    H + tail,
    `${edge ? `<path class="ln" fill="none" stroke-width="1" d="M0.5 ${CARD_R}A${CARD_R} ${CARD_R} 0 0 1 ${CARD_R} 0.5H${W - CARD_R}A${CARD_R} ${CARD_R} 0 0 1 ${W - 0.5} ${CARD_R}"/>` : ''}${body}`,
  )

/** A thin chevron: down when open, right when collapsed, with its tip near (x, y). */
const chevron = (x: number, y: number, isOpen: boolean): string =>
  `<path class="cv" fill="none" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" d="${isOpen ? `M${x} ${y - 2}l3.5 3.5 3.5-3.5` : `M${x + 1.5} ${y - 4}l3.5 3.5-3.5 3.5`}"/>`

/** A section's header: the title, a light chevron right after it, and a muted value on the right. */
const headerSvg = (W: number, title: string, summary: string, isOpen: boolean, edge: boolean, tail: number): string => {
  const shownTitle = fitText(title, 13, W - 90)
  const tx = 16 + textWidth(shownTitle, 13) + 7
  const room = Math.max(0, W - 16 - (tx + 12) - 8)
  return rowSvg(
    W,
    HEADER_H,
    edge,
    tail,
    `<text class="t" x="16" y="${edge ? 26 : 24}" font-family="${FONT}" font-size="13" font-weight="500">${xml(shownTitle)}</text>
${chevron(tx, edge ? 24 : 22, isOpen)}
${summary && room > 24 ? `<text class="s" x="${W - 16}" y="${edge ? 26 : 24}" text-anchor="end" font-family="${FONT}" font-size="12" font-variant-numeric="tabular-nums">${xml(fitText(summary, 12, room))}</text>` : ''}`,
  )
}

/** A sub-accordion's header: a chevron on the left, the label, and a count on the right. */
const subHeaderSvg = (W: number, title: string, count: string, isOpen: boolean, tail: number): string =>
  rowSvg(
    W,
    SUB_H,
    false,
    tail,
    `${chevron(16, 14, isOpen)}
<text class="t" x="36" y="18" font-family="${FONT}" font-size="12">${xml(fitText(title, 12, W - 100))}</text>
<text class="s" x="${W - 16}" y="18" text-anchor="end" font-family="${FONT}" font-size="12" font-variant-numeric="tabular-nums">${xml(count)}</text>`,
  )

/** The progress section's body: the bar the band shows, then one row for each task the skill reported. */
const PROGRESS_H = 34
const TASK_H = 22
const progressBodySvg = (W: number, title: string, shown: Shown, tasks: { title: string; isDone: boolean }[], tail: number): string =>
  rowSvg(
    W,
    PROGRESS_H + tasks.length * TASK_H,
    false,
    tail,
    `<style>${twinkleCss(shown)}</style><g transform="translate(16,${(PROGRESS_H - BAR_ROW_H) / 2 - 2})">${barShapes(title, shown, W - 32)}</g>${tasks
      .map(
        (t, i) =>
          `<rect ${t.isDone ? `fill="${DONE}"` : 'class="sw"'} x="${HEAD_TEXT_X}" y="${PROGRESS_H + i * TASK_H + 6}" width="10" height="10" rx="2.5"/>
<text class="${t.isDone ? 't' : 's'}" x="${HEAD_TEXT_X + 17}" y="${PROGRESS_H + i * TASK_H + 15}" font-family="${FONT}" font-size="12">${xml(fitText(t.title, 12, W - 117))}</text>
<text class="s" x="${W - 16}" y="${PROGRESS_H + i * TASK_H + 15}" text-anchor="end" font-family="${FONT}" font-size="11">${t.isDone ? 'done' : ''}</text>`,
      )
      .join('')}`,
  )

/** The progress section's body for the agent's own plan: the request and its time, the step bar, then a row and a bar for each step. */
const PLAN_HEAD_H = 28
const PLAN_TOP = PLAN_HEAD_H + PROGRESS_H - 12
const PLAN_ROW_H = 24
const PLAN_NOTE_H = 18
const PLAN_DOING_H = 20
// The bar's bullet sits at x 21 with its label at 32; the heading's star shares that centre and the title that
// edge, and a step's bullet is centred under the label's first letter, with the same 7px from bullet to text.
const MARK_X = 21
const HEAD_TEXT_X = 32
const STEP_X = 36
const STEP_TEXT_X = 47
const STOPPED = SEMANTIC.stopped
const planH = (view: PlanView): number =>
  PLAN_TOP +
  6 +
  (view.before ? PLAN_NOTE_H : 0) +
  view.rows.reduce((n, r) => n + PLAN_ROW_H + (r.kind === 'now' && r.doing ? PLAN_DOING_H : 0), 0) +
  (view.after ? PLAN_NOTE_H : 0) +
  (view.files ? PLAN_NOTE_H : 0)
const planBodySvg = (W: number, title: string, shown: Shown, view: PlanView, tail: number): string => {
  const accent = view.state === 'stopped' ? STOPPED : view.state === 'done' ? DONE : ASPIRE
  const badgeW = view.badge ? textWidth(`✓ ${view.badge}`, 12) + 8 : 0
  const timeW = textWidth(view.time, 11) + 8
  const font = `font-family="${FONT}"`
  let y = PLAN_TOP
  const parts: string[] = [
    `${
      view.badge
        ? `<text x="16" y="18" ${font} font-size="12" font-weight="500"><tspan fill="${accent}" font-weight="600">${view.state === 'done' ? '✓' : '■'} ${xml(view.badge)}</tspan><tspan class="t" dx="8">${xml(fitText(view.title, 12, W - 32 - badgeW - timeW))}</tspan></text>`
        : `<text x="${MARK_X}" y="18" text-anchor="middle" fill="${accent}" ${font} font-size="11">✦</text>
<text class="t" x="${HEAD_TEXT_X}" y="18" ${font} font-size="12" font-weight="500">${xml(fitText(view.title, 12, W - HEAD_TEXT_X - 16 - timeW))}</text>`
    }
<text class="s" x="${W - 16}" y="18" text-anchor="end" ${font} font-size="11" font-variant-numeric="tabular-nums">${xml(view.time)}</text>
<style>${twinkleCss(shown)}</style><g transform="translate(16,${PLAN_HEAD_H - 2})">${barShapes(title, shown, W - 32)}</g>`,
  ]
  const note = (text: string) => {
    parts.push(`<text class="s" x="${STEP_TEXT_X}" y="${y + 13}" ${font} font-size="11">${xml(text)}</text>`)
    y += PLAN_NOTE_H
  }
  if (view.before) note(`✓ ${view.before}`)
  const statusW = 46
  const miniW = 40
  const barX = W - 16 - statusW - 6 - miniW
  for (const r of view.rows) {
    const color = r.kind === 'done' ? DONE : r.kind === 'now' ? ASPIRE : STOPPED
    const cy = y + 12
    const icon =
      r.kind === 'done'
        ? `<path d="M${STEP_X - 4} ${cy}l3 3 5-6" fill="none" stroke="${DONE}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`
        : r.kind === 'now'
          ? `<circle cx="${STEP_X}" cy="${cy}" r="4" fill="${ASPIRE}"/>`
          : r.kind === 'halted'
            ? `<rect x="${STEP_X - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.5" fill="${STOPPED}"/>`
            : `<circle class="cv" cx="${STEP_X}" cy="${cy}" r="3.5" fill="none" stroke-width="1.2"/>`
    parts.push(
      `${icon}<text class="${r.kind === 'now' ? 't' : r.kind === 'done' ? 't' : 's'}" x="${STEP_TEXT_X}" y="${y + 16}" ${font} font-size="12"${r.kind === 'now' ? ' font-weight="600"' : ''}>${xml(fitText(r.text, 12, barX - STEP_TEXT_X - 10))}</text>
<rect class="k" x="${barX}" y="${y + 10}" width="${miniW}" height="4" rx="2"/>${r.frac > 0 ? `<rect x="${barX}" y="${y + 10}" width="${Math.max(3, Math.round(miniW * r.frac))}" height="4" rx="2" fill="${color}"/>` : ''}
<text ${r.kind === 'now' ? `fill="${ASPIRE}" font-weight="600"` : 'class="s"'} x="${W - 16}" y="${y + 15}" text-anchor="end" ${font} font-size="11" font-variant-numeric="tabular-nums">${xml(r.status)}</text>`,
    )
    y += PLAN_ROW_H
    if (r.kind === 'now' && r.doing) {
      parts.push(`<text class="s" x="${STEP_TEXT_X}" y="${y + 6}" ${font} font-size="11">${xml(fitText(r.doing, 11, W - STEP_TEXT_X - 16))}</text>`)
      y += PLAN_DOING_H
    }
  }
  if (view.after) note(`○ ${view.after}`)
  if (view.files) note(view.files)
  return rowSvg(W, planH(view), false, tail, parts.join('\n'))
}

/** The credits bar's amber and red, with dark-mode variants (teal is ASPIRE above 25% left, amber at 25% or less, red at 10% or less or when out). */
const BAR_CSS = pairCss({ 'cb-low': ['fill', SEMANTIC.warn], 'cb-critical': ['fill', SEMANTIC.error] })

/** The credits card, fixed at the top and not collapsible: the Aspire mark and the organization's credits from the latest get_status. */
const CREDIT_H = 78

/** The Aspire mark, animated: the A and the I in white over the progress bar's twinkling dither, in a 512 box. */
const LOGO = logoMarkup()
const LOGO_SIZE = 56
const LOGO_GAP = 10
/** The mark's width in terminal columns, at the 8px a column the desktop grid is sized by. */
const LOGO_COLS = Math.round(LOGO_SIZE / 8)

const creditsCardSvg = (W: number, v: CreditsView): string => {
  const pad = 10
  const x0 = LOGO_SIZE + LOGO_GAP
  const cardW = W - x0
  const barW = cardW - pad * 2
  const fill = Math.round(barW * v.ratio)
  const left = x0 + pad
  const right = W - pad
  const text = (x: number, y: number, cls: string, size: number, body: string, extra = '') =>
    `<text class="${cls}" x="${x}" y="${y}" ${extra} font-family="${FONT}" font-size="${size}" font-variant-numeric="tabular-nums">${xml(body)}</text>`
  const bigW = textWidth(v.big, 22) + 6
  return svg(
    W,
    CREDIT_H + 4,
    `<style>${BAR_CSS}</style><g transform="translate(0,${Math.round((CREDIT_H - 4 - LOGO_SIZE) / 2)}) scale(${LOGO_SIZE / 512})"><title>Aspire</title>${LOGO}</g>
<rect class="tile" x="${x0}" y="0" width="${cardW}" height="${CREDIT_H - 4}" rx="8"/>
${text(left, 17, 's', 11, v.title)}
${v.tag ? text(right, 17, 's', 11, v.tag, 'text-anchor="end"') : ''}
<text class="${v.isOver ? 'ef' : 't'}" x="${left}" y="42" font-family="${FONT}" font-size="22" font-weight="600" font-variant-numeric="tabular-nums">${xml(v.big)}</text>
${v.sub ? text(left + bigW, 42, 's', 12, v.sub) : ''}
<rect class="k" x="${left}" y="50" width="${barW}" height="4" rx="2"/>
${v.ratio > 0 ? `<rect ${v.tone === 'ok' ? `fill="${ASPIRE}"` : `class="cb-${v.tone}"`} x="${left}" y="50" width="${Math.max(3, fill)}" height="4" rx="2"/>` : ''}
${v.metaLeft ? text(left, 68, 's', 11, v.metaLeft) : ''}
${v.metaRight ? text(right, 68, 's', 11, v.metaRight, 'text-anchor="end"') : ''}`,
  )
}

/** One line of muted text, for a section with nothing in it yet. */
const NOTE_H = 28
const noteSvg = (W: number, note: string, tail: number): string =>
  rowSvg(W, NOTE_H, false, tail, `<text class="s" x="16" y="18" font-family="${FONT}" font-size="12">${xml(fitText(note, 12, W - 32))}</text>`)

/** What an agent reported through aspire_step: `2/5 reading posts`, and the fraction. */
const stepsOf = (a: AgentRun): { text: string; ratio: number } | null =>
  a.stepTotal ? { text: `${a.stepDone ?? 0}/${a.stepTotal}${a.stepNote ? ` ${a.stepNote}` : ''}`, ratio: Math.min(1, (a.stepDone ?? 0) / a.stepTotal) } : null

/** An agent's task list for its open row: its own task list when it keeps one, else the steps it reported, else nothing yet. */
type AgentTask = { text: string; kind: 'done' | 'now' | 'todo' }
const agentTasks = (a: AgentRun): AgentTask[] => {
  if (a.items?.length) return a.items.map(i => ({ text: i.subject, kind: i.status === 'completed' ? 'done' : i.status === 'in_progress' ? 'now' : 'todo' }))
  if (!a.stepTotal) return []
  const done = Math.min(a.stepDone ?? 0, a.stepTotal)
  return Array.from({ length: a.stepTotal }, (_, n): AgentTask => {
    const kind = n < done ? 'done' : n === done && a.status === 'running' ? 'now' : 'todo'
    return { text: kind === 'now' && a.stepNote ? a.stepNote : `Step ${n + 1}`, kind }
  })
}
/** The line under an open row that has no task list: what it is doing now while it runs, else that it reported none. */
const noTasksText = (a: AgentRun): string =>
  a.status === 'running' && a.doing ? `No task list from this agent. Working: ${a.doing} · ${a.calls ?? 0} calls` : 'No tasks reported yet.'
const AGENT_TASK_H = 22
const agentTasksH = (tasks: AgentTask[]): number => Math.max(1, tasks.length) * AGENT_TASK_H + 8
/** The task rows under an agent's row, drawn like the Progress section's: a bullet, the task, and done on the right. */
const agentTasksSvg = (W: number, a: AgentRun, tasks: AgentTask[], tail: number): string => {
  const color = characterOf(a).color
  const font = `font-family="${FONT}"`
  const body = tasks.length
    ? tasks
        .map((t, i) => {
          const y = 4 + i * AGENT_TASK_H
          const mark =
            t.kind === 'done'
              ? `<rect fill="${DONE}" x="50" y="${y + 6}" width="10" height="10" rx="2.5"/>`
              : t.kind === 'now'
                ? `<rect fill="${color}" x="50" y="${y + 6}" width="10" height="10" rx="2.5"/>`
                : `<rect class="sw" x="50" y="${y + 6}" width="10" height="10" rx="2.5"/>`
          return `${mark}<text class="${t.kind === 'todo' ? 's' : 't'}" x="67" y="${y + 15}" ${font} font-size="12"${t.kind === 'now' ? ' font-weight="600"' : ''}>${xml(fitText(t.text, 12, W - 67 - 60))}</text>
<text class="s" x="${W - 16}" y="${y + 15}" text-anchor="end" ${font} font-size="11">${t.kind === 'done' ? 'done' : t.kind === 'now' ? 'now' : ''}</text>`
        })
        .join('')
    : `<text class="s" x="50" y="19" ${font} font-size="12">${xml(fitText(noTasksText(a), 12, W - 50 - 16))}</text>`
  return rowSvg(W, agentTasksH(tasks), false, tail, body)
}

const agentSvg = (W: number, a: AgentRun, at: number, tail: number): string => {
  const character = characterOf(a)
  const ctx = ctxOf(a)
  const textW = W - 50 - 16 - 24
  const meta = [runModel(a)]
  if (a.round > 1) meta.push(`round ${a.round}`)
  if (a.status === 'failed') meta.push('error')
  const steps = stepsOf(a)
  const stats = `${steps ? `${steps.text} · ` : ''}ctx ${ctx}% · ${fmtTokens(a.contextTokens)}  ${fmtTime(elapsed(a, at))}`
  // A finished run is a full bar; a running one shows its reported steps, else its context fill, grey.
  const progress = a.status === 'done' ? 1 : steps ? steps.ratio : null
  const fillW = Math.round(textW * (progress ?? ctx / 100))
  return rowSvg(
    W,
    ROW_H,
    false,
    tail,
    `${crab(10, 12, character, false, a.status === 'running')}
<text class="t" x="50" y="18" font-family="${FONT}" font-size="12" font-weight="500">${xml(fitText(a.description || a.type, 12, textW))}</text>
<text x="50" y="33" font-family="${FONT}" font-size="11"><tspan fill="${character.color}">${xml(fitText(a.type, 11, textW / 2))}</tspan><tspan class="s">  ${xml(meta.join('  ·  '))}</tspan></text>
<text class="s" x="${50 + textW}" y="47" text-anchor="end" font-family="${FONT}" font-size="11" font-variant-numeric="tabular-nums">${stats}</text>
<rect class="k" x="50" y="52" width="${textW}" height="4" rx="2"/><rect${progress === null ? ' class="m"' : ''} x="50" y="52" width="${fillW}" height="4" rx="2"${progress === null ? '' : ` fill="${character.color}"`}/>
${statusMark(W - 22, 14, a.status, character.color)}`,
  )
}

const CARD_H = 52

/** A crab row for one agent type, indented under its group: costume, name, what it makes, and whether it ran this session. */
const cardSvg = (W: number, entry: RosterEntry, list: AgentRun[], tail: number, isLeaving = false): string => {
  const character = characterOf({ type: entry.type, model: '' })
  const runs = list.filter(a => a.type === entry.type)
  const isRunning = runs.some(a => a.status === 'running')
  const state = isRunning ? 'running' : runs.length ? `ran ${runs.length}×` : ''
  const textW = W - 62 - 84
  return rowSvg(
    W,
    CARD_H,
    false,
    tail,
    `${crab(24, 8, character, false, isRunning || isLeaving, undefined, isRunning || isLeaving ? undefined : breathOf(entry.type), isLeaving)}
<text class="t" x="62" y="22" font-family="${FONT}" font-size="12" font-weight="500">${xml(fitText(entry.name, 12, textW))}</text>
<text class="s" x="62" y="38" font-family="${FONT}" font-size="11">${xml(fitText(entry.blurb, 11, textW))}</text>
${isRunning ? `<circle class="live" cx="${W - 76}" cy="20" r="3.5" fill="${character.color}"/>` : runs.length ? `<path d="M${W - 80} 20l3.5 3.5 6.5-7" fill="none" stroke="${DONE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
${state ? `<text class="s" x="${W - 16}" y="24" text-anchor="end" font-family="${FONT}" font-size="11">${state}</text>` : ''}`,
  )
}

const ctxBar = (pct: number, width: number): string => {
  const filled = Math.round((width * pct) / 100)
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled))
}

const STATUS_GLYPH: Record<string, string> = { running: '●', done: '✓', failed: '✗' }

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
        await count($, 'prompts')
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
        await count($, 'skillTools')
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
      await count($, 'progressReports')
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
      if (tool === PROGRESS_TOOL || tool === STEP_TOOL) return result
      const payload = { result: result.result, text: result.text }
      const isStatus = isAtlasStatusCall(tool, payload)
      if (!isStatus && !isAtlasToolName(tool)) return result
      if (serverOf(tool)) atlasServers.add(serverOf(tool))
      await activate($, 'atlas-tool', shortTool(tool))
      await count($, 'atlasResults')
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
    if ((!Svg && !Raster) || tool === PROGRESS_TOOL || tool === STEP_TOOL || !tool.startsWith('mcp__')) return next(e)
    if (!(isAtlasToolName(tool) || atlasServers.has(serverOf(tool))) || !(await isOn($))) return next(e)
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
    // Every Atlas tool takes a `context`: a sentence on why the call is made, which the row shows as its description.
    const input = e.props.input !== null && typeof e.props.input === 'object' ? (e.props.input as Readonly<Record<string, unknown>>) : {}
    const description = str(input.context)
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
  // group that holds any other tool, and a group the person expanded, keep Claude Code's own drawing alone.
  on('ui.render', { component: 'ToolGroup' }, async ($, e, next) => {
    const calls = e.props.calls
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
      await count($, 'agents')

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
      void $.prompt.fill({ origin: { kind: 'plugin', name: 'aspire' }, text: slackDraft(url), mode: 'replace' } as never).catch(() => undefined)
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
      void $.prompt.fill({ origin: { kind: 'plugin', name: 'aspire' }, text: '/aspire:aspire org', mode: 'replace' } as never).catch(() => undefined)
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
        await $.prompt.fill({ origin: { kind: 'plugin', name: 'aspire' }, text: `/aspire:aspire run ${r.type.replace(/^aspire:/, '')}`, mode: 'replace' } as never)
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
    // A row may be a sub-accordion's header (`h` is its height); its children follow only while it is open.
    type Row = { id: string; h: number; alt: string; draw: (W: number, tail: number) => string; onPress?: () => void }
    type Section = { key: string; title: string; summary: string; rows: Row[]; text: () => JSX.Element }
    const empty = 'No agents yet. Aspire agents show here as they start.'
    // Pressing an agent opens its task list under it; pressing again closes it.
    const agentRows = (items: AgentRun[], state: string): Row[] =>
      items.flatMap((a): Row[] => {
        const key = `agent:${a.id}`
        const tasks = agentTasks(a)
        const isTasksOpen = isOpen(key)
        return [
          { id: a.id, h: ROW_H, alt: `${a.description}: ${modelName(a.model)}, ${state}, ${isTasksOpen ? 'tasks open' : 'tasks collapsed'}`, draw: (W, tail) => agentSvg(W, a, at, tail), onPress: toggle(key) },
          ...(isTasksOpen
            ? [{ id: `${a.id}-tasks`, h: agentTasksH(tasks), alt: `${a.description} tasks: ${tasks.map(t => `${t.kind === 'done' ? 'done' : t.kind === 'now' ? 'now' : 'to do'} ${t.text}`).join(', ') || 'none reported yet'}`, draw: (W: number, tail: number) => agentTasksSvg(W, a, tasks, tail) }]
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
            ? [{ id: 'progress', h: planH(plan), alt: `${title}: ${shown.label}, ${percent}`, draw: (W, tail) => planBodySvg(W, title, shown, plan, tail) }]
            : [
                { id: 'progress', h: PROGRESS_H + tasks.length * TASK_H, alt: `${title}: ${shown.label}, ${percent}`, draw: (W, tail) => progressBodySvg(W, title, shown, tasks, tail) },
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
          : [{ id: 'running-note', h: NOTE_H, alt: empty, draw: (W, tail) => noteSvg(W, list.length ? 'Nothing running right now.' : empty, tail) }],
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
            { id: `group:${g.key}`, h: SUB_H, alt: `${g.title}, ${entries.length}, ${groupOpen ? 'open' : 'collapsed'}`, draw: (W, tail) => subHeaderSvg(W, g.title, String(entries.length), groupOpen, tail), onPress: toggle(`group:${g.key}`) },
            ...(groupOpen
              ? entries.map(r => ({ id: `start-${r.type}`, h: CARD_H, alt: `${r.name}: ${r.blurb}`, draw: (W: number, tail: number) => cardSvg(W, r, list, tail, p.leaving === r.type), onPress: startAgent(r) }))
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
                        <Svg source={r.draw(W, tail)} alt={r.alt} width={W} height={r.h + tail} />
                        {r.onPress ? pressable(r.id, r.h, r.onPress) : null}
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
