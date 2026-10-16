// Run with: claude plugin test plugins/aspire
import { expect, test } from 'claude-code/testing'

import { creditsBar, creditsView, fmtAmount, fmtAtlasUsage, fmtCredits, fmtDay, readAtlasCredits, isAtlasStatusCall, isAtlasToolName, parseTokenCosts, readAtlasOrg, readAtlasUsage, toAmount } from './atlas-usage'

// What an MCP get_status result looks like as the tool.call hook sees it: the
// tool's record (`content` blocks of JSON text) and the text the model reads.
const asToolResult = (body: unknown) => {
  const text = JSON.stringify(body)
  return { result: { content: [{ type: 'text', text }] }, text }
}

const STATUS = {
  organizations: {
    selected: { id: 'org_1', name: 'Sample Brand', tokenCosts: { used: 12400, limit: 50000, remaining: 37600, period: '2026-10', unit: 'tokens' } },
    all: [{ id: 'org_1' }, { id: 'org_2', tokenCosts: { used: 1, limit: 2 } }],
  },
  profiles: [],
}

test('readAtlasUsage: the assumed shape under organizations.selected', () => {
  expect(readAtlasUsage(asToolResult(STATUS))).toEqual({ used: 12400, limit: 50000, remaining: 37600, period: '2026-10', unit: 'tokens' })
})

test('readAtlasUsage: organizations.selected wins over a shallower or sibling container', () => {
  const body = { tokenCosts: { used: 5, limit: 10 }, organizations: STATUS.organizations }
  expect(readAtlasUsage(asToolResult(body))?.used).toBe(12400)
})

test('readAtlasUsage: a top-level container, from parsed JSON, JSON text, or the MCP record alone', () => {
  const body = { tokenCosts: { used: 300, limit: 1000 } }
  expect(readAtlasUsage(body)).toEqual({ used: 300, limit: 1000 })
  expect(readAtlasUsage(JSON.stringify(body))).toEqual({ used: 300, limit: 1000 })
  expect(readAtlasUsage({ content: [{ type: 'text', text: JSON.stringify(body) }] })).toEqual({ used: 300, limit: 1000 })
  expect(readAtlasUsage({ structuredContent: body })).toEqual({ used: 300, limit: 1000 })
})

test('readAtlasUsage: other key spellings', () => {
  expect(readAtlasUsage({ usage: { token_costs: { tokens_used: '1,200', quota: 5000 } } })).toEqual({ used: 1200, limit: 5000 })
  expect(readAtlasUsage({ tokenUsage: { consumed: 7, allowance: 9, currency: 'USD' } })).toEqual({ used: 7, limit: 9, unit: 'USD' })
  expect(readAtlasUsage({ token_cost: 42 })).toEqual({ used: 42 })
})

test('readAtlasUsage: used worked out from limit and remaining, never from either alone', () => {
  expect(readAtlasUsage({ tokenCosts: { limit: 100, remaining: 30 } })).toEqual({ used: 70, limit: 100, remaining: 30 })
  expect(readAtlasUsage({ tokenCosts: { limit: 100 } })).toBeNull()
  expect(readAtlasUsage({ tokenCosts: { remaining: 30 } })).toBeNull()
  expect(readAtlasUsage({ tokenCosts: { limit: 10, remaining: 30 } })).toBeNull()
})

test('readAtlasUsage: no reading when the field is absent or unusable', () => {
  expect(readAtlasUsage(asToolResult({ organizations: { selected: { id: 'org_1' } }, profiles: [] }))).toBeNull()
  expect(readAtlasUsage({ tokenCosts: { used: -5 } })).toBeNull()
  expect(readAtlasUsage({ tokenCosts: { used: 'lots' } })).toBeNull()
  expect(readAtlasUsage({ tokenCosts: null })).toBeNull()
  expect(readAtlasUsage('Signed in as someone. 3 profiles.')).toBeNull()
  expect(readAtlasUsage(undefined)).toBeNull()
  expect(readAtlasUsage(null)).toBeNull()
  // A plain "usage" or "tokens" key is not a token-costs container.
  expect(readAtlasUsage({ usage: { used: 5 }, tokens: { used: 5 } })).toBeNull()
})

test('readAtlasUsage: never throws on hostile input', () => {
  const loop: Record<string, unknown> = {}
  loop.self = loop
  expect(readAtlasUsage(loop)).toBeNull()
  let deep: Record<string, unknown> = { tokenCosts: { used: 1 } }
  for (let i = 0; i < 50; i++) deep = { next: deep }
  expect(readAtlasUsage(deep)).toBeNull()
  expect(readAtlasUsage('{ not json')).toBeNull()
})

test('parseTokenCosts and toAmount', () => {
  expect(parseTokenCosts({ used: 1, period: '  ', unit: 7 })).toEqual({ used: 1 })
  expect(toAmount('12_000')).toBe(12000)
  expect(toAmount('1e5')).toBeUndefined()
  expect(toAmount(Number.POSITIVE_INFINITY)).toBeUndefined()
})

