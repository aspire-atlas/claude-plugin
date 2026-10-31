---
name: Brief parsing into criteria
owner: 05-creator-search
---

# Brief parsing into criteria

## What it does

Turns the campaign's saved brief and criteria into the filters and scoring targets the run searches with.

## Inputs

- From brand memory: the campaign's brief, criteria, pool target, routing and cadence records,
  plus the brand summary, saved competitors, red lines, partners and guidelines. Keys that belong
  to other flows (content review, vetting, programs, the content library) are dropped.
- From the launch message: the brand profile, the campaign, the brand's handles and networks, the
  job (discover, shortlist or view), and for a creator ad campaign the lane to fill.

## Output

A set of search criteria for the run: networks, follower band, countries, archetype and topic
terms, formats, and the hard exclusions. If any of the five campaign records is missing, it stops
and hands back one line asking `/aspire` to run discovery setup. It never asks the person setup
questions and never guesses a criterion.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
