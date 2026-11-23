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

`personas.json` holds them. Each names the person, the state the test organization must start in, the first message
(the bare `/aspire:aspire` a person sends), how they answer the flow's pickers, and the reply typed when a turn ends
without value or a picker. The flow asks almost everything through pickers, so the answers carry each person's role
and choices: the relationship question gets their own role in words, so the flow routes them to their own reader, and
the rest take the short road a person who says "go with your recommended options" takes: no optional questions, no
lists to type, no account to connect (and "Connect later" when the flow offers a retry), "Wait for the report" while
the invited brand report builds, and "Not now" or "Later" to the theme, creator rates and audit offers. The Role
picker a first agent run asks gets the person's own role. "Don't ask again" is never picked: it saves a record, which counts as brand
context on the next run.

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
organizations are ones the signed-in person was invited to and set up through the site, so they also hold the brand
snapshot and the answers given there, and the flow takes its invited first turn. FR1 to FR5 need organizations the
person was not invited to, with no brand questions answered, so the flow takes its first run rather than treating the
organization as set up.

## What it measures

**Value** is the first result of any of these Atlas tools that does not fail, from the main thread or an agent:
`search_creators`, `search_posts`, `lookup_creators`, `search_creator_marketplace`, `search_insights`,
`lookup_posts`, `search_ads` and `search_partnership_content` (`valueTools` in `personas.json`). A scenario stops
once it has value, at the next picker (left unanswered) or when the turn that reached value ends, whichever comes
first. Work in that turn after value, such as an agent finishing its page, counts in the totals and the credits.

| Column | What it holds |
| ------ | ------------- |
| Value | The value tool that answered first, or `no` |
| Time to value | Minutes from the first message to that result, each turn timed from when its session is up. The harness answers pickers and types replies at once, so this is the flow's own time, not the person's |
| Questions | Picker questions the harness answered before value, plus each turn that ended on a question asked in text. The organization picker is left out: a person in one organization never sees it |
| Nudges | Replies the harness typed before value to a turn that ended without asking anything. A person might not have sent them |
| Atlas calls | Atlas tool calls before value, the value call included |
| Tool calls | Every tool call before value, agents' and the value call included |
| Tokens to value | Billed tokens of every turn up to the one that reached value. A turn is billed whole, so work after value in that turn counts too |
| Credits | Credits the organization used over the scenario, from `get_status` before and after (after a wait, `--settle-sec`). Blank when either reading failed, a billing period started between them, or the organization's usage is covered by Aspire, whose count leaves the work out |
| Atlas errors | Atlas results that came back as errors, out of every Atlas call |
| Profile created | Whether the run created a brand Profile |

Under the table: how many scenarios reached value, and the medians of those that did.

## What it needs

- `bun`, and the `claude` CLI signed in. The scenarios run through the Agent SDK, as the page eval's do
  (`../session.ts`), so the flow's pickers are there and answered.
- One test organization per scenario on the dev Atlas server, in the scenario's starting state, billed to a customer
  billing account (not covered by Aspire), or the credits column stays blank. Every run answers the brand questions
  and saves calibrations, so an organization is in its starting state once only: use a fresh one for the next run,
  whether that is the next model, the "after" run or another scenario. Resetting one is not enough: a run also leaves
  the person's own facts and a last-run record, and calibrations belong to the organization, so deleting its Profile
  leaves them behind. With no Profile they cannot be read, so FR5's check cannot see them: give FR5 a fresh
  organization every time. The harness reads `get_status` and the organization's calibrations before each scenario and does
  not run one whose organization is not the named one or is in the wrong state (not exactly one Profile where it needs one, a Profile or Instagram link missing
  or extra, invited or not, brand questions answered, programs or campaigns saved, or any brand context, own-fact,
  decline, theme, rate-card or last-run record; for FR6 and FR7, which are set up on the site, only a last-run
  record), saying why.
- One Instagram account per linked scenario (FR1 to FR4 and FR6). Atlas links an account to one brand Profile across
  every organization, so the scenarios cannot share one, and each fresh set of organizations needs the accounts
  moved: unlink them from the used organizations by hand (the harness refuses `unlink_channel`) and link them again
  through the browser sign-in, or the link comes back as already linked elsewhere.
- A sign-in to the dev Atlas connector held by Claude Code, added with `--scope user`, or a token, exactly as the page
  eval needs it (`../README.md`, **What it needs**). The signed-in person must belong to every test organization.
- `scripts/eval/first-run/local.json`, copied from `local.example.json`: the connector, and for each scenario its test
  organization's name and the brand, website, Instagram handle and competitor its answers and typed reply name. It is ignored by
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
`get_status` readings, default Haiku), `--settle-sec`, `--max-rounds`, `--max-asks`, `--timeout-min`, `--out`.

## What one scenario does

1. **Reads the starting state.** A separate session on the probe model calls `get_status` for the scenario's
   organization, and `search_calibrations` when it has a brand Profile, and nothing else. Its time and tokens are not counted.
2. **Sends the first message**, a bare `/aspire:aspire`, as a new session with the plugin from this checkout.
3. **Answers what the flow asks.** Pickers are answered from the answer list: the organization picker with the
   scenario's organization (picked by name, or typed when the picker does not list it), then the scenario's own `answers`, then the shared ones, then the option marked
   (Recommended), then the first option (`../answers.ts`). `{brand}` and the other values in a rule come from
   `local.json`, and a rule whose value is missing is passed over. The run will not start when a typed reply names a
   value `local.json` does not give. When a turn ends with no value and no picker, the
   harness types the scenario's reply. It stops at value, at `--max-rounds` replies, or at `--max-asks` pickers.
4. **Reads the credits used** with a second `get_status` reading, `--settle-sec` seconds after the last turn, since
   discovery the run started records its usage when it finishes.

## What a run may and may not do

- It makes the writes a first run makes: a brand Profile, calibrations, insights, hashtags, the brand instruction and
  business discovery. So every scenario leaves brand context behind, and FR5 a Profile too: run the next one on a
  fresh organization.
- It refuses every Atlas tool that removes, renames or replaces a record (`update_profile` included), sends feedback,
  or moves billing, and `connect_channel`, whose sign-in needs a browser. `lib.test.ts` fails when the two lists stop covering every Atlas
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
- The signed-in person belongs to every test organization, so each scenario goes through the organization picker
  and the `get_status` call after it, which a person in one organization never sees. Questions leaves the picker out;
  Atlas calls, Tool calls and Time to value include both.
- A run without `--model` records the model the session reported. Pass `--model` anyway, so a change of the CLI's
  default does not split a comparison.
- Credits come from the organization's period total, so other work on the same organization during a run counts too,
  and discovery still running after `--settle-sec` is missed.
- Value is defined by tool name only: a value tool that returned nothing useful still counts. Read the transcript when
  a number looks too good.