test('isAtlasStatusCall: by connector name, or by the shape of the result', () => {
  const plain = asToolResult({ tokenCosts: { used: 1 } })
  const atlasShaped = asToolResult(STATUS)
  expect(isAtlasStatusCall('mcp__Aspire_Atlas__get_status', plain)).toBe(true)
  expect(isAtlasStatusCall('mcp__plugin_aspire_Aspire_Atlas__get_status', plain)).toBe(true)
  expect(isAtlasStatusCall('mcp__claude_ai_Aspire_Atlas__get_status', plain)).toBe(true)
  expect(isAtlasStatusCall('mcp__atlas__get_status', plain)).toBe(true)
  // A connector named by an id: only a result shaped like Atlas's counts.
  expect(isAtlasStatusCall('mcp__d93f4cce-6536__get_status', plain)).toBe(false)
  expect(isAtlasStatusCall('mcp__d93f4cce-6536__get_status', atlasShaped)).toBe(true)
  // Never the organization admin connector, never Atlassian, never another tool.
  expect(isAtlasStatusCall('mcp__Aspire_Atlas_Organization_Admin__get_status', atlasShaped)).toBe(false)
  expect(isAtlasStatusCall('mcp__atlassian__get_status', plain)).toBe(false)
  expect(isAtlasStatusCall('mcp__Aspire_Atlas__search_posts', atlasShaped)).toBe(false)
})

test('fmtAmount and fmtAtlasUsage', () => {
  expect([0, 950, 12.4, 1000, 1250, 12400, 50000, 1_500_000, 2_000_000].map(fmtAmount)).toEqual([
    '0', '950', '12.4', '1k', '1.3k', '12k', '50k', '1.5M', '2M',
  ])
  expect(fmtAtlasUsage({ used: 12400, limit: 50000, unit: 'tokens' })).toBe('12k / 50k')
  expect(fmtAtlasUsage({ used: 12400 })).toBe('12k')
  expect(fmtAtlasUsage({ used: 12.4, limit: 50, unit: 'USD' })).toBe('12.4 / 50 USD')
  expect(fmtAtlasUsage({ used: 300, limit: 1000, unit: 'credits' })).toBe('300 / 1k credits')
})

test('readAtlasOrg: the selected organization, how many there are, profiles and channels', () => {
  const body = {
    organizations: { selected: { id: 'org_1', name: 'Sample Brand', role: 'owner' }, all: [{ id: 'org_1' }, { id: 'org_2' }, { id: 'org_3' }] },
    profiles: [{ id: 'p1', name: 'Brand A', channels: [] }, { id: 'p2', name: 'Brand B', channels: [{ network: 'instagram' }] }],
  }
  expect(readAtlasOrg(asToolResult(body))).toEqual({ name: 'Sample Brand', orgCount: 3, profileCount: 2, hasChannel: true })
  // The same from the MCP record alone, parsed JSON, or JSON text.
  expect(readAtlasOrg(asToolResult(body).result)?.name).toBe('Sample Brand')
  expect(readAtlasOrg(body)?.orgCount).toBe(3)
  expect(readAtlasOrg(JSON.stringify(body))?.profileCount).toBe(2)
})

test('readAtlasOrg: tolerates other shapes and never throws', () => {
  // A list of organizations with one marked selected; profiles under the organization.
  expect(readAtlasOrg({ organizations: [{ name: 'One' }, { name: 'Two', selected: true, profiles: [{ channels: { instagram: {} } }] }] })).toEqual({
    name: 'Two',
    orgCount: 2,
    profileCount: 1,
    hasChannel: true,
  })
  // A single organization object; `displayName` for the name.
  expect(readAtlasOrg({ organization: { id: 'o', displayName: 'Solo' } })).toEqual({ name: 'Solo', orgCount: 1, profileCount: 0, hasChannel: false })
  // No selection yet: no name.
  expect(readAtlasOrg({ organizations: { all: [{ name: 'A' }, { name: 'B' }] }, profiles: [] })).toEqual({ orgCount: 2, profileCount: 0, hasChannel: false })
  // Nothing about organizations, or junk: null.
  for (const junk of [null, undefined, 42, 'text', '{not json', {}, { profiles: [] }, { organizations: 'x' }]) expect(readAtlasOrg(junk)).toBeNull()
  // A name that is not a short string is not used.
  expect(readAtlasOrg({ organizations: { selected: { name: 7 } } })?.name).toBeUndefined()
})

test('isAtlasToolName: the Atlas connectors by name, never the admin connector or Atlassian', () => {
  expect(isAtlasToolName('mcp__claude_ai_Aspire_Atlas__search_posts')).toBe(true)
  expect(isAtlasToolName('mcp__plugin_aspire_Aspire_Atlas__get_status')).toBe(true)
  expect(isAtlasToolName('mcp__Aspire_Atlas_Organization_Admin__list_members')).toBe(false)
  expect(isAtlasToolName('mcp__claude_ai_Atlassian__getJiraIssue')).toBe(false)
  expect(isAtlasToolName('mcp__aspire__aspire_progress')).toBe(false)
})

