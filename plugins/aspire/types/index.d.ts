// State contract of the Aspire mod (hooks/register.tsx): the band above the
// prompt and the agents panel. `claude plugin validate plugins/aspire` holds
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

export type Cache = {
  expiresAt: number | null
  secondsLeft: number | null
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
}

export type Panel = {
  isCompact: boolean
  isDoneCollapsed: boolean
  /** The panel opened by itself once this session (first aspire:* agent). */
  isAutoOpened: boolean
}

declare module 'claude-code' {
  interface PluginState {
    aspire: {
      /** False until /aspire runs or an aspire:* agent starts; every hook passes through until then. */
      isActive: boolean
      atlas: AtlasReading | null
      stats: BandStats
      cache: Cache
      isBandHidden: boolean
      agents: AgentRun[]
      panel: Panel
      now: number
    }
  }
}
