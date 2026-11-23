# First-run eval: how long a new person takes to get a first result

`bun run eval:first-run` plays seven first-run scenarios through the plugin in this checkout, each as a new person
on a test organization, and measures the way from their first message to their first result. Run it before a change
to the first run and again after, on each model, and compare the two.

It runs on a developer's machine. It is not part of CI: one run is seven full first runs, and each needs a test
organization in the right starting state.

## Contents

- [The scenarios](#the-scenarios)
- [What it measures](#what-it-measures)
- [What it needs](#what-it-needs)
- [Commands](#commands)
- [What one scenario does](#what-one-scenario-does)
- [What a run may and may not do](#what-a-run-may-and-may-not-do)
- [What is committed and what is not](#what-is-committed-and-what-is-not)
- [Limits](#limits)

## The scenarios

`personas.json` holds them. Each names the person, the state the test organization must start in, the first message,
the reply the person types when the flow asks in text, and how they answer the flow's pickers.

| Code | Person | Starts with |
| ---- | ------ | ----------- |
| FR1 | Influencer manager | A brand Profile with Instagram linked |
| FR2 | Paid social manager | A brand Profile with Instagram linked |
| FR3 | Organic social manager | A brand Profile with Instagram linked |
| FR4 | Agency strategist | A brand Profile with Instagram linked |
| FR5 | Organic social manager with no linked account | No brand Profile and no link |
| FR6 | Invited person who connected Instagram on atlas.aspire.io | A brand Profile with Instagram linked, set up on the site |
| FR7 | Invited person who skipped connecting on atlas.aspire.io | A brand Profile with no link, set up on the site |

FR6 and FR7 start where Continue in Claude leaves a person: the organization's setup on atlas.aspire.io is done
(role, organization and brand, social connected or skipped), and the first message is a bare `/aspire`. Their test
organizations are set up through the site, so they also hold the brand snapshot and the answers given there. FR1 to
FR4 start from an organization whose Profile and Instagram link were made without the site's onboarding steps.

## What it measures

**Value** is the first result of any of these Atlas tools that does not fail, from the main thread or an agent:
`search_creators`, `search_posts`, `lookup_creators`, `search_creator_marketplace`, `search_insights`,
`lookup_posts`, `search_ads` and `search_partnership_content` (`valueTools` in `personas.json`). A scenario stops
once it has value: the next picker is left unanswered and ends the run.

| Column | What it holds |
| ------ | ------------- |
| Value | The value tool that answered first, or `no` |
| Time to value | Minutes from the first message to that result. The harness answers pickers and types replies at once, so this is the flow's own time, not the person's |
| Questions | Picker questions answered before value, plus each reply typed to a turn that asked in text |
| Atlas calls | Atlas tool calls before value, the value call included |
| Tool calls | Every tool call before value, agents' included |
| Tokens to value | Billed tokens of every turn up to the one that reached value. A turn is billed whole, so work after value in that turn counts too |
| Credits | Credits the organization used over the scenario, from `get_status` before and after. Blank when either reading failed or a billing period started between them |
| Atlas errors | Atlas results that came back as errors, out of every Atlas call |
| Profile created | Whether the run created a brand Profile |

Under the table: how many scenarios reached value, and the medians of those that did.

## What it needs

- `bun`, and the `claude` CLI signed in. The scenarios run through the Agent SDK, as the page eval's do
  (`../session.ts`), so the flow's pickers are there and answered.
- One test organization per scenario on the dev Atlas server, in the scenario's starting state. Scenarios with the
  same starting state can share one. The harness reads `get_status` before each scenario and does not run one whose
  organization is in the wrong state, saying why.
- A sign-in to the dev Atlas connector held by Claude Code, added with `--scope user`, or a token, exactly as the page
  eval needs it (`../README.md`, **What it needs**). The signed-in person must belong to every test organization.
- `scripts/eval/first-run/local.json`, copied from `local.example.json`: the connector, and for each scenario its test
  organization's name and the brand, website, Instagram handle and competitor the typed reply names. It is ignored by
  git: brand names are customer details and this repository is public.

## Commands

```bash
bun run eval:first-run --label before --model haiku     # every scenario, on one model
bun run eval:first-run --label before --model sonnet --baseline
bun run eval:first-run --label after --only FR6,FR7      # some scenarios
bun run eval:first-run --compare 2026-11-23-before-sonnet 2026-12-10-after-sonnet
bun run eval:first-run --dry-run                         # print what would run
```

Run it once per model (Haiku, Sonnet and Opus). `--baseline` stores the results under
`baselines/<date>-<label>-<model>/`. `--compare` takes two baselines or runs (`latest` for the newest run) and prints
before and after, scenario by scenario, ready for the ticket. Other options: `--probe-model` (the model for the
`get_status` readings, default Haiku), `--max-rounds`, `--max-asks`, `--timeout-min`, `--out`.

## What one scenario does

1. **Reads the starting state.** A separate session on the probe model calls `get_status` for the scenario's
   organization and nothing else. Its time and tokens are not counted.
2. **Sends the first message**, `/aspire:aspire` and the organization's name, as a new session with the plugin from
   this checkout.
3. **Answers what the flow asks.** Pickers are answered from the scenario's own `answers`, then the shared list, then
   the option marked (Recommended), then the first option (`../answers.ts`). A turn that ends with no value and no
   picker asked in text, and gets the scenario's typed reply. It stops at value, at `--max-rounds` replies, or at
   `--max-asks` pickers.
4. **Reads the credits used** with a second `get_status` reading.

## What a run may and may not do

- It makes the writes a first run makes: a brand Profile, calibrations, insights, hashtags, the brand instruction and
  business discovery. So a scenario that starts with no Profile leaves one behind: delete it before running that
  scenario again, or the harness will not start it.
- It refuses every Atlas tool that removes or replaces a record, sends feedback, or moves billing, and
  `connect_channel`, whose sign-in needs a browser. `lib.test.ts` fails when the two lists stop covering every Atlas
  write.
- It refuses the plugin's bundled connectors and every other connector on the machine, so it reaches the test
  connector only.
- It publishes any page the flow publishes as a private artifact on the signed-in account, and runs the plugin's shell
  snippets without asking. Run it on a development machine or in a container, never beside production credentials.

## What is committed and what is not

| Path | Committed | Holds |
| ---- | --------- | ----- |
| `baselines/<date>-<label>-<model>/results.json`, `table.md` | Yes | The numbers, the plugin commit, the model. No brand, handle, link or transcript text |
| `.runs/<time>/` | No | Each turn's stamped transcript, the `get_status` readings, `results.json`, `table.md` |
| `local.json` | No | Organizations, brands, handles, the dev server address |

## Limits

- Time to value is the flow's time with instant answers. A person reads and types, so their time is longer; compare
  runs with each other, not with real people's minutes.
- One run per scenario and model is one sample. Run a scenario more than once before reading much into a small change.
- Credits come from the organization's period total, so other work on the same organization during a run counts too.
- Value is defined by tool name only: a value tool that returned nothing useful still counts. Read the transcript when
  a number looks too good.
