#!/usr/bin/env bash
# Checks how agent and skill files read calibration keys that belong to one flow
# (plugins/aspire/skills/aspire/references/atlas-tools.md, Calibration kinds):
#   - every list of keys a flow drops from brand memory (a paragraph, list item, or table row that
#     drops or ignores `orchestrator:` keys) drops `lastrun:` keys, which are saved setup answers
#     (orchestration.md, section 2, Saved answers), and `applicantreview:` keys, which are one
#     campaign's screening setup
#   - a block that names the `red_line` kind is a block that writes or defines red-line records, and
#     says so with `<!-- red-line-check: <reason> -->`; a block that reads the brand's red lines says
#     "brand red line" instead, and so does a block that reads calibrations and names red lines in
#     prose. One campaign's screening red lines then never read as brand-wide rules.
#   - every file that says "brand red line" points to its definition (Calibration kinds)
#   - every calibration key the plugin names is one Atlas accepts: the pattern append_calibration
#     takes for `key` (calibrationKeyPattern in contract/atlas-mcp-tools.json). A backticked
#     `name:` whose name has a hyphen or underscore fails wherever it appears (Atlas refused every
#     `applicant-review:` save, ASP-5995), and a key under a calibration namespace (NAMESPACES)
#     fails when it breaks the pattern, with each {placeholder} or * read as one character.
#   - an applicant review's slug cap plus its longest part fits the pattern's length
#     (applicant-review.md, The records)
# The block checks run first on scripts/fixtures/red-line/, scripts/fixtures/drop-list/ and
# scripts/fixtures/key-format/: every block in pass.md must pass and every block in a fail-*.md
# file must fail.
#
#   scripts/check-calibration-keys.sh
set -euo pipefail
cd "$(dirname "$0")/.."

python3 -I - <<'PY'
import glob, os, re, sys

BLOCK_START = re.compile(r"^ *([0-9]+[a-z]?\.|-|\|) ")
PROSE = re.compile(r"\bred lines?\b")
READS = re.compile(r"search_calibrations|get_brand_context")
DROPS = re.compile(r"[Dd]rop|[Ii]gnore|[Ss]kipping|[Ll]eave out")
OPT_OUT = "<!-- red-line-check:"
REQUIRED = [("lastrun", "orchestration.md, section 2, Saved answers"),
            ("applicantreview", "atlas-tools.md, Calibration kinds")]

# The server's key pattern, vendored with the tool contract.
import json
KEY = re.compile(json.load(open("contract/atlas-mcp-tools.json"))["calibrationKeyPattern"])
KEY_MAX = int(re.search(r"\{1,(\d+)\}\$$", KEY.pattern).group(1))
# Every namespace the plugin writes calibration keys under. A new one goes here.
NAMESPACES = {"adreuse", "applicantreview", "brand", "campaign", "competitor", "creator",
              "decline", "fees", "guideline", "lastrun", "library", "marketsignal",
              "orchestrator", "partner", "policy", "program", "qualityreview", "redline",
              "review", "target", "theme", "user", "vetting"}
# Backticked `name:` tokens with a hyphen that are not calibration keys: CSS, other plugins'
# skills, the hub's attention reasons. Plugin names (marketplace.json) are allowed too.
NOT_KEYS = {"object-fit", "anthropic-skills", "signoff-unrecorded"} | {
    p["name"] for p in json.load(open(".claude-plugin/marketplace.json"))["plugins"]}
TOKEN = re.compile(r"`([a-z][a-z0-9_-]*):([^`\s]*)`")

def blocks(path):
    """Paragraphs, list items, and table rows, each with the line it starts on."""
    blk, start = [], 0
    for i, line in enumerate(open(path).read().split("\n"), 1):
        if not line.strip() or BLOCK_START.match(line):
            if blk:
                yield start, " ".join(blk)
            blk = []
            if not line.strip():
                continue
        if not blk:
            start = i
        blk.append(line)
    if blk:
        yield start, " ".join(blk)

