# Applicant CSV snippet

The reader for a campaign's applicant export from Aspire, used by **Applicant review**,
**Importing applicants**, **Read every column**, and by **Creator vetting**, **Getting the list**,
for an uploaded CSV. It reads the file with Python's `csv` module, so no line is cut and quoted
cells that hold commas or line breaks stay whole, and it leaves out payment and tax data before
Claude reads a row. `scripts/check-applicant-csv.sh` runs the command below on every fixture in
`scripts/fixtures/applicant-csv/`.

## Contents

- [Running it](#running-it)
- [What it prints](#what-it-prints)
- [What it leaves out](#what-it-leaves-out)
- [The snippet](#the-snippet)

## Running it

Make one temporary folder per import, copy the file there once, and keep the
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

## What it prints

The first run (start `0`) prints one line first: `rows` (applicant rows, blank
rows not counted), `encoding` (`utf-8`, `utf-16`, `cp1252` for a file Excel saved in Windows
encoding, or `latin-1`), `kept` (the column keys printed), `left_out` (the columns left out), and
`cells_left_out`. Then one line per row: `row`, its row number in the file (the header is row 1,
a blank row still counts), and `cells`, its non-empty cells, trimmed, under their keys. A key is
the header as written, trimmed; a header that repeats gets ` (2)`, ` (3)`. Columns may be
separated by commas, tabs (Excel's "Unicode Text"), or semicolons: the header line decides. A row
too long for one run alone has its long cells cut to fit, ending `…`, and a `cut` map of each cut
column to its full length: the report names the row and those columns, since their full text is
not imported. A file that mixes UTF-8 with another encoding prints only `error`: ask for it saved
again as CSV UTF-8.

## What it leaves out

Payment and tax data, so it is kept nowhere and the report names it:

- every column whose header matches `PAY` below;
- in every other column except the ones `KEEP` names (a header that is exactly a handle, name,
  email, phone, place, or id header), wherever it sits in the cell: any run of 13 or more digits
  (spaces and dashes allowed) holding 13 to 19 digits in a row that pass the Luhn check (a card
  number, with any expiry or CVV digits next to it), and any IBAN whose check digits are right,
  in any case, with spaces or dashes. The match becomes `[left out]`, and `cells_left_out` counts
  the cells;
- such a column whole, when more than half its non-empty cells hold one.

## The snippet

<!-- applicant-csv -->
```python
import csv, io, json, re, sys

path, start = sys.argv[1], int(sys.argv[2])
PAY = re.compile(r"\b(payments?|pay ?pal|venmo|zelle|cash ?app|bank|account (number|no)|acct|routing|"
                 r"sort code|iban|swift|bic|tax|tin|ein|w-?9|w-?8|ssn|social security|"
                 r"national insurance|card (number|no)|credit card|debit card|cvv|cvc|payouts?)\b", re.I)
KEEP = {"instagram", "instagram handle", "instagram username", "instagram url", "tiktok", "tiktok handle",
        "tiktok username", "tiktok url", "youtube", "youtube url", "handle", "username", "social",
        "profile url", "name", "full name", "first name", "last name", "creator", "id", "applicant id",
        "aspire applicant id", "member id", "creator id", "email", "email address", "e-mail", "phone",
        "phone number", "mobile", "mobile number", "address", "street", "city", "state", "country",
        "region", "zip", "zip code", "postal code"}
DIGITS = re.compile(r"\d(?:[ -]?\d){12,}")
IBAN = re.compile(r"\b[A-Z]{2}\d{2}(?:[ -]?[A-Z0-9]){11,30}", re.I)
LIMIT = 20000


def luhn(s):
    d = [int(c) for c in reversed(s)]
    return (sum(d[0::2]) + sum(sum(divmod(2 * x, 10)) for x in d[1::2])) % 10 == 0


def card(m):
    s = re.sub(r"\D", "", m.group())
    hit = any(luhn(s[i:i + n]) for n in range(13, 20) for i in range(len(s) - n + 1))
    return "[left out]" if hit else m.group()


def iban(m):
    g = m.group()
    for end in range(len(g), 14, -1):
        s = re.sub(r"[ -]", "", g[:end]).upper()
        if g[end - 1] not in " -" and 15 <= len(s) <= 34 and int("".join(str(int(c, 36)) for c in s[4:] + s[:4])) % 97 == 1:
            return "[left out]" + g[end:]
    return g


def scrub(v):
    return DIGITS.sub(card, IBAN.sub(iban, v))


raw = open(path, "rb").read()
if raw.startswith((b"\xff\xfe", b"\xfe\xff")):
    text, enc = raw.decode("utf-16"), "utf-16"
else:
    try:
        text, enc = raw.decode("utf-8-sig"), "utf-8"
    except UnicodeDecodeError:
        if any(ord(c) > 127 for c in raw.decode("utf-8", errors="ignore")):
            print(json.dumps({"error": "The file mixes UTF-8 with another encoding; save it again as CSV UTF-8."}))
            sys.exit(2)
        try:
            text, enc = raw.decode("cp1252"), "cp1252"
        except UnicodeDecodeError:
            text, enc = raw.decode("latin-1"), "latin-1"
first = text.split("\n", 1)[0]
delim = max(",\t;", key=first.count) if any(d in first for d in ",\t;") else ","
rows = list(csv.reader(io.StringIO(text, newline=""), delimiter=delim))
head = [h.strip() for h in rows[0]] if rows else []
seen, keys = {}, []
for h in head:
    seen[h.lower()] = seen.get(h.lower(), 0) + 1
    keys.append(h if seen[h.lower()] == 1 else f"{h} ({seen[h.lower()]})")
check = {i for i, h in enumerate(head) if h.lower() not in KEEP}
# Every non-empty cell once, with its scrubbed text: (row number, [(column, text, was it scrubbed)]).
body = []
for n, r in enumerate(rows[1:], 2):
    got = []
    for i, c in enumerate(r[:len(keys)]):
        c = c.strip()
        if c:
            s = scrub(c) if i in check else c
            got.append((i, s, s != c))
    if got:
        body.append((n, got))
out = {i for i, h in enumerate(head) if PAY.search(h)}
for i in check - out:
    hits = [x for _, got in body for j, _, x in got if j == i]
    if hits and sum(hits) * 2 > len(hits):
        out.add(i)


def line(n, got):
    cells = {keys[i]: s for i, s, _ in got if i not in out}
    text = json.dumps({"row": n, "cells": cells}, ensure_ascii=False)
    if len(text) <= LIMIT:
        return text
    # One row too long for a run: cut its long cells to share the limit, and say which and how long.
    cap = LIMIT // (len(cells) + 1)
    cut = {k: len(v) for k, v in cells.items() if len(v) > cap}
    cells = {k: v[:cap] + "…" if k in cut else v for k, v in cells.items()}
    return json.dumps({"row": n, "cells": cells, "cut": cut}, ensure_ascii=False)


size = 0
if start == 0:
    head_line = json.dumps({"rows": len(body), "encoding": enc,
                            "kept": [k for i, k in enumerate(keys) if i not in out],
                            "left_out": [k for i, k in enumerate(keys) if i in out],
                            "cells_left_out": sum(x for _, got in body for i, _, x in got if i not in out)},
                           ensure_ascii=False)
    print(head_line)
    size = len(head_line)
for k in range(start, len(body)):
    text = line(*body[k])
    if k > start and size + len(text) > LIMIT:
        print(json.dumps({"next": k}))
        break
    print(text)
    size += len(text)
```
<!-- /applicant-csv -->
