// State contract of the Aspire mod (hooks/register.tsx): the progress bar and
// band above the prompt, and the agents panel. `claude plugin validate plugins/aspire-mod` holds
// every $.state key the module names to this file.

/**
 * Atlas token costs as the mod reads them from an Atlas `get_status` result.
 *
 * TODO(atlas-server): ASSUMED SHAPE, not shipped yet. Confirm with the server
 * team and update hooks/atlas-usage.ts and the plugin README together.
 *
 * Assumed: one object named `tokenCosts` anywhere in the get_status result JSON
 * (top level, or under `organizations.selected`, which wins when several are
 * present), for example
 *
 *   { "organizations": { "selected": { "id": "org_…", "tokenCosts": {
 *       "used": 12400, "limit": 50000, "remaining": 37600,
 *       "period": "2026-10", "unit": "tokens" } } } }
 *
 * Also accepted: the spellings `token_costs`, `tokenCost`, `token_cost`,
 * `tokenUsage`, `token_usage`; `usedTokens`/`tokensUsed`/`consumed`/`spent` for
 * `used`; `quota`/`allowance`/`cap` for `limit`; `left`/`balance`/`available`
 * for `remaining`; `window`/`cycle` for `period`; `units`/`currency` for `unit`.
 * Numbers may be JSON numbers or plain numeric strings. A bare number in place
 * of the object is read as `used`. `used` missing with both `limit` and
 * `remaining` present is read as `limit - remaining`; anything else without a
 * usable `used` is no reading at all.
 */
export type AtlasTokenCosts = {
  /** Tokens (or the stated unit) used in the current period. */
  used: number
  /** The period's allowance, when the server states one. */
  limit?: number
  /** What is left of the allowance, when the server states it. */
  remaining?: number
  /** The period the figures cover, as the server labels it ("2026-10", "month"). */
  period?: string
  /** The unit of the figures when not plain tokens ("credits", "USD"). */
  unit?: string
}

/**
 * The organization's credits, from the `credits` block of an Atlas `get_status`
 * result (under `organizations.selected` or at the top level):
 *
 *   { "credits": { "estimate": true, "period": { "start", "end" },
 *       "thisPeriod": { "consumed": 3.8,
 *         "newPosts": { "count": 25, "rate": 0.1, "credits": 2.5 },
 *         "retrievedPosts": { "count": 26, "rate": 0.05, "credits": 1.3 } },
 *       "balance": { "granted": 1000, "consumed": 3.8, "remaining": 996.2, "overage": 0 },
 *       "grants": [ { "kind": "trial", "credits": 1000, "startsAt", "expiresAt": null } ] } }
 *
 * No `balance` with a `remaining`, or a `granted` and a `consumed` to work it out from, is no reading.
 */
export type AtlasCredits = {
  /** The server says the figures are estimates. */
  estimate: boolean
  granted: number
  /** Consumed over the life of the grants. */
  consumed: number
  remaining: number
  /** The organization the block names (`organizationId`), when it does. */
  organizationId?: string
  /** Credits used past the grants; 0 when none. */
  overage: number
  /** The current period, ISO dates; `end` is when it resets. */
  period?: { start: string; end: string }
  /** Credits consumed in the current period. */
  periodConsumed: number
  newPosts?: { count: number; credits: number }
  retrievedPosts?: { count: number; credits: number }
  grants: { kind: string; credits: number; expiresAt: string | null }[]
}

/** The last Atlas credits reading, and when. */
export type AtlasCreditsReading = {
  credits: AtlasCredits
  at: number
}

/** The last Atlas reading: what the latest Atlas get_status said, and when. */
export type AtlasReading = {
  costs: AtlasTokenCosts
  /** $.clock.now() when the get_status result passed through. */
  at: number
}

export type BandStats = {
  /** Main-loop turns since the mod switched on (the /aspire turn is 1). */
  turn: number
  /** Output speed of the last main-loop response, tokens per second. */
  speed: number | null
  /** Context fill of the main conversation, percent. */
  context: number
}

export type AgentStatus = 'running' | 'done' | 'failed'

export type AgentRun = {
  id: string
  agentId?: string
  type: string
  description: string
  model: string
  effort?: string
  status: AgentStatus
  startedAt: number
  endedAt?: number
  contextTokens: number
  contextMax: number
  round: number
  /** Steps the agent reported through `aspire_step`; absent until it reports. */
  stepTotal?: number
  stepDone?: number
  /** The step in progress, a few words. */
  stepNote?: string
  /** The agent's own task list, when it keeps one; it sets the steps above and wins over `aspire_step`. */
  items?: Item[]
  /** What the agent's latest tool call is doing, a few words, and how many calls it made; shown while it keeps no task list. */
  doing?: string
  calls?: number
}

/** The queued notice above the prompt: the pressed agent and the clock time it was set. */
export type Notice = { type: string; name: string; id: number }

/** The prompt coach card above the bar (desktop; one text line on the terminal): the skill's verdict, an optional round label, and the clock time it was set. */
export type Coach = { verdict: string; step: string | null; id: number }

export type Panel = {
  /** The panel opened by itself once this session (first aspire:* agent). */
  isAutoOpened: boolean
  /** The ids of the cards that are open (progress, running, finished, agents, group:<key>); the rest are collapsed. */
  open: string[]
  /** The agent type whose crab is walking off its card after a press, until its start is drafted. */
  leaving: string | null
}

