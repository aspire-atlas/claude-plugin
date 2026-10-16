// Atlas token costs and the organization, read from Atlas `get_status` results.
//
// This file is the one adapter between the Atlas server's get_status result
// and the band above the prompt. Nothing else in the mod reads token costs or
// the organization, and nothing here falls back to Claude's own usage: no
// reading means the band shows a dash.
//
// TODO(atlas-server): the server change that adds token costs to get_status
// has not shipped and its shape is unknown. The shape below is ASSUMED. When
// the server ships, confirm it, adjust CONTAINER_KEYS / FIELD_KEYS, and update
// the AtlasTokenCosts doc in ../types/index.d.ts and the plugin README.

import type { AtlasCredits, AtlasTokenCosts } from '../types'

// Keys are compared lower-cased with `_` and `-` removed, so `tokenCosts`,
// `token_costs` and `Token-Costs` are one key.
const norm = (k: string): string => k.toLowerCase().replace(/[_-]/g, '')

/** The object that holds the figures. */
const CONTAINER_KEYS: ReadonlySet<string> = new Set(['tokencosts', 'tokencost', 'tokenusage'])

/** The figures inside it, each with the spellings accepted. */
const FIELD_KEYS = {
  used: ['used', 'usedtokens', 'tokensused', 'consumed', 'spent'],
  limit: ['limit', 'quota', 'allowance', 'cap'],
  remaining: ['remaining', 'left', 'balance', 'available'],
  period: ['period', 'window', 'cycle'],
  unit: ['unit', 'units', 'currency'],
} as const

// Bounds on the walk: a get_status result is small, so these only stop a
// pathological input from costing the hook its time budget.
const MAX_DEPTH = 8
const MAX_NODES = 5000
const MAX_TEXT = 1_000_000

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** A finite, non-negative number from a JSON number or a plain numeric string ("12,400"). */
export const toAmount = (v: unknown): number | undefined => {
  if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? v : undefined
  if (typeof v !== 'string') return undefined
  const s = v.trim().replace(/[,_\s]/g, '')
  if (!/^\d+(\.\d+)?$/.test(s)) return undefined
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

const toLabel = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined
  const s = v.trim()
  return s && s.length <= 64 ? s : undefined
}

const field = (obj: Record<string, unknown>, names: readonly string[]): unknown => {
  for (const [k, v] of Object.entries(obj)) if (names.includes(norm(k))) return v
  return undefined
}

/** Reads one token-costs container; null when it holds no usable `used`. */
export const parseTokenCosts = (raw: unknown): AtlasTokenCosts | null => {
  const bare = toAmount(raw)
  if (bare !== undefined) return { used: bare }
  if (!isRecord(raw)) return null

  const limit = toAmount(field(raw, FIELD_KEYS.limit))
  const remaining = toAmount(field(raw, FIELD_KEYS.remaining))
  let used = toAmount(field(raw, FIELD_KEYS.used))
  if (used === undefined && limit !== undefined && remaining !== undefined && limit >= remaining) used = limit - remaining
  if (used === undefined) return null

  const out: AtlasTokenCosts = { used }
  if (limit !== undefined) out.limit = limit
  if (remaining !== undefined) out.remaining = remaining
  const period = toLabel(field(raw, FIELD_KEYS.period))
  if (period !== undefined) out.period = period
  const unit = toLabel(field(raw, FIELD_KEYS.unit))
  if (unit !== undefined) out.unit = unit
  return out
}

/** A JSON value from text that looks like JSON; undefined otherwise. */
const parseJson = (text: string): unknown => {
  const s = text.trim()
  if (s.length > MAX_TEXT || !(s.startsWith('{') || s.startsWith('['))) return undefined
  try {
    return JSON.parse(s) as unknown
  } catch {
    return undefined
  }
}

/**
 * The JSON roots a tool result carries: the value itself, and each JSON text
 * inside it (an MCP result's `content[].text`, or the model-facing `text`).
 */
