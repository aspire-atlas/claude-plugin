#!/usr/bin/env bash
# Checks the agent and skill specs in docs/agent-specs (the format is docs/agent-specs/README.md):
#   - every agent spec has its header fields and sections, in order, with valid values
#   - agent numbers run 1..N with no gaps or repeats, and each file is named NN-slug.md
#   - "Skills carried (N)" matches the length of its list
#   - question codes exist in orchestration.md section 3, and U codes are U1 to U7
#   - every plugin agent a spec names has a file in plugins/aspire/agents
#   - no section is empty, and the team number matches its name
#   - the shared and universal skills are all there, and every skill spec names its owner and
#     has the skill sections in order
# Pending fields and unwritten skill files are counted, not failed.
#
#   scripts/check-agent-specs.sh                    check
#   scripts/check-agent-specs.sh --list             every agent with its skill count and skills
#   scripts/check-agent-specs.sh --compare <html>   diff against a saved proposal page (skills, wave,
#                                                   permission, team, personas, job, connections)
set -euo pipefail
cd "$(dirname "$0")/.."
command -v python3 >/dev/null || { echo "FAIL python3 is needed"; exit 1; }

python3 -I - "$@" <<'PY'
import json, os, re, sys

D = "docs/agent-specs"
ORCH = "plugins/aspire/skills/aspire/references/orchestration.md"
AGENTS_DIR = "plugins/aspire/agents"
FIELDS = ["number", "name", "team", "personas", "wave", "permission", "plugin_agents"]
SECTIONS = ["Job to be done", "Questions answered", "Skills carried", "Universal skills used",
            "Shared skills", "Connects to", "Trigger phrases", "Writes to Atlas", "Non-goals"]
SKILL_SECTIONS = ["What it does", "Inputs", "Output", "Callable"]
TEAMS = {"1": "Brand and market", "2": "Creator supply", "3": "Campaign and deals",
         "4": "Commerce and always-on", "5": "Content and ads", "6": "Organic and operations"}
PAGE_PERSONAS = {"im": "Influencer Manager", "psm": "Paid Social Manager", "osm": "Organic Social Manager"}
PERSONAS = set(PAGE_PERSONAS.values())
PERMISSIONS = {"Read", "Write", "Send", "Spend"}
UNIVERSAL = {f"U{i}" for i in range(1, 8)}
SHARED = {"plain-english", "live-artifact-output", "picker-questions", "evidence-labels",
          "brand-memory", "credit-cost", "artifact-standard", "page-building-blocks"}
PENDING = re.compile(r"_Pending: set in [^_]+\._")

fail = 0
def err(msg):
    global fail
    print("FAIL " + msg)
    fail = 1

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

def parse(path):
    """Header fields and {section heading: body} of one spec."""
    text = open(path).read()
    m = re.match(r"---\n(.*?)\n---\n(.*)", text, re.S)
    if not m:
        return None, {}, []
    head = dict(l.split(":", 1) for l in m.group(1).splitlines() if ":" in l)
    head = {k.strip(): v.strip() for k, v in head.items()}
    parts = re.split(r"^## (.+)$", m.group(2), flags=re.M)
    order = parts[1::2]
    return head, dict(zip(order, parts[2::2])), order

def mds(d):
    return sorted(f for f in os.listdir(d) if f.endswith(".md"))

def check_skill(label, path, owner, extra=()):
    """A skill spec: its owner, and the skill sections in order, none empty."""
    head, secs, order = parse(path)
    if not head:
        err(f"{label}: no header between --- lines"); return None
    problems = []
    if head.get("owner") != owner:
        problems.append(f"owner must be {owner}")
    if order != SKILL_SECTIONS + list(extra):
        problems.append(f"sections are {order}; want {SKILL_SECTIONS + list(extra)}")
    problems += [f"section '{s}' is empty" for s in order if not secs[s].strip()]
    for p in problems:
        err(f"{label}: {p}")
    return None if problems else head

