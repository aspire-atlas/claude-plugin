// Run with: claude plugin test plugins/aspire
import { expect, test } from 'claude-code/testing'

import { logoSvg } from './logo'

test('logoSvg animates by default and draws a still mark when asked', () => {
  expect(logoSvg(18)).toContain('@keyframes')
  expect(logoSvg(18, false)).not.toContain('@keyframes')
  expect(logoSvg(18, false)).toContain('viewBox="0 0 512 512"')
})