const rootsOf = (input: unknown): unknown[] => {
  const roots: unknown[] = []
  const seen = new Set<unknown>()
  let nodes = 0
  const visit = (v: unknown, depth: number): void => {
    if (nodes++ > MAX_NODES || depth > MAX_DEPTH) return
    if (typeof v === 'string') {
      const parsed = parseJson(v)
      if (parsed !== undefined) visit(parsed, depth + 1)
      return
    }
    if (typeof v !== 'object' || v === null || seen.has(v)) return
    seen.add(v)
    roots.push(v)
    // Only the places an MCP result keeps its payload are opened here; the
    // search for the container itself walks every key (findContainer).
    if (Array.isArray(v)) {
      for (const item of v) visit(item, depth + 1)
      return
    }
    for (const key of ['result', 'structuredContent', 'content', 'text']) {
      if (key in v) visit((v as Record<string, unknown>)[key], depth + 1)
    }
  }
  visit(input, 0)
  return roots
}

/** Breadth-first: the shallowest token-costs container under `root`. */
const findContainer = (root: unknown): AtlasTokenCosts | null => {
  const queue: [unknown, number][] = [[root, 0]]
  const seen = new Set<unknown>()
  let nodes = 0
  while (queue.length && nodes++ < MAX_NODES) {
    const [v, depth] = queue.shift() as [unknown, number]
    if (typeof v !== 'object' || v === null || seen.has(v) || depth > MAX_DEPTH) continue
    seen.add(v)
    if (Array.isArray(v)) {
      for (const item of v) queue.push([item, depth + 1])
      continue
    }
    for (const [k, child] of Object.entries(v)) {
      if (CONTAINER_KEYS.has(norm(k))) {
        const costs = parseTokenCosts(child)
        if (costs) return costs
      }
    }
    for (const child of Object.values(v)) queue.push([child, depth + 1])
  }
  return null
}

const selectedOrg = (root: unknown): unknown => {
  if (!isRecord(root)) return undefined
  const orgs = root.organizations
  return isRecord(orgs) ? orgs.selected : undefined
}

/**
 * Atlas token costs from a get_status tool result, or null when the result
 * carries none. Accepts the tool result as the hook sees it (`{ result, text }`),
 * the MCP result (`{ content: [{ type: 'text', text }] }`), parsed JSON or the
 * JSON text. Never throws.
 *
 * With several containers present, the one under `organizations.selected`
 * wins (the organization the session works in), then the shallowest one.
 */
export const readAtlasUsage = (result: unknown): AtlasTokenCosts | null => {
  try {
    const roots = rootsOf(result)
    for (const root of roots) {
      const selected = selectedOrg(root)
      if (selected !== undefined) {
        const costs = findContainer(selected)
        if (costs) return costs
      }
    }
    for (const root of roots) {
      const costs = findContainer(root)
      if (costs) return costs
    }
    return null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// The organization and the onboarding checkpoints, read from the same result.

/** What a get_status result says about where onboarding stands. */
export type AtlasOrgReading = {
  /** The selected organization's name; absent when the result names none. */
  name?: string
  /** The selected organization's id; absent when the result gives none. */
  id?: string
  /** How many organizations the caller belongs to (0 when the result lists none). */
  orgCount: number
  /** Brand profiles in the result. */
  profileCount: number
  /** At least one profile has a channel linked (an expired one counts). */
  hasChannel: boolean
}

const NAME_KEYS = ['name', 'displayname', 'title'] as const
const ORG_KEYS = ['organizations', 'organization', 'orgs', 'org'] as const
const SELECTED_KEYS = ['selected', 'current', 'active'] as const
const ALL_KEYS = ['all', 'items', 'list'] as const
const PROFILE_KEYS = ['profiles', 'brandprofiles', 'brands'] as const
const CHANNEL_KEYS = ['channels', 'linkedaccounts', 'connectedchannels', 'accounts'] as const

const nameOf = (v: unknown): string | undefined => (isRecord(v) ? toLabel(field(v, NAME_KEYS)) : undefined)

const listOf = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])

