#!/usr/bin/env bun
// The CI side of the page eval (scripts/eval/README.md, "In CI"): which questions a pull request reruns, the
// comment it gets, and the nightly Slack message. It reads files and prints; the workflow does the posting.
//
//   bun scripts/eval/ci.ts select <changed-files.txt>     prints the question codes, comma-separated, or nothing
//   bun scripts/eval/ci.ts comment <run-dir> [run-url]     prints the PR comment; exits 1 on a regression, 2 when the run stopped
//   bun scripts/eval/ci.ts skipped <reason>                prints the comment for a skipped run
//   bun scripts/eval/ci.ts slack <run-dir> [run-url]       prints the Slack payload as JSON; exits 1 on a regression

import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { checkNames, codesForChanges, regressions, renderComment, renderSkipped, renderSlack, renderStopped, type RunResults } from './lib'

const HERE = import.meta.dir
const PLUGIN = resolve(HERE, '../../plugins/aspire')
const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'))

const names = (eChecks: { id: string; name: string }[]) =>
  checkNames(eChecks, readFileSync(join(PLUGIN, 'skills/aspire/references/reader-standard.md'), 'utf8'))

/** The run's results, or null when the run stopped before its first question finished. */
function results(runDir: string): RunResults | null {
  const path = join(runDir, 'results.json')
  if (existsSync(path)) return readJson(path)
  console.error(`ci: ${path} does not exist; the run stopped before its first question finished`)
  return null
}

const [command, arg, runUrl] = process.argv.slice(2)
const eChecks = readJson(join(HERE, 'e-checks.json')).checks
if (command === 'select' && arg) {
  const config = readJson(join(HERE, 'questions.json'))
  const changed = readFileSync(arg, 'utf8').split('\n').map(line => line.trim()).filter(Boolean)
  const { watched, codes } = codesForChanges(changed, config.questions, config.sharedPaths ?? [])
  console.error(`watched files changed: ${watched.length ? watched.join(', ') : 'none'}`)
  console.log(codes.join(','))
} else if (command === 'comment' && arg) {
  const run = results(arg)
  if (!run) {
    // A comment still goes up, so an earlier table on the PR is never left standing as if it were current.
    process.stdout.write(renderStopped(runUrl ?? null))
    process.exit(2)
  }
  const from = existsSync(join(arg, 'approved-from.txt')) ? readFileSync(join(arg, 'approved-from.txt'), 'utf8').trim() : null
  const source = from && from !== 'none' ? `the baseline of ${from}` : from === 'none' ? null : 'the approved pages, graded in this run'
  process.stdout.write(renderComment(run, eChecks, names(eChecks), source, runUrl ?? null))
  process.exit(regressions(run, eChecks).length ? 1 : 0)
} else if (command === 'skipped' && arg) {
  process.stdout.write(renderSkipped(arg))
} else if (command === 'slack' && arg) {
  const run = results(arg)
  if (!run) process.exit(2)
  process.stdout.write(JSON.stringify({ text: renderSlack(run, eChecks, runUrl ?? null) }))
  process.exit(regressions(run, eChecks).length ? 1 : 0)
} else {
  console.error('usage: bun scripts/eval/ci.ts select <changed-files> | comment <run-dir> [url] | skipped <reason> | slack <run-dir> [url]')
  process.exit(2)
}
