#!/usr/bin/env bash
# Checks the countable items of the Atlas skill and agent standard (docs/STANDARD.md) on every
# agent in every plugin and on the flow reference each agent runs:
#   description  L4  an agent's description is at most 1,024 characters and names its trigger
#                    phrases ("Trigger on")
#   metrics      M1  every question code the agent answers (orchestration.md section 3, or its spec's
#                    Questions answered) or its files name has a row in page-standard's
#                    required-metrics table, and an agent that publishes a page answers one
#   freshness    F1  an agent that publishes a page, or its flow reference, points at page-standard's
#                    Data freshness rule (section 9) or the Build loop's freshness step (section 4,
#                    step 2); a citation of another build loop step, or a freshness rule of the
#                    flow's own, does not count
#   images       C2, C3  no Markdown or JSON file under plugins/ tells anyone to put image data in chat,
#                    to "inline the image", or to lead with a card ("lead with an inline card",
#                    "show the card first"). Data URIs on a published page are how pages carry images
#                    and stay allowed; a line about chat that says "never" or "no" is the rule itself
#   words        V2  no R11 word (page-check.md's BANNED list, the report labels included) in the
#                    page copy or templates of an agent or its flow reference: the text of their
#                    html, text, markdown and plain code fences, outside quotes
#   eval         P2  every agent has an entry in scripts/eval/questions.json's "agents" map naming at
#                    least one question code it answers, with "approved" set to the ticket that holds
#                    the approved page, or null
# Each finding names the file, the line and the STANDARD.md item. Deliberate exceptions go in ALLOW
# below with a reason; the list only shrinks, and an entry that matches nothing fails.
#
#   scripts/check-agent-standard.sh             fixtures, then the plugins (blocking items only)
#   scripts/check-agent-standard.sh --fixtures  every fixture in scripts/fixtures/agent-standard/
#                                               gives its expected result, on every item
#   scripts/check-agent-standard.sh --tree      the plugins, blocking items only
#   scripts/check-agent-standard.sh --advisory  the plugins, advisory items only
#
# Fixtures: scripts/fixtures/agent-standard/base/ is a small repository that passes every item.
# Each other folder is copied over it: pass* must pass, fail-<item>* must fail on <item> only.
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/plugins.sh
command -v python3 >/dev/null || { echo "FAIL python3 is needed"; exit 1; }

mode=${1:-all}
case $mode in all | --fixtures | --tree | --advisory) ;; *) echo "usage: $0 [--fixtures|--tree|--advisory]" >&2; exit 2 ;; esac

FX=scripts/fixtures/agent-standard
WORDS_SRC=plugins/aspire/skills/page-standard/page-check.md

# Items that report without blocking until the work they depend on lands. CI runs --advisory with
# continue-on-error; drop an item from this list once its ticket has landed and the tree passes.
#   TODO(ASP-4093): agent descriptions are trimmed to 1,024 characters.
#   TODO(ASP-5295): page-standard's Data freshness rule lands and every page flow points at it.
#   TODO(ASP-5385): scripts/eval/questions.json carries the "agents" map.
ADVISORY="description freshness eval"

# Deliberate exceptions: <item>[:<kind>]|<agent or file>|<reason>. An entry with a kind covers only
# findings of that kind (metrics:no-code is "publishes a page and answers no question code"). Shrink only.
ALLOW='
metrics:no-code|atlas-affiliate-manager|Program operations: codes, commission and sales records; answers no question code in orchestration.md section 3
metrics:no-code|atlas-campaign-orchestrator|Next actions list across every program; answers no question code in orchestration.md section 3
metrics:no-code|atlas-content-review|Go or no-go on one draft against a brief; answers no question code in orchestration.md section 3
metrics:no-code|atlas-content-sourcing|Rights and asset requests tracker; answers no question code in orchestration.md section 3
metrics:no-code|atlas-creator-negotiation|Deal terms and drafts; answers no question code in orchestration.md section 3
metrics:no-code|atlas-product-fulfillment|Order form and shipping tracker; answers no question code in orchestration.md section 3
metrics:no-code|atlas-program-ledger|Money owed and paid; answers no question code in orchestration.md section 3
metrics:no-code|atlas-quality-review|Reviews another page; answers no question code in orchestration.md section 3
metrics:no-code|atlas-roster-manager|Roster segments and renewals; answers no question code in orchestration.md section 3
metrics:no-code|atlas-shops|Shop setup plan; answers no question code in orchestration.md section 3
'