/** A non-empty channel list or map on a profile. */
const hasChannels = (profile: unknown): boolean => {
  if (!isRecord(profile)) return false
  const channels = field(profile, CHANNEL_KEYS)
  if (Array.isArray(channels)) return channels.length > 0
  return isRecord(channels) && Object.keys(channels).length > 0
}

/** The selected organization, its siblings, and the profiles it carries, from one JSON root. */
const orgFrom = (root: unknown): AtlasOrgReading | null => {
  if (!isRecord(root)) return null
  const orgs = field(root, ORG_KEYS)
  if (orgs === undefined) return null
  let selected: unknown
  let all: unknown[] = []
  if (Array.isArray(orgs)) {
    all = orgs
    selected = orgs.length === 1 ? orgs[0] : orgs.find(o => isRecord(o) && (o.selected === true || o.isSelected === true))
  } else if (isRecord(orgs)) {
    selected = field(orgs, SELECTED_KEYS)
    all = listOf(field(orgs, ALL_KEYS))
    // A bare organization object ({ id, name }) is the selected one.
    if (selected === undefined && nameOf(orgs) !== undefined) selected = orgs
  } else {
    return null
  }
  const profiles = [...listOf(field(root, PROFILE_KEYS)), ...(isRecord(selected) ? listOf(field(selected, PROFILE_KEYS)) : [])]
  const out: AtlasOrgReading = {
    orgCount: all.length || (selected !== undefined ? 1 : 0),
    profileCount: profiles.length,
    hasChannel: profiles.some(hasChannels),
  }
  const name = nameOf(selected)
  if (name !== undefined) out.name = name
  const id = isRecord(selected) ? field(selected, ['id', 'organizationid']) : undefined
  if (typeof id === 'string' && id && id.length <= 80) out.id = id
  return out
}

/**
 * The organization a get_status result names, how many the caller has, and
 * whether a brand profile and a linked channel exist. Accepts the same inputs
 * as readAtlasUsage; null when the result carries no organizations. Never throws.
 */
export const readAtlasOrg = (result: unknown): AtlasOrgReading | null => {
  try {
    for (const root of rootsOf(result)) {
      const reading = orgFrom(root)
      if (reading) return reading
    }
    return null
  } catch {
    return null
  }
}

/** The tool is a `get_status` of some MCP server. */
export const isStatusTool = (tool: string): boolean => /^mcp__.+__get_status$/.test(tool)

/**
 * The tool name is the Aspire Atlas data connector's, by the rule the skill
 * uses (references/atlas-tools.md): `aspire_atlas` or `atlas__` in the name,
 * never `organization_admin`, never a bare `atlas` (Atlassian).
 */
export const isAtlasToolName = (tool: string): boolean =>
  /aspire_atlas|atlas__/i.test(tool) && !/organization_admin/i.test(tool)

/**
 * The result looks like Atlas's get_status: a top-level `organizations`
 * object. Used for connectors whose tool names carry an id instead of a name
 * (a claude.ai connector seen from the desktop app).
 */
export const looksLikeAtlasStatus = (result: unknown): boolean => {
  try {
    return rootsOf(result).some(root => isRecord(root) && isRecord(root.organizations))
  } catch {
    return false
  }
}

/** A get_status call whose result the band should read; never the organization admin connector's. */
export const isAtlasStatusCall = (tool: string, result: unknown): boolean =>
  isStatusTool(tool) && !/organization_admin/i.test(tool) && (isAtlasToolName(tool) || looksLikeAtlasStatus(result))

// ---------------------------------------------------------------------------
// Formatting for the band.

