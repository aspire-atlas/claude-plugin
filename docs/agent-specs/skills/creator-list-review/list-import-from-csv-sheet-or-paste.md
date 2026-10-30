---
name: List import from CSV, sheet or paste
owner: 07-creator-list-review
---

# List import from CSV, sheet or paste

## What it does

Takes the list the person gives `/aspire` and normalizes it into one entry per network and handle.

## Inputs

- From brand memory: the brand's own handles and saved competitors.
- From the launch message: the normalized list (network, handle, and name when given, in list
  order, at most 100), and the list's name, slug and source: a CSV export, pasted handles, or the
  current list read from the Aspire app.

## Output

A clean list for the run, with handles stripped of signs and links and lowercased, the brand's
own handles dropped, and handles on other networks marked as not vetted. `/aspire` reads the file
or paste before the launch; a spreadsheet is saved as CSV first. A list over 100 creators is
split into runs of 100, run one at a time.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
