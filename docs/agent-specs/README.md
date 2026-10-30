# Agent and skill specs

Every Atlas agent and every skill is written down here in one format. A spec is the design record
`/aspire` routes from and the proposal page lists. The agent that actually runs is the file in
`plugins/aspire/agents/`. These docs are not shipped in the plugin.

As of 29 Oct 2026 there are 31 agents carrying 165 skills, matching the "Every skill, by agent"
table on the Atlas Agent Team proposal page.

## What is in this folder

| Path | Holds |
| ---- | ----- |
| `agents/NN-slug.md` | One spec per agent, numbered as on the proposal page |
| `skills/<agent-slug>/<skill-slug>.md` | One spec per skill an agent carries, written in the agent's wave |
| `universal/` | U1 to U7, the analyses two or more personas rely on |
| `shared/` | The skills every agent links to |
| `templates/` | The blank agent and skill specs to copy |

## Three kinds of skill

1. **An agent's own skills.** The job only this agent does. These are the skills counted on the
   proposal page.
2. **Universal skills (U1 to U7).** Shared analysis that two or more personas rely on, built once
   and reused. Never counted in an agent's skills.
3. **Shared skills.** How every agent writes, asks, labels, remembers, spends, and publishes. Every
   agent links all of them, and none is counted.

None of the three is ever user-callable. A person only reaches them through `/aspire`.

The rule for where a piece of analysis goes: if two or more personas ask the question, it belongs
in a universal skill. If only one role acts on it, it belongs in an agent's own skill.

**Universal skills ship as their own shared skills in the plugin, not inside each agent.** This
is the proposed default from the Skills × Artifacts Map, so agents stop repeating the same
analysis. It stands unless the review of ASP-4101 decides otherwise.

## The agent spec

Copy `templates/agent.md`. The header holds the short fields and the sections hold the lists.

| Field | Where | What goes in it |
| ----- | ----- | --------------- |
| Number, name | header | The number and name on the proposal page. The file is `NN-slug.md`. |
| Team | header | The team number and name (1 to 6). |
| Personas | header | Influencer Manager, Paid Social Manager, Organic Social Manager. |
| Wave | header | Build wave, 1 to 4. |
| Permission | header | Read, Write, Send, or Spend, as `orchestration.md` section 7 defines them. |
| Plugin agents | header | The `atlas-*` agents that do this job today, or `none`. |
| Job to be done | section | "When I…, I want…, so…" in the person's words. |
| Questions answered | section | One row per question: its code (I1 to I6, P1 to P6, O1 to O6, A1, or None), the primary reader, the kind of page, and the approved example if there is one. |
| Skills carried (N) | section | A numbered list, with N in the heading. |
| Universal skills used | section | The U codes it runs. |
| Shared skills | section | The fixed line linking `shared/`. |
| Connects to | section | Atlas, Aspire, Shopify MCP, TikTok Shop Partner Center, Meta, Slack, Gmail, and so on. |
| Trigger phrases | section | What a person says that routes here. |
| Writes to Atlas | section | What it saves and under which approval. A Read agent says "Nothing". |
| Non-goals | section | What it leaves to another agent. |

**Kinds of page.** Readout, Shortlist, Verdict, Profile, Plan, or Dashboard. The kind sets the
page's purpose, not its layout.

**Primary readers.** Self, creative team, creators, VP or budget owner, and brand and legal. Use
the wording of the question map where it is more specific ("the leader who asked").

**Approved examples.** Name the ticket that holds the example (ASP-4527), not a link. Examples
carry customer names and this repo holds none.

## The skill spec

Copy `templates/skill.md`. A skill spec holds its name, its owner (the agent's `NN-slug`, or
`shared`, or `universal` with its U code), one sentence on what it does, the inputs it needs from
brand memory or the launch message, and the output it hands back inside the agent. It is never
user-callable.

An agent's skill file is `skills/<agent-slug>/<skill-slug>.md`, where the agent slug is the agent
file's name without the number and the skill slug comes from the skill's name in the agent spec.
Skill files are written in each agent's wave ticket (ASP-4102 to ASP-4105).

## Pending fields

A field the proposal page does not settle reads `_Pending: set in ASP-NNNN._`, naming the ticket
that fills it. The check counts them and does not fail on them.

## Permission levels that differ from the running agents

The `permission` header is the level on the proposal page, and `--compare` holds it there. For
these agents the running `atlas-*` agents have a different level in `orchestration.md` section 7,
and section 7 is the level `/aspire` confirms. Change a header only together with the proposal page, then drop
its row here.

| Agent | Header | Running agents' level | Why |
| ----- | ------ | --------------------- | --- |
| 02 Market Signal | Read | Write | Saves findings |
| 05 Creator Search | Write | Spend | Starts discovery work |
| 06 Creator Vetting | Write | Spend | Fetches handles Atlas does not hold |
| 07 Creator List Review | Write | Spend | Fetches handles Atlas does not hold |
| 08 Creator Profile | Read | Spend | Refreshes a stale handle |
| 09 Ads Creator Finder | Write | Spend | Starts marketplace searches for the ranking passes |
| 18 Creator Payments | Send | Write | Records invoices and payments, never pays |
| 23 UGC Commissioner | Send | Write | Saves asset requests as drafts, never sends |
| 27 Account Analyst | Write | Spend | Refreshes a public handle the person named |
| 29 Reports | Read | Write | Each report saves its findings or snapshot |
| 31 Post Analysis | Read | Spend | Refetches the post |

## The check

```sh
bash scripts/check-agent-specs.sh                   # check every spec
bash scripts/check-agent-specs.sh --list            # every agent with its skill count and skills
bash scripts/check-agent-specs.sh --compare page.html   # diff skills, wave, permission, team, personas, job and connections against a saved copy of the proposal page
```

It fails when a spec is missing a field or section, a section is empty, a team number does not match its name, the count in "Skills carried (N)" is not the
length of the list, numbers repeat or skip, a question code is not in `orchestration.md` section 3,
a U code is not U1 to U7, a named plugin agent has no file, or a skill spec names the wrong owner or lacks the What it does, Inputs, Output, and Callable sections.
It reports how many skill files are written and how many fields are still pending.
