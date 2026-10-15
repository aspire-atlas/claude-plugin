// Atlas token costs, read from Atlas `get_status` results.
//
// This file is the one adapter between the Atlas server's get_status result
// and the band above the prompt. Nothing else in the mod reads token costs,
// and nothing here falls back to Claude's own usage: no reading means the band
// shows a dash.
//
// TODO(atlas-server): the server change that adds token costs to get_status
// has not shipped and its shape is unknown. The shape below is ASSUMED. When
// the server ships, confirm it, adjust CONTAINER_KEYS / FIELD_KEYS, and update
// the AtlasTokenCosts doc in ../types/index.d.ts and the plugin README.

import type { AtlasTokenCosts } from '../types'

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