run_check() { # $1: repository root, $2: items (space separated), $3: plugin folders (space separated)
  # Prints item|kind|message lines; item "error" when a source the check reads is missing.
  python3 -I - "$1" "$2" "$WORDS_SRC" "$3" <<'PY'
import glob, json, os, re, sys

root, items, words_src, plugin_dirs = sys.argv[1], set(sys.argv[2].split()), sys.argv[3], sys.argv[4].split()
P = os.path.join(root, "plugins")
REFS = os.path.join(P, "aspire/skills/aspire/references")
ORCH = os.path.join(REFS, "orchestration.md")
PS = os.path.join(P, "aspire/skills/page-standard/SKILL.md")
QJ = os.path.join(root, "scripts/eval/questions.json")
SPECS = os.path.join(root, "docs/agent-specs/agents")
ID = {"description": "L4", "metrics": "M1", "freshness": "F1", "images": "C2, C3", "words": "V2", "eval": "P2"}
# An agent whose flow reference is not references/<name without atlas->.md.
FLOW = {"atlas-affiliate-manager": "affiliate", "atlas-campaign-orchestrator": "orchestrator",
        "atlas-creator-negotiation": "negotiation", "atlas-creator-outreach": "outreach",
        "atlas-daily-insights-report": "readout", "atlas-weekly-insights-report": "readout",
        "atlas-product-fulfillment": "fulfillment", "atlas-profile-analyst": "account-review"}
CODE = re.compile(r"(?<![A-Za-z0-9])([IPOA][0-9]+)(?![A-Za-z0-9])")
QUESTION_CODES = {f"{l}{i}" for l in "IPO" for i in range(1, 7)} | {"A1"}

def rel(path):
    return os.path.relpath(path, root)

def out(item, path, line, msg, kind=""):
    if item in items:
        print(f"{item}|{kind}|{rel(path)}:{line}: {msg} (docs/STANDARD.md {ID[item]})")

def error(msg):
    print(f"error||{msg}")

def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()

def strip_blocks(text):
    """The text without the verbatim blocks every agent carries, so they never count as a pointer."""
    return re.sub(r"^## (?:Artifact standard|Orchestration contract)\n.*?(?=^## |\Z)", "", text, flags=re.M | re.S)

def line_of(text, pos):
    return text.count("\n", 0, pos) + 1

# --- shared sources ------------------------------------------------------------------------------
orch = read(ORCH) if os.path.isfile(ORCH) else ""
sec3 = re.search(r"^## 3\. .*?(?=^## )", orch, re.M | re.S)
if not sec3:
    error(f"{rel(ORCH)} has no section 3 (Question codes) to read the routes from")
routes = {}
for row in re.findall(r"^\| ([IPOA][0-9]+) \|(.*)$", sec3.group(0) if sec3 else "", re.M):
    for agent in re.findall(r"`(atlas-[a-z-]+)`", row[1]):
        routes.setdefault(agent, set()).add(row[0])

ps = read(PS) if os.path.isfile(PS) else ""
table = re.search(r"<!-- required-metrics -->(.*?)<!-- /required-metrics -->", ps, re.S)
metric_codes = set()
for row in (table.group(1) if table else "").splitlines()[3:]:
    cells = row.split("|")
    if len(cells) > 2:
        metric_codes |= set(CODE.findall(cells[2]))
if not metric_codes:
    error(f"{rel(PS)} has no <!-- required-metrics --> table with codes in its Codes column")

for path in sorted(glob.glob(os.path.join(SPECS, "*.md"))):
    text = read(path)
    m = re.search(r"^plugin_agents:(.*)$", text, re.M)
    q = re.search(r"^## Questions answered\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    codes = set(re.findall(r"^\| ([IPOA][0-9]+) \|", q.group(1), re.M)) if q else set()
    for agent in re.findall(r"atlas-[a-z-]+", m.group(1) if m else ""):
        routes.setdefault(agent, set()).update(codes)

questions = None
if os.path.isfile(QJ):
    try:
        questions = json.loads(read(QJ))
    except ValueError as e:
        questions = e
    if isinstance(questions, dict) and not isinstance(questions.get("agents", {}), dict):
        questions = ValueError('"agents" is not an object')
    elif not isinstance(questions, (dict, Exception)):
        questions = ValueError("the top level is not an object")

# R11 words, taken from the page check itself so the two lists are one.
words = []
pc = read(os.path.join(root, words_src)) if os.path.isfile(os.path.join(root, words_src)) else read(words_src)
src = re.search(r"^EDGE = .*?^BANNED = \[\n.*?^\]\n", pc, re.M | re.S)
if src:
    scope = {"re": re}
    exec(src.group(0), scope)
    words = scope["BANNED"]
else:
    error(f"could not read the BANNED list from {words_src}")

# --- per agent -----------------------------------------------------------------------------------
agents = sorted(f for d in plugin_dirs for f in glob.glob(os.path.join(root, d, "agents", "*.md")))
for path in agents:
    name = os.path.basename(path)[:-3]
    text = read(path)
    fm = re.match(r"---\n(.*?)\n---\n", text, re.S)
    head = fm.group(1) if fm else ""
    d = re.search(r"^description:[ \t]*(?:[|>][-+]?[ \t]*\n)?(.*?)(?=^[A-Za-z_-]+:|\Z)", head, re.M | re.S)
    desc = " ".join(l.strip() for l in d.group(1).strip().splitlines()) if d else ""
    if len(desc) > 1 and desc[0] == desc[-1] and desc[0] in "\"'":
        desc = desc[1:-1]
    dline = line_of(text, text.find("description:")) if d else 1
    if not desc:
        out("description", path, 1, f"{name} has no description in its frontmatter")
    else:
        if len(desc) > 1024:
            out("description", path, dline, f"{name}'s description is {len(desc)} characters, over 1,024")
        if "Trigger on" not in desc:
            out("description", path, dline, f"{name}'s description names no trigger phrases (\"Trigger on ...\")")

    flow = os.path.join(REFS, FLOW.get(name, name[len("atlas-"):] if name.startswith("atlas-") else name) + ".md")
    flow = flow if os.path.isfile(flow) else None
    body = strip_blocks(text)
    flow_text = read(flow) if flow else ""
    # "publishes nothing", "never publish", "published no page" describe a pass that builds no page.
    positive = re.sub(r"\b(?:never|not|nothing to)\s+publish\w*|\bpublish\w*\s+(?:nothing|no\s+page)", " ", body, flags=re.I)
    publishes = re.search(r"\bpublish", positive, re.I) or re.search(r"\*\*Artifact standard\*\*", flow_text)

    # M1: every code named or answered has a row; a page answers at least one code.
    answered = set(routes.get(name, set()))
    for where, t in ((path, body), (flow, flow_text)):
        if not where:
            continue
        for m in CODE.finditer(t):
            c = m.group(1)
            if metric_codes and c in QUESTION_CODES and c not in metric_codes:
                out("metrics", where, line_of(t, m.start()),
                    f"names question code {c}, which has no row in page-standard's required-metrics table")
    for c in sorted(answered - metric_codes if metric_codes else ()):
        out("metrics", path, 1, f"{name} answers {c}, which has no row in page-standard's required-metrics table")
    if publishes and not answered:
        out("metrics", path, 1, f"{name} publishes a page and answers no question code: route it in orchestration.md "
            "section 3 or list the code under its spec's Questions answered", kind="no-code")

    # F1: a page flow points at the one freshness rule or the build loop.
    if publishes:
        pointer = re.compile(r"\*\*Data freshness\*\*|page-standard(?:'s)? (?:Data freshness|freshness rule)"
                             r"|(?:page-standard/SKILL\.md`?|\*\*Page standard\*\*),? section 9\b|section 4, step 2\b|\*\*Build loop\*\*,? step 2\b"
                             r"|build loop's (?:freshness|step 2)", re.I)
        if not (pointer.search(body) or pointer.search(flow_text)):
            where = f"neither {name} nor {rel(flow)} points" if flow else f"{name} does not point"
            out("freshness", path, 1, f"{name} publishes a page, and {where} at page-standard's "
                "Data freshness rule (section 9) or the Build loop's freshness step (section 4, step 2)")

    # V2: R11 words in page copy and templates, outside quotes.
    for where, t in ((path, body), (flow, flow_text)):
        if not where:
            continue
        for fence in re.finditer(r"^[ \t]*```([A-Za-z0-9_-]*)[^\n]*\n(.*?)^[ \t]*```[ \t]*$", t, re.M | re.S):
            if fence.group(1) not in ("html", "text", "markdown", "md", ""):
                continue
            start = line_of(t, fence.start(2))
            # Someone else's words (as page-check's R11 skips them), blanked across lines so line numbers hold.
            blank = lambda m: re.sub(r"[^\n]", " ", m.group(0))
            copy = re.sub(r"<(blockquote|q)\b.*?</\1\s*>", blank, fence.group(2), flags=re.S | re.I)
            copy = re.sub(r"<([a-z0-9]+)\b[^>]*\bdata-quoted\b[^>]*>.*?</\1\s*>", blank, copy, flags=re.S | re.I)
            for i, ln in enumerate(copy.splitlines()):
                plain = re.sub(r"<[^>]*>", " ", ln)
                plain = re.sub(r"\"[^\"]*\"|“[^”]*”|`[^`]*`|\{[^}]*\}", " ", plain)
                for rx, kind in words:
                    m = rx.search(plain)
                    if m:
                        out("words", where, start + i, f"page copy uses {kind}, \"{m.group(0)}\" (R11)")
                        break

    # P2: an eval entry for every agent.
    if "eval" in items:
        if questions is None:
            out("eval", QJ, 1, "scripts/eval/questions.json is missing")
        elif isinstance(questions, Exception):
            out("eval", QJ, 1, f"scripts/eval/questions.json is not valid JSON: {questions}")
        else:
            entry = (questions.get("agents") or {}).get(name)
            if not isinstance(entry, dict):
                out("eval", QJ, 1, f"{name} has no entry in the \"agents\" map")
            else:
                codes = entry.get("codes") or []
                if isinstance(codes, str) or not isinstance(codes, list):
                    out("eval", QJ, 1, f"{name}'s \"codes\" is not a list of question codes")
                    codes = []
                elif not codes:
                    out("eval", QJ, 1, f"{name}'s entry names no question code it answers")
                for c in codes:
                    if c not in QUESTION_CODES:
                        out("eval", QJ, 1, f"{name}'s entry names {c}, which is not a question code in orchestration.md section 3")
                    elif answered and c not in answered:
                        out("eval", QJ, 1, f"{name}'s entry names {c}, which it does not answer")
                if "approved" not in entry:
                    out("eval", QJ, 1, f"{name}'s entry has no \"approved\" (the ticket that holds the approved page, or null)")
                elif entry["approved"] is not None and not re.fullmatch(r"ASP-[0-9]+", str(entry["approved"])):
                    out("eval", QJ, 1, f"{name}'s \"approved\" is neither a ticket key (ASP-NNNN) nor null")

# --- every Markdown and JSON file under plugins/: image data in chat, cards first ----------------
if "images" in items:
    chat = re.compile(r"\b(?:chat|reply|replies|conversation|widget|summary|message)\b", re.I)
    data = re.compile(r"data:image|data URIs?|base64", re.I)
    # The rule itself: a negation within a few words before the image-data term.
    negated = re.compile(r"\b(?:never|no|not|nor|without)\b(?:\W+[\w']+){0,10}?\W+(?:image data|data:image|data URIs?|base64)", re.I)
    always = re.compile(r"inline the image|lead with an? inline card|show the cards? first", re.I)
    for path in sorted(glob.glob(os.path.join(P, "**/*.md"), recursive=True) + glob.glob(os.path.join(P, "**/*.json"), recursive=True)):
        for i, ln in enumerate(read(path).splitlines(), 1):
            m = always.search(ln)
            if m:
                out("images", path, i, f"says \"{m.group(0)}\"; cards show only when the person asks, and chat carries no image data")
            elif data.search(ln) and chat.search(ln) and not negated.search(ln):
                out("images", path, i, "tells a reply, widget or summary to carry image data; images belong on the published page only")
PY
}

fail=0
err() { echo "FAIL $*"; fail=1; }
ALL="description metrics freshness images words eval"
blocking=$(for i in $ALL; do case " $ADVISORY " in *" $i "*) ;; *) printf "%s " "$i" ;; esac; done); blocking=${blocking% }

