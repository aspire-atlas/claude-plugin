---
name: Page building blocks
owner: shared
---

# Page building blocks

## What it does

Gives every page the same tested parts, so pages reach the same quality without looking the same.
There is one block per part of the page skeleton: the reader and scope header with its coverage
strip, the answer headline, insight cards, the decisions block, the ranked next steps table, the
evidence blocks (creator, post, storyboard strip, rights row, score row, quote), the method panel,
the what's missing panel, the "Atlas can draft next" footer, the leadership split wrapper, the test
plan block, and a timeline. The blocks set what each part holds and the order of its evidence. The
flow and the reader set the layout.

## Inputs

- From the launch message: the kind of page and the reader.
- From the brand's calibrations: the saved theme (`theme:brand`), which every block takes through the page tokens.

## Output

The parts the page is built from, already carrying the markup the page standard's self-check
reads.

## Callable

Never user-callable. Every agent links it, and it is never counted in an agent's own skills.

## Lives in today

`plugins/aspire/skills/page-standard/blocks.md`, loaded through the page standard (ASP-4526).
Section 5 of that file maps every element of the three validated examples (I1, O3, P1) to a block.
