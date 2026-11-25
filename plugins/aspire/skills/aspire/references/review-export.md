# Review export snippet

The writer for a review's applicants as an Aspire member import, used by **Creator CSV**, **A
review's applicants**. Claude saves one JSON object per applicant in a temporary folder; the snippet
checks them and prints the CSV, split into parts that fit Aspire's import limits (under 5,000 rows
and under 2 MB a file), so the quoting, line ends, and limits never depend on Claude writing a file
by hand. `scripts/check-review-export.sh` runs it on every fixture in
`scripts/fixtures/review-export/`.

## Contents

- [Running it](#running-it)
- [The rows](#the-rows)
- [What it prints](#what-it-prints)
- [The snippet](#the-snippet)

## Running it

Make one temporary folder per export and keep its path (the first line printed) for every later
run, since shell state does not carry between calls. A failed run removes the folder itself:

<!-- review-export-run -->
```
d=$(mktemp -d) && awk '/^<!-- review-export -->$/{f=1;next} /^<!-- \/review-export -->$/{f=0} f' "${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/review-export.md" | sed '1d;$d' > "$d/review_export.py" && echo "$d" || rm -rf "$d"
```
<!-- /review-export-run -->

Then:

1. Write the rows (**The rows**) with the `Write` tool as `{folder}/rows-1.jsonl`,
   `{folder}/rows-2.jsonl`, and so on, at most 300 rows a file, in the order the file should have,
   and the Decision column's header (`{Campaign} Vetting`) as the only line of
   `{folder}/vetting-column.txt`. With no such file the header is `Vetting`.
2. `python3 -I "{folder}/review_export.py" "{folder}" plan`. It prints one line: the plan, or
   `{"error": ...}`. On an error, fix the row it names and run `plan` again.
3. For each part the plan lists, `python3 -I "{folder}/review_export.py" "{folder}" part {n} >
   "{file path}"`, where the file path is the one **Creator CSV**, **File** names, with
   `-part-{n}` before `.csv` when the plan has more than one part.
4. `rm -rf "{folder}"`, after the last part and whenever the export stops early.

With no Python, say so and write the file by hand per **Creator CSV**, **File**, splitting it
yourself at 4,998 rows.

## The rows

One JSON object per line, one line per applicant. Its keys are the columns **Creator CSV**, **A
review's applicants**, step 4 lists (`email`, `First Name`, `Last Name`, `Instagram`, `YouTube`,
`TikTok`, `Pinterest`, `Groups`, `Projects`, `Owners`, `Tags`), plus `Decision`, spelled exactly; a
column with nothing in it may be left out. Every value is text. `Tags`, `Groups`, and `Projects`
may be a list instead: the snippet removes any `|` or `,` from each item and joins them with `|`.
`Decision` is `Approve`, `Maybe`, `Reject`, or empty; its key in the rows is always `Decision`,
whatever `vetting-column.txt` names the column.

The snippet never trusts a value to be safe: it turns line breaks into spaces, trims each cell, and
puts a `'` in front of a cell that starts with `=`, `+`, `-`, `@`, or a tab, so no spreadsheet runs
it as a formula.

## What it prints

`plan` prints `{"rows", "parts": [{"part", "rows", "bytes"}], "decisions": {"Approve", "Maybe",
"Reject", "none"}, "guarded", "no_email", "shared_email", "no_contact"}`: `guarded` counts the
cells that got a `'`, `no_email` counts rows with no email, `shared_email` lists each email on more
than one row (Aspire makes those rows one member), and `no_contact` lists the row numbers of rows
with no email, Instagram, TikTok, or YouTube, which Aspire has nothing to match a member on. Errors
name the file and line: a line that is not a JSON object, an unknown column, a value that is not
text, a `Decision` outside the four, or a row over the size limit by itself.

`part {n}` prints that part's bytes: a UTF-8 byte order mark, the header row, and its rows, quoted
per RFC 4180 with CRLF line ends. Every part has the header, and rows are never split between parts.

## The snippet

<!-- review-export -->
```python
import csv, io, json, os, re, sys

folder, mode = sys.argv[1], sys.argv[2]
COLUMNS = ["email", "First Name", "Last Name", "Instagram", "YouTube", "TikTok", "Pinterest", "Groups",
           "Projects", "Owners", "Tags", "Decision"]
LISTS = {"Tags", "Groups", "Projects"}
DECISIONS = {"Approve", "Maybe", "Reject", ""}
MAX_ROWS = 4998          # rows a part holds; with its header it stays under 5,000
MAX_BYTES = 2000000      # under 2 MB, counting the byte order mark
BOM = "﻿".encode("utf-8")


def fail(msg):
    print(json.dumps({"error": msg}))
    sys.exit(0)


def clean(v):
    return re.sub(r"[\r\n]+", " ", v).strip()


def cell(v, guard):
    if v and v[0] in "=+-@\t":
        guard[0] += 1
        return "'" + v
    return v


def line(values):
    buf = io.StringIO()
    csv.writer(buf, lineterminator="\r\n").writerow(values)
    return buf.getvalue().encode("utf-8")


def decision_header():
    path = os.path.join(folder, "vetting-column.txt")
    if not os.path.exists(path):
        return "Vetting"
    with open(path, encoding="utf-8-sig") as f:
        name = re.sub(r"\s+", " ", f.read()).strip()
    if not name:
        fail("vetting-column.txt is empty")
    if name in COLUMNS[:-1]:
        fail(f"vetting-column.txt names {name!r}, which is already a column")
    return name


def load():
    names = [n for n in os.listdir(folder) if re.fullmatch(r"rows-(\d+)\.jsonl", n)]
    names.sort(key=lambda n: int(re.fullmatch(r"rows-(\d+)\.jsonl", n).group(1)))
    if not names:
        fail("no rows-<n>.jsonl files in the folder")
    rows, guard = [], [0]
    for name in names:
        with open(os.path.join(folder, name), encoding="utf-8-sig") as f:
            for i, text in enumerate(f, 1):
                if not text.strip():
                    continue
                where = f"{name} line {i}"
                try:
                    obj = json.loads(text)
                except ValueError:
                    fail(f"{where}: not JSON")
                if not isinstance(obj, dict):
                    fail(f"{where}: not a JSON object")
                for k in obj:
                    if k not in COLUMNS:
                        fail(f"{where}: unknown column {k!r}")
                row = []
                for col in COLUMNS:
                    v = obj.get(col, "")
                    if v is None:
                        v = ""
                    if isinstance(v, list) and col in LISTS:
                        if not all(isinstance(x, str) for x in v):
                            fail(f"{where}: {col} holds a value that is not text")
                        v = "|".join(p for p in (re.sub(r"\s+", " ", re.sub(r"[|,]", "", x)).strip() for x in v) if p)
                    elif not isinstance(v, str):
                        fail(f"{where}: {col} is not text")
                    v = clean(v)
                    if col == "Decision" and v not in DECISIONS:
                        fail(f"{where}: Decision {v!r} is not Approve, Maybe, Reject, or empty")
                    row.append(v)
                rows.append((where, row))
    return rows, guard


rows, guard = load()
header = line([cell(v, [0]) for v in COLUMNS[:-1] + [decision_header()]])
parts, cur, size = [], [], len(BOM) + len(header)
for where, row in rows:
    b = line([cell(v, guard) for v in row])
    if len(BOM) + len(header) + len(b) >= MAX_BYTES:
        fail(f"{where}: this row alone is over the 2 MB limit")
    if cur and (len(cur) >= MAX_ROWS or size + len(b) >= MAX_BYTES):
        parts.append((cur, size))
        cur, size = [], len(BOM) + len(header)
    cur.append(b)
    size += len(b)
parts.append((cur, size))

if mode == "plan":
    dec = {"Approve": 0, "Maybe": 0, "Reject": 0, "none": 0}
    i_dec, i_email = COLUMNS.index("Decision"), COLUMNS.index("email")
    contact = [COLUMNS.index(c) for c in ("email", "Instagram", "TikTok", "YouTube")]
    no_contact, emails = [], {}
    for n, (where, row) in enumerate(rows, 1):
        dec[row[i_dec] or "none"] += 1
        if row[i_email]:
            key = row[i_email].lower()
            emails[key] = emails.get(key, 0) + 1
        if not any(row[j] for j in contact):
            no_contact.append(f"row {n}")
    print(json.dumps({"rows": len(rows),
                      "parts": [{"part": k, "rows": len(p), "bytes": s} for k, (p, s) in enumerate(parts, 1)],
                      "decisions": dec, "guarded": guard[0],
                      "no_email": sum(1 for _, r in rows if not r[i_email]),
                      "shared_email": sorted(e for e, c in emails.items() if c > 1),
                      "no_contact": no_contact}))
elif mode == "part":
    k = int(sys.argv[3])
    if not 1 <= k <= len(parts):
        fail(f"there is no part {k}; the plan has {len(parts)}")
    out = sys.stdout.buffer
    out.write(BOM + header + b"".join(parts[k - 1][0]))
    out.flush()
else:
    fail(f"unknown mode {mode!r}: use plan or part <n>")
```
<!-- /review-export -->