/** One step the skill reported. */
export type ProgressTask = {
  title: string
  isDone: boolean
}

/**
 * The aspire skill's progress, as the bar draws it.
 *
 * The skill reports through the mod's `aspire_progress` tool
 * (`mcp__aspire-mod__aspire_progress`; the main session only, a subagent's call is
 * ignored). Until it reports, the bar shows a baseline from the latest Atlas
 * `get_status` result (OrgState.checkpoints): onboarding checkpoints done out
 * of 6, where 1 is Atlas answered, 2 an organization selected, 3 a brand
 * profile exists, 4 a channel is linked, and 5 (brand context) and 6 (first
 * insights) come only from reported progress. Once the skill reports, its
 * done and total win.
 */
export type Progress = {
  /** A few words; empty when the skill gave none. */
  title: string
  total: number
  done: number
  /** The phase in progress, a few words; empty when none was given. */
  phase: string
  isFinished: boolean
  tasks: ProgressTask[]
}

/** One task of the agent's own task list: TaskCreate and TaskUpdate, TodoWrite, or the desktop app's update_plan. */
export type Item = {
  /** TaskCreate's id; absent for the other tools' entries. */
  id?: string
  subject: string
  status: 'pending' | 'in_progress' | 'completed'
  /** Tool calls made while this task was the current one: what the step's estimate reads. */
  calls: number
}

/** How a turn ended: the model answered, the person interrupted, or an error stopped it. */
export type End = 'answer' | 'aborted' | 'error'

/** The request the steps follow, from its turn.start to the next one. Times are epoch milliseconds. */
export type Turn = {
  /** The request's first line, or the last title when a turn starts with no text. */
  title: string
  startedAt: number
  endedAt?: number
  end?: End
  /** Tool calls on the main loop this turn, task tools left out. */
  calls: number
  /** The tool call in flight, in a few words. */
  doing?: string
  /** Files an Edit, Write or NotebookEdit changed, and files a Read read. */
  changed: string[]
  read: string[]
}

/** What the latest Atlas `get_status` result said about the organization. */
export type OrgState = {
  /**
   * The selected organization's name: `organizations.selected.name`, read when
   * the caller has one organization or the call named one (`asOrganizationId`).
   * Null until one is known; the bar's label is then just `Aspire`.
   */
  name: string | null
  /**
   * The selected organization's id, when the result carried one. Credits are
   * shown only for this organization (see `creditsOf` in hooks/atlas-usage.ts).
   * Absent when unknown; never set without `name`.
   */
  id?: string
  /** Onboarding checkpoints the result shows, 0 to 4 (see Progress). */
  checkpoints: number
}

/**
 * What switched the mod on. `prompt`: a prompt typed as `/aspire` or
 * `/aspire:aspire`. `skill-tool`: the Skill tool ran the aspire skill.
 * `progress`: the skill reported progress. `atlas-tool`: an Atlas connector
 * tool answered. `agent`: an `aspire:*` agent started.
 */
export type TriggerKind = 'prompt' | 'skill-tool' | 'progress' | 'atlas-tool' | 'agent'

/** The first Aspire event of the session, the one that switched the mod on. */
export type Trigger = {
  kind: TriggerKind
  /** The skill, tool, or agent type that did it (`/aspire:aspire`, `get_status`, `aspire:atlas-creator-brief`). */
  detail: string
  /** $.clock.now() when the mod switched on. */
  at: number
}

/**
 * Aspire events the mod has seen this session, for `/aspire-agents-info
 * status`. Only Aspire events are counted; anything else passes unrecorded.
 */
export type Seen = {
  /** Prompts typed as `/aspire` or `/aspire:aspire`. */
  prompts: number
  /** Skill tool calls that ran the aspire skill. */
  skillTools: number
  /** Progress reports through `aspire_progress` (main session). */
  progressReports: number
  /** Atlas connector tool results. */
  atlasResults: number
  /** Atlas `get_status` results among them. */
  statusReads: number
  /** $.clock.now() of the latest Atlas `get_status` result, or null. */
  lastStatusAt: number | null
  /** Agents listed in the panel. */
  agents: number
}

declare module 'claude-code' {
  interface PluginState {
    'aspire-mod': {
      /** False until an Aspire event (see Trigger); every hook passes through until then. */
      isActive: boolean
      trigger: Trigger | null
      seen: Seen
      /** Null until the skill reports through `aspire_progress`. */
      progress: Progress | null
      /** The request the steps follow, and the agent's own task list. */
      turn: Turn | null
      items: Item[]
      org: OrgState
      atlas: AtlasReading | null
      /** The organization's credits from the latest get_status; null when it gave none. */
      credits: AtlasCreditsReading | null
      stats: BandStats
      isBandHidden: boolean
      agents: AgentRun[]
      panel: Panel
      now: number
      /** The queued notice above the prompt; null when none shows. `id` is the clock time it was set. */
      notice: Notice | null
      /** The prompt coach card above the bar; null when none shows. Set only by the main session's aspire_progress `coach` field. */
      coach: Coach | null
      /** The progress line last put under the prompt while the band is not drawn; null when none shows. */
      statusLine: string | null
    }
  }
}
