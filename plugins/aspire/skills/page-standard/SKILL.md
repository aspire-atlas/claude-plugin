---
name: page-standard
description: >
  Shared skill for Aspire Atlas agents: the skeleton every published page follows (who it is
  for and what it covers, the answer first, up to three insights, ranked next steps, decisions
  kept apart, real evidence, how it was worked out, what is missing, what Atlas can draft next),
  the reader and evidence rules, and the E1 to E12 self-check every page passes before it is
  published. Agents load it before they build a page. It is not a command.
user-invocable: false
metadata:
  author: Aspire
---

# Page standard: the skeleton and the self-check

Every page an Atlas agent publishes holds the nine parts below and passes checks E1 to E12
before it goes out. The parts are fixed. The look is not: a creator profile, a competitor brief,
and a rights log should still look different. Decide what this question and this reader need
first, then fit the nine parts to it.

This skill sets what a page says. `skills/aspire/references/artifact-standard.md` sets the
mark and the source line, `skills/aspire/references/recipient-lens.md` sets the reader, and
`skills/aspire/references/theme.md` sets the colors and type. A flow's own reference sets what
its page holds; this skill is the bar that content clears.

## 1. The skeleton (every page)

| # | Part | What it holds | Check |
| - | ---- | ------------- | ----- |
| 1 | Who it is for and what it covers | The reader, the brand, the date range, and each platform with its post count. A platform with no data is named as not covered. The method section repeats the platform counts. | E1, E2 |
| 2 | Lead with the answer | The headline is the conclusion, written last, from the decision. Never a topic title ("Creator performance overview" fails; "49 creators reviewed. Contact 11 this week." passes). | E3 |
| 3 | Up to three insights | Each is a claim, the evidence, the comparison (last period, peers, a goal, the account's own baseline), then a "So:" line with the action. Hedges go in the "So:" line, never in the claim. The headline insight gets one chart. | E4 |
| 4 | Ranked next steps | Each says what to do, who does it, by when, and what it should change. | E5 |
| 5 | Decisions kept apart | What the reader must approve, each with a deadline, in its own section. When nothing does, the section says "Nothing needs approval." | E6 |
| 6 | Real evidence | Real posts and creators from this run, linked, with thumbnails or timestamps, below the argument. | E7 |
| 7 | How it was worked out | The scoring weights and the reasoning behind every score and recommendation, and the platform counts again. | E8, E2 |
| 8 | What is missing | Missing data and what connecting it would add ("Paid results need a connected Meta ad account"). | E9 |
| 9 | What Atlas can draft next | The drafts Atlas can make next, for example outreach to the 11, offers, discount codes. Nothing is sent without approval. | |

Every part is on every page. When a part has nothing for this page, it says so in one line ("No
decision needs approval", "No insights this run: 3 posts is too few to compare"); it is never
left out. A working page (an order form, a ledger, a tracker) keeps the parts short and puts its
working table where the evidence goes.

Two more checks cover the whole page:

- **Plain language (E11).** No tool, agent, or system names and none of the words in section 6.
  Say what was done ("Atlas compared 412 Instagram posts"), never who or what did it.
- **Built for this question (E12).** The sections and visuals come from what this question and
  this reader need. A launch timeline on a one-creator profile fails.

## 2. Reader rules

- **A VP or budget owner reads it** (questions I6, P4, P5, O3, O4, A1, and any page whose
  `recipient` is `leadership`): split the page. The answer, the decisions, and the next steps sit
  on the first screen. The method, all the evidence, and the options left out go below, so the
  person who prepared it can back it up if asked. "Prepared by" sits at the top with the name the
  main thread passed as `preparedBy`, or a blank the preparer fills in, and the page tells them
  they can edit it before sending. A VP page that opens with the method fails E10.
- **The brand reads it** (an agency or Aspire team prepared it for the brand): build the client
  version. No revision history, no "was 5, now 12", no named rejects, and the brand's own colors
  and type from `theme.md`. Whenever the reader is the brand and the main thread did not say which
  version, return the question "Build a client version for {brand}?" with the result.
- **Any other reader:** the "Prepared for" chip from `recipient-lens.md` and the order the lens
  sets.

## 3. Evidence standards that never vary by layout

- **Ad cut-downs (P1).** A storyboard per ad: a real still for every beat, timecodes, a one-line
  description, a duration strip, and edit notes, on the fixed five-beat structure: hook 0 to 3s,
  brand 3 to 6s, build 6 to 9s, reveal 9 to 12s, end card +2s. Treat timecodes from speech or
  frame sheets as drafts: check every one against a 1-second frame scan before publishing, and
  re-cut a beat that moves.
- **Any page that recommends paid spend.** A test plan: one variable per test, a hypothesis, and
  the Scale, Fix, or Stop rule for each.
- **Creator slates (I1).** Yes, Maybe, or No with a reason for every creator, the fee and the
  expected return. Run the fit checks before brand safety, and say which checks each creator
  reached. Each Maybe carries the one question that would settle it. Screen in the order the user
  ranked the brief's criteria. When the ask comes up short, say so ("3 of the 20 asked for") and
  never pad the list.

## 4. Build loop

1. **Read the validated example** for the same question, when the flow's reference or the launch
   message names one: the whole page, not just the top. List the evidence elements it carries that
   this page must match (storyboards, test plan, cards with thumbnails). Match the evidence, not
   the layout.
2. **Draft the page** for this question and this reader, with the markup in section 5.
3. **Self-check E1 to E12.** Run the script in section 5 for E1, E2, E6, and E11, and judge the
   others against section 6. Fix every fail and check again.
4. **Publish**, then report the result in the page check (section 7): which checks were fixed
   and which still fail, by name.

Write the headline last. Draft every other part, then write the headline from the decision the
page supports.

## 5. Markup and the scripted checks (E1, E2, E6, E11)

Mark the parts the script reads. The attributes carry no styling; style the page as the flow and
`theme.md` say.

```html
<!-- Part 1, before the first h2. data-range is the range as the page shows it. -->
<div data-page="scope" data-reader="the influencer manager" data-brand="Brightside Toys"
     data-range="Aug 1 to Oct 28, 2026">
  For the influencer manager · Brightside Toys · Aug 1 to Oct 28, 2026 ·
  <span data-platform="instagram" data-posts="412">Instagram 412 posts</span>,
  <span data-platform="tiktok" data-posts="96">TikTok 96 posts</span>,
  <span data-platform="youtube" data-posts="0">YouTube not covered</span>
</div>

<!-- Part 5. Either one item per decision, each with its deadline... -->
<section data-page="decisions">
  <h2>Decisions for you</h2>
  <p data-decision data-by="2026-11-04">Approve the 11 creators by Nov 4</p>
</section>
<!-- ...or: <section data-page="decisions"><h2>Decisions</h2><p>Nothing needs approval.</p></section> -->

<!-- Part 4 -->
<section data-page="next-steps">...</section>

<!-- Part 7 repeats every data-platform element from the scope, with the same counts. -->
<section data-page="method">...</section>
```

- List Instagram, TikTok, and YouTube in the scope every time, with a count of 0 and words such as
  "not covered" or "no posts" for one with no data. Add another platform the data holds.
- A page with no social data at all (a ledger, an order form) puts `data-platforms="none"` on the
  scope and says in it what the page covers instead.
- Mark a creator's caption or anything else in someone else's words with `blockquote`, `q`, or
  `data-quoted`; the plain-language check skips it.

Run the check on the HTML file before every publish. Save this script once per session to a
temporary file (`page_check.py`) and run `python3 page_check.py {page.html}`. It reads only that
file, writes nothing, and prints one JSON line per check; it exits 1 when any check fails. When
Python is not installed, check these four by reading the page and say "checked by reading" in the
page check.

<!-- page-check -->
```python
# Page standard self-check: E1, E2, E6 and E11. Reads one HTML file; writes nothing.
import json, re, sys
from html.parser import HTMLParser

NETWORKS = ("instagram", "tiktok", "youtube")
NOT_COVERED = ("not covered", "no posts", "not connected", "missing", "none")
SKIP = {"script", "style", "svg", "template", "noscript", "head"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
VERBS = "search|lookup|list|get|set|add|remove|append|start|connect|create|update|delete|unlink|switch|supersede|retract"
BANNED = [
    (r"\batlas-[a-z]+(?:-[a-z]+)*\b", "an agent name"),
    (r"(?<![@#\w])(?:%s)_[a-z_]+\b" % VERBS, "a tool name"),
    (r"\b(?:Claude|Anthropic|LLM|MCP)\b", "a system name"),
    (r"\bsub-?agents?\b", "a system word"),
    (r"\btool calls?\b", "a system word"),
    (r"\b(?:API|JSON|endpoints?|webhooks?|schema|embeddings?|runKey)\b", "a system word"),
]

class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.kids = tag, dict(attrs), parent, []

class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = self.cur = Node("#root", [], None)
    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.cur)
        self.cur.kids.append(node)
        if tag not in VOID:
            self.cur = node
    def handle_startendtag(self, tag, attrs):
        self.cur.kids.append(Node(tag, attrs, self.cur))
    def handle_endtag(self, tag):
        node = self.cur
        while node is not self.root and node.tag != tag:
            node = node.parent
        if node is not self.root:
            self.cur = node.parent
    def handle_data(self, data):
        self.cur.kids.append(data)

def walk(node):
    yield node
    for kid in node.kids:
        if isinstance(kid, Node):
            yield from walk(kid)

def text(node, quotes=True):
    if node.tag in SKIP or (not quotes and (node.tag in ("blockquote", "q") or "data-quoted" in node.attrs)):
        return ""
    parts = [kid if isinstance(kid, str) else " %s " % text(kid, quotes) for kid in node.kids]
    return re.sub(r"\s+", " ", "".join(parts)).strip()

def has(haystack, needle):
    return re.sub(r"\s+", " ", needle).strip().lower() in haystack.lower()

def inside(node, name):
    node = node.parent
    while node is not None:
        if node.attrs.get("data-page") == name:
            return True
        node = node.parent
    return False

def platforms(region):
    found = {}
    for node in walk(region):
        name = (node.attrs.get("data-platform") or "").strip().lower()
        if name:
            found.setdefault(name, []).append(node)
    return found

def e1(nodes, regions):
    scopes = regions.get("scope", [])
    if len(scopes) != 1:
        return ["the page needs exactly one data-page=\"scope\" (found %d)" % len(scopes)]
    scope, problems = scopes[0], []
    first_h2 = next((i for i, n in enumerate(nodes) if n.tag == "h2"), None)
    if first_h2 is not None and nodes.index(scope) > first_h2:
        problems.append("the scope comes after the first h2; it belongs at the top")
    shown = text(scope)
    for attr in ("data-reader", "data-brand", "data-range"):
        value = (scope.attrs.get(attr) or "").strip()
        if not value:
            problems.append("the scope has no %s" % attr)
        elif not has(shown, value):
            problems.append("the scope's %s (%s) is not in its visible text" % (attr, value))
    return problems

def counts(region, label):
    out, problems = {}, []
    for name, found in platforms(region).items():
        if len(found) > 1:
            problems.append("%s lists %s more than once" % (label, name))
        raw = (found[0].attrs.get("data-posts") or "").replace(",", "").strip()
        if not raw.isdigit():
            problems.append("%s gives %s no whole-number data-posts" % (label, name))
            continue
        posts, shown = int(raw), text(found[0])
        if posts == 0 and not any(has(shown, w) for w in NOT_COVERED):
            problems.append("%s shows %s with 0 posts but does not say it is not covered" % (label, name))
        if posts > 0 and not (str(posts) in shown.replace(",", "")):
            problems.append("%s does not show %s's post count (%d)" % (label, name, posts))
        out[name] = posts
    return out, problems

def e2(nodes, regions):
    scopes = regions.get("scope", [])
    if len(scopes) != 1:
        return ["no single scope to read platforms from"]
    scope = scopes[0]
    if (scope.attrs.get("data-platforms") or "").strip().lower() == "none":
        return [] if not platforms(scope) else ["the scope says data-platforms=\"none\" but lists platforms"]
    top, problems = counts(scope, "the scope")
    for name in NETWORKS:
        if name not in top:
            problems.append("the scope does not name %s; list it with its count, or say it is not covered" % name)
    if not any(top.values()):
        problems.append("no platform in the scope has posts; use data-platforms=\"none\" for a page with no social data")
    methods = regions.get("method", [])
    if len(methods) != 1:
        problems.append("the page needs exactly one data-page=\"method\" repeating the platform counts (found %d)" % len(methods))
    else:
        again, more = counts(methods[0], "the method section")
        problems += more
        if again != top:
            problems.append("the method section's platform counts %s differ from the scope's %s" % (again, top))
    return problems

def e6(nodes, regions):
    sections = regions.get("decisions", [])
    if len(sections) != 1:
        return ["the page needs exactly one data-page=\"decisions\" (found %d)" % len(sections)]
    section, problems = sections[0], []
    if inside(section, "next-steps"):
        problems.append("the decisions sit inside the next steps")
    if not any(n.tag in ("h2", "h3") for n in walk(section)):
        problems.append("the decisions section has no heading")
    items = [n for n in walk(section) if "data-decision" in n.attrs]
    if not items and not has(text(section), "nothing needs approval"):
        problems.append("the decisions section lists no data-decision and does not say \"Nothing needs approval\"")
    for item in items:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", (item.attrs.get("data-by") or "").strip()):
            problems.append("decision \"%s\" has no data-by deadline (YYYY-MM-DD)" % text(item)[:60])
    stray = [n for n in nodes if "data-decision" in n.attrs and not inside(n, "decisions")]
    if stray:
        problems.append("%d decision(s) sit outside the decisions section" % len(stray))
    return problems

def e11(nodes, regions):
    shown, problems = text(nodes[0], quotes=False), []
    for pattern, kind in BANNED:
        for hit in sorted(set(re.findall(pattern, shown, flags=re.I)))[:5]:
            problems.append("names %s: \"%s\"" % (kind, hit))
    return problems

def main(path):
    tree = Tree()
    with open(path, encoding="utf-8") as f:
        tree.feed(f.read())
    nodes = list(walk(tree.root))
    regions = {}
    for node in nodes:
        name = node.attrs.get("data-page")
        if name:
            regions.setdefault(name.strip().lower(), []).append(node)
    failed = False
    for code, name, check in (("E1", "Reader and scope", e1), ("E2", "Platforms covered", e2),
                              ("E6", "Decisions kept separate", e6), ("E11", "Plain language", e11)):
        problems = check(nodes, regions)
        failed = failed or bool(problems)
        print(json.dumps({"check": code, "name": name, "result": "fail" if problems else "pass", "problems": problems}))
    return 1 if failed else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
```
<!-- /page-check -->

## 6. The checks

Every check is pass or fail, never a score. "Script" means the check in section 5 decides it.
"Judgment" means you decide it against the "Passes when" column; those calls are trusted once
they match the expert reviewers' verdicts, and until then a reviewer may overrule them.

| Code | Check | Passes when | Fails when, for example | How |
| ---- | ----- | ----------- | ----------------------- | --- |
| E1 | Reader and scope | The top of the page names the reader, the brand, and the date range | "Q3 overview" with no reader named | Script |
| E2 | Platforms covered | Every platform is listed with its post count, any missing platform is named, and the method section repeats the counts | "Social" with no breakdown; TikTok missing and not mentioned | Script |
| E3 | Answer first | The headline is the conclusion and answers the question | "Creator performance overview" | Judgment |
| E4 | Numbers have context | Every number in the summary and insights is compared with something (last period, peers, a goal), each insight ends in a "So:" line, and there are no more than three | "48K views" with nothing beside it | Judgment |
| E5 | Clear next steps | Every next step says what to do, who does it, by when, and what it should change | "Consider optimizing content" | Judgment |
| E6 | Decisions kept separate | What the reader must approve sits in its own section with a deadline each, or the page says nothing needs approval | Approvals buried in the to-do list | Script |
| E7 | Real evidence | Every creator, post, and number comes from this run's Atlas data, every link works, and every storyboard timecode was checked against a 1-second frame scan | A handle or number that is not in the Atlas data | Judgment, checking each figure against what the run read |
| E8 | Shows its working | Scores and recommendations explain how they were reached, with the weights | A score with no explanation | Judgment |
| E9 | Names what is missing | Missing data is named, with what connecting it would add | Says nothing about missing ad data | Judgment |
| E10 | Fits the reader | A VP or budget owner sees the answer, decisions, and next steps on one screen, with "Prepared by" at the top and the detail below; a brand reader gets the client version | A VP brief that opens with the method | Judgment |
| E11 | Plain language | No tool, agent, or system name; none of these words outside quoted text: an agent name (`atlas-...`), an Atlas tool name, Claude, Anthropic, LLM, MCP, subagent, tool call, API, JSON, endpoint, webhook, schema, embedding, runKey | "The atlas-market-signal agent found" | Script |
| E12 | Built for this question | The page's sections and visuals come from what this question and reader need | A launch timeline on a one-creator profile copied from an example | Judgment |

- **Sample pages** (invented data) pass E7 by carrying the sample banner and source line from
  `artifact-standard.md`; every other check applies.
- **A review page** (a quality review) is checked like any other page; the work it reviews is
  not.
- The scripted checks look only at the markup in section 5. A page can pass the script and still
  fail the check in substance (a scope that names "the team" as the reader); judge that too.

## 7. The page check in the result

End the output to the main thread with the page check, after everything else the agent returns:

```
Page check: 12 of 12 pass. Fixed E3 Answer first, E5 Clear next steps.
```

```page-check
{"page": "{link}", "question": "{question code, or none}", "reader": "{primary reader}",
 "channels": {"instagram": 412, "tiktok": 96, "youtube": 0},
 "checks": {"E1": "pass", "E2": "pass", "E3": "fixed", "E4": "pass", "E5": "fixed", "E6": "pass",
            "E7": "pass", "E8": "pass", "E9": "pass", "E10": "pass", "E11": "pass", "E12": "pass"},
 "stillFailing": [], "scripted": "ran"}
```

- `checks`: `pass` (passed the first time), `fixed` (failed, fixed before publishing), or `fail`
  (still failing at publish). Never publish with a scripted check at `fail` unless the main thread
  said to publish anyway; say why in `stillFailing`.
- `stillFailing`: one entry per `fail`, as "E9 Names what is missing: {why it could not be fixed}".
- `scripted`: `ran`, or `read` when Python was not available and E1, E2, E6, and E11 were judged
  by reading the page.
- One page check per page published. A run that publishes no page returns none.

The main thread relays the one line in its close-out, one line per page: the question, the link,
and the checks fixed or still failing by name.
