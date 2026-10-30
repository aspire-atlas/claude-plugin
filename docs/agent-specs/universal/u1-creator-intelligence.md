---
name: Creator intelligence
owner: universal
code: U1
---

# U1 Creator intelligence

## What it does

Answers who these creators are, whether they fit, and whether they drive action.

## Inputs

- From brand memory: the saved criteria (vetting criteria and thresholds, a campaign's brief and criteria, or a creator ad lane), `brand:summary` and the goal, and the team's saved notes and earlier vetting and discovery findings on the creator.
- From Atlas: the creator's account fields and demographics, and their recent posts (the last 90 days, or 180 when there are fewer than 5; up to 100 for a full profile).
- From the launch message: the handle or list, and the reader.

## Output

For each creator: a fit score out of 100 in six parts with fixed weights (audience 30, topic 25, engagement against its size band 20, cadence 10, format 10, market 5), each part naming the field or post behind it, and a part with no data scored zero and listed as missing. Beside the score, unscored: the audience panel (gender, age bands, top locations), median engagement and view rates, cadence, the top and lowest posts, the post to cite to the creator, and the audience fit and paid track record signals rated strong, typical, weak, or not judged. In a program it also returns engagement lift against the creator's own baseline, judged only with 2 or more program posts and 5 or more of their own posts.

## Callable

Never user-callable. Agents that list U1 under **Universal skills used** run it, and it is never
counted in an agent's own skills.