orch = open(ORCH).read()
sec3 = re.search(r"^## 3\. .*?(?=^## )", orch, re.S | re.M)
codes = set(re.findall(r"^\| ([IPOA]\d) \|", sec3.group(0) if sec3 else "", re.M))
if not codes:
    err(f"no question codes found in {ORCH} section 3")

# Agents.
agents = []
for f in mds(f"{D}/agents"):
    path = f"{D}/agents/{f}"
    head, secs, order = parse(path)
    if head is None:
        err(f"{f}: no header between --- lines"); continue
    for k in FIELDS:
        if not head.get(k):
            err(f"{f}: header has no {k}")
    if any(k not in head for k in ("number", "name")):
        continue
    want = f"{int(head['number']):02d}-{slug(head['name'])}.md" if head["number"].isdigit() else None
    if f != want:
        err(f"{f}: file should be named {want}")
    plain = [re.sub(r" \(\d+\)$", "", s) for s in order]
    if plain != SECTIONS:
        err(f"{f}: sections are {plain}; want {SECTIONS}")
    for s in order:
        if not secs[s].strip():
            err(f"{f}: section '{s}' is empty")
    if not set(p.strip() for p in head.get("personas", "").split(",")) <= PERSONAS:
        err(f"{f}: personas must be from {sorted(PERSONAS)}")
    if head.get("permission") not in PERMISSIONS:
        err(f"{f}: permission must be one of {sorted(PERMISSIONS)}")
    if head.get("wave") not in {"1", "2", "3", "4"}:
        err(f"{f}: wave must be 1 to 4")
    tn, _, tname = head.get("team", "").partition(" ")
    if TEAMS.get(tn) != tname:
        err(f"{f}: team must be one of {[f'{k} {v}' for k, v in TEAMS.items()]}")
    for a in head.get("plugin_agents", "none").split(","):
        a = a.strip()
        if a != "none" and not os.path.isfile(f"{AGENTS_DIR}/{a}.md"):
            err(f"{f}: plugin agent {a} has no file in {AGENTS_DIR}")
    heading = next((s for s in order if s.startswith("Skills carried")), "")
    hm = re.fullmatch(r"Skills carried \((\d+)\)", heading)
    skills = re.findall(r"^\d+\. (.+)$", secs.get(heading, ""), re.M)
    if not hm:
        err(f"{f}: the skills heading must read 'Skills carried (N)'")
    elif int(hm.group(1)) != len(skills) or not skills:
        err(f"{f}: heading says {hm.group(1)} skills, the list has {len(skills)}")
    if len({slug(s) for s in skills}) != len(skills):
        err(f"{f}: two skills share a name")
    for c in re.findall(r"^\| ([^|]+?) \|", secs.get("Questions answered", ""), re.M):
        if c not in ("Code", "None") and not re.fullmatch(r":?-+:?", c) and c not in codes:
            err(f"{f}: question code {c} is not in {ORCH} section 3")
    uni = secs.get("Universal skills used", "")
    if not PENDING.search(uni):
        for u in re.findall(r"\bU\d+\b", uni):
            if u not in UNIVERSAL:
                err(f"{f}: {u} is not a universal skill (U1 to U7)")
    pending = sum(1 for s in secs.values() if PENDING.search(s))
    agents.append({"file": f, "n": int(head["number"]) if head["number"].isdigit() else 0,
                   "name": head["name"], "slug": slug(head["name"]), "skills": skills,
                   "pending": pending, "head": head,
                   "job": " ".join(secs.get("Job to be done", "").split()),
                   "connects": re.findall(r"^- (.+)$", secs.get("Connects to", ""), re.M)})

nums = sorted(a["n"] for a in agents)
if nums != list(range(1, len(agents) + 1)):
    err(f"agent numbers are {nums}; want 1 to {len(agents)} with no gaps or repeats")

