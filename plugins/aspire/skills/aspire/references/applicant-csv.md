# Applicant CSV snippet

The reader for a campaign's applicant export from Aspire, used by **Applicant review**,
**Importing applicants**, step 1, and by **Creator vetting**, **Getting the list**, for an uploaded
CSV. It reads the file with Python's `csv` module, so no line is cut and quoted cells that hold
commas or line breaks stay whole, and it leaves out payment and tax data before Claude reads a row.
`scripts/check-applicant-csv.sh` runs it on every fixture in `scripts/fixtures/applicant-csv/`.

**Running it.** Make one temporary folder per import, copy the file there once, and keep the
folder's path for every later run (shell state does not carry between calls):

```
d=$(mktemp -d) && cp "{csv path}" "$d/applicants.csv" && awk '/^<!-- applicant-csv -->$/{f=1;next} /^<!-- \/applicant-csv -->$/{f=0} f' "${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/applicant-csv.md" | sed '1d;$d' > "$d/applicant_csv.py" && echo "$d" && python3 -I "$d/applicant_csv.py" "$d/applicants.csv" 0 100
```

Then `python3 -I "{folder}/applicant_csv.py" "{folder}/applicants.csv" 100 100`, and so on, up to
the row count the first run printed; 25 rows at a time when a run's output comes back cut. After
the last run, `rm -rf "{folder}"`. With no Python, say so: the import stops, and a plain list is
read with the `Read` tool instead.

**What it prints.** The first run (start `0`) prints one line first: `rows` (applicant rows, blank
rows not counted), `encoding` (`utf-8`, or `cp1252` for a file Excel saved in Windows encoding),
`kept` (the column keys printed), `left_out` (the columns left out), and `cells_left_out`. Then one
line per row: `row`, its row number in the file (the header is row 1, a blank row still counts),
and `cells`, its non-empty cells, trimmed, under their keys. A key is the header as written,
trimmed; a header that repeats gets ` (2)`, ` (3)`.

**What it leaves out**, so it is kept nowhere and the report names it:

- every column whose header matches `PAY` below;
- every column, other than a handle, name, place, contact, or id column (`SKIP`), where more than
  half the non-empty cells are shaped like a card number (13 to 19 digits that pass the Luhn check)
  or an IBAN;
- any single cell shaped like those in such a column, counted in `cells_left_out`.

<!-- applicant-csv -->
```python
import csv, io, json, re, sys

path, start, count = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
PAY = re.compile(r"\b(payments?|pay ?pal|venmo|zelle|cash ?app|bank|account (number|no)|acct|routing|"
                 r"sort code|iban|swift|bic|tax|tin|ein|w-?9|w-?8|ssn|social security|"
                 r"national insurance|card (number|no)|credit card|debit card|cvv|cvc|payouts?)\b", re.I)
SKIP = re.compile(r"instagram|tiktok|youtube|handle|user ?name|social|profile|url|link|name|creator|"
                  r"\bid\b|address|street|city|state|country|region|zip|postal|phone|mobile|cell|"
                  r"whatsapp|\btel\b|e-?mail", re.I)
IBAN = re.compile(r"^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$")


def luhn(s):
    d = [int(c) for c in reversed(s)]
    return (sum(d[0::2]) + sum(sum(divmod(2 * x, 10)) for x in d[1::2])) % 10 == 0


def account_like(v):
    s = re.sub(r"[ -]", "", v.strip())
    return bool(IBAN.match(s.upper())) or (s.isdigit() and 13 <= len(s) <= 19 and luhn(s))


raw = open(path, "rb").read()
try:
    text, enc = raw.decode("utf-8-sig"), "utf-8"
except UnicodeDecodeError:
    text, enc = raw.decode("cp1252", errors="replace"), "cp1252"
rows = list(csv.reader(io.StringIO(text, newline="")))
head = [h.strip() for h in rows[0]] if rows else []
body = [(n, r) for n, r in enumerate(rows[1:], 2) if any(c.strip() for c in r)]
seen, keys = {}, []
for h in head:
    seen[h.lower()] = seen.get(h.lower(), 0) + 1
    keys.append(h if seen[h.lower()] == 1 else f"{h} ({seen[h.lower()]})")
check = {i for i, h in enumerate(head) if not SKIP.search(h)}
out = set()
for i, h in enumerate(head):
    vals = [r[i] for _, r in body if i < len(r) and r[i].strip()]
    if PAY.search(h) or (i in check and vals and sum(map(account_like, vals)) * 2 > len(vals)):
        out.add(i)
cut = sum(1 for _, r in body for i, c in enumerate(r)
          if i in check and i not in out and c.strip() and account_like(c))
if start == 0:
    print(json.dumps({"rows": len(body), "encoding": enc,
                      "kept": [k for i, k in enumerate(keys) if i not in out],
                      "left_out": [k for i, k in enumerate(keys) if i in out],
                      "cells_left_out": cut}, ensure_ascii=False))
for n, r in body[start:start + count]:
    cells = {keys[i]: c.strip() for i, c in enumerate(r) if i < len(keys) and i not in out
             and c.strip() and not (i in check and account_like(c))}
    print(json.dumps({"row": n, "cells": cells}, ensure_ascii=False))
```
<!-- /applicant-csv -->
