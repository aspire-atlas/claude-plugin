---
name: Velocity detection across tracked content
owner: 03-trend-scout
---

# Velocity detection across tracked content

## What it does

Finds the formats, sounds, claims, and visual styles whose use is growing fastest across the content Atlas tracks for the brand, before they peak.

## Inputs

- From brand memory: the brand's tracked hashtags, its saved `competitor` records with their handles, and the program creators on its rosters. It reads no earlier run: it saves nothing, so first sighting comes from the posts themselves.
- From the launch message: the profile, the window (default the last 14 days, against a four-week baseline), and the networks.

## Output

Up to ten patterns, each with its kind (format, sound, claim, or visual style), the posts and distinct creators using it in the window against the baseline, its growth as a multiple of the baseline, both counted per week so a 14-day window and a four-week baseline compare fairly, its first sighting, and three example posts with links. A pattern needs at least three distinct creators; fewer is listed as early, not rising. A pattern whose baseline is zero is labelled new, never given a multiple.

## Callable

Never user-callable. Only Trend Scout runs it.