def red_line_problem(b):
    lb = b.lower()
    if OPT_OUT in lb:
        return None
    if "`red_line`" in lb:
        return "names the `red_line` kind: a reader says brand red line, a writer opts out"
    if PROSE.search(lb) and READS.search(lb) and "brand red line" not in lb:
        return "reads calibrations and names red lines but does not say brand red line"
    return None

def drop_list_problems(b):
    if "`orchestrator:" not in b or not DROPS.search(b):
        return []
    return [f"drops `orchestrator:` keys but not `{key}:` keys ({why})"
            for key, why in REQUIRED if f"`{key}:" not in b]

def key_problems(b):
    out = []
    for m in TOKEN.finditer(b):
        ns, rest = m.groups()
        token = f"{ns}:{rest}"
        if ns in NOT_KEYS:
            continue
        if not re.fullmatch(r"[a-z0-9]+", ns):
            out.append(f"`{token}`: a key's namespace is letters and digits only, no hyphen ({KEY.pattern})")
            continue
        if ns not in NAMESPACES or not rest or rest.endswith("-"):
            continue
        # One character per {placeholder} or *, so a template is checked on its fixed part.
        probe = re.sub(r"\{[^}]*\}|\*", "x", rest)
        if not KEY.fullmatch(f"{ns}:{probe}"):
            out.append(f"`{token}` is not a key Atlas accepts ({KEY.pattern})")
    return out

def problems(b):
    out = drop_list_problems(b) + key_problems(b)
    rl = red_line_problem(b)
    return out + ([rl] if rl else [])

bad = 0
for name in ("red-line", "drop-list", "key-format"):
    folder = f"scripts/fixtures/{name}"
    fixtures = sorted(glob.glob(f"{folder}/*.md"))
    if not os.path.exists(f"{folder}/pass.md") or not any(os.path.basename(f).startswith("fail-") for f in fixtures):
        print(f"FAIL {folder} needs a pass.md and at least one fail-*.md")
        bad = 1
    for f in fixtures:
        want_pass = not os.path.basename(f).startswith("fail-")
        for start, b in blocks(f):
            if b.startswith("#"):
                continue
            passes = not problems(b)
            if passes != want_pass:
                print(f"FAIL {f}:{start}: the check gives {'pass' if passes else 'fail'}, the fixture expects {'pass' if want_pass else 'fail'}")
                bad = 1

files = (sorted(glob.glob("plugins/*/agents/*.md")) + sorted(glob.glob("plugins/**/skills/**/*.md", recursive=True))
         + ["scripts/templates/agent.md"])
for f in files:
    for start, b in blocks(f):
        for p in problems(b):
            print(f"FAIL {f}:{start}: {p} (atlas-tools.md, Calibration kinds)")
            bad = 1
    text = open(f).read()
    if not f.endswith("atlas-tools.md") and re.search(r"[Bb]rand red line", text) and "Calibration kinds" not in text:
        print(f"FAIL {f}: says brand red line but does not point to its definition (atlas-tools.md, Calibration kinds)")
        bad = 1

# An applicant review's longest key fits: the slug cap plus the longest part.
ar = "plugins/aspire/skills/aspire/references/applicant-review.md"
text = open(ar).read()
cap = re.search(r"\*\*The slug is (\d+) characters at most", text)
parts = re.findall(r"^\| `(-[a-z0-9-]+)` \|", text.split("## The records", 1)[-1].split("\n## ", 1)[0], re.M)
if not cap or len(parts) != 9:
    print(f"FAIL {ar}: The records needs the slug cap sentence and the nine parts (found {len(parts)})")
    bad = 1
elif int(cap.group(1)) + max(map(len, parts)) > KEY_MAX:
    longest = max(parts, key=len)
    print(f"FAIL {ar}: a {cap.group(1)}-character slug plus `{longest}` is over the {KEY_MAX} characters Atlas allows after the colon")
    bad = 1

if not bad:
    print("OK   every drop list drops lastrun: and applicantreview: keys, every red-line reader reads brand red lines, every file that says so points to the definition, and every calibration key fits Atlas's key pattern")
sys.exit(bad)
PY
