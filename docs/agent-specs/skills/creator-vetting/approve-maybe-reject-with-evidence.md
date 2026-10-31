---
name: Approve, maybe, reject with evidence
owner: 06-creator-vetting
---

# Approve, maybe, reject with evidence

## What it does

Applies the recommendation rule to each creator and publishes the page with every call and its proof.

## Inputs

- From brand memory: the team's saved calls on single creators, vetting lessons, the thresholds
  (or the defaults of 70 and 50, labelled as defaults), earlier vetting and discovery states, and
  the brand theme when saved.
- From the launch message: the list name and source, the criteria source, whether the person
  chose to save the recommendations, the question code, the reader lens, and any approved
  examples.

## Output

Per creator: Approve, Maybe, Reject or Can't vet, the rule that decided it, its top two
reasons, and for a Maybe what would settle it. The first rule that applies wins, in order: a
saved team call, a hard stop, too little data, a safety cap, then the fit score. A creator is
never rejected for data Atlas does not hold. The agent hands back a published page and a
numbered summary, and proposes the recommendation saves.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
