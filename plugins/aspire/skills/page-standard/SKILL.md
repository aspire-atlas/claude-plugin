---
name: page-standard
description: >
  Shared skill for Aspire Atlas agents: the skeleton every published page follows (who it is
  for and what it covers, the answer first, up to three insights, ranked next steps, decisions
  kept apart, real evidence, how it was worked out, what is missing, what Atlas can draft next),
  the reader and evidence rules, and the self-check against the reader standard (R1 to R12)
  every page runs before it is published. Agents load it before they build a page. It is not
  a command.
user-invocable: false
metadata:
  author: Aspire
---

# Page standard: the skeleton and the self-check

Every page an Atlas agent publishes holds the nine parts below and is checked against R1 to R12
before it goes out. The checks are defined once, in
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/reader-standard.md`; the quality review runs the
same ones on a finished page. Read that file with this one. The parts are fixed. The look is not:
a creator profile, a competitor brief, and a rights log should still look different. Decide what
this question and this reader need first, then fit the nine parts to it.

This skill sets what a page says. `skills/aspire/references/artifact-standard.md` sets the mark
and the source line, `skills/aspire/references/recipient-lens.md` sets the reader, and
`skills/aspire/references/theme.md` sets the colors and type, `blocks.md` in this folder holds
the parts each page is built from, with their markup, and `examples.md` lists the evidence each
approved example sets, by question code. **The flow's own reference wins**
wherever it sets a rule: its layout, what its page leaves out, who sees money, and the form its
evidence takes. This skill fills in what the reference leaves open.

## 1. The skeleton

| # | Part | What it holds | Check |
| - | ---- | ------------- | ----- |
| 1 | Who it is for and what it covers | The reader, the brand, the date range, and each platform with its post count. On a team page, a platform with no data is named as not covered. The method section repeats the platform counts. | R1, R2 |
| 2 | Lead with the answer | The headline is the conclusion, written last, from the decision. Never a topic title ("Creator performance overview" fails; "49 creators reviewed. Contact 11 this week." passes). | R3 |
| 3 | Up to three insights | Each is a claim, the evidence, the comparison (last period, peers, a goal, the account's own baseline), then a "So:" line with the action. Hedges go in the "So:" line, never in the claim. The headline insight gets one chart. | R4 |
| 4 | Ranked next steps | Each says what to do, who does it, by when, and what it should change. | R5 |
| 5 | Decisions kept apart | What the reader must approve, in its own section, each with its deadline when it has one. When nothing does, the section says "Nothing needs approval." | R6 |
| 6 | Real evidence | Real posts and creators from this run, linked, with thumbnails or timestamps, below the argument. | R7 |
| 7 | How it was worked out | The scoring weights and the reasoning behind every score and recommendation, and the platform counts again. | R8, R2 |
| 8 | What is missing | Team pages only. Missing data and what connecting it would add ("Paid results need a connected Meta ad account"). | R9 |
| 9 | What Atlas can draft next | The drafts Atlas can make next, for example outreach to the 11, offers, discount codes. Nothing is sent without approval. | Judged (`draftNext`) |

A part that applies but has nothing to show says so in one line ("Nothing needs approval", "No
insights this run: 3 posts is too few to compare"). A part does not apply, and is reported `n/a`
with its reason, when:

- **The reader standard or the quality review marks its check N/A for this kind of page**
  (`reader-standard.md`; `quality-review.md`, section 3). For example: R2 on a page about one
  post, one creator, or one account on one network, or with no social data at all; R3 and R4's
  three-insight cap on a tracker with no single question.
- **The page is shared outside the team.** A page that carries the shared audience line
  (`artifact-standard.md`, section 2: a client, a creator, or the public) says nothing about what
  Atlas could not read. Leave part 8 out, list only the platforms the page has data for, and name
  no platform as not covered. Put those gaps in the page check's `gaps` for the main thread to
  tell the requester.
- **The flow's reference fixes the layout or leaves the section out.** The PPA deck's slide order,
  the org dashboard's header, the order form, and the creator profile's rule against empty
  sections all stand. Place a part where the reference allows; where it has no place, the part is
  `n/a` with the reason "the {flow} layout".

**Money stays where the flow keeps it.** A flow that keeps amounts out of the page's own HTML (the
program ledger, the program dashboard, negotiation) keeps them there. The headline and insights
state the point without the figure, or point to the team view.

Two checks cover the whole page:

- **Plain language (R11).** No tool, agent, or system names, and none of the words
  `reader-standard.md` lists for R11. Say what was done ("Atlas compared 412 Instagram posts"),
  never who or what did it.
- **Built for this question (R12).** The sections and visuals come from what this question and
  this reader need. A launch timeline on a one-creator profile fails.

## 2. Reader rules

- **A VP or budget owner reads it** (the primary `recipient` is `leadership`, or the page is
  addressed to a VP or budget owner): split the page. The answer, the decisions, and the next
  steps sit on the first screen. The method, all the evidence, and the options left out go below,
  so the person who prepared it can back it up if asked. "Prepared by {preparedBy}" sits at the
  top, with the `preparedBy` the main thread passed, or "{organization} team" when it passed none;
  the person who sends it on can edit the line. A VP page that opens with the method fails R10.
- **A client reads it** (the page carries the shared audience line and its audience is the brand
  as a client of the team that prepared it): build the client version. No revision history, no
  "was 5, now 12", no named rejects, and the brand's own colors and type from `theme.md`. The
  `brand` lens in `recipient-lens.md` (the brand's own safety and approval team) is not a client
  reader. A flow that sets its own client view (the CAS campaign page) keeps it.
- **Any other reader:** the "Prepared for" chip from `recipient-lens.md` and the order the lens
  sets.

## 3. Evidence standards

Where the flow's reference sets the form of its evidence (ad reuse's cut lengths and timing,
creator vetting's verdicts and check order), follow the reference. Otherwise:

- **Ad cut-downs.** A storyboard per ad: a real still for every beat, timecodes, a one-line
  description, a duration strip, and edit notes. When the flow sets no cut length, use five beats:
  hook 0 to 3s, brand 3 to 6s, build 6 to 9s, reveal 9 to 12s, end card +2s. Every timecode the
  page shows is a draft until a 1-second frame scan confirms it (`quality-review.md`, 4.15).
- **Any page that recommends paid spend.** A test plan: one variable per test, a hypothesis, and
  the Scale, Fix, or Stop rule for each.
- **Creator slates.** A reason for every verdict, and which checks each creator reached. A fee
  only when the fee calculator gives one, and an expected return only when the run worked one
  out. Each Maybe carries the one question that would settle it. Screen in the order the user
  ranked the brief's criteria. When the ask comes up short, say so ("3 of the 20 asked for") and
  never pad the list.

## 4. Build loop

1. **List the evidence the approved example sets** for the launch block's `question`, from
   `${CLAUDE_PLUGIN_ROOT}/skills/page-standard/examples.md` (storyboards, test plan, cards with
   thumbnails), when this flow is the one that file's row names as building the page. A flow that
   only feeds another (discovery feeding vetting for I1) skips this step. Read every example the launch block's `examples` lists and list the
   evidence, per `examples.md` steps 1 and 2. Match the evidence, never copy the sections or the
   layout. A code with no example, or a launch with no `question`, skips this
   step.
2. **Draft the page** for this question and this reader, from the blocks in
   `${CLAUDE_PLUGIN_ROOT}/skills/page-standard/blocks.md`. They already carry the markup in
   section 5. The blocks set what each part holds and the order of its evidence; the flow's
   reference and this reader set the layout. Add the print block with the page's title as
   `${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/artifact-standard.md`, section 6, sets, so the page saves to PDF
   in the light theme with a footer on every page.
3. **Self-check R1 to R12.** Run the script in section 5 for R1, R2, R6, and R11, and judge the
   others against `reader-standard.md`. Fix every fail you can and check again.
4. **Publish**, even when a check still fails, and report it in the page check (section 7).

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

<!-- Part 5: one item per decision; data-by only when the decision has a deadline. -->
<section data-page="decisions">
  <h2>Decisions for you</h2>
  <p data-decision data-by="2026-11-04">Approve the 11 creators by Nov 4</p>
</section>
<!-- ...or: <section data-page="decisions"><h2>Decisions</h2><p>Nothing needs approval.</p></section> -->

<!-- Part 4, never inside the decisions section and never around it. -->
<section data-page="next-steps">...</section>

<!-- Part 7 repeats every data-platform element from the scope, with the same counts. -->
<section data-page="method">...</section>
```

- On a team page, list Instagram, TikTok, and YouTube in the scope every time, with a count of 0
  and words such as "not covered" or "no posts" for one with no data. A day with no posts at all is
  still a team page with three zeros. On a page with the shared audience line, list only the
  platforms with posts; the script knows the page is shared when its `atlas-footnote` says "Shared
  with". Show the exact count ("1,412 posts"), never a rounded one ("1.4K").
- A check that is N/A for this page (section 1) goes in `data-na` on the scope, for example
  `data-na="R2"` on a ledger or a one-creator profile; the script reports it `n/a`. Only R2 and R6
  can be N/A; R1 and R11 apply to every page, and naming them fails the check.
- A decisions section with no decision says "Nothing needs approval" (or "No decision needs
  approval"). A `data-by` date is a real date the page also shows.
- Mark anything in someone else's words with `blockquote`, `q`, or `data-quoted`: a creator's
  caption or name, and on a review page, the words of the work under review. The plain-language
  check skips it, and it skips handles, hashtags, emails, and links. Never change a creator's real
  name or handle to pass a check.
- A page that draws its sections in script from embedded data (the org dashboard) has nothing the
  script can read. Judge R1, R2, R6, and R11 from the data and what the page draws, and report
  `scripted` as `read`.
- A page with no `data-page` markup yet (a flow whose reference does not add it) gets `unmarked`
  for R1, R2, and R6. Judge those three by reading; R11 still runs.

Run the check on every page before you publish it. Copy the page into a new temporary folder,
extract the script there from this file (never retype it), and run it:

```bash
d=$(mktemp -d) && cp {page.html} "$d/" && awk '/^<!-- page-check -->$/{f=1;next} /^<!-- \/page-check -->$/{f=0} f' "${CLAUDE_PLUGIN_ROOT}/skills/page-standard/SKILL.md" | sed '1d;$d' > "$d/page_check.py" && python3 -I "$d/page_check.py" "$d/{page file name}"
```

It reads only the pages named, writes nothing, and prints one JSON line per check and page:
`pass`, `fail`, `n/a`, or `unmarked`. It exits 0 when nothing failed, 1 when a check failed, and 2
when it could not read a page. When Python is not installed, judge the four by reading and report
`scripted` as `read`.

<!-- page-check -->
```python
# Page standard self-check: R1, R2, R6 and R11 from reader-standard.md. Reads the HTML files named; writes nothing.
import datetime, json, re, sys
from html.parser import HTMLParser

NETWORKS = ("instagram", "tiktok", "youtube")
NOT_COVERED = ("not covered", "no posts", "not connected", "missing", "none")
SKIP = {"script", "style", "template", "noscript"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
INLINE = {"a", "abbr", "b", "bdi", "cite", "code", "data", "em", "i", "kbd", "mark", "q", "s", "small",
          "span", "strong", "sub", "sup", "time", "u", "var"}
BLOCK = {"address", "article", "aside", "blockquote", "details", "div", "dl", "fieldset", "figure",
         "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "li", "main", "nav", "ol",
         "p", "pre", "section", "table", "ul", "dt", "dd"}
# An open p closes at the next block, unless one of these sits between them (as browsers do).
P_STOPS = {"button", "table", "td", "th", "caption", "template", "object", "svg"}
# Start tag -> (open tags it closes, tags that stop the search), for omitted end tags.
CLOSES = {"li": ({"li"}, {"ul", "ol"}), "dt": ({"dt", "dd"}, {"dl"}), "dd": ({"dt", "dd"}, {"dl"}),
          "tr": ({"tr"}, {"table", "tbody", "thead", "tfoot"}), "td": ({"td", "th"}, {"tr", "table"}),
          "th": ({"td", "th"}, {"tr", "table"}), "option": ({"option"}, {"select"})}
ATTRS = ("alt", "title", "aria-label", "placeholder", "value")
# Atlas tool names, kept equal to contract/atlas-mcp-tools.json by scripts/check-artifact-standard.sh.
TOOLS = frozenset("""
add_hashtags append_calibration append_insights cancel_invitation connect_channel create_organization
create_profile delete_organization delete_profile get_brand_instruction get_job_status get_more_tools
get_profile get_status invite_member leave_organization list_ad_accounts list_ad_search_fields
list_available_hashtags list_channels list_creator_marketplace_labels list_creator_search_fields
list_hashtag_posts list_hashtags list_insight_search_fields list_invitations list_members
list_my_organizations list_my_profiles list_post_search_fields lookup_creators lookup_posts
remove_hashtags remove_member report_checkpoint retract_calibration search_ads search_calibrations
search_creator_marketplace search_creators search_insights search_partnership_content search_posts
set_brand_instruction start_business_discovery supersede_calibration switch_billing_account
unlink_channel update_member_role update_organization update_profile
""".split())
EDGE = r"(?<![A-Za-z0-9])%s(?![A-Za-z0-9])"
# Names match by case so "Atlas-indexed" and "an api of ideas" stay plain words; the rest match any case.
BANNED = [
    (re.compile(EDGE % r"atlas-[a-z]+(?:-[a-z]+)*"), "an agent name"),
    (re.compile(EDGE % r"(?:Claude|Anthropic|LLMs?|MCPs?|APIs?|JSON|runKey)"), "a system name"),
    (re.compile(EDGE % r"(?:sub-?agents?|tool calls?|webhooks?|endpoints?|schemas?)", re.I), "a system word"),
]
NOTHING = re.compile(r"\b(?:nothing|no decisions?) needs? (?:your )?approval\b", re.I)

class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.kids = tag, dict(attrs), parent, []

class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = self.cur = Node("#root", [], None)
    def close_open(self, names, stops):
        node = self.cur
        while node is not self.root and node.tag not in stops:
            if node.tag in names:
                self.cur = node.parent
                return
            node = node.parent
    def foreign(self):
        node = self.cur
        while node is not self.root:
            if node.tag in ("svg", "math"):
                return True
            node = node.parent
        return False
    def handle_starttag(self, tag, attrs):
        if not self.foreign():
            if tag in BLOCK:
                self.close_open({"p"}, P_STOPS)
            if tag in CLOSES:
                self.close_open(*CLOSES[tag])
        node = Node(tag, attrs, self.cur)
        self.cur.kids.append(node)
        if tag not in VOID:
            self.cur = node
    def handle_startendtag(self, tag, attrs):
        # HTML ignores "/>" on a non-void element and leaves it open; SVG and MathML honor it.
        if self.foreign():
            self.cur.kids.append(Node(tag, attrs, self.cur))
        else:
            self.handle_starttag(tag, attrs)
    def handle_endtag(self, tag):
        node = self.cur
        while node is not self.root and node.tag != tag:
            node = node.parent
        if node is not self.root:
            self.cur = node.parent
    def handle_data(self, data):
        self.cur.kids.append(data)

def walk(node, keep=lambda n: True):
    stack = [node]
    while stack:
        node = stack.pop()
        if not keep(node):
            continue
        yield node
        stack.extend(reversed([k for k in node.kids if isinstance(k, Node)]))

def quoted(node):
    return node.tag in ("blockquote", "q") or "data-quoted" in node.attrs

def exempt(node):
    # Skipped by R11: someone else's words, the Aspire Atlas mark, and the source line.
    return (quoted(node) or node.attrs.get("aria-label") == "Aspire Atlas"
            or "atlas-footnote" in (node.attrs.get("class") or "").split())

def text(node, gap="", skip=lambda n: False):
    out, stack = [], [node]
    while stack:
        item = stack.pop()
        if isinstance(item, str):
            out.append(item)
        elif item.tag not in SKIP and not skip(item):
            pad = gap if item.tag in INLINE else " "
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

def numbers(shown):
    # Whole numbers as written ("1,412", "96"); a decimal or a K/M suffix is a rounded count.
    found = set()
    for m in re.finditer(r"(?<![\w.,])(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?\s*([KkMm](?![A-Za-z]))?", shown):
        if not (m.group(2) or m.group(3)):
            found.add(int(m.group(1).replace(",", "")))
    return found

def r1(nodes, regions):
    scopes = regions.get("scope", [])
    if len(scopes) != 1:
        return ["the page needs exactly one data-page=\"scope\" (found %d)" % len(scopes)]
    scope, problems = scopes[0], []
    first_h2 = next((n for n in nodes if n.tag == "h2"), None)
    if first_h2 is not None and nodes.index(scope) > nodes.index(first_h2):
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
        if not (raw.isascii() and raw.isdigit()):
            problems.append("%s gives %s no whole-number data-posts" % (label, name))
            out[name] = None
            continue
        posts, shown = int(raw), text(found[0], gap=" ")
        if posts == 0 and not any(has(shown, w) for w in NOT_COVERED):
            problems.append("%s shows %s with 0 posts but does not say it is not covered" % (label, name))
        if posts > 0 and posts not in numbers(shown):
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
    top, problems = counts(scopes[0], "the scope")
    if shared(nodes):
        if not any(top.values()):
            problems.append("the page is shared outside the team but lists no platform with posts; list the ones it covers")
        for name, posts in sorted(top.items()):
            if posts == 0:
                problems.append("the page is shared outside the team but names %s as not covered; leave it out" % name)
    else:
        for name in NETWORKS:
            if name not in top:
                problems.append("the scope does not name %s; list it with its count, or say it is not covered" % name)
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
    if inside(section, "next-steps") or any(page_name(n) == "next-steps" for n in walk(section)):
        problems.append("the decisions and the next steps are nested; keep them in separate sections")
    if not any(n.tag in ("h2", "h3") for n in walk(section)):
        problems.append("the decisions section has no heading")
    items = [n for n in walk(section) if "data-decision" in n.attrs]
    if not items and not NOTHING.search(text(section)):
        problems.append("the decisions section lists no data-decision and does not say \"Nothing needs approval\"")
    for item in items:
        by = (item.attrs.get("data-by") or "").strip()
        if by:
            try:
                datetime.date.fromisoformat(by)
            except ValueError:
                problems.append("decision \"%s\" has data-by \"%s\", which is not a date (YYYY-MM-DD)" % (text(item)[:60], by))
    mine = {id(n) for n in items}
    stray = [n for n in nodes if "data-decision" in n.attrs and id(n) not in mine]
    if stray:
        problems.append("%d decision(s) sit outside the decisions section" % len(stray))
    return problems

def r11(nodes, regions):
    kept = list(walk(nodes[0], keep=lambda n: n.tag not in SKIP and not exempt(n)))
    shown = " ".join([text(nodes[0], gap=" ", skip=exempt)] +
                     [n.attrs[a] for n in kept for a in ATTRS if n.attrs.get(a)])
    shown = re.sub(r"https?://\S+|\S+@\S+\.\w+|(?<!\w)[@#][\w.]+", " ", shown)
    problems = []
    for token in sorted(set(re.findall(r"[A-Za-z0-9]+(?:_+[A-Za-z0-9]+)+", shown))):
        parts = token.lower().split("__")
        if parts[0] == "mcp" or token.lower() in TOOLS or any(p in TOOLS for p in parts):
            problems.append("names a tool name: \"%s\"" % token)
    for pattern, kind in BANNED:
        for hit in sorted(set(pattern.findall(shown)))[:5]:
            problems.append("names %s: \"%s\"" % (kind, hit))
    return problems

# Only these scripted checks can be N/A (reader-standard.md; quality-review.md, section 3).
CAN_BE_NA = {"R2", "R6"}
CHECKS = (("R1", "Reader and scope", r1), ("R2", "Platforms covered", r2),
          ("R6", "Decisions kept separate", r6), ("R11", "Plain language", r11))

def check(path):
    tree = Tree()
    with open(path, encoding="utf-8", errors="replace") as f:
        tree.feed(f.read())
    tree.close()
    nodes = list(walk(tree.root))
    regions = {}
    for node in nodes:
        if page_name(node):
            regions.setdefault(page_name(node), []).append(node)
    scope = (regions.get("scope") or [None])[0]
    na = set((scope.attrs.get("data-na") or "").upper().split()) if scope is not None else set()
    results = []
    for code, name, run in CHECKS:
        if code in na and code in CAN_BE_NA:
            results.append((code, name, "n/a", []))
        elif code in na:
            results.append((code, name, "fail", ["%s is never N/A; remove it from data-na" % code]))
        elif code != "R11" and not regions:
            results.append((code, name, "unmarked", ["the page has no data-page markup; judge this check by reading"]))
        else:
            problems = run(nodes, regions)
            results.append((code, name, "fail" if problems else "pass", problems))
    return results

def main(paths):
    status = 0
    for path in paths:
        try:
            results = check(path)
        except Exception as error:
            print(json.dumps({"page": path, "check": "error", "result": "error", "problems": [repr(error)]}))
            status = 2
            continue
        for code, name, result, problems in results:
            print(json.dumps({"page": path, "check": code, "name": name, "result": result, "problems": problems}))
            if result == "fail" and status == 0:
                status = 1
    return status

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: python3 -I page_check.py page.html [more.html]", file=sys.stderr)
        sys.exit(2)
    sys.exit(main(sys.argv[1:]))
```
<!-- /page-check -->

## 6. How each check is judged

What each check asks, when it passes, and how a defect is judged are in
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/reader-standard.md`. Never restate them here or in a
flow. Every check is pass, fail, or N/A, never a score.

| Check | How |
| ----- | --- |
| R1 Reader and scope, R2 Platforms covered, R6 Decisions kept separate, R11 Plain language | Script, or by reading when the page is drawn in script or carries no markup |
| R3, R4, R5, R8, R10, R12 | Judgment |
| R7 Real evidence | Judgment, checking each figure against what the run read |
| R9 Names what's missing | Judgment on a team page; N/A on a page shared outside the team |

When the reader standard changes, this table and the script change in the same commit.

- **Sample pages** follow `${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/agents/sample-artifact.md`:
  no self-check and no page check.
- **A review page** (a quality review) runs the check with the words of the work under review
  marked as quoted.
- The scripted checks look only at the markup in section 5. A page can pass the script and still
  fail the check in substance (a scope that names "the team" as the reader, an approval worded as
  a next step); judge that too.

## 7. The page check in the result

Return one `page-check` block per page published, at the end of your output, just before the
audit trail block, which stays last. The audit block's `outputs` line names the same result in
words ("page check: 9 pass, 2 fixed, 1 n/a").

```page-check
{"page": "{link}", "reader": "{primary reader}",
 "checks": {"R1": "pass", "R2": "pass", "R3": "fixed", "R4": "pass", "R5": "fixed", "R6": "pass",
            "R7": "pass", "R8": "pass", "R9": "n/a", "R10": "pass", "R11": "pass", "R12": "pass"},
 "draftNext": "pass", "stillFailing": [], "gaps": [], "scripted": "ran"}
```

- `checks`: `pass` (passed the first time), `fixed` (failed, fixed before publishing), `fail`
  (still failing at publish), or `n/a` (does not apply to this page, section 1).
- `draftNext`: part 9, judged the same way.
- `stillFailing`: one entry per `fail`, as "R5 Clear next steps: {why it could not be fixed}".
  Every `n/a` has its reason here too, as "R2 n/a: {reason}".
- `gaps`: on a page shared outside the team, what Atlas could not read, for the main thread to
  tell the requester. Empty on a team page, whose gaps are on the page.
- `scripted`: `ran`, `read` (no Python, or a page drawn in script), or `unmarked`.