if [ "$mode" = all ] || [ "$mode" = --fixtures ]; then
  [ -d "$FX/base" ] || err "$FX/base is missing (the repository every fixture is copied over)"
  tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
  cases=0
  for d in "$FX"/*/; do
    d=${d%/}; name=${d##*/}
    [ "$name" != base ] || continue
    cases=$((cases + 1))
    rm -rf "$tmp/r"; cp -R "$FX/base" "$tmp/r"; cp -R "$d/." "$tmp/r/"
    res=$(run_check "$tmp/r" "$ALL" plugins/aspire) || { err "could not check fixture $d: $res"; continue; }
    got=$(cut -d'|' -f1 <<< "$res" | sed '/^$/d' | sort -u | tr '\n' ' ' | sed 's/ *$//')
    case $name in
      pass*) [ -z "$got" ] || err "fixture $d should pass and fails '$got': $res" ;;
      fail-*)
        want=${name#fail-}; want=${want%%-*}
        case " $ALL " in *" $want "*) ;; *) err "$d names no item of: $ALL"; continue ;; esac
        [ "$got" = "$want" ] || err "fixture $d should fail only '$want' and fails '${got:-nothing}': $res" ;;
      *) err "$d is named neither pass* nor fail-<item>*" ;;
    esac
  done
  [ "$cases" -gt 0 ] || err "no fixtures in $FX"
  [ "$fail" -eq 0 ] && echo "OK   $cases agent-standard fixtures give their result"
