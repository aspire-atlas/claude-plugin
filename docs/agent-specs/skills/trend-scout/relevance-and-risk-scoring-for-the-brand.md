---
name: Relevance and risk scoring for the brand
owner: 03-trend-scout
---

# Relevance and risk scoring for the brand

## What it does

Scores each rising pattern for how well it fits the brand and what could go wrong if the brand joins it.

## Inputs

- From brand memory: the brand's guidelines, `red_line` calibrations, and brand safety instruction, and the brand's own posts' formats from the performance baseline.
- From the launch message: the patterns from velocity detection.

## Output

Per pattern: relevance (high, medium, low) with one reason tied to the brand's category, products, or audience; risk (none, watch, avoid) with the red line or safety category it touches and the post that shows it; and whether the brand has already used it, with the brand's own result against its median. An `avoid` pattern stays on the page so the team knows why it was left out.

## Callable

Never user-callable. Only Trend Scout runs it.
