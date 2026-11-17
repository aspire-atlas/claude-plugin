#!/usr/bin/env bash
# Scaffolds a new agent in the aspire plugin, in the shape every check expects, so a new agent starts
# on the standard (docs/STANDARD.md) instead of as a copy of the nearest one. It writes:
#   - plugins/aspire/agents/atlas-<slug>.md            from scripts/templates/agent.md, with the
#                                                      artifact standard block, the orchestration
#                                                      contract block and the checkpoint paragraph
#                                                      copied from the files that own them
#   - plugins/aspire/skills/aspire/references/<slug>.md  the flow reference, from scripts/templates/flow.md
#   - docs/agent-specs/agents/NN-<name>.md             the spec, from scripts/templates/spec.md, numbered next;
#                                                      when a spec of that name already exists with no
#                                                      agent (plugin_agents: none), it names the new agent
#                                                      there instead
# and adds the agent's rows where agents are listed by hand:
#   - SKILL.md: the Sections index (the router entry), the Agent hand-off table, the Model tiers table
#   - plugins/aspire/README.md's agent table
#   - the agents panel: plugins/aspire-mod/hooks/roster.ts and a placeholder costume in costumes.ts
#   - orchestration.md section 7's permission level table
#   - scripts/eval/questions.json's "agents" map, with "approved": null
# Every line a person fills in carries TODO(new-agent). The checks pass on the scaffold as written;
# the judgment review flags each TODO(new-agent) until it is filled. CONTRIBUTING.md "Adding an agent"
# lists what to fill, in order. CI scaffolds a throwaway agent on every pull request and runs the
# checks on it, so the templates cannot drift from them.
#
#   scripts/new-agent.sh <slug> [--name "<Name>"] [--codes I1,P2] [--permission read|write|send|spend]
#                        [--model sonnet|inherit] [--team 1-6] [--wave 1-4]
#                        [--group insights|discover|create|program|measure] [--dry-run]
#   scripts/new-agent.sh --remove <slug> [--dry-run]
#
# <slug> is lower-case words joined by hyphens (the agent is atlas-<slug>). --codes are question codes
# from orchestration.md section 3 that have a row in page-standard's required-metrics table; the
# default is the existing spec's codes, or I1 without one. --name defaults to the slug in sentence case, --permission to read, --model to
# sonnet. --team, --group and the spec's personas default from the first code's letter (I: creator
# supply, P: content and ads, O and A: organic and operations). --dry-run prints every new file and a
# diff of every edit, and changes nothing. --remove undoes a scaffold whose agent and flow files still
# hold every TODO(new-agent) line; it refuses once they are filled, and when the spec it wrote is not
# the last one (removing it would leave a gap in the numbering). A spec that existed before the
# scaffold is kept and gets plugin_agents: none back.
set -euo pipefail
cd "$(dirname "$0")/.."
command -v python3 >/dev/null || { echo "new-agent.sh: python3 is needed" >&2; exit 1; }

python3 -I - "$@" <<'PY'
import difflib, glob, json, os, re, sys

USAGE = """usage: scripts/new-agent.sh <slug> [--name "<Name>"] [--codes I1,P2] [--permission read|write|send|spend]
                            [--model sonnet|inherit] [--team 1-6] [--wave 1-4]
                            [--group insights|discover|create|program|measure] [--dry-run]
       scripts/new-agent.sh --remove <slug> [--dry-run]"""

P = "plugins/aspire"
AGENTS = f"{P}/agents"
REFS = f"{P}/skills/aspire/references"
SKILL = f"{P}/skills/aspire/SKILL.md"
README = f"{P}/README.md"
ORCH = f"{REFS}/orchestration.md"
STD = f"{REFS}/artifact-standard.md"
PS = f"{P}/skills/page-standard/SKILL.md"
ROSTER = "plugins/aspire-mod/hooks/roster.ts"
COSTUMES = "plugins/aspire-mod/hooks/costumes.ts"
QJ = "scripts/eval/questions.json"
SPECS = "docs/agent-specs/agents"
TPL = "scripts/templates"
MARK = "TODO(new-agent)"

