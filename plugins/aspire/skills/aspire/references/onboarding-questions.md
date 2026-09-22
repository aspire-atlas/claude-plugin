# Onboarding question set (Phase 4.1 and Phase 5)

Every question is asked with `AskUserQuestion`, one per call, in this order. Each row gives the
option set (2 to 4 options). The tool always adds its own free text field, so never add
"Other". "Skip" appears only where listed. Before Phase 5's first question, read existing
calibrations for the profile and skip any whose key is already occupied. Write each answer
immediately with `append_calibration`, `provenance: "interview"`. Keep `statement` under 280
characters; put supporting prose in `detail`.

The `web` column marks brand-facing questions that also carry a **"Research it on the web"**
option (appended to the listed options; the 4-option cap still applies, so drop "Skip" from the
displayed set when needed and treat a free-text "skip" the same way). When chosen, follow the web
research procedure in SKILL.md Phase 5: search, share findings with sources, confirm, then write
with `provenance: "web"`. Questions marked `web: no` are about the person or their team and never
offer it.

Substitute `{brand}` with the profile display name, `{org}` with the organization name, and
`{handles}` with the linked handles.

## Phase 4.1: profile creation

| # | Question | Options | Used for |
| - | -------- | ------- | -------- |
| P1 | What is the brand name, as customers know it? | 1) `{org}` stripped of "'s Organization"; 2) the user's company name if known; 3) "Test brand" (for trying the flow) | `create_profile.name` |
| P2 | Create a profile for **{name}** in {org}? | 1) Yes, create it (Recommended); 2) Change the name | gate |

## Phase 4.2: channels

| # | Question | Options | Used for |
| - | -------- | ------- | -------- |
| C1 | Which social accounts do you want to connect to {brand}? (multiSelect) | 1) Instagram (Recommended): Meta sign in, feeds search and hashtag tracking; 2) TikTok: feeds search and hashtag tracking; 3) YouTube: Google sign in | `connect_channel.channel` |

## Phase 5 core set (only after a channel is `complete`)

| # | Question | Options | web | kind | key | detail |
| - | -------- | ------- | --- | ---- | --- | ------ |
| 1 | What best describes what {brand} sells, and to whom? | 1) Consumer product or DTC brand; 2) B2B software or service; 3) Research it on the web; 4) Skip | yes | `brand_fact` | `brand:summary` | `{section: "brand_summary", body}` (use free text when given, else the chosen label; web: summary of the brand's own site) |
| 2 | What is your relationship to {brand}? | 1) In-house marketer or social lead; 2) Agency working on the brand's behalf; 3) Founder or owner | no | `user_fact` | `user:primary-contact` | `{role, relationship: in_house|agency|owner}` |
| 3 | Which competitors should Atlas watch most closely? | 1) I'll list handles (type them); 2) Research it on the web; 3) Not sure yet, suggest some later; 4) Skip | yes | `competitor`, one per handle | `competitor:{handle}` | `{handle, tier: "a"}` (web: review-site alternatives lists; confirm handles before writing) |
| 4 | Main goal for social listening over the next 90 days? | 1) Brand awareness and reach; 2) Creator discovery and partnerships; 3) Campaign measurement; 4) Competitive tracking or sentiment | no | `brand_fact` | `brand:business-context` | `{section: "business_context", body}` |
| 5 | Any hard no's Atlas should enforce: topics, creators, or content types to block or escalate? | 1) Yes, I'll describe them (type them); 2) Standard brand safety only; 3) Skip | no | `red_line`, one per rule | `redline:{slug}` | `{action, appliesTo[], body}` |
| 6 | Which creators or partners already work with {brand}? | 1) I'll list handles (type them); 2) Scan {handles} and the web for partners; 3) None yet; 4) Skip | yes | `partner`, one per handle | `partner:{handle}` | `{handle, platform, themes?}` (scan: tagged handles and collab language in the brand's own posts via `search_posts`, plus the web; present the list, let the user pick) |
| 7 | Which hashtags or product lines should always be tracked? | 1) I'll list them (type them); 2) Use the brand name and handle only; 3) Research it on the web; 4) Skip | yes | `add_hashtags` (4.3) plus `brand_fact` | `brand:tracking-scope` | `{section: "brand_context", body}` (web: hashtags the brand and its site use; also aggregate `instagram.hashtags` on the brand's own posts) |

After question 7, ask once: "Continue with 4 optional questions on cadence, voice, KPIs, and
team?" Options: 1) Yes, continue; 2) Finish setup now.

## Extended set

| # | Question | Options | web | kind | key | detail |
| - | -------- | ------- | --- | ---- | --- | ------ |
| 8 | How should findings reach you? | 1) Interrupt me for anything urgent; 2) Daily digest; 3) Weekly digest; 4) On demand only | no | `policy` | `policy:cadence` | `{area: "cadence", cadence}` |
| 9 | Tone and content rules the brand follows? | 1) I'll describe them (type them); 2) Research it on the web; 3) No formal rules yet; 4) Skip | yes | `guideline` | `guideline:voice` | `{concern: "preference", appliesTo: ["content"], body}` (web: published brand or style guidelines, observed voice on the brand's site and posts) |
| 10 | What does a good week on social look like, in numbers? | 1) I'll give targets (type them); 2) Research benchmarks on the web; 3) Not defined yet; 4) Skip | yes | `alignment_target` (admin) else `brand_fact` `limits_and_gaps` | `target:weekly-health` | `{horizon: "90d", confidence: "confirmed", cadence: "weekly", observable, notCovered}` (web: industry engagement benchmarks; the user must confirm the numbers, so confidence stays "confirmed" only after they do) |
| 11 | Who else on the team will use Atlas? | 1) I'll list them (type names and roles); 2) Just me for now; 3) Skip | no | `user_fact` per person | `user:{slug}` | `{role, relationship, firstAsk}` |

## Web findings before writing

A "Research it on the web" pick never writes directly. Present the findings (3 to 6 bullets,
each with its source), then ask: record as stated / edit / discard. Record with
`provenance: "web"` and `sourceRef` set to the primary URL; an edited version is written with
`provenance: "interview"`. A discard is not a decline: re-ask the original question with the
web option removed.

## Skips and declines

A "Skip" answer writes kind `decline`, key `decline:{question-slug}`, detail
`{topic, askedAt}` so no future session asks again. "Not sure yet" and "None yet" answers are
recorded as `brand_fact` in `limits_and_gaps` with `provenance: "known-absent"`.

## Handles

Normalize handles to lowercase without the `@` before using them as key slugs. Show them
with the `@` in conversation.
