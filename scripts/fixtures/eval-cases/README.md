# Fixture pages for the client cases

Two short pages for each client case in `scripts/eval/questions.json` (a question with `assertions`):

| File | What it is |
| ---- | ---------- |
| `<code>-wrong.html` | A page that draws the wrong conclusion the case is about. Every assertion of the case fails on it. |
| `<code>-corrected.html` | The same findings read correctly. Every assertion of the case passes on it. |

`bun run eval:pages --fixtures` judges each case's assertions on both pages and fails unless they come out
that way. It shows that an assertion's wording tells the two readings apart, which a rerun on thin test data
cannot show.

The pages are written from the findings as their tickets record them. They are not copies of a customer's
page: the figures behind each finding are kept, every brand and competitor is invented, every handle is a
placeholder (`@creator_a`), and every link points at `example.com`.
This repository is public and holds no customer names.

A new client example for a case adds its wrong reading to `<code>-wrong.html` and its corrected reading to
`<code>-corrected.html`, with the row it adds to the assertion's `examples` (`docs/STANDARD.md`,
"Adding a client example").

## Filled-in figures

`i13-*.html` keep each creator's talks to camera score as the source deck gave it, with its shares and
analysed post count where the deck named them. Where the deck gave no shares, the
shares on the pages are filled in so that 45% speech + 35% to camera + 20% explainer gives the stated score:
every creator but @creator_g's speech share (100%), @creator_h's speech and to-camera shares (31% and 62%),
@creator_j's speech share (39%) and @creator_k's explainer share (98%). The analysed post counts are filled
in too, except @creator_g's 26 and @creator_i's 15. @creator_k is also scored on 60 / 20 / 20, the weights of a
second campaign, to show how a changed weighting reads.

`p7-*.html` and `p8-*.html` use invented brands (Inkwell, Tidewalk) and products. The creator figures
on the P7 pages are those of the source deck; the client's quotes, the email date and the brand's own
page lines are invented.
