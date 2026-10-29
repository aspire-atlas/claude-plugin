---
name: page-standard
description: >
  Shared skill for Aspire Atlas agents: the skeleton every published page follows (who it is
  for and what it covers, the answer first, up to three insights, ranked next steps, decisions
  kept apart, real evidence, how it was worked out, what is missing, what Atlas can draft next),
  the reader and evidence rules, and the self-check against the reader standard (R1 to R12)
  every page passes before it is published. Agents load it before they build a page. It is not
  a command.
user-invocable: false
metadata:
  author: Aspire
---

# Page standard: the skeleton and the self-check

Every page an Atlas agent publishes holds the nine parts below and passes checks R1 to R12
before it goes out. The checks are defined once, in
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/reader-standard.md`; the quality review runs the
same ones on a finished page. Read that file with this one. The Skills x Artifacts Map calls the
checks E1 to E12 (R1 is E1). The parts are fixed. The look is not: a creator profile, a competitor brief,
and a rights log should still look different. Decide what this question and this reader need
first, then fit the nine parts to it.

This skill sets what a page says. `skills/aspire/references/artifact-standard.md` sets the
mark and the source line, `skills/aspire/references/recipient-lens.md` sets the reader, and
`skills/aspire/references/theme.md` sets the colors and type. A flow's own reference sets what
its page holds; this skill is the bar that content clears.

## 1. The skeleton (every page)

| # | Part | What it holds | Check |
| - | ---- | ------------- | ----- |
| 1 | Who it is for and what it covers | The reader, the brand, the date range, and each platform with its post count. On a team page, a platform with no data is named as not covered. The method section repeats the platform counts. | R1, R2 |
| 2 | Lead with the answer | The headline is the conclusion, written last, from the decision. Never a topic title ("Creator performance overview" fails; "49 creators reviewed. Contact 11 this week." passes). | R3 |
| 3 | Up to three insights | Each is a claim, the evidence, the comparison (last period, peers, a goal, the account's own baseline), then a "So:" line with the action. Hedges go in the "So:" line, never in the claim. The headline insight gets one chart. | R4 |
| 4 | Ranked next steps | Each says what to do, who does it, by when, and what it should change. | R5 |
| 5 | Decisions kept apart | What the reader must approve, each with a deadline, in its own section. When nothing does, the section says "Nothing needs approval." | R6 |
| 6 | Real evidence | Real posts and creators from this run, linked, with thumbnails or timestamps, below the argument. | R7 |
| 7 | How it was worked out | The scoring weights and the reasoning behind every score and recommendation, and the platform counts again. | R8, R2 |
| 8 | What is missing | Team pages only. Missing data and what connecting it would add ("Paid results need a connected Meta ad account"). | R9 |
| 9 | What Atlas can draft next | The drafts Atlas can make next, for example outreach to the 11, offers, discount codes. Nothing is sent without approval. | |

Every part is on every page. When a part has nothing for this page, it says so in one line
("Nothing needs approval", "No insights this run: 3 posts is too few to compare"); it is never
left out. A working page (an order form, a ledger, a tracker) keeps the parts short and puts its
working table where the evidence goes.

**Pages shared outside the team are the exception.** A page that carries the shared audience line
(`artifact-standard.md`, section 2: a client, a creator, or the public) says nothing about what
Atlas could not read. Leave part 8 out, list only the platforms the page has data for, and name no
platform as not covered. Give those gaps to the main thread in your result instead. R9 is N/A on
such a page.

**A flow's fixed format wins on layout.** Where a flow's reference fixes a format (the PPA deck's
slide order, the CAS campaign page's tabs and client view, the order form), keep that format and
place each part where it fits. A part with no place is marked `fail` in the page check with the
reason "fixed format"; that does not hold the publish.

Two more checks cover the whole page:

- **Plain language (R11).** No tool, agent, or system names and none of the words
  `reader-standard.md` lists for R11.
  Say what was done ("Atlas compared 412 Instagram posts"), never who or what did it.
- **Built for this question (R12).** The sections and visuals come from what this question and
  this reader need. A launch timeline on a one-creator profile fails.

## 2. Reader rules

- **A VP or budget owner reads it** (the primary `recipient` is `leadership`, or the main thread
  passed a `questionCode` the Skills x Artifacts Map marks as VP-read: I6, P4, P5, O3, O4, or A1):
  split the page. The answer, the decisions, and the next steps sit on the first screen. The
  method, all the evidence, and the options left out go below, so the person who prepared it can
  back it up if asked. "Prepared by {preparedBy}" sits at the top, with the `preparedBy` the main
  thread passed, or "{organization} team" when it passed none; the person who sends it can edit
  the line. A VP page that opens with the method fails R10. The map's codes come only from
  `questionCode`; they are not the numbered questions inside a flow (outreach's O3 is a send step).
- **A client reads it** (an agency or Aspire team prepared it for the brand as its client: the
  shared-page audiences in `artifact-standard.md` section 2): build the client version. No
  revision history, no "was 5, now 12", no named rejects, and the brand's own colors and type from
  `theme.md`. When the main thread did not say which version, return the question "Build a client
  version for {brand}?" with the result. The `brand` lens in `recipient-lens.md` (the brand's own
  safety and approval team) is not a client reader. A flow that sets its own client view (the CAS
  campaign page) keeps it.
- **Any other reader:** the "Prepared for" chip from `recipient-lens.md` and the order the lens
  sets.

## 3. Evidence standards that never vary by layout

- **Ad cut-downs** (map question P1). A storyboard per ad: a real still for every beat, timecodes, a one-line
  description, a duration strip, and edit notes, on the fixed five-beat structure: hook 0 to 3s,
  brand 3 to 6s, build 6 to 9s, reveal 9 to 12s, end card +2s. Treat timecodes from speech or
  frame sheets as drafts: check every one against a 1-second frame scan before publishing, and
  re-cut a beat that moves.
- **Any page that recommends paid spend.** A test plan: one variable per test, a hypothesis, and
  the Scale, Fix, or Stop rule for each.
- **Creator slates** (map question I1). Yes, Maybe, or No with a reason for every creator, the fee and the
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
3. **Self-check R1 to R12.** Run the script in section 5 for R1, R2, R6, and R11, and judge the
   others against `reader-standard.md`, with the notes in section 6. Fix every fail and check
   again.
4. **Publish**, then report the result in the page check (section 7): which checks were fixed
   and which still fail, by name.

Write the headline last. Draft every other part, then write the headline from the decision the
page supports.

## 5. Markup and the scripted checks (R1, R2, R6, R11)

Mark the parts the script reads. The attributes carry no styling; style the page as the flow and
`theme.md` say.

```html
<!-- Part 1, before the first h2. data-range is the range as the page shows it. -->
<div data-page="scope" data-reader="the influencer manager" data-brand="Brightside Toys"
     data-range="Aug 1 to Oct 28, 2026">
  For the influencer manager | Brightside Toys | Aug 1 to Oct 28, 2026 |
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

