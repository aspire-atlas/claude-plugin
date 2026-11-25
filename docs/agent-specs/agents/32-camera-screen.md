---
number: 32
name: Camera screen
team: 2 Creator supply
personas: Influencer Manager
wave: 4
permission: Write
plugin_agents: atlas-camera-screen
---

# Camera screen

## Job to be done

When I am casting a creator ad campaign, I want to know how much each creator on the slate talks
on camera, read from their own analysed videos, so I put forward creators who can carry a spoken,
to-camera ad and skip the ones who only post voiceover or text.

## Questions answered

| Code | Question | Primary reader | Eval reader | Kind of page | Approved example | Eval question |
| ---- | -------- | -------------- | ----------- | ------------ | ---------------- | ------------- |
| I13 | Which creators on this slate talk to camera? | Self | team | Shortlist | None yet | Not yet |

## Skills carried (1)

1. Talks to camera read per handle, post by post

## Universal skills used

- U1 Creator intelligence
- U2 Content intelligence

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Atlas

## Trigger phrases

- "camera screen"
- "which creators talk to camera"
- "talks to camera score"
- "screen the slate for on-camera creators"

## Writes to Atlas

Inside a CAS campaign only: each read as a new version of the creator's discovery finding, with
`detail.adFigures.talksToCamera` added, under row 4's Run picker. Asked on its own, nothing.

## Non-goals

- The match score and the Approve, Maybe or Reject call: `atlas-creator-vetting`.
- Finding and adding creators to a pool: `atlas-creator-discovery`.
- Changing the weights or the minimum: the CAS campaign's settings (ASP-5931).
