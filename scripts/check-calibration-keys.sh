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
#   - every calibration key the plugin and its specs name is one Atlas accepts: the pattern
#     append_calibration takes for `key` (calibrationKeyPattern in contract/atlas-mcp-tools.json),
#     ASP-5995. A key is a token in backticks or double quotes. The key namespaces are the list in
#     atlas-tools.md ("Key namespaces:"). A token fails when
#       - its namespace is a known one written with a hyphen, underscore or capital
#         (`applicant-review:`, `Brand:`), or any namespace that is not lowercase letters and
#         digits where the text calls it a key,
#       - the text calls it a key but its namespace is not on the list (add it there first),
#       - it is under a known namespace and breaks the pattern, each {placeholder} or * read as
#         one character, or
#       - with every {slug}, {campaign-slug} or lone * at the slug cap (atlas-tools.md) and
#         {ig|tt} or {network} at 2, it is longer than the pattern allows.
#   - the applicant review's slug cap is the shared one and its longest part fits
#     (applicant-review.md, The records), and the creator slug cap leaves room for `-99`
#     (creator-vetting.md, creator calibrations)
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

import json
REFS = "plugins/aspire/skills/aspire/references"

def die(msg):
    print(f"FAIL {msg}")
    sys.exit(1)

# The server's key pattern, vendored with the tool contract.
pattern = json.load(open("contract/atlas-mcp-tools.json")).get("calibrationKeyPattern")
if not isinstance(pattern, str):
    die("contract/atlas-mcp-tools.json has no calibrationKeyPattern; refresh it with check-tool-contract.sh --update")
KEY = re.compile(pattern)
m = re.search(r"\{\d*,(\d+)\}\$$", pattern)
if not m:
    die(f"calibrationKeyPattern {pattern} does not end in a {{n,N}}$ length; teach this check its new shape")
KEY_MAX = int(m.group(1))

tools = open(f"{REFS}/atlas-tools.md").read()
m = re.search(r"Key namespaces: (.*?)\. A new namespace", tools, re.S)
if not m:
    die(f"{REFS}/atlas-tools.md has no \"Key namespaces:\" list")
NAMESPACES = set(re.findall(r"`([a-z0-9]+)`", m.group(1)))
m = re.search(r"\*\*A `\{slug\}` built from .*? is (\d+) characters at most", tools, re.S)
if not m:
    die(f"{REFS}/atlas-tools.md has no slug cap (\"A `{{slug}}` built from ... is N characters at most\")")
SLUG_CAP = int(m.group(1))
SLUG_LIKE = {"{slug}", "{campaign-slug}"}
SHORT = {"{ig|tt}": 2, "{network}": 2}

# A key in backticks or double quotes; the namespace is read loosely so a bad one is caught.
TOKEN = re.compile(r"(?P<q>[`\"])(?P<ns>[A-Za-z][A-Za-z0-9_-]*):(?P<rest>[^`\"\s]*)(?P=q)")
# The text calls the token a key: "key `x:`", "keys starting `x:`", key: "x:y", "`x:` keys".
KEY_BEFORE = re.compile(r"(?i)(\bkeys?\b(\s+starting)?|\bkey[\"']?\s*[:=])\s*$")
KEY_AFTER = re.compile(r"^\s*keys?\b")

def length_budget(rest):
    """Characters after the colon with each placeholder at its cap, or None when one has none."""
    holders = re.findall(r"\{[^}]*\}|\*", rest)
    total = len(re.sub(r"\{[^}]*\}|\*", "", rest))
    for h in holders:
        if h in SLUG_LIKE or (h == "*" and len(holders) == 1):
            total += SLUG_CAP
        elif h in SHORT:
            total += SHORT[h]
        else:
            return None
    return total

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
        ns, rest = m.group("ns"), m.group("rest")
        token = f"{ns}:{rest}"
        called_key = bool(KEY_BEFORE.search(b[:m.start()]) or KEY_AFTER.match(b[m.end():]))
        canon = re.sub(r"[-_]", "", ns.lower())
        if ns != canon:
            if canon in NAMESPACES or called_key:
                out.append(f"`{token}`: a key's namespace is lowercase letters and digits only ({KEY.pattern})")
            continue
        if ns not in NAMESPACES:
            if called_key:
                out.append(f"`{token}` is called a key but `{ns}` is not in atlas-tools.md's Key namespaces list")
            continue
        if not rest or rest.endswith("-"):
            continue
        # One character per {placeholder} or *, so a template is checked on its fixed part.
        probe = re.sub(r"\{[^}]*\}|\*", "x", rest)
        if not KEY.fullmatch(f"{ns}:{probe}"):
            out.append(f"`{token}` is not a key Atlas accepts ({KEY.pattern})")
            continue
        n = length_budget(rest)
        if n is not None and n > KEY_MAX:
            out.append(f"`{token}` is {n} characters after the colon with a {SLUG_CAP}-character slug, over the {KEY_MAX} Atlas allows")
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
         + sorted(glob.glob("docs/agent-specs/**/*.md", recursive=True)) + ["scripts/templates/agent.md"])
# Only the key check runs on the specs; the drop-list and red-line rules are for runtime files.
specs = {f for f in files if f.startswith("docs/")}
for f in files:
    for start, b in blocks(f):
        for p in (key_problems(b) if f in specs else problems(b)):
            print(f"FAIL {f}:{start}: {p} (atlas-tools.md, Calibration kinds)")
            bad = 1
    text = open(f).read()
    if f not in specs and not f.endswith("atlas-tools.md") and re.search(r"[Bb]rand red line", text) and "Calibration kinds" not in text:
        print(f"FAIL {f}: says brand red line but does not point to its definition (atlas-tools.md, Calibration kinds)")
        bad = 1

# An applicant review's longest key fits: the shared slug cap plus the longest part.
ar = f"{REFS}/applicant-review.md"
text = open(ar).read()
cap = re.search(r"\*\*The slug is (\d+) characters at most", text)
parts = re.findall(r"^\| `(-[a-z0-9-]+)` \|", text.split("## The records", 1)[-1].split("\n## ", 1)[0], re.M)
if not cap or len(parts) != 9:
    print(f"FAIL {ar}: The records needs the slug cap sentence and the nine parts (found {len(parts)})")
    bad = 1
elif int(cap.group(1)) != SLUG_CAP:
    print(f"FAIL {ar}: its slug cap ({cap.group(1)}) is not atlas-tools.md's ({SLUG_CAP})")
    bad = 1
elif SLUG_CAP + max(map(len, parts)) > KEY_MAX:
    longest = max(parts, key=len)
    print(f"FAIL {ar}: a {SLUG_CAP}-character slug plus `{longest}` is over the {KEY_MAX} characters Atlas allows after the colon")
    bad = 1

# A creator key's slug cap leaves room for a -2 to -99 suffix.
cv = f"{REFS}/creator-vetting.md"
cap = re.search(r"(\d+)\s+characters at most before any `-2` suffix", open(cv).read())
if not cap:
    print(f"FAIL {cv}: the creator calibration key needs its slug cap (\"N characters at most before any `-2` suffix\")")
    bad = 1
elif int(cap.group(1)) + len("-99") > KEY_MAX:
    print(f"FAIL {cv}: a {cap.group(1)}-character creator slug plus `-99` is over the {KEY_MAX} characters Atlas allows")
    bad = 1

if not bad:
    print("OK   every drop list drops lastrun: and applicantreview: keys, every red-line reader reads brand red lines, every file that says so points to the definition, and every calibration key fits Atlas's key pattern")
sys.exit(bad)
PY
