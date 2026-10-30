---
name: Gap analysis by product, format and hook
owner: 23-ugc-commissioner
---

# Gap analysis by product, format and hook

## What it does

Counts the cleared assets the library holds per product, format, theme and hook pattern, and names the gaps.

## Inputs

- From brand memory: the library's `asset` findings and the rights joined to them, the program's
  catalog, and the audiences in `brand:summary`.
- From the launch message: any focus the person named (products, formats).

## Output

At most five gaps, ranked by catalog order and then by how much better the missing pattern does in
the library. A gap is a product with fewer than two cleared videos, or a product with a theme or
hook pattern the brand's best posts use and none cleared. Persona is "not checked" when no audience
is tagged. Agreed or delivered asset requests not yet posted count toward their cell, so a gap is
never commissioned twice.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