TEAMS = {"1": "Brand and market", "2": "Creator supply", "3": "Campaign and deals",
         "4": "Commerce and always-on", "5": "Content and ads", "6": "Organic and operations"}
BY_LETTER = {  # team, roster group, spec persona
    "I": ("2", "discover", "Influencer Manager"),
    "P": ("5", "create", "Paid Social Manager"),
    "O": ("6", "insights", "Organic Social Manager"),
    "A": ("6", "measure", "Influencer Manager"),
}
GROUPS = ("insights", "discover", "create", "program", "measure")
WRITES = {
    "read": ("writes nothing to Atlas",
             "Nothing. You publish the page and save no record.",
             "Nothing.",
             "Publishes its page; writes nothing to Atlas"),
    "write": ("saves its findings to Atlas when the user approved it",
              f"{MARK}: what you save (insights, calibrations, drafts) and under which key. Put every "
              "save in the result packet's `proposals` at level `write`; the main thread confirms the "
              "batch with one question, and you save only on a relaunch whose `approved` carries it.",
              f"{MARK}: what it saves, under one batch question.",
              f"{MARK}: what it saves"),
    "send": ("sends nothing until the user confirms each recipient",
             f"{MARK}: what you send and to whom. Put every send in the result packet's `proposals` at "
             "level `send`; the main thread confirms each recipient, order, or payment with its own "
             "question, and you send only on a relaunch whose `approved` carries that item.",
             f"{MARK}: what it sends, one question per item.",
             f"{MARK}: what it sends"),
    "spend": ("spends credits only after the user approves the cost",
              f"{MARK}: what you fetch or start that costs credits. Put it in the result packet's "
              "`proposals` at level `spend` with its cost; the main thread states the cost before the "
              "run, and you spend only on a relaunch whose `approved` carries it.",
              f"{MARK}: what it spends, with the cost stated first.",
              f"{MARK}: what it spends"),
}


def die(msg):
    print(f"new-agent.sh: {msg}", file=sys.stderr)
    sys.exit(1)


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def between(text, open_tag, close_tag, path):
    m = re.search(re.escape(open_tag) + r"\n(.*?)\n" + re.escape(close_tag), text, re.S)
    if not m:
        die(f"{path} has no {open_tag} block")
    return m.group(1).strip("\n")


def fill(template, values):
    out = re.sub(r"\{\{([A-Z_]+)\}\}", lambda m: values[m.group(1)], template)
    left = re.findall(r"\{\{[A-Z_]+\}\}", out)
    if left:
        die(f"a template placeholder has no value: {left[0]}")
    return out


def table_end(lines, start):
    """The index just past the Markdown table whose first row is at or after `start`."""
    i = start
    while i < len(lines) and not lines[i].startswith("|"):
        i += 1
    if i == len(lines):
        return None
    while i < len(lines) and lines[i].startswith("|"):
        i += 1
    return i


def heading_index(lines, pattern, path):
    for i, line in enumerate(lines):
        if re.match(pattern, line):
            return i
    die(f"{path} has no line matching {pattern!r}")


def question_codes():
    """{code: (question, default reader)} from orchestration.md section 3."""
    sec = re.search(r"^## 3\. .*?(?=^## )", read(ORCH), re.S | re.M)
    if not sec:
        die(f"{ORCH} has no section 3")
    codes = {}
    for row in re.findall(r"^\| ([IPOA][0-9]+) \|(.*)$", sec.group(0), re.M):
        cells = [c.strip() for c in row[1].split("|")]
        reader = re.search(r"`([a-z]+)`", cells[1])
        codes[row[0]] = (cells[0], reader.group(1) if reader else "team")
    return codes


