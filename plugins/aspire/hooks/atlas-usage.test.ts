// Run with: claude plugin test plugins/aspire
import { expect, test } from 'claude-code/testing'

import { fmtAmount, fmtAtlasUsage, isAtlasStatusCall, parseTokenCosts, readAtlasUsage, toAmount } from './atlas-usage'

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
