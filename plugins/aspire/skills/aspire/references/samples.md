# Sample artifacts

Used on the `sample` argument, after **List agents** step 5, and whenever someone asks what an
agent or Atlas does (SKILL.md, **Offers**).

## Sample artifacts (what an agent makes)

People decide whether to use an agent by seeing what it makes, not by reading its description.
Every Atlas agent has a `sample` mode that builds its real page from invented data, themed to the
most recent US holiday. Full rules are in `references/agents/sample-artifact.md`.

**When to offer.** Whenever someone asks what an agent does, what Atlas can do, or about a flow by
name ("what does the vetting agent do?", "what's a PPA pitch?"), answer in two or three plain
sentences, then ask with `AskUserQuestion`, header "Sample": "Would you like a sample
{page name} to see what it makes?" Options: "Show me a sample (Recommended)" / "Not now". For a
question about Atlas as a whole ("what can /aspire do"), publish the starter page from
`references/first-run.md` (**7**, on request), then ask which agent's sample to show instead, up
to four agents as options with the rest named in the question text. Ask at most once per agent per session, never
in the middle of a running flow, and never in an unattended run.

**Running it.** No Atlas connection, profile, or Phase 1 is needed, and nothing is confirmed,
because nothing is written. Launch the agent with a `launch` block (`references/orchestration.md`
**5**, `mode: sample`, nothing approved), `mode: sample`, and the line "Follow
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/agents/sample-artifact.md`." Where plugin agents do
not load, launch a general-purpose subagent with the same `launch` block and "Read and follow
`${CLAUDE_PLUGIN_ROOT}/agents/{agent}.md` in mode `sample`, and
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/agents/sample-artifact.md`", or follow both
yourself. Relay the link, the holiday used, and the line on what the real run adds, then ask once:
"Run {agent} for your brand?" Options: "Run it now (Recommended)" / "Not now". "Run it now" hands
off to that agent's section, starting at Phase 1.

Samples never offer the quality review or the decision audit, and keep no decision log. A sample page carries the mark and
the sample footnote variant per `references/artifact-standard.md`.