def metric_rows():
    """{code: kind of question} from page-standard's required-metrics table."""
    block = between(read(PS), "<!-- required-metrics -->", "<!-- /required-metrics -->", PS)
    kinds = {}
    for row in block.splitlines()[2:]:
        cells = row.split("|")
        if len(cells) > 2:
            for c in re.findall(r"\b[IPOA][0-9]+\b", cells[2]):
                kinds[c] = cells[1].strip()
    return kinds


def specs():
    """{number: path} of every NN-name.md agent spec."""
    out = {}
    for path in glob.glob(f"{SPECS}/*.md"):
        m = re.match(r"(\d+)-", os.path.basename(path))
        if m:
            out[int(m.group(1))] = path
    return out


def plugin_agents(text):
    m = re.search(r"^plugin_agents:(.*)$", text, re.M)
    return [a.strip() for a in m.group(1).split(",")] if m else []


def spec_of(agent):
    return next((p for _, p in sorted(specs().items()) if agent in plugin_agents(read(p))), None)


def spec_named(name):
    """The spec whose file name ends in -<the name's slug>.md, which check-agent-specs keys on."""
    slug_ = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return next((p for _, p in sorted(specs().items()) if os.path.basename(p).endswith(f"-{slug_}.md")), None)


def set_plugin_agents(text, agents):
    return re.sub(r"^plugin_agents:.*$", "plugin_agents: " + (", ".join(agents) or "none"), text, count=1, flags=re.M)


def costume_block(lines, agent):
    """(start, end) of the costume entry `agent` wears, or None."""
    for i, line in enumerate(lines):
        if line.strip() == f"agent: 'aspire:{agent}',":
            s = i
            while lines[s] != "  {":
                s -= 1
            e = i
            while lines[e] != "  },":
                e += 1
            return s, e + 1
    return None


def json_text(data):
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"


# --- arguments -----------------------------------------------------------------------------------
args = sys.argv[1:]
opts = {"name": None, "codes": None, "permission": "read", "model": "sonnet", "team": None,
        "wave": "4", "group": None}
slug = None
remove = dry = False
i = 0
while i < len(args):
    a = args[i]
    if a in ("-h", "--help"):
        print(USAGE)
        sys.exit(0)
    elif a == "--dry-run":
        dry = True
    elif a == "--remove":
        remove = True
    elif a.startswith("--") and a[2:] in opts:
        if i + 1 >= len(args):
            die(f"{a} needs a value\n{USAGE}")
        opts[a[2:]] = args[i + 1]
        i += 1
    elif not a.startswith("-") and slug is None:
        slug = a
    else:
        die(f"unexpected argument {a!r}\n{USAGE}")
    i += 1

if not slug:
    die(USAGE)
if not re.fullmatch(r"[a-z]+(-[a-z]+)*", slug):
    die(f"the slug {slug!r} must be lower-case words joined by hyphens, with no digits (agents are atlas-[a-z-]+)")
if slug.startswith("atlas-"):
    slug = slug[len("atlas-"):]
agent = f"atlas-{slug}"
agent_path = f"{AGENTS}/{agent}.md"
flow_path = f"{REFS}/{slug}.md"

changes = {}  # path -> new text, or None to delete