fi

if [ "$mode" != --fixtures ]; then
  if [ "$mode" = --advisory ]; then items=$ADVISORY; else items=$blocking; fi
  echo "     Advisory items, reported by --advisory without blocking: $ADVISORY"
  dirs=
  for p in $(plugin_names); do src=$(plugin_src "$p"); [ -d "$src/agents" ] && dirs="$dirs $src"; done
  res=$(run_check . "$items" "$dirs") || { err "could not check the plugins: $res"; exit 1; }
  used=
  while IFS='|' read -r item kind msg; do
    [ -n "$item" ] || continue
    [ "$item" != error ] || { err "$msg"; continue; }
    file=${msg%%:*}; agent=${file##*/}; agent=${agent%.md}
    allowed=
    while IFS='|' read -r a who reason; do
      [ -n "$a" ] || continue
      case $a in *:*) [ -n "$kind" ] && [ "$a" = "$item:$kind" ] || continue ;; *) [ "$a" = "$item" ] || continue ;; esac
      if [ "$who" = "$agent" ] || [ "$who" = "$file" ]; then allowed=1; used="$used|$a|$who|"; fi
    done <<< "$ALLOW"
    [ -n "$allowed" ] || err "$msg"
  done <<< "$res"
  while IFS='|' read -r a who reason; do
    [ -n "$a" ] || continue
    [ -n "$reason" ] || err "ALLOW line $a|$who has no reason"
    case " $items " in *" ${a%%:*} "*) ;; *) continue ;; esac
    case $used in *"|$a|$who|"*) ;; *) err "ALLOW line $a|$who matches no finding; remove it" ;; esac
  done <<< "$ALLOW"
  n=0
  for src in $dirs; do n=$((n + $(find "$src/agents" -name "*.md" | wc -l))); done
  [ "$fail" -eq 0 ] && echo "OK   $n agents meet the standard's countable items ($items)"
fi

[ "$fail" -eq 0 ] || echo "     The items are in docs/STANDARD.md; a deliberate exception goes in this script's ALLOW list with a reason."
exit "$fail"