/** Compact figures: 950, 12.4, 1.2k, 38k, 1.5M. */
export const fmtAmount = (n: number): string => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1e4) return `${Math.round(n / 1e3)}k`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, '')}k`
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(2).replace(/0$/, '')
}

/** "12.4k / 50k", "12.4k" without a limit, with the unit after when it is not tokens. */
export const fmtAtlasUsage = (c: AtlasTokenCosts): string => {
  const figures = c.limit !== undefined ? `${fmtAmount(c.used)} / ${fmtAmount(c.limit)}` : fmtAmount(c.used)
  const unit = c.unit && !/^tokens?$/i.test(c.unit) ? ` ${c.unit}` : ''
  return figures + unit
}

/** What the band shows with no reading: a dash, and at full width how to get one. */
export const ATLAS_ABSENT = '—'
export const ATLAS_ABSENT_HINT = '—, run /aspire to refresh'


// ---------------------------------------------------------------------------
// Credits: the `credits` block of get_status.

const num = (v: unknown): number | undefined => toAmount(v)

const postsOf = (v: unknown): { count: number; credits: number } | undefined => {
  if (!isRecord(v)) return undefined
  const count = num(v.count)
  const credits = num(v.credits)
  return count !== undefined && credits !== undefined ? { count, credits } : undefined
}

/** Reads one credits block; null when it holds no usable balance. */
export const parseCredits = (raw: unknown): AtlasCredits | null => {
  if (!isRecord(raw) || !isRecord(raw.balance)) return null
  const b = raw.balance
  const granted = num(b.granted)
  const consumed = num(b.consumed)
  let remaining = num(b.remaining)
  if (remaining === undefined && granted !== undefined && consumed !== undefined) remaining = Math.max(0, granted - consumed)
  if (remaining === undefined) return null
  const out: AtlasCredits = {
    estimate: raw.estimate === true,
    granted: granted ?? remaining + (consumed ?? 0),
    consumed: consumed ?? 0,
    remaining,
    overage: num(b.overage) ?? 0,
    periodConsumed: 0,
    grants: [],
  }
  if (typeof raw.organizationId === 'string' && raw.organizationId) out.organizationId = raw.organizationId
  if (isRecord(raw.period) && typeof raw.period.start === 'string' && typeof raw.period.end === 'string') {
    out.period = { start: raw.period.start, end: raw.period.end }
  }
  if (isRecord(raw.thisPeriod)) {
    out.periodConsumed = num(raw.thisPeriod.consumed) ?? 0
    const np = postsOf(raw.thisPeriod.newPosts)
    if (np) out.newPosts = np
    const rp = postsOf(raw.thisPeriod.retrievedPosts)
    if (rp) out.retrievedPosts = rp
  }
  if (Array.isArray(raw.grants)) {
    for (const g of raw.grants.slice(0, 20)) {
      if (!isRecord(g)) continue
      const credits = num(g.credits)
      const kind = toLabel(g.kind)
      if (credits !== undefined && kind !== undefined) out.grants.push({ kind, credits, expiresAt: typeof g.expiresAt === 'string' ? g.expiresAt : null })
    }
  }
  return out
}

/** Breadth-first: the shallowest `credits` block under `root`. */
const findCredits = (root: unknown): AtlasCredits | null => {
  const queue: [unknown, number][] = [[root, 0]]
  const seen = new Set<unknown>()
  let nodes = 0
  while (queue.length && nodes++ < MAX_NODES) {
    const [v, depth] = queue.shift() as [unknown, number]
    if (typeof v !== 'object' || v === null || seen.has(v) || depth > MAX_DEPTH) continue
    seen.add(v)
    if (Array.isArray(v)) {
      for (const item of v) queue.push([item, depth + 1])
      continue
    }
    for (const [k, child] of Object.entries(v)) {
      if (norm(k) === 'credits') {
        const credits = parseCredits(child)
        if (credits) return credits
      }
    }
    for (const child of Object.values(v)) queue.push([child, depth + 1])
  }
  return null
}

/**
 * The organization's credits from a get_status tool result, or null when it
 * carries none. Same inputs as readAtlasUsage; the block under
 * `organizations.selected` wins. Never throws.
 */
export const readAtlasCredits = (result: unknown): AtlasCredits | null => {
  try {
    const roots = rootsOf(result)
    for (const root of roots) {
      const selected = selectedOrg(root)
      if (selected !== undefined) {
        const credits = findCredits(selected)
        if (credits) return credits
      }
    }
    for (const root of roots) {
      const credits = findCredits(root)
      if (credits) return credits
    }
    return null
  } catch {
    return null
  }
}

/**
 * "An organization is selected": the mod has a name for it (OrgState.name is
 * non-null). The name is set only when a get_status result picked one: the
 * caller has a single organization or the call named one (`asOrganizationId`).
 * With several organizations and none named, get_status's default is not a
 * pick, so nothing is selected. Reset, /clear and a new session clear it.
 */
export const isOrgSelected = (o: { name: string | null }): boolean => o.name !== null

/**
 * Credit and usage figures belong to the selected organization only. None
 * without a selected organization; none when the reading names another
 * organization than the selected one (both ids known and different); a
 * reading or selection with no id is trusted, since a get_status result's
 * figures come from the organization it selected. Pure.
 */
export const creditsOf = <C extends { organizationId?: string }>(o: { name: string | null; id?: string }, c: C | null): C | null => {
  if (!c || !isOrgSelected(o)) return null
  if (o.id !== undefined && c.organizationId !== undefined && o.id !== c.organizationId) return null
  return c
}

/** Credits for people: whole numbers with separators, one decimal otherwise (996.2, 1,000, 3.8). */
export const fmtCredits = (n: number): string => {
  const [whole, frac] = String(Number(n.toFixed(1))).split('.')
  return (whole ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (frac ? `.${frac}` : '')
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

/** `Nov 1` from an ISO date, in UTC; empty when it is not a date. */
export const fmtDay = (iso: string): string => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

/** What the one card in the sidebar shows, whatever the surface draws it with. */
export type CreditsView = {
  title: string
  /** The big figure: credits left. */
  big: string
  /** After it: "of 1,000 left". */
  sub: string
  /** Share of the grants consumed, 0 to 1. */
  ratio: number
  /** Credits ran past the grants. */
  isOver: boolean
  /** Under the bar, left. */
  metaLeft: string
  /** Under the bar, right; posts counted this period. */
  metaRight: string
  /** Top right: "estimate · resets Nov 1". */
  tag: string
  /** Bottom right: the grants. */
  grants: string
}

const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`