# --- remove --------------------------------------------------------------------------------------
if remove:
    if not os.path.isfile(agent_path):
        die(f"{agent_path} does not exist; there is no scaffold to remove")
    # Never filled: every template line that carries a TODO(new-agent) and no placeholder is still there.
    for path, tpl in ((agent_path, "agent.md"), (flow_path, "flow.md")):
        if not os.path.isfile(path):
            continue
        have = {l.strip() for l in read(path).splitlines()}
        gone = [l.strip() for l in read(f"{TPL}/{tpl}").splitlines()
                if MARK in l and "{{" not in l and l.strip() not in have]
        if gone:
            die(f"{path} has been filled in ({gone[0]!r} is gone); remove it by hand if you mean to")
    spec = spec_of(agent)
    if spec and MARK not in read(spec):
        # A spec that existed before the scaffold: give it back its agent list without this agent.
        changes[spec] = set_plugin_agents(read(spec), [a for a in plugin_agents(read(spec)) if a not in (agent, "none")])
    elif spec:
        if spec != specs()[max(specs())]:
            die(f"{spec} is not the last spec; removing it would leave a gap in the numbering")
        changes[spec] = None
    changes[agent_path] = None
    if os.path.isfile(flow_path):
        changes[flow_path] = None

    row = f"| `{agent}` |"
    lines = read(SKILL).split("\n")
    changes[SKILL] = "\n".join(l for l in lines
                               if not l.startswith(row) and not (l.startswith("| **") and f"`references/{slug}.md`" in l))
    lines = read(README).split("\n")
    changes[README] = "\n".join(l for l in lines if not l.startswith(f"| Agent {row}"))
    lines = read(ORCH).split("\n")
    changes[ORCH] = "\n".join(l for l in lines if not l.startswith(row))
    lines = read(ROSTER).split("\n")
    changes[ROSTER] = "\n".join(l for l in lines if f"type: 'aspire:{agent}'," not in l)
    lines = read(COSTUMES).split("\n")
    block = costume_block(lines, agent)
    if block:
        changes[COSTUMES] = "\n".join(lines[:block[0]] + lines[block[1]:])
    data = json.loads(read(QJ))
    if agent in data.get("agents", {}):
        del data["agents"][agent]
        if not data["agents"]:
            del data["agents"]
        changes[QJ] = json_text(data)


