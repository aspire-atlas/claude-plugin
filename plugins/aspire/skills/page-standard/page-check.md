# Page check script

The script `SKILL.md`, section 5, runs on every page before it is published: R1, R2, R6, R11 and
R13 from the reader standard. Extract it with the command there; never retype it. It reads only the
pages named and writes nothing. With `--text` anywhere among its arguments it runs no check and prints the
words a reader sees instead, one block per line, which is all the English read (`SKILL.md`,
section 4, step 4b) is given. It lives in this file so `SKILL.md` stays short; when the reader
standard changes, `SKILL.md`'s section 6 table and this script change in the same commit, and when
the required-metrics table (`SKILL.md`, section 8) changes, `REQUIRED_ROWS` here changes with it.

## Contents

- [The script](#the-script)

## The script

<!-- page-check -->
```python
# Page standard self-check: R1, R2, R6, R11 and R13 from reader-standard.md. Reads the HTML files named; writes nothing.
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
add_hashtags append_calibration append_insights calculate_creator_fee cancel_invitation connect_channel
create_organization create_profile delete_organization delete_profile get_brand_context get_brand_instruction
get_brand_theme get_cas_briefs get_cas_campaign get_cas_rates get_cas_results get_cas_selection
get_cas_setup_form get_creator get_dashboard get_fee_rate_card get_job_status get_more_tools get_onboarding_form
get_onboarding_report get_profile get_shop_analytics get_status invite_member leave_organization
list_ad_accounts list_ad_search_fields list_available_hashtags list_channels
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
NOTHING = re.compile(r"\b(?:nothing|no decisions?) needs? (?:your )?approval\b", re.I)
# Required metrics on every cited post, by question code. Kept equal to the required-metrics table in
# SKILL.md, section 8, by scripts/check-artifact-standard.sh.
REQUIRED_ROWS = """
O1 O4 O5 O6: views likes comments shares saves engagement
O2 O3: views likes comments engagement
I1 I2 I3 I4: views likes comments engagement
P1 P2 P4 P5 P6: views likes comments shares saves engagement
I5 I6 P3 A1: views likes comments
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

def post_label(post, index):
    link = next((n.attrs.get("href") for n in walk(post) if n.tag == "a" and n.attrs.get("href")), "")
    return (post.attrs.get("data-post") or "").strip() or link or "cited post %d" % index

def r13(nodes, regions):
    # Every cited post (data-post) shows each metric its question's row requires (data-metric), or
    # names it in data-missing="{metric}: {reason}" with the reason shown on the post. Returns None
    # (n/a) on a page with no question code and no cited post.
    scope = (regions.get("scope") or [None])[0]
    code = ((scope.attrs.get("data-question") or "") if scope is not None else "").strip().upper()
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

# Only these scripted checks can be N/A (reader-standard.md; quality-review.md, section 3). R13 is
# n/a on its own terms (no question code and no cited post), never through data-na.
CAN_BE_NA = {"R2", "R6"}
CHECKS = (("R1", "Reader and scope", r1), ("R2", "Platforms covered", r2),
          ("R6", "Decisions kept separate", r6), ("R11", "Plain language", r11),
          ("R13", "Required metrics", r13))

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
            if problems is None:
                results.append((code, name, "n/a", ["the page names no question code and cites no post"]))
            else:
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

def visible(path):
    # The words a reader sees, one block per line, for the English read. Someone else's words are
    # marked [quoted: ...] and image text [image: ...]; the mark and the source line are left out.
    tree = Tree()
    with open(path, encoding="utf-8", errors="replace") as f:
        tree.feed(f.read())
    tree.close()
    out, stack = [], [tree.root]
    while stack:
        item = stack.pop()
        if isinstance(item, str):
            out.append(item)
            continue
        if item.tag in SKIP or (exempt(item) and not quoted(item)):
            continue
        pad = "" if item.tag in INLINE else ("\n" if item.tag in BLOCK or item.tag in ("tr", "td", "th", "br") else " ")
        # Words a screen reader says or a field shows, which R11 checks too: alt text, any aria-label
        # (an icon button, a role="img" chart), and a field's placeholder or value.
        image = item.tag in ("svg", "img") or item.attrs.get("role") == "img"
        label = item.attrs.get("alt") or item.attrs.get("aria-label") or ""
        field = (item.attrs.get("placeholder") or item.attrs.get("value") or "") if item.tag in ("input", "textarea") else ""
        stack.append(("]" if quoted(item) else "") + pad)
        stack.extend(reversed(item.kids))
        stack.append(pad + ("[quoted: " if quoted(item) else "")
                     + (("[image: %s] " if image else "[label: %s] ") % label if label else "")
                     + ("[field: %s] " % field if field else ""))
    lines = (re.sub(r"[ \t\r\f\v]+", " ", line).strip() for line in "".join(out).split("\n"))
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