- On a team page, list Instagram, TikTok, and YouTube in the scope every time, with a count of 0
  and words such as "not covered" or "no posts" for one with no data. On a page with the shared
  audience line, list only the platforms with posts. Add another platform the data holds. Show the
  exact count ("1,412 posts"), never a rounded one ("1.4K").
- The script tells the two apart by the source line: a page whose `atlas-footnote` says "Shared
  with" is shared outside the team.
- A decisions section with no decision says "Nothing needs approval" (or "No decision needs
  approval").
- A page with no social data at all (a ledger, an order form) puts `data-platforms="none"` on the
  scope and says in it what the page covers instead.
- Mark a creator's caption, name, or anything else in someone else's words with `blockquote`,
  `q`, or `data-quoted`; the plain-language check skips it, and it skips handles, hashtags, and
  links. Never change a creator's real name or handle to pass a check.

Run the check on the HTML file before every publish. Save this script once per session to a
temporary file (`page_check.py`) and run `python3 page_check.py {page.html}` on the page file you
are about to publish. It reads only that
file, writes nothing, and prints one JSON line per check; it exits 1 when any check fails. When
Python is not installed, check these four by reading the page and say "checked by reading" in the
page check.

<!-- page-check -->
```python
# Page standard self-check: R1, R2, R6 and R11 from reader-standard.md. Reads one HTML file; writes nothing.
import json, re, sys
from html.parser import HTMLParser

NETWORKS = ("instagram", "tiktok", "youtube")
NOT_COVERED = ("not covered", "no posts", "not connected", "missing", "none")
SKIP = {"script", "style", "svg", "template", "noscript"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
INLINE = {"a", "abbr", "b", "bdi", "cite", "code", "data", "em", "i", "kbd", "mark", "q", "s", "small",
          "span", "strong", "sub", "sup", "time", "u", "var"}
# Start tag -> open tags it closes, as browsers do for omitted end tags.
CLOSES = {"p": {"p"}, "li": {"li", "p"}, "dt": {"dt", "dd", "p"}, "dd": {"dt", "dd", "p"},
          "tr": {"tr", "td", "th", "p"}, "td": {"td", "th", "p"}, "th": {"td", "th", "p"},
          "option": {"option"}, "body": {"head"}}
BLOCK = {"address", "article", "aside", "blockquote", "details", "div", "dl", "fieldset", "figure",
         "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "main", "nav", "ol",
         "p", "pre", "section", "table", "ul"}
# Atlas tool names, kept equal to contract/atlas-mcp-tools.json by scripts/check-artifact-standard.sh.
TOOLS = frozenset("""
add_hashtags append_calibration append_insights cancel_invitation connect_channel create_organization
create_profile delete_organization delete_profile get_brand_instruction get_job_status get_more_tools
get_profile get_status invite_member leave_organization list_ad_accounts list_ad_search_fields
list_available_hashtags list_channels list_creator_marketplace_labels list_creator_search_fields
list_hashtag_posts list_hashtags list_insight_search_fields list_invitations list_members
list_my_organizations list_my_profiles list_post_search_fields lookup_creators lookup_posts
remove_hashtags remove_member retract_calibration search_ads search_calibrations
search_creator_marketplace search_creators search_insights search_partnership_content search_posts
set_brand_instruction start_business_discovery supersede_calibration switch_billing_account
unlink_channel update_member_role update_organization update_profile
""".split())
# Case-sensitive on purpose: "Atlas-indexed" and "embedding a link" are plain words.
BANNED = [
    (r"\batlas-[a-z]+(?:-[a-z]+)*\b", "an agent name"),
    (r"\b(?:Claude|Anthropic|LLM|MCP|API|JSON|runKey)\b", "a system name"),
    (r"\b[Ss]ub-?agents?\b|\b[Tt]ool calls?\b|\b[Ww]ebhooks?\b|\b[Ee]ndpoints?\b|\b[Ss]chemas?\b", "a system word"),
]
NOTHING = re.compile(r"\b(?:nothing|no decisions?) needs? (?:your )?approval\b", re.I)

class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.kids = tag, dict(attrs), parent, []

class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = self.cur = Node("#root", [], None)
    def handle_starttag(self, tag, attrs):
        while self.cur is not self.root and (self.cur.tag in CLOSES.get(tag, ()) or
                                              (tag in BLOCK and self.cur.tag == "p")):
            self.cur = self.cur.parent
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
    stack = [node]
    while stack:
        node = stack.pop()
        yield node
        stack.extend(reversed([k for k in node.kids if isinstance(k, Node)]))

def quoted(node):
    return node.tag in ("blockquote", "q") or "data-quoted" in node.attrs

def text(node, quotes=True):
    out, stack = [], [node]
    while stack:
        item = stack.pop()
        if isinstance(item, str):
            out.append(item)
        elif item.tag not in SKIP and (quotes or not quoted(item)):
            pad = "" if item.tag in INLINE else " "
            stack.append(pad)
            stack.extend(reversed(item.kids))
            stack.append(pad)
    return re.sub(r"\s+", " ", "".join(out)).strip()

def has(haystack, needle):
    return re.sub(r"\s+", " ", needle).strip().lower() in haystack.lower()

def page_name(node):
    return (node.attrs.get("data-page") or "").strip().lower()

def inside(node, name):
    node = node.parent
    while node is not None:
        if page_name(node) == name:
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

def r1(nodes, regions):
    scopes = regions.get("scope", [])
    if len(scopes) != 1:
        return ["the page needs exactly one data-page=\"scope\" (found %d)" % len(scopes)]
    scope, problems = scopes[0], []
    order = {id(n): i for i, n in enumerate(nodes)}
    first_h2 = next((i for i, n in enumerate(nodes) if n.tag == "h2"), None)
    if first_h2 is not None and order[id(scope)] > first_h2:
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
        numbers = {int(n.replace(",", "")) for n in re.findall(r"(?<![\d.,])\d[\d,]*(?![\d.])", shown)}
        if posts == 0 and not any(has(shown, w) for w in NOT_COVERED):
            problems.append("%s shows %s with 0 posts but does not say it is not covered" % (label, name))
        if posts > 0 and posts not in numbers:
            problems.append("%s does not show %s's exact post count (%d)" % (label, name, posts))
        out[name] = posts
    return out, problems

def shared(nodes):
    # The shared audience line from artifact-standard.md marks a page seen outside the team.
    return any("atlas-footnote" in (n.attrs.get("class") or "").split() and has(text(n), "shared with")
               for n in nodes)

def r2(nodes, regions):
    scopes = regions.get("scope", [])
    if len(scopes) != 1:
        return ["no single scope to read platforms from"]
    scope = scopes[0]
    if (scope.attrs.get("data-platforms") or "").strip().lower() == "none":
        return [] if not platforms(scope) else ["the scope says data-platforms=\"none\" but lists platforms"]
    top, problems = counts(scope, "the scope")
    if shared(nodes):
        for name, posts in sorted(top.items()):
            if posts == 0:
                problems.append("the page is shared outside the team but names %s as not covered; leave it out" % name)
    else:
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

def r6(nodes, regions):
    sections = regions.get("decisions", [])
    if len(sections) != 1:
        return ["the page needs exactly one data-page=\"decisions\" (found %d)" % len(sections)]
    section, problems = sections[0], []
    if inside(section, "next-steps"):
        problems.append("the decisions sit inside the next steps")
    if not any(n.tag in ("h2", "h3") for n in walk(section)):
        problems.append("the decisions section has no heading")
    items = [n for n in walk(section) if "data-decision" in n.attrs]
    if not items and not NOTHING.search(text(section)):
        problems.append("the decisions section lists no data-decision and does not say \"Nothing needs approval\"")
    for item in items:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", (item.attrs.get("data-by") or "").strip()):
            problems.append("decision \"%s\" has no data-by deadline (YYYY-MM-DD)" % text(item)[:60])
    stray = [n for n in nodes if "data-decision" in n.attrs and not inside(n, "decisions")]
    if stray:
        problems.append("%d decision(s) sit outside the decisions section" % len(stray))
    return problems

def r11(nodes, regions):
    shown = re.sub(r"https?://\S+|[@#][\w.]+", " ", text(nodes[0], quotes=False))
    problems = ["names a tool name: \"%s\"" % t for t in
                sorted(set(re.findall(r"\b[a-z]+(?:_[a-z]+)+\b", shown)) & TOOLS)[:5]]
    for pattern, kind in BANNED:
        for hit in sorted(set(re.findall(pattern, shown)))[:5]:
            problems.append("names %s: \"%s\"" % (kind, hit))
    return problems

def main(path):
    tree = Tree()
    with open(path, encoding="utf-8") as f:
        tree.feed(f.read())
    tree.close()
    nodes = list(walk(tree.root))
    regions = {}
    for node in nodes:
        if page_name(node):
            regions.setdefault(page_name(node), []).append(node)
    failed = False
    for code, name, check in (("R1", "Reader and scope", r1), ("R2", "Platforms covered", r2),
                              ("R6", "Decisions kept separate", r6), ("R11", "Plain language", r11)):
        problems = check(nodes, regions)
        failed = failed or bool(problems)
        print(json.dumps({"check": code, "name": name, "result": "fail" if problems else "pass", "problems": problems}))
    return 1 if failed else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
```
<!-- /page-check -->

## 6. The checks

What each check asks, when it passes, and how a defect is judged are in
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/reader-standard.md`. Never restate them here or in a
flow. Every check is pass or fail, never a score. Four are decided by the script in section 5; you
judge the rest against that file, and those calls are trusted once they match the expert reviewers'
verdicts. Until then a reviewer may overrule them.

| Check | How |
| ----- | --- |
| R1 Reader and scope, R2 Platforms covered, R6 Decisions kept separate, R11 Plain language | Script |
| R3, R4, R5, R8, R10, R12 | Judgment |
| R7 Real evidence | Judgment, checking each figure against what the run read |
| R9 Names what's missing | Judgment on a team page; N/A on a page shared outside the team |

When the reader standard changes, this table and the script change in the same commit.

- **Sample pages** (invented data) pass R7 by carrying the sample banner and source line from
  `artifact-standard.md`; every other check applies.
- **A review page** (a quality review) is checked like any other page; the work it reviews is
  not.
- The scripted checks look only at the markup in section 5. A page can pass the script and still
  fail the check in substance (a scope that names "the team" as the reader); judge that too.

## 7. The page check in the result

Put the page check at the end of the output to the main thread, just before the audit trail
block, which stays last. The audit block's `outputs` line carries the one-line page check as its
checks result.

```
Page check: 12 of 12 pass. Fixed R3 Answer first, R5 Clear next steps.
```

```page-check
{"page": "{link}", "question": "{question code, or none}", "reader": "{primary reader}",
 "channels": {"instagram": 412, "tiktok": 96, "youtube": 0},
 "checks": {"R1": "pass", "R2": "pass", "R3": "fixed", "R4": "pass", "R5": "fixed", "R6": "pass",
            "R7": "pass", "R8": "pass", "R9": "pass", "R10": "pass", "R11": "pass", "R12": "pass"},
 "stillFailing": [], "scripted": "ran"}
```

- `checks`: `pass` (passed the first time), `fixed` (failed, fixed before publishing), `fail`
  (still failing at publish), or `n/a` (the reader standard marks it N/A for this page, such as
  R9 on a page shared outside the team). Never publish with a scripted check at `fail` unless its reason is
  "fixed format" or the main thread said to publish anyway; say why in `stillFailing`.
- `stillFailing`: one entry per `fail`, as "R9 Names what is missing: {why it could not be fixed}".
- `scripted`: `ran`, or `read` when Python was not available and R1, R2, R6, and R11 were judged
  by reading the page.
- `question`: the `questionCode` the main thread passed, or `none`.
- One page check per page published. A run that publishes no page returns none.

The main thread relays the one line in its close-out, one line per page: the question, the link,
and the checks fixed or still failing by name.
