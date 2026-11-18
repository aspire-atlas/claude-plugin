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