# --- add -----------------------------------------------------------------------------------------
else:
    name = opts["name"] or slug.replace("-", " ").capitalize()
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9 ,&+-]*", name):
        die(f"the name {name!r} may hold only letters, digits, spaces and , & + -")
    permission = opts["permission"].lower()
    if permission not in WRITES:
        die(f"--permission must be read, write, send, or spend, not {opts['permission']!r}")
    model = opts["model"]
    if not re.fullmatch(r"[a-z0-9.-]+", model):
        die(f"--model {model!r} is not a model name (sonnet, inherit, opus)")
    # A spec already written for this agent (one with no plugin agent yet) is kept, not duplicated:
    # check-agent-specs keys skill files on the spec's name, so a second spec of that name fails it.
    old_spec = spec_named(name)
    old_codes = []
    if old_spec:
        if [a for a in plugin_agents(read(old_spec)) if a != "none"]:
            die(f"{old_spec} already has the name {name!r} and names its own agent; pick another --name")
        q = re.search(r"^## Questions answered\n(.*?)(?=^## |\Z)", read(old_spec), re.M | re.S)
        old_codes = re.findall(r"^\| ([IPOA][0-9]+) \|", q.group(1), re.M) if q else []
        if not old_codes:
            die(f"{old_spec} answers no question code yet. Add the codes this agent answers to its Questions "
                "answered table (one row per code, in the table shape docs/agent-specs/templates/agent.md "
                "shows), then run this again")
    raw = opts["codes"] or (",".join(old_codes) if old_codes else "I1")
    codes = list(dict.fromkeys(c.strip().upper() for c in raw.split(",") if c.strip()))
    if not codes:
        die("--codes needs at least one question code")
    if old_spec and old_codes and set(codes) - set(old_codes):
        die(f"{old_spec} answers {', '.join(old_codes)}; --codes {', '.join(sorted(set(codes) - set(old_codes)))} "
            "is not among them. Add the code to the spec's Questions answered first, or leave --codes out")
    known, kinds = question_codes(), metric_rows()
    for c in codes:
        if c not in known:
            die(f"{c} is not a question code in {ORCH} section 3 ({', '.join(sorted(known))})")
        if c not in kinds:
            die(f"{c} has no row in page-standard's required-metrics table ({PS}, section 8)")
    letter = codes[0][0]
    team = opts["team"] or BY_LETTER[letter][0]
    if team not in TEAMS:
        die(f"--team must be 1 to 6: {', '.join(f'{k} {v}' for k, v in TEAMS.items())}")
    wave = opts["wave"]
    if wave not in ("1", "2", "3", "4"):
        die("--wave must be 1 to 4")
    group = opts["group"] or BY_LETTER[letter][1]
    if group not in GROUPS:
        die(f"--group must be one of {', '.join(GROUPS)}")

    for path in (agent_path, flow_path):
        if os.path.exists(path):
            die(f"{path} already exists")
    named = spec_of(agent)
    if named:
        die(f"{named} already names {agent}")
    skill = read(SKILL)
    if f"**{name}**" in skill:
        die(f"SKILL.md already cites a section named **{name}**; pick another --name")

    personas = sorted({BY_LETTER[c[0]][2] for c in codes})
    short, long_, spec_writes, level_note = WRITES[permission]
    codes_text = " or ".join(codes) if len(codes) < 3 else ", ".join(codes[:-1]) + ", or " + codes[-1]
    orch = read(ORCH)
    values = {
        "AGENT": agent, "SLUG": slug, "NAME": name, "NAME_LOWER": name.lower(), "MODEL": model,
        "COLOR": "cyan", "CODES_TEXT": codes_text, "WRITES_SHORT": short, "WRITES_LONG": long_,
        "SPEC_WRITES": spec_writes, "PERMISSION_CAP": permission.capitalize(), "TEAM": f"{team} {TEAMS[team]}",
        "WAVE": wave, "PERSONAS": ", ".join(personas),
        "ARTIFACT_BLOCK": between(read(STD), "<!-- agent-block -->", "<!-- /agent-block -->", STD),
        "PACKET_BLOCK": between(orch, "<!-- packet-block -->", "<!-- /packet-block -->", ORCH),
        "CHECKPOINT_BLOCK": between(orch, "<!-- checkpoint-block -->", "<!-- /checkpoint-block -->", ORCH),
        "ASK_ROWS": "\n".join(["| Code | Question |", "| ---- | -------- |"]
                              + [f"| {c} | {known[c][0]} |" for c in codes]),
        "METRIC_ROWS": "\n".join(f"| {c} | {kinds[c]} | {MARK}: the metrics this flow adds, or \"None\" |" for c in codes),
        "QUESTION_ROWS": "\n".join(f"| {c} | {known[c][0]} | Self | {known[c][1]} | {MARK}: kind of page | None yet | Not yet |"
                                   for c in codes),
    }

    changes[agent_path] = fill(read(f"{TPL}/agent.md"), values)
    changes[flow_path] = fill(read(f"{TPL}/flow.md"), values)
    if old_spec:
        changes[old_spec] = set_plugin_agents(read(old_spec), [agent])
    else:
        number = max(specs(), default=0) + 1
        values["NUMBER"] = f"{number:02d}"
        spec_slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
        changes[f"{SPECS}/{number:02d}-{spec_slug}.md"] = fill(read(f"{TPL}/spec.md"), values)

    # SKILL.md: the router entry above **Theme**, then the hand-off and Model tiers rows at the end of
    # their tables.
    lines = skill.split("\n")
    at = heading_index(lines, r"^\| \*\*Theme\*\* ", SKILL)
    lines.insert(at, f"| **{name}** | `references/{slug}.md` |")
    end = table_end(lines, heading_index(lines, r"^### Agent hand-off", SKILL))
    lines.insert(end, f"| `{agent}` | Phase 1, then Phase 2 + 3, then **{name}** |")
    end = table_end(lines, heading_index(lines, r"^## Model tiers", SKILL))
    lines.insert(end, f"| `{agent}` | {model} | {MARK}: why this model fits the work |")
    changes[SKILL] = "\n".join(lines)

    lines = read(README).split("\n")
    last = max(i for i, l in enumerate(lines) if l.startswith("| Agent | `atlas-"))
    lines.insert(last + 1, f"| Agent | `{agent}` | {MARK}: what the agent hands the brand, what it reads "
                           "and writes, and whether it runs on a schedule. |")
    changes[README] = "\n".join(lines)

    # orchestration.md section 7: the agent's row, in name order.
    lines = orch.split("\n")
    head = heading_index(lines, r"^\| Agent \| Level \| What reaches it \|", ORCH)
    end = table_end(lines, head)
    names = [(i, re.match(r"^\| `(atlas-[a-z-]+)`", lines[i])) for i in range(head + 2, end)]
    at = next((i for i, m in names if m and m.group(1) > agent), end)
    lines.insert(at, f"| `{agent}` | {permission} | {level_note} |")
    changes[ORCH] = "\n".join(lines)

    # The agents panel: a roster card in its group and a placeholder costume after the agent costumes.
    lines = read(ROSTER).split("\n")
    in_group = [i for i, l in enumerate(lines) if f"group: '{group}' }}," in l]
    if in_group:
        at = in_group[-1] + 1
    else:  # the group has no card yet: the end of ROSTER, not of GROUPS above it
        start = heading_index(lines, r"^export const ROSTER\b", ROSTER)
        at = next((i for i in range(start, len(lines)) if lines[i] == "]"), None)
        if at is None:
            die(f"{ROSTER} has no closing ] for ROSTER")
    lines.insert(at, f"  {{ type: 'aspire:{agent}', name: '{name}', blurb: '{MARK}: one line on what it makes', "
                     f"group: '{group}' }},")
    changes[ROSTER] = "\n".join(lines)

    lines = read(COSTUMES).split("\n")
    keys = set(re.findall(r"^    key: '([a-z0-9-]+)',$", "\n".join(lines), re.M))
    key = slug if slug not in keys else f"{slug}-agent"
    first_variant = heading_index(lines, r"^    agent: null,$", COSTUMES)
    while lines[first_variant] != "  {":
        first_variant -= 1
    costume = [
        "  {",
        f"    key: '{key}',",
        f"    name: '{MARK}: the prop',",
        f"    agent: 'aspire:{agent}',",
        "    color: I.sky,",
        "    anim: 'sway',",
        "    held: [",
        "      '..kkkk..',",
        "      '.kwwwwk.',",
        "      '.kwllwk.',",
        "      '.kwwwwk.',",
        "      '.kwllwk.',",
        "      '.kwwwwk.',",
        "      '..kkkk..',",
        "      '...kk...',",
        "      '...kk...',",
        "    ],",
        "    head: null,",
        "    headAt: [8, 3],",
        "  },",
    ]
    changes[COSTUMES] = "\n".join(lines[:first_variant] + costume + lines[first_variant:])

    data = json.loads(read(QJ))
    data.setdefault("agents", {})[agent] = {"codes": codes, "approved": None}
    changes[QJ] = json_text(data)


# --- write or show -------------------------------------------------------------------------------
for path, text in changes.items():
    old = read(path) if os.path.isfile(path) else None
    if old == text:
        continue
    if dry:
        if text is None:
            print(f"=== delete {path}")
        elif old is None:
            print(f"=== new {path}\n{text}")
        else:
            sys.stdout.writelines(difflib.unified_diff(old.splitlines(True), text.splitlines(True), path, path))
        continue
    if text is None:
        os.remove(path)
    else:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(text)
    print(("removed " if text is None else "wrote   " if old is None else "edited  ") + path)

if not dry:
    if remove:
        print(f"\n{agent} is gone. Check `git status` for anything left over.")
    else:
        print(f"\nScaffolded {agent}. Fill every {MARK} line, in the order CONTRIBUTING.md \"Adding an agent\" "
              f"gives, then run the checks it lists.\n  grep -rn '{MARK}' plugins docs scripts/eval")
PY