# Shared and universal skills.
have = {f[:-3] for f in mds(f"{D}/shared")}
for s in sorted(SHARED - have):
    err(f"shared/{s}.md is missing")
for s in sorted(have - SHARED):
    err(f"shared/{s}.md is not a known shared skill; add it to this check and the README")
for s in sorted(have):
    check_skill(f"shared/{s}.md", f"{D}/shared/{s}.md", "shared", ["Lives in today"])
seen = set()
for f in mds(f"{D}/universal"):
    head = check_skill(f"universal/{f}", f"{D}/universal/{f}", "universal")
    if head and head.get("code") not in UNIVERSAL:
        err(f"universal/{f}: code must be U1 to U7"); continue
    if head:
        seen.add(head["code"])
for u in sorted(UNIVERSAL - seen):
    err(f"universal: no spec for {u}")

# Skill files written so far.
written = 0
by_slug = {a["slug"]: a for a in agents}
if os.path.isdir(f"{D}/skills"):
    for ag in sorted(os.listdir(f"{D}/skills")):
        a = by_slug.get(ag)
        if not a:
            err(f"skills/{ag}: no agent spec has the slug {ag}"); continue
        names = {slug(s) for s in a["skills"]}
        for f in mds(f"{D}/skills/{ag}"):
            if f[:-3] not in names:
                err(f"skills/{ag}/{f}: not in {a['file']}'s skill list")
            elif check_skill(f"skills/{ag}/{f}", f"{D}/skills/{ag}/{f}", a["file"][:-3]):
                written += 1

args = sys.argv[1:]
if args[:1] == ["--list"]:
    for a in sorted(agents, key=lambda a: a["n"]):
        print(f"{a['n']:02d} {a['name']} ({len(a['skills'])})")
        for s in a["skills"]:
            print(f"     {s}")
elif args[:1] == ["--compare"] and len(args) == 2:
    text = open(args[1]).read()
    m = re.search(r"const A=(.*?);\n", text, re.S)
    if not m:
        err(f"{args[1]} has no 'const A=' agent list")
    else:
        page = json.loads(re.sub(r'([{,]\s*)(\w+):', r'\1"\2":', m.group(1)))
        mine = {a["n"]: a for a in agents}
        for p in page:
            a = mine.pop(p["n"], None)
            if not a:
                err(f"page agent {p['n']:02d} {p['name']} has no spec"); continue
            if a["name"] != p["name"]:
                err(f"{a['file']}: name '{a['name']}', page says '{p['name']}'")
            h = a["head"]
            spec_personas = {s.strip() for s in h.get("personas", "").split(",")}
            fields = [
                ("skills", a["skills"], p["s"]),
                ("wave", h.get("wave"), str(p["w"])),
                ("permission", h.get("permission"), p["lvl"]),
                ("team", h.get("team", "").partition(" ")[0], str(p["t"])),
                ("personas", spec_personas, {PAGE_PERSONAS[x] for x in p["p"]}),
                ("job to be done", a["job"], f"When {p['j'][0]}, I want {p['j'][1]}, so {p['j'][2]}."),
                ("connects to", a["connects"], p["c"]),
            ]
            for label, spec, want in fields:
                if spec != want:
                    err(f"{a['file']}: {label} differs from the page: spec {spec}, page {want}")
        for a in mine.values():
            err(f"{a['file']}: not on the page")
        print(f"     page: {len(page)} agents, {sum(len(p['s']) for p in page)} skills")
elif args:
    err("usage: check-agent-specs.sh [--list | --compare <proposal.html>]")

total = sum(len(a["skills"]) for a in agents)
print(f"     {len(agents)} agents, {total} skills, {written} skill files written, "
      f"{sum(a['pending'] for a in agents)} pending fields")
if not fail:
    print("OK   every agent and skill spec follows the format")
sys.exit(fail)
PY
