#!/usr/bin/env bash
# Checks that each request in scripts/agent-triggers.json starts the agent it names and no other:
# the agent's description lists the request among its "Trigger on" phrases, and no other agent's
# description lists it or a phrase contained in it. Placeholders ({brand}, {n}) match any
# placeholder. A case whose agent has no file yet waits, and must name the ticket that adds the agent
# ("waitsFor"), so a case naming an agent that will never exist fails rather than waiting forever.
#
#   scripts/check-agent-triggers.sh
set -euo pipefail
cd "$(dirname "$0")/.."
command -v python3 >/dev/null || { echo "FAIL python3 is needed"; exit 1; }

python3 - <<'PY'
import glob, json, os, re, sys

def description(path):
    lines = open(path, encoding="utf-8").read().split("\n")
    if not lines or lines[0] != "---":
        return ""
    out, inside = [], False
    for line in lines[1:]:
        if line == "---":
            break
        if line.startswith("description:"):
            rest = line[len("description:"):].strip()
            if rest not in ("|", ">", "|-", ">-"):
                return rest
            inside = True
            continue
        if inside:
            if line and not line[0].isspace():
                break
            out.append(line.strip())
    return " ".join(out)

def triggers(desc):
    # Every quoted phrase in the sentences that start "Trigger on".
    phrases = []
    for start in [m.end() for m in re.finditer(r"Trigger on", desc)]:
        text, quoted, buf = desc[start:], False, ""
        for ch in text:
            if ch == '"':
                if quoted:
                    phrases.append(buf)
                    buf = ""
                quoted = not quoted
            elif quoted:
                buf += ch
            elif ch == ".":
                break
    return phrases

def norm(s):
    s = re.sub(r"\{[^}]*\}", "{}", s.lower())
    return re.sub(r"[^a-z0-9{} ]+", "", s).strip()

agents = {}
for path in sorted(glob.glob("plugins/*/agents/*.md")):
    name = os.path.basename(path)[:-3]
    agents[name] = [norm(p) for p in triggers(description(path))]

cases = json.load(open("scripts/agent-triggers.json", encoding="utf-8"))["cases"]
fail = waiting = checked = 0
for case in cases:
    request, want = norm(case["request"]), case["agent"]
    padded = f" {request} "
    others = sorted(a for a, ps in agents.items() if a != want and any(p and f" {p} " in padded for p in ps))
    if others:
        print(f'FAIL "{case["request"]}" also starts {", ".join(others)} ({case["why"]})')
        fail += 1
    if want not in agents:
        if not re.fullmatch(r"ASP-\d+", case.get("waitsFor", "")):
            print(f'FAIL "{case["request"]}": {want} has no agent file, and the case names no ticket in "waitsFor"')
            fail += 1
            continue
        print(f'wait "{case["request"]}": {want} has no agent file yet ({case["waitsFor"]})')
        waiting += 1
        continue
    checked += 1
    if request not in agents[want]:
        print(f'FAIL "{case["request"]}" is not among {want}\'s "Trigger on" phrases ({case["why"]})')
        fail += 1

if fail:
    sys.exit(1)
print(f"OK   {checked} trigger cases start their agent and no other; {waiting} wait for their agent")
PY