const CREDITS_BLOCK = {
  estimate: true,
  organizationId: 'org_z54dtf9al5vg5v92',
  period: { start: '2026-10-01T00:00:00.000Z', end: '2026-11-01T00:00:00.000Z' },
  thisPeriod: { consumed: 3.8, newPosts: { count: 25, rate: 0.1, credits: 2.5 }, retrievedPosts: { count: 26, rate: 0.05, credits: 1.3 } },
  balance: { granted: 1000, consumed: 3.8, remaining: 996.2, overage: 0 },
  grants: [{ kind: 'trial', credits: 1000, startsAt: '2026-07-07T20:59:42.673Z', expiresAt: null }],
}

test('readAtlasCredits: the credits block, top level or under the selected organization', () => {
  const want = {
    estimate: true,
    granted: 1000,
    consumed: 3.8,
    remaining: 996.2,
    overage: 0,
    period: { start: '2026-10-01T00:00:00.000Z', end: '2026-11-01T00:00:00.000Z' },
    periodConsumed: 3.8,
    newPosts: { count: 25, credits: 2.5 },
    retrievedPosts: { count: 26, credits: 1.3 },
    grants: [{ kind: 'trial', credits: 1000, expiresAt: null }],
  }
  expect(readAtlasCredits(asToolResult({ credits: CREDITS_BLOCK }))).toEqual(want)
  expect(readAtlasCredits(asToolResult({ organizations: { selected: { id: 'org_1', credits: CREDITS_BLOCK } } }))).toEqual(want)
})

test('readAtlasCredits: no balance is no reading; a missing remaining is worked out', () => {
  expect(readAtlasCredits(asToolResult({ credits: { estimate: true } }))).toBeNull()
  expect(readAtlasCredits(asToolResult({ organizations: {} }))).toBeNull()
  expect(readAtlasCredits(asToolResult({ credits: { balance: { granted: 100, consumed: 30 } } }))?.remaining).toBe(70)
})

test('fmtCredits and fmtDay', () => {
  expect(fmtCredits(996.2)).toBe('996.2')
  expect(fmtCredits(1000)).toBe('1,000')
  expect(fmtCredits(12345.67)).toBe('12,345.7')
  expect(fmtCredits(3.8)).toBe('3.8')
  expect(fmtDay('2026-11-01T00:00:00.000Z')).toBe('Nov 1')
  expect(fmtDay('nope')).toBe('')
})

test('creditsView: trial with usage, over the grants, token costs only, nothing', () => {
  const c = readAtlasCredits({ credits: CREDITS_BLOCK })
  expect(creditsView(c, null)).toMatchObject({ big: '996.2', sub: 'of 1,000 left', isOver: false, metaLeft: '3.8 used this period', metaRight: '25 new posts · 26 retrieved', tag: 'estimate · resets Nov 1', grants: 'Trial · no expiry' })
  const over = readAtlasCredits({ credits: { ...CREDITS_BLOCK, balance: { granted: 1000, consumed: 1042.5, remaining: 0, overage: 42.5 } } })
  expect(creditsView(over, null)).toMatchObject({ big: '42.5 over', sub: 'of 1,000 used up', isOver: true, ratio: 0, tone: 'critical' })
  expect(creditsView(null, { used: 12000, limit: 50000 })).toMatchObject({ title: 'Atlas tokens', big: '12k / 50k' })
  expect(creditsView(null, null)).toMatchObject({ title: 'Credits', big: '—', sub: 'run /aspire to refresh' })
})

test('creditsBar: fills by what remains, teal above 25%, amber at 25%, red at 10%, empty when out or unknown', () => {
  const bar = (granted: number, remaining: number, overage = 0) => creditsBar({ granted, remaining, overage })
  const full = bar(1000, 993.3)
  expect(Math.round(full.ratio * 10000)).toBe(9933)
  expect(full.tone).toBe('ok')
  expect(bar(1000, 251).tone).toBe('ok')
  expect(bar(1000, 250)).toEqual({ ratio: 0.25, tone: 'low' })
  expect(bar(1000, 101).tone).toBe('low')
  expect(bar(1000, 100)).toEqual({ ratio: 0.1, tone: 'critical' })
  expect(bar(1000, 0)).toEqual({ ratio: 0, tone: 'critical' })
  expect(bar(1000, 0, 42.5)).toEqual({ ratio: 0, tone: 'critical' })
  expect(bar(0, 0)).toEqual({ ratio: 0, tone: 'ok' })
  expect(bar(Number.NaN, 5)).toEqual({ ratio: 0, tone: 'ok' })
  expect(bar(1000, 1200).ratio).toBe(1)
  const c = readAtlasCredits({ credits: { ...CREDITS_BLOCK, balance: { granted: 1000, consumed: 6.7, remaining: 993.3, overage: 0 } } })
  const v = creditsView(c, null)
  expect(v.big).toBe('993.3')
  expect(v.sub).toBe('of 1,000 left')
  expect(Math.round(v.ratio * 10000)).toBe(9933)
  expect(v.tone).toBe('ok')
})