/**
 * The card's content from the latest credits reading, else the older token-cost
 * reading, else a dash. Pure.
 */
export const creditsView = (c: AtlasCredits | null, costs: AtlasTokenCosts | null): CreditsView => {
  if (c) {
    const tag = [c.estimate ? 'estimate' : '', c.period ? `resets ${fmtDay(c.period.end)}` : ''].filter(Boolean).join(' · ')
    const posts = [
      c.newPosts ? plural(c.newPosts.count, 'new post', 'new posts') : '',
      c.retrievedPosts ? `${c.retrievedPosts.count} retrieved` : '',
    ].filter(Boolean)
    const trial = c.grants.length === 1 ? c.grants[0]! : undefined
    const grants = trial
      ? `${trial.kind[0]!.toUpperCase()}${trial.kind.slice(1)} · ${trial.expiresAt ? `ends ${fmtDay(trial.expiresAt)}` : 'no expiry'}`
      : c.grants.length
        ? plural(c.grants.length, 'grant', 'grants')
        : ''
    return {
      title: 'Credits',
      big: c.overage > 0 ? `${fmtCredits(c.overage)} over` : fmtCredits(c.remaining),
      sub: c.overage > 0 ? `of ${fmtCredits(c.granted)} used up` : `of ${fmtCredits(c.granted)} left`,
      ratio: c.granted > 0 ? Math.min(1, c.consumed / c.granted) : c.overage > 0 ? 1 : 0,
      isOver: c.overage > 0,
      metaLeft: `${fmtCredits(c.periodConsumed)} used this period`,
      metaRight: posts.join(' · '),
      tag,
      grants,
    }
  }
  if (costs) {
    return { title: 'Atlas tokens', big: fmtAtlasUsage(costs), sub: '', ratio: costs.limit ? Math.min(1, costs.used / costs.limit) : 0, isOver: false, metaLeft: '', metaRight: '', tag: '', grants: '' }
  }
  return { title: 'Credits', big: ATLAS_ABSENT, sub: 'run /aspire to refresh', ratio: 0, isOver: false, metaLeft: '', metaRight: '', tag: '', grants: '' }
}
