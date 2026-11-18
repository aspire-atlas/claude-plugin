# Page check script

The script `SKILL.md`, section 5, runs on every page before it is published: R1, R2, R6, R7's linked
evidence (`explanations.md`), R11, R13, R14 and R15 from the reader standard. Extract it with the command there; never retype it. It reads only the
pages named and writes nothing. With `--text` anywhere among its arguments it runs no check and prints the
words a reader sees instead, one block per line, which is all the English read (`SKILL.md`,
section 4, step 4b) is given. It lives in this file so `SKILL.md` stays short; when the reader
standard changes, `SKILL.md`'s section 6 table and this script change in the same commit, and when
the required-metrics table (`SKILL.md`, section 8) changes, `REQUIRED_ROWS` here changes with it.
`DIRECTIONAL_MAX` and `IN_LINE_POINTS` are the two numbers `comparisons.md` sets.

## Contents

- [The script](#the-script)

## The script

<!-- page-check -->
```python
# Page standard self-check: R1, R2, R6, R7 (its linked evidence), R11, R13, R14 and R15 from reader-standard.md. Reads the HTML files named; writes nothing.
import datetime, json, re, sys
from html.parser import HTMLParser

NETWORKS = ("instagram", "tiktok", "youtube")
NOT_COVERED = ("not covered", "no posts", "no data", "not connected", "missing", "none")
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
add_hashtags append_calibration append_insights calculate_creator_fee cancel_invitation connect_channel
create_organization create_profile delete_organization delete_profile get_brand_context get_brand_instruction
get_brand_theme get_cas_briefs get_cas_campaign get_cas_rates get_cas_results get_cas_selection
get_card_images get_cas_setup_form get_creator get_dashboard get_fee_rate_card get_job_status get_more_tools get_onboarding_form
get_onboarding_report get_profile get_shop_analytics get_status invite_member leave_organization
list_ad_accounts list_ad_search_fields list_applicants list_available_hashtags list_channels
list_creator_marketplace_labels list_creator_search_fields
list_hashtag_posts list_hashtags list_insight_search_fields list_invitations list_members
list_my_organizations list_my_profiles list_post_search_fields lookup_creators lookup_posts
mint_run_id remove_hashtags remove_member report_checkpoint retract_calibration search_ads search_calibrations
search_creator_marketplace search_creators search_insights search_partnership_content search_posts
set_brand_instruction show_ads show_partnership_content start_business_discovery supersede_calibration
switch_billing_account unlink_channel update_member_role update_organization update_profile
""".split())
EDGE = r"(?<![A-Za-z0-9])%s(?![A-Za-z0-9])"
# Names match by case so "Atlas-indexed" and "an api of ideas" stay plain words; the rest match any case.
BANNED = [
    (re.compile(EDGE % r"atlas-[a-z]+(?:-[a-z]+)*"), "an agent name"),
    (re.compile(EDGE % r"(?:Claude|Anthropic|LLMs?|MCPs?|APIs?|JSON|runKey)"), "a system name"),
    (re.compile(EDGE % r"(?:sub-?agents?|tool calls?|webhooks?|endpoints?|schemas?)", re.I), "a system word"),
    # "picks" and "reads" are also plain verbs and counts ("Atlas reads public posts", "3 picks"), so
    # only their label use fails; any other report wording is the English read's to catch.
    (re.compile(EDGE % r"(?:(?:top|our|first|creator|the|your|weekly|daily|today's|this\s+week's)\s+(?:picks|reads)"
                r"|pulses?|the\s+run(?![-\s]+(?:up|rate)\b)|reach\s+slots?|practitioners?)", re.I), "a report label"),
]
# Links and emails, then handles and hashtags: never read as words. An email starts at a word
# character, so a handle after "(" or a quote stays a handle.
LINKS = re.compile(r"https?://\S+|(?<![\w.])[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
NAMES = re.compile(r"(?<!\w)[@#][\w.]+")
HANDLE = re.compile(r"(?<!\w)@[\w.]+")
# A post by someone other than the brand has a "paid label" or "no paid label" (post-kinds.md).
# PAID_CODES is kept equal to the codes post-kinds.md names by scripts/check-artifact-standard.sh.
PAID_CODES = {"O1", "O2", "O3", "I6"}
# Only the word said of posts fails, so "organic cotton", "organic, fair-trade" and "2 unpaid
# invoices" beside a handle stay plain words. To cover a new kind of post, add its noun here.
POST_NOUNS = ("posts?", "mentions?", "content", "buzz", "reach", "views", "engagement", "conversations?",
              "coverage", "videos?", "reels?", "shorts", "stories", "creators?", "share")
POST_VERBS = ("posted", "mentioned", "shared", "spread", "grew", "talked")
VERSUS = r"(?:vs\.?|versus|and|or|against|to|from)"
BEFORE_NOUN = r"(?:organic|unpaid)\s+(?:%s)" % "|".join(POST_NOUNS)
PAIRED = r"paid\s+%s\s+(?:organic|unpaid)|(?:organic|unpaid)\s+%s\s+paid" % (VERSUS, VERSUS)
ADVERB = r"(?:%s)\s+organically|organically\s+(?:%s)" % ("|".join(POST_VERBS), "|".join(POST_VERBS))
# The word closing a clause or standing alone in a table cell: "the buzz is organic.", "| Unpaid |".
CLAUSE_END = r"(?:organic|unpaid)(?=\s*(?:[.;!?|]|$))"
UNLABELLED = re.compile(EDGE % ("(?:%s)" % "|".join((PAIRED, BEFORE_NOUN, ADVERB, CLAUSE_END))), re.I)
# A sentence ends at . ! ? or ; before anything but a lowercase letter, and never at an abbreviation.
SENTENCE = re.compile(r"(?<=[.!?;])\s+(?=[^a-z])")
ABBREVIATION = re.compile(r"(?i)(?<![a-z])(?:vs|e\.g|i\.e|etc|approx|est|avg|incl|no|jan|feb|mar|apr|jun|jul|aug|sept?|oct|nov|dec)\.$")
NOTHING = re.compile(r"\b(?:nothing|no decisions?) needs? (?:your )?approval\b", re.I)
# Required metrics on every cited post, by question code. Kept equal to the required-metrics table in
# SKILL.md, section 8, by scripts/check-artifact-standard.sh.
REQUIRED_ROWS = """
O1 O4 O5 O6: views likes comments shares saves engagement
O2 O3: views likes comments engagement
I1 I2 I3 I4: views likes comments engagement
P1 P2 P4 P5 P6: views likes comments shares saves engagement
I5 I6 I11 P3 A1: views likes comments
I12: views likes comments engagement
"""
REQUIRED = {code: tuple(metrics.split()) for line in REQUIRED_ROWS.strip().splitlines()
            for codes, metrics in [line.split(":")] for code in codes.split()}

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

def flow(node, wrap, skip=lambda n: False, seen=lambda n: None):
    # The page's words in reading order. wrap(node) gives what goes before and after a node's
    # words; skip(node) leaves a node and everything in it out; seen(node) is told each node kept.
    out, stack = [], [node]
    while stack:
        item = stack.pop()
        if isinstance(item, str):
            out.append(item)
        elif item.tag not in SKIP and not skip(item):
            seen(item)
            before, after = wrap(item)
            stack.append(after)
            stack.extend(reversed(item.kids))
            stack.append(before)
    return "".join(out)

def text(node, gap="", skip=lambda n: False):
    pad = lambda n: (gap, gap) if n.tag in INLINE else (" ", " ")
    return re.sub(r"\s+", " ", flow(node, pad, skip)).strip()

def has(haystack, needle):
    # Word for word, whatever the markup around the words: an inline element pads its text with
    # spaces, so the two are compared with all white space taken out.
    squeeze = lambda value: re.sub(r"\s+", "", value).lower()
    return squeeze(needle) in squeeze(haystack)

def has_phrase(haystack, phrase):
    # The phrase as whole words, so "no data" never matches "no database" or "none" "nonetheless".
    words = r"\s+".join(re.escape(w) for w in phrase.split())
    return re.search(r"(?i)(?<!\w)%s(?!\w)" % words, haystack) is not None

def page_name(node):
    return (node.attrs.get("data-page") or "").strip().lower()

def inside(node, name):
    return any(page_name(a) == name for a in ancestors(node))

def ancestors(node):
    found = []
    while node.parent is not None:
        node = node.parent
        found.append(node)
    return found

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

def whole(value):
    # A post count as written in data-posts ("1,412", "96"); None when it is not a whole number.
    value = (value or "").replace(",", "").strip()
    return int(value) if value.isascii() and value.isdigit() else None

def r1(nodes, regions, out):
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
        posts, shown = whole(found[0].attrs.get("data-posts")), text(found[0], gap=" ")
        if posts is None:
            problems.append("%s gives %s no whole-number data-posts" % (label, name))
            out[name] = None
            continue
        if posts == 0 and not any(has_phrase(shown, w) for w in NOT_COVERED):
            problems.append("%s shows %s with 0 posts but says neither that it is not covered nor that Atlas has no data" % (label, name))
        if posts > 0 and posts not in numbers(shown):
            problems.append("%s does not show %s's exact post count (%d)" % (label, name, posts))
        out[name] = posts
    return out, problems

def shared(nodes):
    # The shared audience line from artifact-standard.md marks a page seen outside the team.
    return any("atlas-footnote" in (n.attrs.get("class") or "").split() and has(text(n), "shared with")
               for n in nodes)

def r2(nodes, regions, out):
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

def r6(nodes, regions, out):
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

# R7's scripted part (explanations.md): every cited post links to itself, every explanation rests on
# linked evidence from Atlas or the brand's site or says it is not explained yet, and every saved
# capture carries its link, date, quote, and screenshot or the reason there is none. Whether the
# evidence supports the claim, and each figure, is still judged by reading.
UNEXPLAINED = re.compile(r"(?i)\bnot explained yet\b")
NO_SCREENSHOT = re.compile(r"(?i)\bscreenshot not taken\b")
GONE = re.compile(r"(?i)\bno longer visible\b")
SEARCHED_LABEL = re.compile(r"(?i)^\s*searched\s*:?\s*")
# data-evidence names where the evidence comes from. Only atlas and site can carry an explanation;
# outside evidence (a coupon site, another store) and every saved capture sit beside them.
SOURCES = {"atlas", "site", "outside"}
# Markup that belongs inside a data-explain block, and is unchecked anywhere else.
EXPLAIN_PARTS = ("data-evidence", "data-unexplained", "data-searched")

def web(value):
    return re.match(r"(?i)^https?://[^\s/]+\.[^\s/]+", (value or "").strip()) is not None

def anchors(node):
    # The links a reader can open: never one inside a script, style, template, or noscript.
    return [(n.attrs.get("href") or "").strip() for n in walk(node, keep=lambda n: n.tag not in SKIP) if n.tag == "a"]

def links(node):
    return [href for href in anchors(node) if web(href)]

def opens(href, url):
    # The link opens the post: data-post itself, or data-post with a timecode or share parameters
    # after it ("...watch?v=X&t=4s", ".../reel/X/?igsh=1"). Case is kept: post ids are case-sensitive.
    base = url.rstrip("/")
    return href.startswith(base) and href[len(base):][:1] in ("", "/", "?", "&", "#")

def captured_at(value):
    # data-captured as a UTC or offset date and time ("2026-10-30T15:20Z"); None when it is not one.
    if not re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$", value):
        return None
    try:
        return datetime.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None

def post_link_problems(nodes):
    problems = []
    for index, post in enumerate((n for n in nodes if "data-post" in n.attrs), 1):
        url = (post.attrs.get("data-post") or "").strip()
        if not web(url):
            problems.append("cited post %d has data-post \"%s\", which is not the post's link" % (index, url))
        elif not any(opens(href, url) for href in links(post)):
            problems.append("%s is cited with no link a reader can open; link the post itself" % url)
    return problems

def explain_problems(nodes, out):
    problems, saved_ids = [], {"#" + n.attrs["id"].strip() for n in nodes
                               if "data-saved" in n.attrs and (n.attrs.get("id") or "").strip()}
    stray = [n for n in nodes if any(a in n.attrs for a in EXPLAIN_PARTS)
             and not any("data-explain" in a.attrs for a in [n] + ancestors(n))]
    if stray:
        problems.append("%d explanation part(s) (data-evidence, data-unexplained, data-searched) sit outside a data-explain block; wrap the explanation in one" % len(stray))
    for index, block in enumerate((n for n in nodes if "data-explain" in n.attrs), 1):
        label = "explanation %d (\"%s\")" % (index, text(block)[:50])
        evidence = [n for n in walk(block) if "data-evidence" in n.attrs]
        unexplained = [n for n in walk(block) if "data-unexplained" in n.attrs]
        searched = [SEARCHED_LABEL.sub("", text(n, gap=" ")) for n in walk(block) if "data-searched" in n.attrs]
        carrying, saved = 0, 0
        for item in evidence:
            source, hrefs = (item.attrs.get("data-evidence") or "").strip().lower(), anchors(item)
            to_saved = [h for h in hrefs if h in saved_ids]
            saved += len(to_saved)
            if not to_saved and not any(web(h) for h in hrefs):
                problems.append("%s marks evidence with no link to it" % label)
            elif source not in SOURCES:
                problems.append("%s has data-evidence \"%s\"; name its source: atlas, site, or outside" % (label, source))
            elif to_saved and source != "outside":
                problems.append("%s marks a saved capture as %s evidence; a saved capture is outside evidence" % (label, source))
            elif source != "outside":
                carrying += 1
        if unexplained:
            if not all(UNEXPLAINED.search(text(n, gap=" ")) for n in unexplained):
                problems.append("%s marks data-unexplained but does not say \"not explained yet\"" % label)
            if not any(searched):
                problems.append("%s is not explained yet but does not say what was searched (data-searched)" % label)
        elif not evidence:
            problems.append("%s names no linked evidence (data-evidence) and does not say \"not explained yet\"" % label)
        elif not carrying:
            problems.append("%s rests only on outside evidence; give the evidence from Atlas or the brand's site, or say \"not explained yet\"" % label)
        out.setdefault("explanations", []).append(
            {"claim": text(block)[:80], "evidence": carrying, "searched": [s for s in searched if s], "saved": saved,
             "explained": not unexplained})
    return problems

def saved_problems(nodes):
    problems = []
    for index, saved in enumerate((n for n in nodes if "data-saved" in n.attrs), 1):
        label, shown = "saved evidence %d" % index, text(saved, gap=" ")
        if not links(saved):
            problems.append("%s has no link to where it was read" % label)
        when = (saved.attrs.get("data-captured") or "").strip()
        moment = captured_at(when)
        if moment is None:
            problems.append("%s has data-captured \"%s\", which is not a date and time with its zone (YYYY-MM-DDTHH:MMZ)" % (label, when))
        else:
            # The saved date, outside the quoted words. The page may show it in the reader's time
            # zone, a day either side of the UTC date.
            own = text(saved, gap=" ", skip=quoted)
            day = moment.astimezone(datetime.timezone.utc).date()
            days = [(day + datetime.timedelta(days=d)).isoformat() for d in (0, -1, 1)]
            if not any(shows_date(own, d) for d in days):
                problems.append("%s does not show the date it was saved (%s)" % (label, days[0]))
        if not any(quoted(n) for n in walk(saved)):
            problems.append("%s quotes none of the text it rests on (blockquote, q, or data-quoted)" % label)
        if not any(n.tag == "img" for n in walk(saved)) and not NO_SCREENSHOT.search(shown):
            problems.append("%s has no screenshot and does not say \"screenshot not taken\"" % label)
        if "data-gone" in saved.attrs and not GONE.search(shown):
            problems.append("%s is marked data-gone but does not say \"no longer visible\"" % label)
    return problems

def r7(nodes, regions, out):
    # Returns None (unmarked) on a page that cites no post and marks no explanation or capture:
    # read it for an explanation the markup missed.
    if not any(a in n.attrs for n in nodes for a in ("data-post", "data-explain", "data-saved") + EXPLAIN_PARTS):
        return None
    return post_link_problems(nodes) + explain_problems(nodes, out) + saved_problems(nodes)

def question_code(regions):
    scope = (regions.get("scope") or [None])[0]
    return ((scope.attrs.get("data-question") or "") if scope is not None else "").strip().upper()

def rows(node, skip):
    # The words a reader sees or hears, one block or label per line; a table row stays one line,
    # its cells set apart by "|".
    labels = []
    pad = lambda n: (" ", " ") if n.tag in INLINE else (" | ", " | ") if n.tag in ("td", "th") else ("\n", "\n")
    lines = flow(node, pad, skip, lambda n: labels.extend(n.attrs[a] for a in ATTRS if n.attrs.get(a))).split("\n")
    return [line for line in (re.sub(r"\s+", " ", l).strip() for l in lines + labels) if line.strip(" |")]

def sentences(line):
    found = []
    for part in SENTENCE.split(line):
        if found and ABBREVIATION.search(found[-1]):
            found[-1] += " " + part
        else:
            found.append(part)
    return found

def unlabelled(line, beside=None):
    # "organic" or "unpaid" said of posts, per sentence: beside the handle given, or else beside
    # one in the same sentence. Yields (word, sentence, where).
    for sentence in sentences(LINKS.sub(" ", line)):
        handle = HANDLE.search(sentence)
        where = beside or (handle and "beside %s" % handle.group(0))
        if where:
            for match in UNLABELLED.finditer(NAMES.sub(" ", sentence)):
                yield match.group(0).lower(), sentence, where

def paid_label(nodes, regions):
    mentions = [n for n in nodes if "data-mention" in n.attrs]
    if question_code(regions) not in PAID_CODES and not mentions:
        return []
    # data-own marks the brand's own posts or records, where "organic" and "unpaid" are right.
    skip = lambda n: exempt(n) or "data-own" in n.attrs
    shown = lambda n: not any(a.tag in SKIP or skip(a) for a in [n] + ancestors(n))
    hits = {}
    def read(lines, beside=None):
        # One hit per word and sentence, so a table row read twice is reported once.
        for line in lines:
            for word, sentence, where in unlabelled(line, beside):
                hits.setdefault((word, sentence), where)
    read(rows(nodes[0], skip))
    # A table that names a handle in any row is read whole, so a column heading counts.
    for table in (n for n in nodes if n.tag == "table" and shown(n)):
        lines = rows(table, skip)
        handle = next((m.group(0) for m in map(HANDLE.search, (LINKS.sub(" ", l) for l in lines)) if m), None)
        if handle:
            read(lines, "in a table with %s" % handle)
    for node in (n for n in mentions if shown(n)):
        read(rows(node, skip), "on another account's post")
    return ["says \"%s\" %s: say \"paid label\" or \"no paid label\", or mark the brand's own posts or records with data-own"
            % (word, where) for word, where in sorted({(w, where) for (w, _), where in hits.items()})[:5]]

def r11(nodes, regions, out):
    kept = list(walk(nodes[0], keep=lambda n: n.tag not in SKIP and not exempt(n)))
    shown = " ".join([text(nodes[0], gap=" ", skip=exempt)] +
                     [n.attrs[a] for n in kept for a in ATTRS if n.attrs.get(a)])
    shown = NAMES.sub(" ", LINKS.sub(" ", shown))
    problems = []
    for token in sorted(set(re.findall(r"[A-Za-z0-9]+(?:_+[A-Za-z0-9]+)+", shown))):
        parts = token.lower().split("__")
        if parts[0] == "mcp" or token.lower() in TOOLS or any(p in TOOLS for p in parts):
            problems.append("names a tool name: \"%s\"" % token)
    for pattern, kind in BANNED:
        for hit in sorted(set(pattern.findall(shown)))[:5]:
            problems.append("names %s: \"%s\"" % (kind, hit))
    return problems + paid_label(nodes, regions)

def post_label(post, index):
    link = next((n.attrs.get("href") for n in walk(post) if n.tag == "a" and n.attrs.get("href")), "")
    return (post.attrs.get("data-post") or "").strip() or link or "cited post %d" % index

def r13(nodes, regions, out):
    # Every cited post (data-post) shows each metric its question's row requires (data-metric), or
    # names it in data-missing="{metric}: {reason}" with the reason shown on the post. Returns None
    # (n/a) on a page with no question code and no cited post.
    code = question_code(regions)
    posts = [n for n in nodes if "data-post" in n.attrs]
    if not code:
        if posts:
            return ["%d cited post(s), but the scope names no data-question; give the page's question code" % len(posts)]
        return None
    if code not in REQUIRED:
        return ["the scope's data-question \"%s\" has no row in the required-metrics table" % code]
    problems = []
    for index, post in enumerate(posts, 1):
        # A post nested in this one (a frame in a storyboard) is checked on its own, never for this one.
        nested = lambda n: n is not post and "data-post" in n.attrs
        label, shown = post_label(post, index), text(post, gap=" ", skip=nested)
        missing = {}
        for entry in (post.attrs.get("data-missing") or "").split(";"):
            if not entry.strip():
                continue
            name, sep, reason = entry.partition(":")
            if not sep or not name.strip() or not reason.strip():
                problems.append("%s has a data-missing entry \"%s\" that is not \"{metric}: {reason}\"" % (label, entry.strip()))
                continue
            missing[name.strip().lower()] = reason.strip()
        found = {}
        for node in walk(post, keep=lambda n: n.tag not in SKIP and not nested(n)):
            name = (node.attrs.get("data-metric") or "").strip().lower()
            if name:
                found.setdefault(name, []).append(node)
        for metric in REQUIRED[code]:
            if metric in found and metric in missing:
                problems.append("%s both shows %s and notes it missing; keep one" % (label, metric))
            elif metric in found:
                if not any(re.search(r"\d", text(n, gap=" ")) for n in found[metric]):
                    problems.append("%s marks %s but shows no number; note it in data-missing with the reason instead" % (label, metric))
            elif metric in missing:
                if not has(shown, missing[metric]):
                    problems.append("%s notes %s missing (%s) but does not show that reason beside it" % (label, metric, missing[metric]))
            else:
                problems.append("%s shows no %s and has no data-missing note for it" % (label, metric))
    return problems

def account_key(value):
    # "instagram:@Name" -> "instagram:name"; None when the value is not "{network}:{handle}".
    network, sep, handle = (value or "").partition(":")
    network, handle = network.strip().lower(), handle.strip().lstrip("@").lower()
    return "%s:%s" % (network, handle) if sep and network and handle else None

def day(value):
    # "date" for YYYY-MM-DD (optionally with a time after "T"), "none" or "unknown" as written;
    # anything else is False.
    value = (value or "").strip().lower()
    if value in ("none", "unknown"):
        return value
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}(?:t\S*)?", value):
        return False
    try:
        datetime.date.fromisoformat(value[:10])
    except ValueError:
        return False
    return "date"

def in_footnote(node):
    while node is not None:
        if "atlas-footnote" in (node.attrs.get("class") or "").split():
            return True
        node = node.parent
    return False

MONTHS = ("january", "february", "march", "april", "may", "june", "july", "august", "september",
          "october", "november", "december")

def month_day(iso):
    # A pattern for the date as month and day ("Oct 12", "October 12", "12 Oct").
    month, day_of = MONTHS[int(iso[5:7]) - 1], int(iso[8:10])
    name = r"sep(?:t(?:ember)?)?\.?" if month == "september" else r"%s(?:%s)?\.?" % (month[:3], month[3:])
    return r"(?:%s\s+0?%d|0?%d\s+%s)" % (name, day_of, day_of, name)

def shows_date(shown, value):
    # The page shows the date as written in the attribute (2026-10-12), or as month and day.
    iso = value.strip()[:10]
    return iso in shown or re.search(r"(?i)\b%s\b" % month_day(iso), shown) is not None

def shows_year(shown, value):
    # The year sits beside the date ("Dec 30, 2025", "30 Dec 2025", or 2025-12-30), not anywhere
    # in the entry, so a view count such as 12025 never stands in for it.
    iso = value.strip()[:10]
    return iso in shown or re.search(r"(?i)\b%s,?\s+%s\b" % (month_day(iso), iso[:4]), shown) is not None

PLATFORM_NAMES = {"instagram": "Instagram", "tiktok": "TikTok", "youtube": "YouTube", "pinterest": "Pinterest",
                  "facebook": "Facebook"}
LABELS = {"data-newest": "newest post", "data-fetched": "last fetched", "data-changed": "last changed"}

def after_label(shown, label):
    # The text from the label to the next label, so each date is read beside its own label.
    low = shown.lower()
    at = low.find(label)
    if at < 0:
        return ""
    rest = low[at + len(label):]
    ends = [rest.find(other) for other in LABELS.values() if other != label and other in rest]
    return shown[at + len(label):at + len(label) + min(ends)] if ends else shown[at + len(label):]

def page_year(node):
    # The year of the source line's data-updated, the page's as-of time; None when it has none.
    while node is not None:
        if "atlas-footnote" in (node.attrs.get("class") or "").split():
            updated = (node.attrs.get("data-updated") or "").strip()
            return updated[:4] if re.match(r"\d{4}-", updated) else None
        node = node.parent
    return None

def dated_problems(key, node, shown):
    problems, year = [], page_year(node)
    for attr, label in LABELS.items():
        value = node.attrs.get(attr)
        if day(value) != "date":
            continue
        near = after_label(shown, label)
        if not shows_date(near, value):
            problems.append("the freshness entry for %s does not show its %s date (%s) after \"%s\"" % (key, attr[5:], value.strip()[:10], label))
        elif year and value.strip()[:4] != year and not shows_year(near, value):
            problems.append("the freshness entry for %s shows its %s date without its year (%s)" % (key, attr[5:], value.strip()[:4]))
    return problems

NUMBER_WORDS = ("one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
                "eleven", "twelve")

def mention_platform(node):
    # The platform a data-mention post is on: data-mention's own value, or its data-post URL's host.
    given = (node.attrs.get("data-mention") or "").strip().lower()
    if given in PLATFORM_NAMES:
        return given
    host = re.match(r"(?i)https?://(?:[\w-]+\.)*?([\w-]+)\.com/", (node.attrs.get("data-post") or "").strip())
    return host.group(1).lower() if host and host.group(1).lower() in PLATFORM_NAMES else None

def mention_problems(node):
    # The one entry for authors cited only as mention evidence or counted only in totals.
    shown, problems = text(node, gap=" "), []
    if not re.search(r"(?i)\b(?:\d[\d,]*|%s)\s+other creators?\b" % "|".join(NUMBER_WORDS), shown):
        problems.append("the mentions freshness entry does not say how many other creators it covers")
    if day(node.attrs.get("data-newest")) != "date":
        problems.append("the mentions freshness entry needs data-newest as a date (YYYY-MM-DD)")
    problems += dated_problems("mentions", node, shown)
    return problems

def fresh_problems(key, node):
    shown = text(node, gap=" ")
    problems = dated_problems(key, node, shown)
    network, handle = key.split(":", 1)
    at_handle = r"(?i)@%s(?!\w|-|\.\w)" % re.escape(handle)
    if not re.search(at_handle, shown):
        problems.append("the freshness entry for %s does not show the handle" % key)
    # The platform is looked for outside the handle, so @maker.instagram never names Instagram.
    if not re.search(r"(?i)\b%s\b" % re.escape(PLATFORM_NAMES.get(network, network)), re.sub(at_handle, " ", shown)):
        problems.append("the freshness entry for %s does not name the platform (%s)" % (key, PLATFORM_NAMES.get(network, network)))
    newest = day(node.attrs.get("data-newest"))
    if not newest or newest == "unknown":
        problems.append("the freshness entry for %s needs data-newest as a date (YYYY-MM-DD) or \"none\"" % key)
    elif newest == "none" and not has_phrase(shown, "holds no posts"):
        problems.append("the freshness entry for %s has no newest post but does not say Atlas holds no posts" % key)
    elif newest == "date" and not has_phrase(shown, "newest post"):
        problems.append("the freshness entry for %s does not show its newest post" % key)
    fetched, changed = node.attrs.get("data-fetched"), node.attrs.get("data-changed")
    if (fetched is None) == (changed is None):
        problems.append("the freshness entry for %s needs one of data-fetched (from freshness) or data-changed (no freshness)" % key)
    elif fetched is not None:
        when = day(fetched)
        if not when:
            problems.append("the freshness entry for %s has data-fetched \"%s\", not a date, \"none\" or \"unknown\"" % (key, fetched))
        elif when == "unknown" and not has_phrase(shown, "freshness unknown"):
            problems.append("the freshness entry for %s has no freshness on record but does not say \"freshness unknown\"" % key)
        elif when == "none" and not has_phrase(shown, "not fetched by Atlas yet"):
            problems.append("the freshness entry for %s has no fetch but does not say \"not fetched by Atlas yet\"" % key)
        elif when == "date" and not has_phrase(shown, "last fetched"):
            problems.append("the freshness entry for %s does not say when it was last fetched" % key)
    elif day(changed) != "date":
        problems.append("the freshness entry for %s has data-changed \"%s\", not a date" % (key, changed))
    elif not has_phrase(shown, "last changed") or has_phrase(shown, "last fetched"):
        problems.append("the freshness entry for %s has no fetch time, so it says \"last changed\", never \"last fetched\"" % key)
    return problems

def r14(nodes, regions, out):
    # Every subject account the page cites (data-account, and the scope's data-accounts) has one
    # freshness entry (data-fresh) in the source line: the newest post Atlas holds, and when Atlas
    # last fetched the account or, with no freshness on record, when it last changed. A cited post
    # carries data-account, or data-mention when its author is cited only as mention evidence; those
    # authors share one data-fresh="mentions" entry. A scope that reports posts, or "no posts" or
    # "no data", must name its accounts. Returns None (n/a) on a page that cites no account and no
    # post, whose scope reports on no account, and that has no freshness entry to check.
    cited, problems = {}, []
    for index, post in enumerate([n for n in nodes if "data-post" in n.attrs], 1):
        if not (post.attrs.get("data-account") or "").strip() and "data-mention" not in post.attrs:
            problems.append("%s has no data-account; give the account it is from as {network}:{handle}, or mark it data-mention" % post_label(post, index))
    mentions = any("data-mention" in n.attrs for n in nodes)
    for node in nodes:
        raw = (node.attrs.get("data-account") or "").strip()
        if not raw:
            continue
        key = account_key(raw)
        if key is None:
            problems.append("data-account \"%s\" is not {network}:{handle}" % raw)
        else:
            cited.setdefault(key, raw)
    scope = (regions.get("scope") or [None])[0]
    for raw in ((scope.attrs.get("data-accounts") or "") if scope is not None else "").split():
        key = account_key(raw)
        if key is None:
            problems.append("the scope's data-accounts entry \"%s\" is not {network}:{handle}" % raw)
        else:
            cited.setdefault(key, raw)
    def reports(node):
        # A platform the scope reports on: posts counted, or 0 with "no posts" or "no data". "Not
        # covered" means no linked account, so it reports on none.
        posts = whole(node.attrs.get("data-posts"))
        if posts is None or not node.attrs.get("data-platform"):
            return False  # a malformed count is R2's to report
        shown = text(node, gap=" ")
        return posts != 0 or ((has_phrase(shown, "no posts") or has_phrase(shown, "no data")) and not has_phrase(shown, "not covered"))
    reporting = [n for n in walk(scope) if reports(n)] if scope is not None else []
    if reporting and not (scope.attrs.get("data-accounts") or "").strip():
        problems.append("the scope reports posts or their absence but names no account; list them in the scope's data-accounts")
    elif reporting:
        # Each platform the scope reports needs an account on it, unless the page counts it only
        # through other creators' posts on that platform: a data-mention post there, or the
        # platform in the mentions entry's data-platforms.
        named = {k.split(":", 1)[0] for k in (account_key(r) for r in scope.attrs.get("data-accounts", "").split()) if k}
        mentioned = {mention_platform(n) for n in nodes if "data-mention" in n.attrs}
        for n in nodes:
            if (n.attrs.get("data-fresh") or "").strip().lower() == "mentions":
                mentioned |= set((n.attrs.get("data-platforms") or "").lower().split())
        for name in sorted({(n.attrs.get("data-platform") or "").strip().lower() for n in reporting}):
            if name not in named and name not in mentioned:
                problems.append("the scope reports %s but names no %s account in data-accounts, and no mention evidence covers it" % (name, name))
    if scope is not None:
        # A post whose figures the page shows is a subject account's, so the scope names it; mention
        # evidence never stands in for it.
        in_scope = {k for k in (account_key(r) for r in (scope.attrs.get("data-accounts") or "").split()) if k}
        for key in sorted({account_key(n.attrs["data-account"]) for n in nodes
                           if "data-post" in n.attrs and (n.attrs.get("data-account") or "").strip()} - {None} - in_scope):
            problems.append("the page shows posts from %s but the scope's data-accounts does not name it" % key)
    entries = any("data-fresh" in n.attrs for n in nodes)
    if not cited and not mentions and not problems and not entries:
        return None
    fresh = {}
    for node in nodes:
        if "data-fresh" not in node.attrs:
            continue
        raw = node.attrs.get("data-fresh") or ""
        if raw.strip().lower() == "mentions":
            if "mentions" in fresh:
                problems.append("the page has more than one mentions freshness entry")
                continue
            fresh["mentions"] = node
            if not in_footnote(node):
                problems.append("the mentions freshness entry is outside the source line (atlas-footnote)")
            problems += mention_problems(node)
            continue
        key = account_key(raw)
        if key is None:
            problems.append("data-fresh \"%s\" is not {network}:{handle}" % raw.strip())
        elif key in fresh:
            problems.append("%s has more than one freshness entry" % key)
        else:
            fresh[key] = node
            if not in_footnote(node):
                problems.append("the freshness entry for %s is outside the source line (atlas-footnote)" % key)
            problems += fresh_problems(key, node)
    for key in sorted(set(cited) - set(fresh)):
        problems.append("the page cites %s but the source line gives no freshness for it" % cited[key])
    # An entry for an account the page never cites, or a mentions entry with no mention evidence
    # behind it, is an orphan: the source line gives freshness only for what the page cites.
    for key in sorted(set(fresh) - set(cited) - {"mentions"}):
        problems.append("the source line gives freshness for %s, but the page does not cite it" % key)
    if "mentions" in fresh and not mentions and not (fresh["mentions"].attrs.get("data-platforms") or "").strip():
        problems.append("the source line has a mentions freshness entry, but the page cites no mention evidence")
    if mentions and "mentions" not in fresh:
        problems.append("the page cites mention posts but the source line has no data-fresh=\"mentions\" entry")
    return problems

# The like-for-like check (comparisons.md). A side with this many posts or fewer is marked
# "directional"; a share within this many points of its group's share of the whole is "in line with"
# the group's size. Kept equal to comparisons.md by scripts/check-artifact-standard.sh.
DIRECTIONAL_MAX = 20
IN_LINE_POINTS = 5
COMPARES = ("groups", "periods", "brands", "kinds", "share")
# data-kind values. "mixed" is a side the run could not split into one kind.
KIND_NAMES = {"paid-label": "posts with a paid label", "shop": "TikTok Shop selling posts",
              "no-paid-label": "posts with no paid label", "mixed": "a mix of kinds"}
# The checks a comparison may fail and stay on the page, saying so. "Enough posts" is not one: its
# line is the "directional" mark itself.
MAY_FAIL = ("same-kind", "mentions", "share-size")

def percent(value):
    value = (value or "").strip().rstrip("%").strip()
    return value if re.fullmatch(r"\d+(?:\.\d+)?", value) else None

def shows_percent(shown, value, times=1):
    return len(re.findall(r"(?<![\d.,])%s\s*(?:%%|percent\b)" % re.escape(value), shown)) >= times

def shows_posts(shown, posts):
    # The post count as a count of posts ("18 posts", "18 TikTok Shop posts", "1 post"), with up to
    # two words between the number and "posts", not any number in the text.
    return re.search(r"(?<![\d.,])%d\s+(?:[A-Za-z][\w'-]*\s+){0,2}posts?\b" % posts, shown, re.I) is not None

def declared(node):
    # data-fails="{check}: {line}; ..." as ({check: line}, [entries that are not that shape]).
    fails, bad = {}, []
    for entry in (node.attrs.get("data-fails") or "").split(";"):
        if not entry.strip():
            continue
        name, sep, line = entry.partition(":")
        if sep and name.strip().lower() in MAY_FAIL and line.strip():
            fails[name.strip().lower()] = line.strip()
        else:
            bad.append(entry.strip())
    return fails, bad

def sides_of(comparison):
    # The data-side elements of this comparison, not those of a comparison nested in it.
    inner = lambda n: n is not comparison and "data-compare" in n.attrs
    return [n for n in walk(comparison, keep=lambda n: not inner(n)) if "data-side" in n.attrs]

def thin_problems(owner, what, label):
    # A side, or a share's group, of DIRECTIONAL_MAX posts or fewer shows "directional" and its count.
    posts = whole(owner.attrs.get("data-posts"))
    if posts is None or posts > DIRECTIONAL_MAX:
        return []
    said = text(owner, gap=" ")
    if not has_phrase(said, "directional"):
        return ["%s: %s has %d posts, %d or fewer, but is not marked \"directional\" beside its number"
                % (label, what, posts, DIRECTIONAL_MAX)]
    if not shows_posts(said, posts):
        return ["%s: %s is marked directional but does not show its post count (\"%d post%s\")"
                % (label, what, posts, "" if posts == 1 else "s")]
    return []

def share_problems(node, label, fails):
    shown, problems = text(node, gap=" "), []
    share, group = percent(node.attrs.get("data-share")), percent(node.attrs.get("data-group-share"))
    if share is None:
        problems.append("%s states a share but has no data-share as a number" % label)
    elif not shows_percent(shown, share):
        problems.append("%s does not show its share (%s%%)" % (label, share))
    if group is None:
        # Only a share whose whole the run does not know may say so and stay.
        if "share-size" not in fails:
            problems.append("%s states a share with no data-group-share: show the group's share of the whole beside it" % label)
    elif "share-size" in fails:
        problems.append("%s gives the group's share of the whole (%s%%), so it cannot also note share-size in data-fails" % (label, group))
        del fails["share-size"]
    elif not shows_percent(shown, group, times=2 if group == share else 1):
        problems.append("%s does not show the group's share of the whole (%s%%) beside the share" % (label, group))
    elif share is not None and abs(float(share) - float(group)) <= IN_LINE_POINTS and not has_phrase(shown, "in line with"):
        problems.append("%s: the share (%s%%) is within %d points of the group's size (%s%%) but the page does not say it is \"in line with\" it"
                        % (label, share, IN_LINE_POINTS, group))
    if "data-posts" in node.attrs:
        problems += thin_problems(node, "the group", label)
    return problems

def sides_problems(node, label, fails, method):
    sides, problems, kinds = sides_of(node), [], []
    across_kinds = (node.attrs.get("data-compare") or "").strip().lower() == "kinds"
    if len(sides) < 2:
        problems.append("%s marks %d data-side; a comparison has at least two" % (label, len(sides)))
    for number, side in enumerate(sides, 1):
        what = "side %d (\"%s\")" % (number, (side.attrs.get("data-side") or "").strip() or text(side, gap=" ")[:40])
        if whole(side.attrs.get("data-posts")) is None:
            problems.append("%s: %s has no whole-number data-posts" % (label, what))
        problems += thin_problems(side, what, label)
        kind = (side.attrs.get("data-kind") or "").strip().lower()
        kinds.append(kind)
        if kind not in KIND_NAMES:
            problems.append("%s: %s has data-kind \"%s\"; use one of %s" % (label, what, kind, ", ".join(KIND_NAMES)))
        elif kind == "mixed" and "same-kind" not in fails:
            problems.append("%s: %s mixes kinds of post; split it, drop the comparison, or note same-kind in data-fails with the line shown" % (label, what))
        if "data-mentions" in side.attrs and "mentions" not in fails:
            how = (side.attrs.get("data-mentions") or "").strip()
            if not how:
                problems.append("%s: %s counts mentions but data-mentions does not say how they were found" % (label, what))
            elif not has(method, how):
                problems.append("%s: %s counts mentions, but the method section does not show how they were found (%s)" % (label, what, how))
    named = sorted({k for k in kinds if k in KIND_NAMES and k != "mixed"})
    if "mixed" in kinds or "same-kind" in fails:
        return problems
    if across_kinds and len(named) < 2:
        problems.append("%s is marked data-compare=\"kinds\" but its sides hold one kind; a kinds comparison sets two different kinds side by side" % label)
    elif not across_kinds and len(named) > 1:
        problems.append("%s sets %s side by side; compare one kind, mark it data-compare=\"kinds\" when the kinds are what it compares, or note same-kind in data-fails"
                        % (label, " and ".join(KIND_NAMES[k] for k in named)))
    return problems

def r15(nodes, regions, out):
    # Every marked comparison (data-compare) passes the four like-for-like checks of comparisons.md,
    # or names the one it fails in data-fails="{check}: {line}" with that line shown in it. Returns
    # None on a page that marks no comparison: the script cannot tell whether it makes one. Puts in
    # out["comparisons"] what the page check block's "comparisons" holds: each comparison with its
    # sides' post counts and kinds, or a share with its group's share, and the failures it may keep.
    marked = [n for n in nodes if "data-compare" in n.attrs]
    if not marked:
        return None
    method = " ".join(text(m, gap=" ") for m in regions.get("method", []))
    problems = []
    for index, node in enumerate(marked, 1):
        shown = text(node, gap=" ")
        label = "comparison %d (\"%s\")" % (index, shown[:50])
        compare = (node.attrs.get("data-compare") or "").strip().lower()
        fails, bad = declared(node)
        for entry in bad:
            problems.append("%s has a data-fails entry \"%s\" that is not \"{check}: {line}\" with check one of %s"
                            % (label, entry, ", ".join(MAY_FAIL)))
        for name, line in sorted(fails.items()):
            if not has(shown, line):
                problems.append("%s notes that it fails %s but does not show that line (%s)" % (label, name, line))
                del fails[name]
        entry = {"compare": compare,
                 "sides": [{"label": (s.attrs.get("data-side") or "").strip() or text(s, gap=" ")[:60],
                            "kind": (s.attrs.get("data-kind") or "").strip().lower() or None,
                            "posts": whole(s.attrs.get("data-posts")),
                            "mentions": "data-mentions" in s.attrs} for s in sides_of(node)]}
        if compare not in COMPARES:
            problems.append("%s has data-compare \"%s\"; use one of %s" % (label, compare, ", ".join(COMPARES)))
        elif compare == "share":
            entry.update(share=percent(node.attrs.get("data-share")), groupShare=percent(node.attrs.get("data-group-share")),
                         posts=whole(node.attrs.get("data-posts")))
            problems += share_problems(node, label, fails)
        else:
            problems += sides_problems(node, label, fails, method)
        entry["fails"] = sorted(fails)
        out.setdefault("comparisons", []).append(entry)
    return problems

# Only these scripted checks can be N/A through data-na (reader-standard.md; quality-review.md,
# section 3). One named there while the page carries the attribute in NA_REFUSED fails instead.
CAN_BE_NA = {"R2", "R6", "R15"}
NA_REFUSED = {"R15": ("data-compare", "the page marks a comparison")}
# What a check that returns None reports: n/a on its own terms, or unmarked, to be judged by reading.
NO_RESULT = {"R7": ("unmarked", "the page cites no post and marks no explanation; read it for one, and mark every explanation"),
             "R13": ("n/a", "the page names no question code and cites no post"),
             "R14": ("n/a", "the page cites no account and no post, its scope reports on no account, and it has no freshness entry"),
             "R15": ("unmarked", "the page marks no comparison; read it for one, and put R15 in data-na only when it compares nothing")}
CHECKS = (("R1", "Reader and scope", r1), ("R2", "Platforms covered", r2),
          ("R6", "Decisions kept separate", r6), ("R7", "Real evidence, linked", r7), ("R11", "Plain language", r11),
          ("R13", "Required metrics", r13), ("R14", "Data freshness", r14), ("R15", "Like for like", r15))

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
    results, out = [], {}
    for code, name, run in CHECKS:
        attr, why = NA_REFUSED.get(code, (None, None))
        if code in na and attr and any(attr in n.attrs for n in nodes):
            results.append((code, name, "fail", ["%s is in data-na, but %s; remove it from data-na" % (code, why)]))
        elif code in na and code in CAN_BE_NA:
            results.append((code, name, "n/a", []))
        elif code in na:
            results.append((code, name, "fail", ["%s is never N/A; remove it from data-na" % code]))
        elif code != "R11" and not regions:
            results.append((code, name, "unmarked", ["the page has no data-page markup; judge this check by reading"]))
        else:
            problems = run(nodes, regions, out)
            if problems is None:
                results.append((code, name, NO_RESULT[code][0], [NO_RESULT[code][1]]))
            else:
                results.append((code, name, "fail" if problems else "pass", problems))
    return results, out

# What a check lists beside its result line, for the page check block (SKILL.md, section 7).
LISTED = {"R7": "explanations", "R15": "comparisons"}

def main(paths):
    status = 0
    for path in paths:
        try:
            results, listed = check(path)
        except Exception as error:
            print(json.dumps({"page": path, "check": "error", "result": "error", "problems": [repr(error)]}))
            status = 2
            continue
        for code, name, result, problems in results:
            line = {"page": path, "check": code, "name": name, "result": result, "problems": problems}
            field = LISTED.get(code)
            if field and listed.get(field):
                line[field] = listed[field]
            print(json.dumps(line))
            if result == "fail" and status == 0:
                status = 1
    return status

def visible(path):
    # The words a reader sees, one block per line, for the English read. Someone else's words are
    # marked [quoted: ...] and image text [image: ...]; the mark and the source line are left out.
    tree = Tree()
    with open(path, encoding="utf-8", errors="replace") as f:
        tree.feed(f.read())
    tree.close()
    def wrap(item):
        pad = "" if item.tag in INLINE else ("\n" if item.tag in BLOCK or item.tag in ("tr", "td", "th", "br") else " ")
        # Words a screen reader says or a field shows, which R11 checks too: alt text, any aria-label
        # (an icon button, a role="img" chart), and a field's placeholder or value.
        image = item.tag in ("svg", "img") or item.attrs.get("role") == "img"
        label = item.attrs.get("alt") or item.attrs.get("aria-label") or ""
        field = (item.attrs.get("placeholder") or item.attrs.get("value") or "") if item.tag in ("input", "textarea") else ""
        return (pad + ("[quoted: " if quoted(item) else "")
                + (("[image: %s] " if image else "[label: %s] ") % label if label else "")
                + ("[field: %s] " % field if field else ""),
                ("]" if quoted(item) else "") + pad)
    shown = flow(tree.root, wrap, lambda n: exempt(n) and not quoted(n))
    lines = (re.sub(r"[ \t\r\f\v]+", " ", line).strip() for line in shown.split("\n"))
    return "\n".join(line for line in lines if line)

def show(paths):
    status = 0
    for path in paths:
        try:
            print(("== %s\n" % path if len(paths) > 1 else "") + visible(path))
        except Exception as error:
            print("could not read %s: %r" % (path, error), file=sys.stderr)
            status = 2
    return status

if __name__ == "__main__":
    args = sys.argv[1:]
    pages = [arg for arg in args if arg != "--text"]
    if not pages:
        print("usage: python3 -I page_check.py [--text] page.html [more.html]", file=sys.stderr)
        sys.exit(2)
    sys.exit(show(pages) if "--text" in args else main(pages))
```
<!-- /page-check -->
