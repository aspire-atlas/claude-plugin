# Applicant CSV snippet

The reader for a campaign's applicant export from Aspire, used by **Applicant review**,
**Importing applicants**, **Read every column**, and by **Creator vetting**, **Getting the list**,
for an uploaded CSV. It reads the file with Python's `csv` module, so no line is cut and quoted
cells that hold commas or line breaks stay whole, and it leaves out payment and tax data before
Claude reads a row. `scripts/check-applicant-csv.sh` runs the command below on every fixture in
`scripts/fixtures/applicant-csv/`.

**Running it.** Make one temporary folder per import, copy the file there once, and keep the
folder's path (the first line printed) for every later run, since shell state does not carry
between calls. A failed first run removes the folder itself:

<!-- applicant-csv-run -->
```
d=$(mktemp -d) && cp "{csv path}" "$d/applicants.csv" && awk '/^<!-- applicant-csv -->$/{f=1;next} /^<!-- \/applicant-csv -->$/{f=0} f' "${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/applicant-csv.md" | sed '1d;$d' > "$d/applicant_csv.py" && echo "$d" && python3 -I "$d/applicant_csv.py" "$d/applicants.csv" 0 || rm -rf "$d"
```
<!-- /applicant-csv-run -->

Each run prints rows up to about 20,000 characters, so its output is never cut, and ends with
`{"next": n}` while rows remain: run `python3 -I "{folder}/applicant_csv.py"
"{folder}/applicants.csv" {n}` next. After the last run, and whenever the import stops early
(an error, "Not now", or the user stopping), `rm -rf "{folder}"`. With no Python, say so: the
import stops, and a plain list is read with the `Read` tool instead. When a run prints `error`,
say it in one line and stop the import the same way.

**What it prints.** The first run (start `0`) prints one line first: `rows` (applicant rows, blank
rows not counted), `encoding` (`utf-8`, `utf-16`, `cp1252` for a file Excel saved in Windows
encoding, or `latin-1`), `kept` (the column keys printed), `left_out` (the columns left out), and
`cells_left_out`. Then one line per row: `row`, its row number in the file (the header is row 1,
a blank row still counts), and `cells`, its non-empty cells, trimmed, under their keys. A key is
the header as written, trimmed; a header that repeats gets ` (2)`, ` (3)`. A file that mixes UTF-8
with another encoding prints only `error`: ask for it saved again as CSV UTF-8.

**What it leaves out**, so it is kept nowhere and the report names it:

- every column whose header matches `PAY` below;
- in every other column except the ones `KEEP` names (a header that is exactly a handle, name,
  email, phone, place, or id header), every run of 13 to 19 digits that passes the Luhn check (a
  card number) and every IBAN, wherever it sits in the cell: the match becomes `[left out]`, and
  `cells_left_out` counts the cells;
- such a column whole, when more than half its non-empty cells hold one.

<!-- applicant-csv -->
```python
import csv, io, json, re, sys

path, start = sys.argv[1], int(sys.argv[2])
PAY = re.compile(r"\b(payments?|pay ?pal|venmo|zelle|cash ?app|bank|account (number|no)|acct|routing|"
                 r"sort code|iban|swift|bic|tax|tin|ein|w-?9|w-?8|ssn|social security|"
                 r"national insurance|card (number|no)|credit card|debit card|cvv|cvc|payouts?)\b", re.I)
KEEP = re.compile(r"^((instagram|tiktok|youtube)( handle| username| url| profile)?|handle|username|"
                  r"social|profile url|(full |first |last )?name|creator|((aspire )?applicant |member |"
                  r"creator )?id|e-?mail( address)?|(phone|mobile)( number)?|address|street|city|state|"
                  r"country|region|zip( code)?|postal code)$", re.I)
CARD = re.compile(r"(?<![\d-])\d(?:[ -]?\d){12,18}(?![\d-])")
IBAN = re.compile(r"\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]){11,30}\b")
LIMIT = 20000


def luhn(s):
    d = [int(c) for c in reversed(s)]
    return (sum(d[0::2]) + sum(sum(divmod(2 * x, 10)) for x in d[1::2])) % 10 == 0


def scrub(v):
    v = CARD.sub(lambda m: "[left out]" if luhn(re.sub(r"\D", "", m.group())) else m.group(), v)
    return IBAN.sub("[left out]", v)


raw = open(path, "rb").read()
if raw.startswith((b"\xff\xfe", b"\xfe\xff")):
    text, enc = raw.decode("utf-16"), "utf-16"
else:
    try:
        text, enc = raw.decode("utf-8-sig"), "utf-8"
    except UnicodeDecodeError:
        if re.search(rb"[\xc2-\xf4][\x80-\xbf]", raw):
            print(json.dumps({"error": "The file mixes UTF-8 with another encoding; save it again as CSV UTF-8."}))
            sys.exit(2)
        try:
            text, enc = raw.decode("cp1252"), "cp1252"
        except UnicodeDecodeError:
            text, enc = raw.decode("latin-1"), "latin-1"
rows = list(csv.reader(io.StringIO(text, newline="")))
head = [h.strip() for h in rows[0]] if rows else []
body = [(n, r) for n, r in enumerate(rows[1:], 2) if any(c.strip() for c in r)]
seen, keys = {}, []
for h in head:
    seen[h.lower()] = seen.get(h.lower(), 0) + 1
    keys.append(h if seen[h.lower()] == 1 else f"{h} ({seen[h.lower()]})")
check = {i for i, h in enumerate(head) if not KEEP.match(h)}
out = set()
for i, h in enumerate(head):
    vals = [r[i].strip() for _, r in body if i < len(r) and r[i].strip()]
    if PAY.search(h) or (i in check and vals and sum(scrub(v) != v for v in vals) * 2 > len(vals)):
        out.add(i)


def cells(r):
    got, cut = {}, 0
    for i, c in enumerate(r):
        c = c.strip()
        if i >= len(keys) or i in out or not c:
            continue
        if i in check and scrub(c) != c:
            c, cut = scrub(c), cut + 1
        got[keys[i]] = c
    return got, cut


if start == 0:
    print(json.dumps({"rows": len(body), "encoding": enc,
                      "kept": [k for i, k in enumerate(keys) if i not in out],
                      "left_out": [k for i, k in enumerate(keys) if i in out],
                      "cells_left_out": sum(cells(r)[1] for _, r in body)}, ensure_ascii=False))
size, k = 0, start
while k < len(body) and (k == start or size < LIMIT):
    line = json.dumps({"row": body[k][0], "cells": cells(body[k][1])[0]}, ensure_ascii=False)
    if k > start and size + len(line) > LIMIT:
        break
    print(line)
    size, k = size + len(line), k + 1
if k < len(body):
    print(json.dumps({"next": k}))
```
<!-- /applicant-csv -->
