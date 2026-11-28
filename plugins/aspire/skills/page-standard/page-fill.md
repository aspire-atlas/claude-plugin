# Page fill script

This script turns a page's data into the page (`templates.md` in this folder). It checks the
data against `page-data.schema.json` and the rules in `templates.md`, section 3, then prints the
whole page as one HTML document. It reads only the files beside the data file, writes nothing, and
starts no other program. Extract it with the command below; never retype it.

Copy the data file and the seven files the script reads into a new temporary folder, extract the
script there, and run it. The shell saves what it prints as the page:

```bash
d=$(mktemp -d) && cp {data file} "$d/page.json" && P="${CLAUDE_PLUGIN_ROOT}" && cp "$P/skills/page-standard/page-data.schema.json" "$P/skills/page-standard/page-templates.json" "$P/skills/page-standard/blocks.md" "$P/skills/page-standard/page-check.md" "$P/skills/page-standard/glossary.md" "$P/skills/aspire/references/artifact-standard.md" "$P/assets/aspire-animated.svg.md" "$d/" && awk '/^<!-- page-fill -->$/{f=1;next} /^<!-- \/page-fill -->$/{f=0} f' "$P/skills/page-standard/page-fill.md" | sed '1d;$d' > "$d/page_fill.py" && python3 -I "$d/page_fill.py" "$d/page.json" > "$d/{page name}.html"
```

- It exits 0 and prints the page when the data passes. Add `--check` to check the data and print
  one line instead of the page. Add `--capabilities` to print the capability declaration to publish
  the page with (`live.capabilities`, or `{}` on a page with no live parts; `templates.md`, section 8).
- It exits 1 when the data breaks a rule, and prints one JSON line per problem, with its `rule`,
  the field's `path`, and a `message`. Fix the data and run it again.
- It exits 2 when it could not read the data file or a file beside it.
- It takes the Atlas tool names it refuses in reader text from `page-check.md`, and the banned
  phrases from `glossary.md`, so the fill and the page check refuse the same words.
- The page takes its style from `blocks.md` (the block style), its print rules from
  `artifact-standard.md` (section 6), and the mark from `aspire-animated.svg.md`, so a change to
  any of them reaches every page with no change here.
- Run the page check (`SKILL.md`, section 5) on the printed page before publishing it.
- When Python is not installed, build the page from the blocks by hand, in the order the template
  sets (`templates.md`, section 4).

## Contents

- [The script](#the-script)

## The script

<!-- page-fill -->
```python
import html, json, math, re, sys
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path

FIXED_SOURCES = ("Atlas", "Brand memory", "Web", "You", "Our read")
NETWORKS = {"instagram": "Instagram", "tiktok": "TikTok", "youtube": "YouTube"}
METRICS = (("views", "Views"), ("likes", "Likes"), ("comments", "Comments"), ("shares", "Shares"),
           ("saves", "Saves"), ("engagement", "Engagement"))
VERDICTS = {"yes": ("pb-ok", "Yes", "To contact"), "maybe": ("pb-warn", "Maybe", "Maybes"),
            "no": ("pb-bad", "No", "Left out")}
CONFIDENCE = {"high": "pb-ok", "medium": "pb-warn", "low": "pb-bad"}
CHECK_WORDS = {"ok": "Pass", "warn": "Fix", "bad": "Fail", "flat": "Not checked"}
MONTHS = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
# Record ids the reader never sees: uuids and prefixed ids. Tool names come from page-check.md's TOOLS.
INTERNAL = (re.compile(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b", re.I),
            re.compile(r"\b(org|usr|prof|run)_[a-z0-9]{8,}\b"))
WORD = re.compile(r"[A-Za-z0-9_]+")
# Fields that hold no words for the reader: keys, links, dates, enums, labels checked elsewhere, and style.
NOT_READER = frozenset(("version", "template", "length", "account", "accounts", "href", "image", "source", "job",
                        "due", "by", "newest", "fetched", "changed", "updated", "status", "verdict", "level",
                        "kind", "period", "network", "question", "tools", "theme",
                        # The live parts' page data paths, ids, keys and capability declaration.
                        "capabilities", "doc", "field", "vsField", "id", "key", "type", "fingerprint", "target",
                        "facet", "collection"))
CHART_SERIES = 6
# No figure reaches a quadrillion; the bound keeps every number a float can hold exactly.
NUMBER_BOUND = 10 ** 15
# A published page stays under 10MB (creator-card.md, Images, Budgets), well inside the Artifact limit.
PAGE_LIMIT = 10_000_000
# Images stay under 8MB of data URIs, cut in creator-card.md's order (Images, Budgets).
IMAGE_LIMIT = 8_000_000
CUT_ORDER = ("cut to two thumbnails per creator card, then post images past the first five to thumbnails, "
             "then images in secondary sections, then embed again at quality 80, then one thumbnail per card, "
             "then no thumbnails past card 60 (on a lanes page, past the first 60% of each lane's cards)")
# What each live part needs declared on publish (templates.md, section 8). Filters run on the
# data embedded in the page and need none.
LIVE_NEEDS = {"team": ("db",), "form": ("db", "user"), "filters": (), "approvals": ("db", "user")}
# An amount: a currency code or sign before a digit. Team parts show amounts only from page data.
AMOUNT = re.compile(r"(?:\b[A-Z]{3}\s?|[$\u20ac\u00a3\u00a5])\d")
FILES = ("page-data.schema.json", "page-templates.json", "page-check.md", "glossary.md", "blocks.md", "artifact-standard.md",
         "aspire-animated.svg.md")

def e(value):
    return html.escape(str(value), quote=True)

# ---- The shape: the part of JSON Schema page-data.schema.json uses.
def is_type(value, name):
    if name in ("integer", "number"):
        # JSON can carry Infinity, NaN and integers of any length, which no figure means. Ints are
        # compared as ints, since a long one overflows a float.
        if isinstance(value, bool) or not isinstance(value, int if name == "integer" else (int, float)):
            return False
        return abs(value) < NUMBER_BOUND and (isinstance(value, int) or math.isfinite(value))
    return isinstance(value, {"string": str, "boolean": bool, "object": dict, "array": list}[name])

def shape(value, schema, path, root, errs):
    if "$ref" in schema:
        target = root
        for part in schema["$ref"].lstrip("#/").split("/"):
            target = target[part]
        shape(value, target, path, root, errs)
    if "const" in schema and value != schema["const"]:
        errs.append(("shape", path, "must be %s" % json.dumps(schema["const"])))
    if "enum" in schema and value not in schema["enum"]:
        errs.append(("shape", path, "must be one of %s" % ", ".join(map(str, schema["enum"]))))
    kinds = schema.get("type")
    if kinds is not None:
        kinds = kinds if isinstance(kinds, list) else [kinds]
        if not any(is_type(value, k) for k in kinds):
            errs.append(("shape", path, "must be %s" % " or ".join(kinds)))
            return
    if isinstance(value, dict):
        props = schema.get("properties", {})
        for key in schema.get("required", []):
            if key not in value:
                errs.append(("shape", "%s.%s" % (path, key), "is required"))
        for key, item in value.items():
            if key in props:
                shape(item, props[key], "%s.%s" % (path, key), root, errs)
            elif schema.get("additionalProperties") is False:
                errs.append(("shape", "%s.%s" % (path, key), "is not a field of the page data"))
    elif isinstance(value, list):
        if len(value) < schema.get("minItems", 0):
            errs.append(("shape", path, "needs at least %d" % schema["minItems"]))
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            errs.append(("shape", path, "holds at most %d" % schema["maxItems"]))
        for i, item in enumerate(value):
            if "items" in schema:
                shape(item, schema["items"], "%s[%d]" % (path, i), root, errs)
    elif isinstance(value, str):
        if len(value.strip()) < schema.get("minLength", 0):
            errs.append(("shape", path, "is empty"))
        if "maxLength" in schema and len(value) > schema["maxLength"]:
            errs.append(("shape", path, "is over %d characters" % schema["maxLength"]))
        if "pattern" in schema and not re.search(schema["pattern"], value):
            errs.append(("shape", path, "does not match %s" % schema["pattern"]))
    elif is_type(value, "number"):
        if "minimum" in schema and value < schema["minimum"]:
            errs.append(("shape", path, "is under %s" % schema["minimum"]))
        if "maximum" in schema and value > schema["maximum"]:
            errs.append(("shape", path, "is over %s" % schema["maximum"]))

# ---- The rules the shape cannot state (templates.md, section 3).
def real_date(value):
    try:
        if "T" in value:
            datetime.fromisoformat(value.replace("Z", "+00:00"))
        else:
            date.fromisoformat(value)
        return True
    except ValueError:
        return False

def shared(data):
    return "Shared with" in data["footer"]["source"]

def rules(data, templates, tools, phrases):
    errs, sec = [], data.get("sections", {})
    tpl = templates["templates"][data["template"]]
    for need in tpl.get("needs", []):
        if need not in sec:
            errs.append(("template-sections", "sections.%s" % need, "a %s page needs it" % tpl["name"]))
    if tpl.get("needsOne") and not any(k in sec for k in tpl["needsOne"]):
        errs.append(("template-sections", "sections", "a %s page needs one of %s" % (tpl["name"], ", ".join(tpl["needsOne"]))))
    for key in sec:
        if key not in tpl["allows"]:
            errs.append(("template-sections", "sections.%s" % key, "a %s page has no %s section" % (tpl["name"], key)))
    for key in tpl.get("exactlyOne", []):
        if key in sec and len(sec[key]) != 1:
            errs.append(("template-sections", "sections.%s" % key, "a %s page holds exactly one" % tpl["name"]))
    lengths = [k for k in tpl["length"] if k != "default"]
    if lengths and data.get("length") not in lengths:
        errs.append(("length", "length", "a %s page sets it to %s" % (tpl["name"], " or ".join(lengths))))
    if not lengths and "length" in data:
        errs.append(("length", "length", "only a page with more than one length budget sets it"))
    if "groups" in data and data["template"] != "shortlist":
        errs.append(("groups", "groups", "only a Shortlist names its verdict groups"))
    ranks = [a["rank"] for a in data["actions"]]
    for i in range(1, len(ranks)):
        if ranks[i] <= ranks[i - 1]:
            errs.append(("action-ranks", "actions[%d].rank" % i, "ranks are unique and ascending"))
    labels = set(FIXED_SOURCES) | set(data["scope"].get("tools", []))
    cited = [("figures[%d]" % i, f) for i, f in enumerate(data["figures"])]
    for name in ("insights", "actions", "evidence"):
        cited += [("%s[%d]" % (name, i), item) for i, item in enumerate(data.get(name, []))]
    cited += [("sections.kpis[%d]" % i, k) for i, k in enumerate(sec.get("kpis", []))]
    for i, c in enumerate(sec.get("creators", [])):
        cited += [("sections.creators[%d].stats[%d]" % (i, j), s) for j, s in enumerate(c.get("stats", []))]
        cited += [("sections.creators[%d].details[%d]" % (i, j), x) for j, x in enumerate(c.get("details", []))]
    for path, item in cited:
        if "source" in item and item["source"] not in labels:
            errs.append(("source-label", path + ".source", "is not Atlas, Brand memory, Web, You, Our read, or a tool in scope.tools"))
    dated = [("footer.updated", data["footer"]["updated"])]
    dated += [("actions[%d].due" % i, a["due"]) for i, a in enumerate(data["actions"])]
    dated += [("decisions[%d].by" % i, d["by"]) for i, d in enumerate(data["decisions"]) if "by" in d]
    for i, f in enumerate(data["footer"]["freshness"]):
        dated += [("footer.freshness[%d].%s" % (i, k), f[k]) for k in ("newest", "fetched", "changed")
                  if f.get(k) not in (None, "none", "unknown")]
    for path, value in dated:
        if not real_date(value):
            errs.append(("dates", path, "%s is not a real date" % value))
    for i, c in enumerate(sec.get("creators", [])):
        if c["verdict"] == "maybe" and "settle" not in c:
            errs.append(("maybe-settle", "sections.creators[%d].settle" % i, "a Maybe carries the question that settles it"))
    for i, p in enumerate(sec.get("posts", [])):
        for k in set(p["metrics"]) & set(p.get("missing", {})):
            errs.append(("post-metrics", "sections.posts[%d].%s" % (i, k), "a metric is shown or missing, never both"))
    for i, it in enumerate(data["insights"][1:], 1):
        if "chart" in it:
            errs.append(("one-chart", "insights[%d].chart" % i, "only the headline insight, the first, carries a chart"))
    for i, it in enumerate(data["insights"]):
        if "chart" in it:
            series = {s["label"] for b in it["chart"]["bars"] for s in b["segments"]}
            if len(series) > CHART_SERIES:
                errs.append(("chart-series", "insights[%d].chart" % i,
                             "a chart has at most %d segment labels, one color each" % CHART_SERIES))
    weights = data.get("method", {}).get("weights")
    if weights and sum(w["percent"] for w in weights) != 100:
        errs.append(("method-weights", "method.weights", "the weights add up to 100"))
    for path, items in (("sections.creators", sec.get("creators", [])), ("sections.posts", sec.get("posts", []))):
        for i, item in enumerate(items):
            if item["account"] not in data["scope"]["accounts"]:
                errs.append(("scope-accounts", "%s[%d].account" % (path, i), "%s is not in scope.accounts" % item["account"]))
    if sec.get("posts") and "question" not in data["scope"]:
        errs.append(("question", "scope.question", "a page that cites posts gives its question code"))
    costs = [("actions[%d].cost" % i, a["cost"]) for i, a in enumerate(data["actions"])]
    costs += [("decisions[%d].cost" % i, d["cost"]) for i, d in enumerate(data["decisions"])]
    for path, cost in costs:
        if cost["kind"] == "unpriced" and not ("missing" in cost and "holder" in cost):
            errs.append(("cost", path, "a cost that cannot be priced names the missing figure and who has it"))
        for key in ("missing", "holder"):
            if key in cost and cost[key].lower() not in cost["line"].lower():
                errs.append(("cost", "%s.%s" % (path, key), "the cost line shows it"))
    fresh = {f["account"] for f in data["footer"]["freshness"]}
    accounts = set(data["scope"]["accounts"]) | {c["account"] for c in sec.get("creators", [])} | {p["account"] for p in sec.get("posts", [])}
    for account in sorted(accounts - fresh):
        errs.append(("freshness", "footer.freshness", "has no entry for %s" % account))
    for account in sorted(fresh - accounts):
        errs.append(("freshness", "footer.freshness", "has an entry for %s, which the page does not cite" % account))
    for i, f in enumerate(data["footer"]["freshness"]):
        if ("fetched" in f) == ("changed" in f):
            errs.append(("freshness", "footer.freshness[%d]" % i, "carries fetched or changed, one of the two"))
        if shared(data) and "note" in f:
            errs.append(("shared-page", "footer.freshness[%d].note" % i, "a page shared outside the team carries no freshness notes"))
    if shared(data) and data["gaps"]:
        errs.append(("shared-page", "gaps", "a page shared outside the team lists no gaps; return them to the main thread"))
    errs += live_rules(data, tpl)
    if not theme_ok(data.get("theme", {}).get("css", "")):
        errs.append(("theme", "theme.css", "holds custom-property declarations only, in plain or @media rules, loading nothing"))
    for i, tool in enumerate(data["scope"].get("tools", [])):
        if ";" in tool:
            errs.append(("source-label", "scope.tools[%d]" % i, "holds no \";\", which separates the tools on the page"))
    # scope.tools entries are the labels the reader sees on source chips, so they are read too.
    named = reader_text(data) + [("scope.tools[%d]" % i, t) for i, t in enumerate(data["scope"].get("tools", []))]
    for path, value in named:
        if any(pattern.search(value) for pattern in INTERNAL) or any(names_tool(w, tools) for w in WORD.findall(value)):
            errs.append(("no-internal-names", path, "names a tool or an id"))
    # Quoted words and names are someone else's and never change: a post's quote, a creator's name,
    # and the brand's own name.
    brand = data["scope"]["brand"].strip()
    for path, value in reader_text(data):
        if path == "scope.brand" or QUOTED.search(path):
            continue
        value = re.sub(r"(?<![\w-])%s(?![\w-])" % re.escape(brand), " ", value) if brand else value
        for pattern, form, instead in phrases:
            if pattern.search(value):
                errs.append(("banned-phrase", path, "uses \"%s\": %s (glossary.md)" % (form, instead)))
    return errs

def live_rules(data, tpl):
    """The live parts (templates.md, section 8): allowed by the template, declared, and consistent."""
    live, errs, sec = data.get("live"), [], data.get("sections", {})
    tagged = [("sections.%s[%d].tags" % (k, i), item) for k in ("creators", "posts")
              for i, item in enumerate(sec.get(k, [])) if "tags" in item]
    if live is None:
        errs += [("live-filters", path, "a card carries tags only on a page with filters") for path, _ in tagged]
        return errs
    parts = [k for k in LIVE_NEEDS if k in live]
    if not parts:
        errs.append(("live-parts", "live", "holds at least one part: team, form, filters, or approvals"))
    for k in parts:
        if k not in tpl.get("live", []):
            errs.append(("live-parts", "live.%s" % k, "a %s page has no %s part" % (tpl["name"], k)))
    caps = live["capabilities"]
    for k in parts:
        for cap in LIVE_NEEDS[k]:
            if cap not in caps:
                errs.append(("live-capabilities", "live.capabilities.%s" % cap, "the %s part needs it declared" % k))
    if "team" in live and "db" in caps:
        db_rules = caps["db"].get("rules", []) if isinstance(caps["db"], dict) else []
        if not any(isinstance(r, dict) and r.get("path") == "team" and r.get("read") in ("admin", "owner") for r in db_rules):
            errs.append(("live-capabilities", "live.capabilities.db.rules", "the team part needs a rule that lets only Editors read team"))
    team = live.get("team", {})
    if "team" in live and not (team.get("tiles") or team.get("tables")):
        errs.append(("live-team", "live.team", "holds at least one tile or table"))
    for kind in ("tiles", "tables"):
        for i, item in enumerate(team.get(kind, [])):
            segments = item["doc"].split("/")
            if segments[0] != "team" or len(segments) % 2:
                errs.append(("live-team", "live.team.%s[%d].doc" % (kind, i), "is a document under team: team, then an odd number of segments"))
    # Everyone sees the team part's words, so they carry no amount; amounts come only from page data.
    for path, value in reader_text(team, "live.team"):
        if AMOUNT.search(value):
            errs.append(("live-team", path, "shows an amount every viewer sees; put it in page data under team"))
    form = live.get("form")
    if form:
        fields = {f["key"]: f for f in form["fields"]}
        if len(fields) != len(form["fields"]):
            errs.append(("live-form", "live.form.fields", "each field has its own key"))
        for i, f in enumerate(form["fields"]):
            if (f["type"] == "select") != ("options" in f):
                errs.append(("live-form", "live.form.fields[%d]" % i, "a select field has options and no other field does"))
        ids = [r["id"] for r in form["rows"]]
        if len(set(ids)) != len(ids):
            errs.append(("live-form", "live.form.rows", "each row has its own id"))
        for i, r in enumerate(form["rows"]):
            for j, v in enumerate(r.get("values", [])):
                f = fields.get(v["key"])
                if f is None:
                    errs.append(("live-form", "live.form.rows[%d].values[%d].key" % (i, j), "is not a field of the form"))
                elif f["type"] == "select" and v["value"] not in f.get("options", []):
                    errs.append(("live-form", "live.form.rows[%d].values[%d].value" % (i, j), "is not one of the field's options"))
                elif f["type"] == "date" and not real_date(v["value"]):
                    errs.append(("live-form", "live.form.rows[%d].values[%d].value" % (i, j), "is not a real date"))
            keys = [v["key"] for v in r.get("values", [])]
            if len(set(keys)) != len(keys):
                errs.append(("live-form", "live.form.rows[%d].values" % i, "gives each field once"))
    filters = live.get("filters")
    if filters:
        facets = [f["key"] for f in filters["facets"]]
        if len(set(facets)) != len(facets):
            errs.append(("live-filters", "live.filters.facets", "each facet has its own key"))
        if not sec.get(filters["target"]):
            errs.append(("live-filters", "live.filters.target", "the page has no %s to filter" % filters["target"]))
        for path, item in tagged:
            if not path.startswith("sections.%s[" % filters["target"]):
                errs.append(("live-filters", path, "only the cards the filters run over carry tags"))
            for j, tag in enumerate(item["tags"]):
                if tag["facet"] not in facets:
                    errs.append(("live-filters", "%s[%d].facet" % (path, j), "is not one of the filters' facets"))
    else:
        errs += [("live-filters", path, "a card carries tags only on a page with filters") for path, _ in tagged]
    approvals = live.get("approvals")
    if approvals:
        ids = [a["id"] for a in approvals["items"]]
        if len(set(ids)) != len(ids):
            errs.append(("live-approvals", "live.approvals.items", "each item has its own id"))
        for i, a in enumerate(approvals["items"]):
            qids = [q["id"] for q in a.get("questions", [])]
            if len(set(qids)) != len(qids):
                errs.append(("live-approvals", "live.approvals.items[%d].questions" % i, "each question has its own id"))
            if "held" in a and a.get("questions"):
                errs.append(("live-approvals", "live.approvals.items[%d]" % i, "a held item asks no questions on the page"))
    return errs

QUOTED = re.compile(r"(?:\.quote|^sections\.creators\[\d+\]\.name)$")

def names_tool(word, tools):
    """A tool name alone or inside a prefixed name such as mcp__atlas__search_posts."""
    low = word.lower()
    return low in tools or any(part in tools for part in low.split("__"))

def css_plain(css):
    """The CSS with comments dropped and every quoted string emptied, read in one pass as a browser
    tokenizes it, so a brace, quote or comment marker inside a string or a comment moves nothing.
    None when a string or a comment is left open."""
    out, i, n = [], 0, len(css)
    while i < n:
        if css.startswith("/*", i):
            end = css.find("*/", i + 2)
            if end < 0:
                return None
            i = end + 2
        elif css[i] in "\"'":
            end = i + 1
            # CSS ends a string at any newline (LF, CR or form feed) as a bad string, so those end it here too.
            while end < n and css[end] not in (css[i], "\n", "\r", "\f"):
                end += 1
            if end >= n or css[end] != css[i]:
                return None
            out.append('""')
            i = end + 1
        else:
            out.append(css[i])
            i += 1
    return "".join(out)

def theme_ok(css):
    """Token rules only: plain rules that set custom properties, optionally inside @media, nothing nested, nothing loaded."""
    if re.search(r"[<\\]|@import|url\s*\(|image-set\s*\(", css, re.I):
        return False
    css = css_plain(css)
    if css is None:
        return False
    stack, start = [], 0
    for i, ch in enumerate(css):
        if ch == "{":
            header = css[start:i].strip()
            # A rule opened inside a rule is CSS nesting, which would carry ordinary declarations.
            if not header or (stack and stack[-1] == "rule"):
                return False
            if header.startswith("@"):
                if stack or not re.match(r"@media\b", header, re.I):
                    return False
                stack.append("media")
            else:
                stack.append("rule")
            start = i + 1
        elif ch == "}":
            if not stack:
                return False
            body = css[start:i]
            if stack.pop() == "rule":
                if not all(re.match(r"\s*--[\w-]+\s*:", decl) for decl in body.split(";") if decl.strip()):
                    return False
            elif body.strip():
                return False
            start = i + 1
    return not stack and not css[start:].strip()

def reader_text(data, path=""):
    """Every string the reader sees, with its path: all of the data but the NOT_READER fields, keeping the source line."""
    if isinstance(data, str):
        return [(path, data)]
    if isinstance(data, list):
        return [t for i, v in enumerate(data) for t in reader_text(v, "%s[%d]" % (path, i))]
    if isinstance(data, dict):
        # A creator's verdict is an enum string; sections.verdict is an object of reader words.
        return [t for k, v in data.items()
                if k not in NOT_READER or (path, k) == ("footer", "source") or (k == "verdict" and not isinstance(v, str))
                for t in reader_text(v, "%s.%s" % (path, k) if path else k)]
    return []

# The glossary fences its list; the fence is built so this script holds none of its own.
FENCE = "`" * 3

def banned_phrases(glossary):
    """The banned-phrase list in glossary.md, read the way the page check reads it: whole words, any case."""
    block = re.search(r"^<!-- banned-phrases -->\n%stext\n(.*?)\n%s\n<!-- /banned-phrases -->$" % (FENCE, FENCE), glossary, re.S | re.M)
    if not block:
        raise ValueError("glossary.md has no banned-phrases block")
    found = []
    for line in block.group(1).splitlines():
        forms, _, instead = line.partition("|")
        for form in (f.strip() for f in forms.split(",") if f.strip()):
            words = r"\s+".join(re.escape(w).replace("'", "['\u2019]") for w in form.split())
            found.append((re.compile(r"(?i)(?<![\w-])%s(?![\w-])" % words), form, instead.strip()))
    return found

def tool_names(page_check):
    m = re.search(r'^TOOLS = frozenset\("""\n(.*?)\n"""\.split\(\)\)', page_check, re.S | re.M)
    if not m:
        raise ValueError("page-check.md has no TOOLS list")
    return frozenset(m.group(1).split())

# ---- Words and numbers as the page shows them.
def num(value):
    if isinstance(value, str):
        return value
    if isinstance(value, float) and not math.isfinite(value):
        # Validation keeps these out of the data; a sum computed after it (a chart total) still could.
        return "not available"
    if isinstance(value, int) or value.is_integer():
        return "{:,}".format(int(value))
    # Six decimals drop the noise a difference of larger figures carries (100000.1 - 100000); a value
    # smaller than that keeps its own digits (0.00000004).
    value = round(value, 6) or value
    # Twelve significant digits drop the noise of sums and small differences (0.1 + 0.2, 2.3 - 2.2).
    # A whole part of 12 to 14 digits keeps every whole digit and one decimal; 15 or more rounds to
    # fifteen significant digits, a double's exact range. A Decimal keeps fixed point: 0.00004, not 4e-05.
    whole = len(str(int(abs(value))))
    rounded = Decimal("%.*g" % (min(15, max(12, whole + 1)), value))
    if rounded == rounded.to_integral_value():
        return "{:,}".format(int(rounded))
    return format(rounded, ",f")

def day(value, year):
    d = date.fromisoformat(value)
    shown = "%s %d" % (MONTHS[d.month - 1], d.day)
    return shown if d.year == year else "%s, %d" % (shown, d.year)

def handle(account):
    network, name = account.split(":", 1)
    return "@" + name, NETWORKS[network]

def chip(text, cls=""):
    return '<span class="pb-chip%s">%s</span>' % (" " + cls if cls else "", e(text))

def source_chip(label):
    return '<span class="pb-chip pb-src" title="Source">%s</span>' % e(label)

# ---- The blocks (blocks.md, section 3), filled from the data.
def coverage(data, block):
    items = []
    for p in data["scope"]["platforms"]:
        name = NETWORKS[p["network"]]
        if p["posts"]:
            items.append('<li><span class="pb-chip" data-platform="%s" data-posts="%d">%s <b>%s</b> posts</span></li>'
                         % (p["network"], p["posts"], name, num(p["posts"])))
        elif not shared(data):
            note = (" " + e(p["note"])) if block and p.get("note") else ""
            items.append('<li><span class="pb-chip pb-gap" data-platform="%s" data-posts="0">%s not covered.%s</span></li>'
                         % (p["network"], name, note))
    attr = ' data-block="coverage"' if block else ""
    return '<ul class="pb-coverage"%s>%s</ul>' % (attr, "".join(items))

def scope(data):
    s = data["scope"]
    attrs = ['class="pb-scope"', 'data-page="scope"', 'data-block="scope"']
    if "question" in s:
        attrs.append('data-question="%s"' % e(s["question"]))
    attrs.append('data-accounts="%s"' % e(" ".join(s["accounts"])))
    attrs += ['data-reader="%s"' % e(s["reader"]), 'data-brand="%s"' % e(s["brand"]), 'data-range="%s"' % e(s["range"])]
    if s.get("na"):
        attrs.append('data-na="%s"' % " ".join(s["na"]))
    if s.get("tools"):
        attrs.append('data-tools="%s"' % e("; ".join(s["tools"])))
    by = '<span class="pb-muted">Prepared by %s</span>' % e(s["preparedBy"]) if "preparedBy" in s else ""
    return ('<div %s><p class="pb-scope-line"><span>For <b>%s</b></span><span><b>%s</b></span><span>%s</span>%s</p>%s</div>'
            % (" ".join(attrs), e(s["reader"]), e(s["brand"]), e(s["range"]), by, coverage(data, True)))

def kpi(item):
    status = item.get("status", "flat")
    src = '<p class="pb-kpi-src">%s</p>' % source_chip(item["source"]) if "source" in item else ""
    said = ' data-source="%s"' % e(item["source"]) if "source" in item else ""
    return ('<article class="pb-card pb-kpi" data-block="kpi" data-status="%s"%s><p class="pb-label">%s</p>'
            '<p class="pb-kpi-value pb-num">%s</p><p class="pb-kpi-vs" data-vs><span class="pb-kpi-dot pb-%s"></span>%s</p>%s</article>'
            % (status, said, e(item["label"]), e(num(item["value"])), status, e(item["comparison"]), src))

def verdict_badge(v):
    checks = ""
    if v.get("checks"):
        rows = "".join('<li>%s <b>%s</b> <span class="pb-muted">%s</span></li>'
                       % (chip(CHECK_WORDS[c["status"]], "pb-" + c["status"]), e(c["label"]), e(c["note"])) for c in v["checks"])
        checks = '<ul class="pb-checks">%s</ul>' % rows
    return ('<div class="pb-badge pb-%s" data-block="verdict-badge" data-verdict="%s"><b class="pb-badge-call">%s</b><span>%s</span></div>%s'
            % (v["status"], e(v["status"]), e(v["call"]), e(v["reason"]), checks))

def answer(data):
    sec = data.get("sections", {})
    parts = ["<h1>%s</h1>" % e(data["answer"])]
    if "takeaway" in data:
        parts.append("<p>%s</p>" % e(data["takeaway"]))
    creators = sec.get("creators", [])
    if data["template"] == "shortlist" and creators:
        counts = [(k, sum(1 for c in creators if c["verdict"] == k)) for k in VERDICTS]
        counts = [(k, n) for k, n in counts if n]
        label = ", ".join("%d %s" % (n, VERDICTS[k][1].lower()) for k, n in counts)
        bar = "".join('<span class="%s" style="flex:%d"></span>' % (VERDICTS[k][0], n) for k, n in counts)
        links = "".join('<li><a href="#%s"><b class="pb-num">%d</b> %s</a></li>' % (k, n, e(group_name(data, k).lower())) for k, n in counts)
        parts.append('<div class="pb-tally"><div class="pb-bar" role="img" aria-label="%s">%s</div><ul>%s</ul></div>' % (label, bar, links))
    out = ['<header class="pb-answer" data-block="answer">%s</header>' % "".join(parts)]
    if "verdict" in sec:
        out.append(verdict_badge(sec["verdict"]))
    tiles = data["figures"] + sec.get("kpis", [])
    if tiles:
        out.append('<div class="pb-grid pb-kpis">%s</div>' % "".join(kpi(t) for t in tiles))
    return "".join(out)

def chart(c):
    names = []
    for bar in c["bars"]:
        for s in bar["segments"]:
            if s["label"] not in names:
                names.append(s["label"])
    top = max(sum(s["value"] for s in b["segments"]) for b in c["bars"]) or 1
    unit = (" " + c["unit"]) if "unit" in c else ""
    rows, said = [], []
    for i, bar in enumerate(c["bars"]):
        y, x = 8 + i * 34, 120.0
        total = sum(s["value"] for s in bar["segments"])
        rows.append('<text x="0" y="%d">%s</text>' % (y + 16, e(bar["label"])))
        for s in bar["segments"]:
            w = 240.0 * s["value"] / top
            rows.append('<rect x="%.1f" y="%d" width="%.1f" height="22" fill="var(--chart-%d)"/>' % (x, y, w, names.index(s["label"]) % 6 + 1))
            x += w
        rows.append('<text x="%.1f" y="%d">%s</text>' % (x + 6, y + 16, e(num(total))))
        said.append("%s: %s" % (bar["label"], ", ".join("%s %s%s" % (s["label"], num(s["value"]), unit) for s in bar["segments"])))
    legend = "".join('<li><span class="pb-swatch" style="background:var(--chart-%d)"></span>%s</li>' % (i % 6 + 1, e(n)) for i, n in enumerate(names))
    return ('<svg class="pb-stack" viewBox="0 0 440 %d" role="img" aria-label="%s"><title>%s</title>%s</svg><ul class="pb-legend">%s</ul>'
            % (16 + 34 * len(c["bars"]), e("; ".join(said)), e(c["title"]), "".join(rows), legend))

def insights(data):
    if not data["insights"]:
        return '<section class="pf-part"><h2 class="pb-h">What we found</h2><p>No insights on this page.</p></section>'
    cards = []
    for i, it in enumerate(data["insights"], 1):
        cards.append('<article class="pb-card pb-insight" data-block="insight" data-source="%s"><p class="pb-label">Insight %d %s</p>'
                     '<p class="pb-claim">%s</p><dl><dt>Evidence</dt><dd>%s</dd><dt>Compared with</dt><dd data-vs>%s</dd></dl>%s'
                     '<p class="pb-so"><b>So:</b> %s</p></article>'
                     % (e(it["source"]), i, source_chip(it["source"]), e(it["text"]), e(it["evidence"]), e(it["comparison"]),
                        chart(it["chart"]) if "chart" in it else "", e(it["so"])))
    return '<section class="pf-part"><h2 class="pb-h">What we found</h2><div class="pb-grid">%s</div></section>' % "".join(cards)

def cost_attrs(cost):
    out = ' data-cost="%s"' % cost["kind"]
    for key, attr in (("period", "data-cost-period"), ("missing", "data-cost-missing"), ("holder", "data-cost-holder")):
        if key in cost:
            out += ' %s="%s"' % (attr, e(cost[key]))
    return out

def job_words(job):
    return job.replace("-", " ").capitalize()

def actions(data, year):
    rows = []
    for a in data["actions"]:
        first = " data-first-task" if a.get("first") else ""
        rows.append('<tr data-recommend%s%s data-owner="%s" data-source="%s"><td data-label="Rank" class="pb-rank">%d</td>'
                    '<td data-label="What">%s %s %s</td><td data-label="Who">%s</td><td data-label="By when">%s</td>'
                    '<td data-label="What it should change">%s</td><td data-label="Atlas can do it">%s</td>'
                    '<td data-label="Cost" data-cost-line>%s</td></tr>'
                    % (cost_attrs(a["cost"]), first, e(a["owner"]), e(a["source"]), a["rank"], e(a["verb"]), e(a["object"]), source_chip(a["source"]),
                       e(a["owner"]), day(a["due"], year), e(a["effect"]), e(job_words(a["job"])), e(a["cost"]["line"])))
    table = ('<table class="pb-table"><thead><tr><th>#</th><th>What</th><th>Who</th><th>By when</th>'
             '<th>What it should change</th><th>Atlas can do it</th><th>Cost</th></tr></thead><tbody>%s</tbody></table>' % "".join(rows))
    out = '<section class="pb-card" data-page="next-steps" data-block="next-steps"><h2 class="pb-h">Next steps</h2>%s</section>' % table
    steps = data.get("sections", {}).get("steps")
    if steps:
        items = "".join('<li><span class="pb-tc">%s</span><span>%s%s</span></li>'
                        % (e(s["when"]), e(s["what"]), (" " + e(s["who"]) + ".") if "who" in s else "") for s in steps)
        out += '<section class="pf-part"><h2 class="pb-h">When it happens</h2><ol class="pb-timeline" data-block="timeline">%s</ol></section>' % items
    return out

def decisions(data, year):
    if not data["decisions"]:
        return ('<section class="pb-card pb-decisions" data-page="decisions" data-block="decisions">'
                '<h2 class="pb-h">Decisions</h2><p>Nothing needs approval.</p></section>')
    items = []
    for d in data["decisions"]:
        by = ' data-by="%s"' % d["by"] if "by" in d else ""
        due = '<span class="pb-due">by %s</span>' % day(d["by"], year) if "by" in d else "<span></span>"
        items.append('<li data-decision%s data-recommend%s><span>%s</span>%s'
                     '<span class="pb-meta">Approves: %s. Once approved: %s</span><span class="pb-meta" data-cost-line>%s</span></li>'
                     % (by, cost_attrs(d["cost"]), e(d["text"]), due, e(d["approver"]), e(d["then"]), e(d["cost"]["line"])))
    return ('<section class="pb-card pb-decisions" data-page="decisions" data-block="decisions">'
            '<h2 class="pb-h">Decisions for you</h2><ol>%s</ol></section>' % "".join(items))

def group_name(data, verdict):
    return data.get("groups", {}).get(verdict, VERDICTS[verdict][2])

def creator(c):
    name, network = handle(c["account"])
    cls, word, _ = VERDICTS[c["verdict"]]
    stats = "".join('<span>%s <b>%s</b>%s</span>' % (e(s["label"]), e(s["value"]), (" (%s)" % e(s["source"])) if "source" in s else "")
                    for s in c.get("stats", []))
    head = []
    if "image" in c:
        head.append('<img class="pb-avatar" src="%s" alt="%s" width="56" height="56" decoding="async" loading="lazy">' % (c["image"], e(c.get("alt", "Profile picture of " + name))))
    head.append('<p><a href="%s">%s</a> <span class="pb-muted">on %s%s</span>%s</p>'
                % (e(c["href"]), e(name), network, (", " + '<span data-quoted>%s</span>' % e(c["name"])) if "name" in c else "",
                   (" " + chip(c["group"])) if "group" in c else ""))
    if "score" in c:
        sc = c["score"]
        head.append('<span class="pb-ring" style="--v:%d" role="img" aria-label="%s %d out of 100"><b>%d</b><span>%s</span></span>'
                    % (sc["value"], e(sc["label"]), sc["value"], sc["value"], e(sc["label"])))
    parts = ['<div class="pb-creator-head">%s</div>' % "".join(head)]
    parts.append('<div class="pb-verdict" data-block="creator" data-verdict="%s" data-account="%s"><p>%s %s</p>'
                 % (c["verdict"], e(c["account"]), chip(word, cls), e(c["reason"])))
    if "checks" in c:
        parts.append('<p class="pb-muted">Checks reached: %s</p>' % e(c["checks"]))
    if stats:
        parts.append('<p class="pb-stats">%s</p>' % stats)
    if c.get("details"):
        parts.append('<dl class="pb-details">%s</dl>' % "".join(
            '<dt>%s</dt><dd>%s%s</dd>' % (e(x["label"]), e(x["value"]), (" " + source_chip(x["source"])) if "source" in x else "")
            for x in c["details"]))
    if "settle" in c:
        parts.append("<p><b>To settle it:</b> %s</p>" % e(c["settle"]))
    parts.append("</div>")
    if c.get("thumbs"):
        parts.append('<div class="pb-thumbs">%s</div>' % "".join(
            '<a href="%s"><img src="%s" alt="%s" width="80" height="80" decoding="async" loading="lazy"></a>' % (e(t["href"]), t["image"], e(t.get("alt", "A post by " + name)))
            for t in c["thumbs"]))
    return '<article class="pb-card pb-creator"%s>%s</article>' % (tags_attr(c), "".join(parts))

def post(p):
    name, network = handle(p["account"])
    missing = p.get("missing", {})
    attr = ' data-missing="%s"' % e("; ".join("%s: %s" % (k, v) for k, v in missing.items())) if missing else ""
    stats = []
    for key, label in METRICS:
        if key in p["metrics"]:
            value = num(p["metrics"][key])
            shown = "%s <b>%s</b> per 1,000 views" % (label, value) if key == "engagement" else "%s <b>%s</b>" % (label, value)
            if key == "views" and "usual" in p:
                shown += " (%s)" % e(p["usual"])
            stats.append('<span data-metric="%s">%s</span>' % (key, shown))
    body = ['<p><a href="%s">%s on %s</a> <span class="pb-muted">%s</span></p>' % (e(p["href"]), e(name), network, e(p["postedAt"]))]
    if stats:
        body.append('<p class="pb-stats">%s</p>' % "".join(stats))
    body += ['<p class="pb-na">%s not available: %s</p>' % (dict(METRICS)[k], e(v)) for k, v in missing.items()]
    if "why" in p:
        body.append("<p>%s</p>" % e(p["why"]))
    if "quote" in p:
        body.append("<p data-quoted>&quot;%s&quot;</p>" % e(p["quote"]))
    img = ('<img src="%s" alt="%s" width="96" height="171">' % (p["image"], e(p.get("alt", "")))) if "image" in p else ""
    return ('<article class="pb-card pb-post" data-block="post" data-account="%s" data-post="%s"%s%s>%s<div class="pb-post-body">%s</div></article>'
            % (e(p["account"]), e(p["href"]), attr, tags_attr(p), img, "".join(body)))

def evidence(data):
    sec, out = data.get("sections", {}), []
    creators = sec.get("creators", [])
    if creators and data["template"] == "shortlist":
        for k in VERDICTS:
            group = [c for c in creators if c["verdict"] == k]
            if group:
                out.append('<h3 class="pb-h" id="%s">%s</h3><div class="pb-grid">%s</div>' % (k, e(group_name(data, k)), "".join(creator(c) for c in group)))
    elif creators:
        out.append(filter_bar(data, "creators") + '<div class="pb-grid" data-live-cards="creators">%s</div>' % "".join(creator(c) for c in creators))
    if sec.get("posts"):
        out.append(filter_bar(data, "posts") + '<div class="pb-grid" data-live-cards="posts">%s</div>' % "".join(post(p) for p in sec["posts"]))
    if data.get("evidence"):
        items = "".join('<li data-source="%s">%s %s</li>' % (e(v["source"]), ('<a href="%s">%s</a>' % (e(v["href"]), e(v["text"]))) if "href" in v else e(v["text"]), source_chip(v["source"]))
                        for v in data["evidence"])
        out.append('<ul class="pf-evidence">%s</ul>' % items)
    if not out:
        return ""
    return '<section class="pf-part"><h2 class="pb-h">The evidence</h2>%s</section>' % "".join(out)

def method(data):
    m, parts = data.get("method", {}), ['<h2 class="pb-h">How this was worked out</h2>', coverage(data, False)]
    if m.get("weights"):
        parts.append('<p class="pb-label">Scoring weights</p><ul class="pb-weights">%s</ul>' % "".join(
            '<li><span>%s<span class="pb-bar"><span style="width:%d%%"></span></span></span><span class="pb-num">%d%%</span></li>'
            % (e(w["label"]), w["percent"], w["percent"]) for w in m["weights"]))
    parts += ["<p>%s</p>" % e(n) for n in m.get("notes", [])]
    parts.append('<p class="pb-label">Sources</p><ol class="pb-sources">%s</ol>' % "".join(
        '<li id="src-%d">%s</li>' % (i, e(s)) for i, s in enumerate(data["sources"], 1)))
    return '<section class="pb-card pb-method" data-page="method" data-block="method">%s</section>' % "".join(parts)

def gaps(data):
    c = data["confidence"]
    items = []
    for g in data["gaps"]:
        head, _, rest = g.partition(": ")
        items.append("<li><b>%s</b>%s</li>" % (e(head), ('<span class="pb-muted">%s</span>' % e(rest[:1].upper() + rest[1:])) if rest else ""))
    if shared(data):
        listed, heading = "", "How sure we are"
    else:
        listed = "<ul>%s</ul>" % "".join(items) if items else "<p>Nothing is missing that would change this page.</p>"
        heading = "What\'s missing, and how sure we are"
    return ('<section class="pb-card pb-missing" data-block="missing"><h2 class="pb-h">%s</h2>%s'
            '<p class="pb-confidence" data-confidence="%s">%s %s</p></section>'
            % (heading, listed, c["level"], chip("Confidence: " + c["level"], CONFIDENCE[c["level"]]), e(c["why"])))

def drafts(data):
    if not data.get("drafts"):
        return ""
    items = "".join("<li><span>%s</span>%s</li>" % (e(d["draft"]), chip(d["waitsOn"])) for d in data["drafts"])
    return ('<section class="pb-card pb-draft" data-block="draft-next"><h2 class="pb-h">What Atlas can draft next</h2>'
            '<ul>%s</ul><p class="pb-muted">Nothing is sent without your approval.</p></section>' % items)

# ---- The live parts (templates.md, section 8). Each prints a fallback that reads right with no
# runtime; LIVE_SCRIPT lights it up when the page's capabilities answer.
def tags_attr(item):
    if "tags" not in item:
        return ""
    return ' data-tags="%s"' % e(json.dumps([[t["facet"], t["value"]] for t in item["tags"]]))

def filter_bar(data, target):
    f = data.get("live", {}).get("filters")
    if not f or f["target"] != target:
        return ""
    values = {}
    for item in data["sections"][target]:
        for tag in item.get("tags", []):
            values.setdefault(tag["facet"], [])
            if tag["value"] not in values[tag["facet"]]:
                values[tag["facet"]].append(tag["value"])
    controls = []
    for facet in f["facets"]:
        opts = "".join('<option value="%s">%s</option>' % (e(v), e(v)) for v in sorted(values.get(facet["key"], []), key=str.lower))
        controls.append('<label>%s <select data-live-facet="%s"><option value="">All</option>%s</select></label>'
                        % (e(facet["label"]), e(facet["key"]), opts))
    if f.get("search"):
        controls.append('<label>Search <input type="search" data-live-search maxlength="80"></label>')
    return ('<div class="pf-filters" data-live="filters" hidden>%s<span class="pb-muted" data-live-count></span></div>'
            % "".join(controls))

def team_part(data):
    team = data.get("live", {}).get("team")
    if not team:
        return ""
    fallback = e(team.get("fallback", "Team view"))
    out = ['<h2 class="pb-h">Team view</h2><p class="pb-muted">Only Editors see these values.</p>']
    tiles = []
    for i, t in enumerate(team.get("tiles", [])):
        src = '<p class="pb-kpi-src">%s</p>' % source_chip(t["source"]) if "source" in t else ""
        said = ' data-source="%s"' % e(t["source"]) if "source" in t else ""
        tiles.append('<article class="pb-card pb-kpi" data-block="kpi" data-status="flat" data-live-tile="%d"%s><p class="pb-label">%s</p>'
                     '<p class="pb-kpi-value pb-num" data-live-value>%s</p><p class="pb-kpi-vs" data-vs><span class="pb-kpi-dot pb-flat"></span>%s'
                     '<span data-live-vs></span></p>%s</article>' % (i, said, e(t["label"]), fallback, e(t["comparison"]), src))
    if tiles:
        out.append('<div class="pb-grid pb-kpis">%s</div>' % "".join(tiles))
    for i, t in enumerate(team.get("tables", [])):
        head = "".join("<th>%s</th>" % e(c["label"]) for c in t["columns"])
        out.append('<h3 class="pb-h">%s</h3><table class="pb-table" data-live-table="%d"><thead><tr>%s</tr></thead>'
                   '<tbody><tr><td colspan="%d">%s</td></tr></tbody></table>' % (e(t["title"]), i, head, len(t["columns"]), fallback))
    return '<section class="pb-card pf-live" data-block="team" data-live="team">%s</section>' % "".join(out)

def approvals_part(data):
    a = data.get("live", {}).get("approvals")
    if not a:
        return ""
    items = []
    for i, item in enumerate(a["items"]):
        parts = ["<p><b>%s</b></p>" % e(item["text"])]
        if "held" in item:
            parts.append("<p>%s %s</p>" % (chip("Do this in a session", "pb-warn"), e(item["held"])))
            items.append('<li data-live-item="%d" data-held>%s</li>' % (i, "".join(parts)))
            continue
        for q in item.get("questions", []):
            kind = "checkbox" if q.get("multi") else "radio"
            opts = "".join('<label><input type="%s" name="q%d-%s" value="%s" disabled> %s</label>'
                           % (kind, i, e(q["id"]), e(o), e(o)) for o in q["options"])
            parts.append('<fieldset data-live-question="%s"%s><legend>%s</legend>%s</fieldset>'
                         % (e(q["id"]), " data-multi" if q.get("multi") else "", e(q["text"]), opts))
        parts.append('<label class="pf-changes">Changes to ask for <textarea data-live-changes maxlength="600" rows="2" disabled></textarea></label>')
        buttons = "".join('<button type="button" data-verdict="%s" disabled>%s</button>' % (v, w) for v, w in
                          (("approve", "Approve"), ("not-now", "Not now"), ("session", "Do this in a session"), ("revise", "Ask for changes")))
        parts.append('<div class="pf-buttons">%s</div><p class="pb-muted" data-live-status>Editors decide here once the page has loaded.</p>' % buttons)
        items.append('<li data-live-item="%d">%s</li>' % (i, "".join(parts)))
    return ('<section class="pb-card pf-live" data-block="approvals" data-live="approvals"><h2 class="pb-h">Approve on this page</h2>'
            '<ol class="pf-approvals">%s</ol></section>' % "".join(items))

def form_part(data):
    f = data.get("live", {}).get("form")
    if not f:
        return ""
    head = "<th>Item</th>" + "".join("<th>%s</th>" % e(x["label"]) for x in f["fields"])
    rows = []
    for r in f["rows"]:
        values = {v["key"]: v["value"] for v in r.get("values", [])}
        cells = "".join('<td data-label="%s" data-live-key="%s"><span data-live-text>%s</span></td>'
                        % (e(x["label"]), e(x["key"]), e(values.get(x["key"], ""))) for x in f["fields"])
        rows.append('<tr data-live-row="%s"><td data-label="Item">%s</td>%s</tr>' % (e(r["id"]), e(r["label"]), cells))
    if not rows:
        rows.append('<tr><td colspan="%d">%s</td></tr>' % (len(f["fields"]) + 1, e(f.get("empty", "Nothing to fill in yet."))))
    note = "<p>%s</p>" % e(f["note"]) if "note" in f else ""
    return ('<section class="pb-card pf-live" data-block="form" data-live="form"><h2 class="pb-h">%s</h2>%s'
            '<table class="pb-table pf-form"><thead><tr>%s</tr></thead><tbody>%s</tbody></table>'
            '<p class="pb-muted" data-live-status>Contributors fill this in once the page has loaded.</p></section>'
            % (e(f["title"]), note, head, "".join(rows)))

def live_script(data):
    live = data.get("live")
    if not live:
        return ""
    config = {k: v for k, v in live.items() if k != "capabilities"}
    # JSON inside a script stays JSON; every < is written as < so it cannot close the tag.
    return ('<script type="application/json" id="pf-live">%s</script><script>%s</script>'
            % (json.dumps(config).replace("<", "\\u003c"), LIVE_SCRIPT))

LIVE_SCRIPT = """
(function () {
  "use strict";
  var cfg = JSON.parse(document.getElementById("pf-live").textContent);
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pick(obj, path) {
    return path.split(".").reduce(function (o, k) { return o && typeof o === "object" ? o[k] : undefined; }, obj);
  }
  function shown(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "number") return isFinite(v) ? v.toLocaleString("en-US", {maximumFractionDigits: 2}) : "";
    if (typeof v === "string" || typeof v === "boolean") return String(v);
    return "";
  }
  function use(name) {
    return window.claude && window.claude.use ? window.claude.use(name).catch(function () { return null; }) : Promise.resolve(null);
  }

  // Filters: run on the cards in the page; no capability.
  if (cfg.filters) {
    var bar = document.querySelector("[data-live=filters]");
    var cards = all("[data-live-cards=" + cfg.filters.target + "] > article");
    var count = bar && bar.querySelector("[data-live-count]");
    var apply = function () {
      var want = {}, q = "", n = 0;
      all("[data-live-facet]", bar).forEach(function (s) { if (s.value) want[s.dataset.liveFacet] = s.value; });
      var box = bar.querySelector("[data-live-search]");
      if (box) q = box.value.trim().toLowerCase();
      cards.forEach(function (c) {
        var tags = [];
        try { tags = JSON.parse(c.dataset.tags || "[]"); } catch (err) { tags = []; }
        var ok = Object.keys(want).every(function (f) { return tags.some(function (t) { return t[0] === f && t[1] === want[f]; }); });
        if (ok && q) ok = c.textContent.toLowerCase().indexOf(q) >= 0;
        c.hidden = !ok;
        if (ok) n += 1;
      });
      if (count) count.textContent = "Showing " + n + " of " + cards.length;
      var params = new URLSearchParams();
      Object.keys(want).forEach(function (f) { params.set(f, want[f]); });
      if (q) params.set("q", q);
      var hash = params.toString();
      if (("#" + hash) !== location.hash && (hash || location.hash)) history.replaceState(null, "", hash ? "#" + hash : location.pathname + location.search);
    };
    if (bar) {
      var start = new URLSearchParams(location.hash.slice(1));
      all("[data-live-facet]", bar).forEach(function (s) {
        var v = start.get(s.dataset.liveFacet);
        if (v && all("option", s).some(function (o) { return o.value === v; })) s.value = v;
        s.addEventListener("change", apply);
      });
      var box = bar.querySelector("[data-live-search]");
      if (box) { box.value = start.get("q") || ""; box.addEventListener("input", apply); }
      bar.hidden = false;
      apply();
    }
  }

  if (!cfg.team && !cfg.form && !cfg.approvals) return;
  Promise.all([use("db"), use("user")]).then(function (got) {
    var db = got[0], user = got[1];
    if (!db || !user) {
      all("[data-live=form] [data-live-status], [data-live=approvals] [data-live-status]").forEach(function (s) {
        s.textContent = "Open this page in Claude, signed in, to make changes here.";
      });
    }
    if (!db) return;

    // Team view: Editors' reads return; everyone else keeps the fallback.
    if (cfg.team) {
      (cfg.team.tiles || []).forEach(function (t, i) {
        var tile = document.querySelector("[data-live-tile='" + i + "']");
        db.doc(t.doc).get().then(function (snap) {
          var body = snap.exists ? snap.data() : undefined;
          var v = body ? shown(pick(body, t.field)) : "";
          if (!v) return;
          tile.querySelector("[data-live-value]").textContent = v;
          if (t.vsField) {
            var vs = shown(pick(body, t.vsField));
            if (vs) tile.querySelector("[data-live-vs]").textContent = ": " + vs;
          }
        }).catch(function () {});
      });
      (cfg.team.tables || []).forEach(function (t, i) {
        var body = document.querySelector("[data-live-table='" + i + "'] tbody");
        db.doc(t.doc).get().then(function (snap) {
          var rows = snap.exists ? pick(snap.data(), t.field) : undefined;
          if (!Array.isArray(rows)) return;
          body.textContent = "";
          if (!rows.length) {
            var tr = body.insertRow(), td = tr.insertCell();
            td.colSpan = t.columns.length;
            td.textContent = t.empty || "Nothing here.";
            return;
          }
          rows.forEach(function (row) {
            var tr = body.insertRow();
            t.columns.forEach(function (c) {
              var td = tr.insertCell();
              td.dataset.label = c.label;
              td.textContent = shown(pick(row, c.field));
            });
          });
        }).catch(function () {});
      });
    }

    if (!user) return;
    var stamp = function () { return new Date().toISOString(); };

    // The form: one write per change, only for viewers who may write.
    if (cfg.form) {
      var section = document.querySelector("[data-live=form]");
      var status = section.querySelector("[data-live-status]");
      Promise.all([user.can("data.write"), user.id()]).then(function (r) {
        var canWrite = r[0], uid = r[1];
        var coll = db.collection(cfg.form.collection);
        var inputs = {};
        if (canWrite !== false && uid) {
          all("[data-live-row]", section).forEach(function (tr) {
            var id = tr.dataset.liveRow;
            inputs[id] = {};
            cfg.form.fields.forEach(function (f) {
              var cell = tr.querySelector("[data-live-key='" + f.key + "']");
              var text = cell.querySelector("[data-live-text]");
              var input;
              if (f.type === "select") {
                input = document.createElement("select");
                [""].concat(f.options).forEach(function (o) {
                  var opt = document.createElement("option");
                  opt.value = o; opt.textContent = o || "Choose";
                  input.appendChild(opt);
                });
              } else {
                input = document.createElement("input");
                input.type = f.type === "date" ? "date" : "text";
                input.maxLength = 200;
              }
              input.value = text.textContent;
              input.setAttribute("aria-label", f.label);
              input.addEventListener("change", function () {
                var patch = {updatedBy: uid, updatedAt: stamp()};
                patch[f.key] = input.value;
                var ref = coll.doc(id);
                status.textContent = "Saving...";
                ref.update(patch).catch(function () { return ref.set(patch); }).then(function () {
                  status.textContent = "Saved.";
                }, function () { status.textContent = "Not saved: you may not have edit access."; });
              });
              cell.replaceChild(input, text);
              inputs[id][f.key] = input;
            });
          });
          status.textContent = "Changes save as you make them.";
        } else {
          status.textContent = "Ask for Contributor access to fill this in.";
        }
        coll.onSnapshot(function (snap) {
          snap.docs.forEach(function (d) {
            var tr = section.querySelector("[data-live-row='" + CSS.escape(d.id) + "']");
            if (!tr) return;
            var body = d.data() || {};
            cfg.form.fields.forEach(function (f) {
              if (!(f.key in body)) return;
              var v = shown(body[f.key]);
              var input = inputs[d.id] && inputs[d.id][f.key];
              if (input) { if (document.activeElement !== input) input.value = v; }
              else { var cell = tr.querySelector("[data-live-key='" + f.key + "'] [data-live-text]"); if (cell) cell.textContent = v; }
            });
          });
        }, function () {});
      });
    }

    // Approvals: each Editor's decision is saved under their own id.
    if (cfg.approvals) {
      Promise.all([user.canEdit(), user.id()]).then(function (r) {
        var canEdit = r[0], uid = r[1];
        cfg.approvals.items.forEach(function (item, i) {
          var li = document.querySelector("[data-live-item='" + i + "']");
          if (item.held || !li) return;
          var status = li.querySelector("[data-live-status]");
          if (!canEdit || !uid) { status.textContent = "Only Editors decide on this page."; return; }
          var ref = db.doc(cfg.approvals.collection + "/" + uid + "/actions/" + item.id);
          all("input, textarea, button", li).forEach(function (el) { el.disabled = false; });
          status.textContent = "Not decided yet.";
          ref.get().then(function (snap) {
            if (!snap.exists) return;
            var d = snap.data();
            status.textContent = d.fingerprint === item.fingerprint ? "You chose: " + shown(d.verdict) + "."
              : "Changed since you decided. Decide again.";
          }).catch(function () {});
          all("[data-verdict]", li).forEach(function (b) {
            b.addEventListener("click", function () {
              var answers = {};
              all("[data-live-question]", li).forEach(function (fs) {
                var picked = all("input:checked", fs).map(function (x) { return x.value; });
                answers[fs.dataset.liveQuestion] = fs.hasAttribute("data-multi") ? picked : (picked[0] || "");
              });
              var decision = {verdict: b.dataset.verdict, fingerprint: item.fingerprint, answers: answers, updatedAt: stamp()};
              if (b.dataset.verdict === "revise") {
                var text = li.querySelector("[data-live-changes]").value.trim();
                if (!text) { status.textContent = "Type the changes to ask for first."; return; }
                decision.changes = text;
              }
              status.textContent = "Saving...";
              ref.set(decision).then(function () { status.textContent = "You chose: " + decision.verdict + "."; },
                                     function () { status.textContent = "Not saved: only Editors decide on this page."; });
            });
          });
        });
      });
    }
  });
})();
"""

def footer(data, year):
    f, entries = data["footer"], []
    for x in f["freshness"]:
        name, network = handle(x["account"])
        attrs = 'data-fresh="%s" data-newest="%s"' % (e(x["account"]), x["newest"])
        newest = "no posts in Atlas" if x["newest"] == "none" else "newest post " + day(x["newest"], year)
        if "changed" in x:
            attrs += ' data-changed="%s"' % x["changed"]
            when = "last changed " + day(x["changed"], year)
        else:
            attrs += ' data-fetched="%s"' % x["fetched"]
            when = {"none": "not fetched by Atlas yet", "unknown": "freshness unknown"}.get(x["fetched"]) or "last fetched " + day(x["fetched"], year)
        note = " (%s)" % e(x["note"]) if "note" in x else ""
        entries.append("<span %s>%s on %s: %s, %s%s</span>" % (attrs, e(name), network, newest, when, note))
    lines = ['<p data-block="freshness" data-freshness>Data freshness: %s.</p>' % "; ".join(entries)] if entries else []
    lines += ["<p>%s</p>" % e(n) for n in f.get("notes", [])]
    lines.append("<p>%s</p>" % e(f["source"]))
    return '<footer class="atlas-footnote" data-updated="%s">%s</footer>' % (e(f["updated"]), "".join(lines))

FRAME = """<style>
/* The template frame (page-fill.md). Colors come only from the tokens. */
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 var(--font-body)}
.pf-page{max-width:1080px;margin:0 auto;padding:20px 16px 40px;display:grid;gap:20px}
.pf-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between}
.pf-head .pb-label{margin:0}
.pf-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.pf-mark{flex:none;width:40px;height:40px;border:1px solid var(--border);border-radius:8px;overflow:hidden}
.pf-mark svg{display:block;width:100%;height:100%}
.pf-part{display:grid;gap:12px}
.pf-part>.pb-h,.pf-part>h3{margin:0}
.pf-evidence{margin:0;padding-left:18px;display:grid;gap:6px}
.pf-evidence a,.pb-card a{color:var(--brand-ink)}
.atlas-footnote{color:var(--muted);font-size:.84rem;display:grid;gap:6px;border-top:1px solid var(--border);padding-top:12px}
.atlas-footnote p{margin:0}
.pf-live h3{margin:8px 0 0}
.pf-filters{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.pf-filters select,.pf-filters input,.pf-form input,.pf-form select,.pf-live textarea{font:inherit;color:var(--text);background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:4px 6px}
.pf-approvals{margin:0;padding-left:18px;display:grid;gap:14px}
.pf-approvals fieldset{border:1px solid var(--border);border-radius:8px;margin:6px 0;display:flex;flex-wrap:wrap;gap:4px 12px}
.pf-changes{display:grid;gap:4px;margin:6px 0}
.pf-buttons{display:flex;flex-wrap:wrap;gap:6px}
.pf-buttons button{font:inherit;color:var(--text);background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:4px 10px;cursor:pointer}
.pf-buttons button:disabled{cursor:default;opacity:.6}
</style>"""

def fenced(text, start, end):
    m = re.search(r"^%s\n```[a-z]*\n(.*?)\n```\n%s$" % (re.escape(start), re.escape(end)), text, re.S | re.M)
    if not m:
        raise ValueError("no %s section" % start)
    return m.group(1)

def page(data, d):
    blocks = (d / "blocks.md").read_text(encoding="utf-8")
    standard = (d / "artifact-standard.md").read_text(encoding="utf-8")
    mark = re.search(r"```svg\n(.*?)\n```", (d / "aspire-animated.svg.md").read_text(encoding="utf-8"), re.S).group(1)
    year = int(data["footer"]["updated"][:4])
    short = re.sub(r'["\\<>\x00-\x1f\x7f]', "", data["title"]).encode("ascii", "ignore").decode()
    short = short if len(short) <= 40 else short[:40].rsplit(" ", 1)[0]
    head = ['<!doctype html><html lang="en"><head><meta charset="utf-8">',
            '<meta name="viewport" content="width=device-width,initial-scale=1">', "<title>%s</title>" % e(data["title"]),
            '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>']
    theme = data.get("theme", {})
    fonts = theme.get("fontsHref", "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Instrument+Sans:wght@500;600;700&display=swap")
    head.append('<link rel="stylesheet" href="%s">' % e(fonts))
    head += [fenced(blocks, "<!-- block-style -->", "<!-- /block-style -->"), FRAME]
    if theme.get("css"):
        head.append("<style>%s</style>" % theme["css"])
    head.append(fenced(standard, "<!-- print-style -->", "<!-- /print-style -->").replace("{pageTitle}", short))
    chips = [chip("Example", "pb-warn")] if data.get("example") else []
    chips.append(chip("Prepared for " + data["scope"]["reader"]))
    body = ['</head><body><main class="pf-page" data-template="%s"%s>' % (data["template"], (' data-length="%s"' % data["length"]) if "length" in data else ""),
            '<div class="pf-head"><div><p class="pb-label">%s</p><div class="pf-chips">%s</div></div><span class="pf-mark">%s</span></div>'
            % (e(data["title"]), "".join(chips), mark),
            scope(data), answer(data), team_part(data), insights(data), actions(data, year), decisions(data, year),
            approvals_part(data), form_part(data), evidence(data), method(data), gaps(data), drafts(data), footer(data, year),
            "</main>", live_script(data), "</body></html>"]
    return "\n".join(head + body).encode("ascii", "xmlcharrefreplace").decode("ascii")

def main(argv):
    names = [a for a in argv if not a.startswith("--")]
    if len(names) != 1:
        print("usage: page_fill.py [--check | --capabilities] {page data file}", file=sys.stderr)
        return 2
    path = Path(names[0])
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        schema, templates = (json.loads((path.parent / n).read_text(encoding="utf-8")) for n in FILES[:2])
        tools = tool_names((path.parent / FILES[2]).read_text(encoding="utf-8"))
        phrases = banned_phrases((path.parent / FILES[3]).read_text(encoding="utf-8"))
        for n in FILES[4:]:
            (path.parent / n).stat()
    except (OSError, ValueError) as err:
        print(json.dumps({"rule": "read", "path": str(err), "message": "could not read the page data or a file beside it"}))
        return 2
    errs = []
    shape(data, schema, "$", schema, errs)
    if not errs:
        errs = rules(data, templates, tools, phrases)
    for rule, where, message in errs:
        print(json.dumps({"rule": rule, "path": where.lstrip("$."), "message": message}))
    if errs:
        return 1
    try:
        html_page = page(data, path.parent)
    except (OSError, ValueError, AttributeError) as err:
        print(json.dumps({"rule": "read", "path": str(err), "message": "a file beside the page data lacks the part the page needs"}))
        return 2
    images = sum(len(m) for m in re.findall(r'src="(data:image/[^"]*)"', html_page))
    if images > IMAGE_LIMIT or len(html_page) > PAGE_LIMIT:
        print(json.dumps({"rule": "page-size", "path": "sections", "message": "the images are %d characters (at most %d) and the page %d (at most %d); %s" % (images, IMAGE_LIMIT, len(html_page), PAGE_LIMIT, CUT_ORDER)}))
        return 1
    if "--check" in argv:
        print(json.dumps({"ok": True, "template": data["template"]}))
        return 0
    if "--capabilities" in argv:
        # The declaration to pass to the Artifact publish; {} on a page with no live parts.
        print(json.dumps(data.get("live", {}).get("capabilities", {})))
        return 0
    print(html_page)
    return 0

sys.exit(main(sys.argv[1:]))
```
<!-- /page-fill -->
