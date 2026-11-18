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
`{"next": n}` while rows remain (`"r0"` when the header line alone filled the first run): run `python3 -I "{folder}/applicant_csv.py"
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
too long for one run alone has its long cells cut to fit, each ending `…[cut, n characters]`: the
report names the row and those columns, since their full text is not imported. A file that mixes UTF-8 with another encoding prints only `error`: ask for it saved
again as CSV UTF-8.

## What it leaves out

Payment and tax data, so it is kept nowhere and the report names it:

- every column whose header matches `PAY` below;
- in every other column except the ones `KEEP` names (a header that is exactly a handle, name,
  email, phone, place, or id header), wherever it sits in the cell: a card number (13 to 19
  digits, spaces or dashes allowed, that pass the Luhn check, alone or with a short expiry or CVV
  group at either end, and not inside a link) and an IBAN (in any case, spaces or dashes allowed,
  exactly its country's length, with the right check digits). The match becomes `[left out]`, and
  `cells_left_out` counts the cells;
- such a column whole, when more than half its non-empty cells hold one.

## The snippet

<!-- applicant-csv -->
```python
import csv, io, json, re, sys

path, arg = sys.argv[1], sys.argv[2]
start = int(arg.lstrip("r"))  # "r0": rows from 0, without the summary line
PAY = re.compile(r"\b(payments?|pay ?pal|venmo|zelle|cash ?app|bank|account (number|no)|acct|routing|"
                 r"sort code|iban|swift|bic|tax|tin|ein|w-?9|w-?8|ssn|social security|"
                 r"national insurance|card (number|no)|credit card|debit card|cvv|cvc|payouts?)\b", re.I)
KEEP = {"instagram", "instagram handle", "instagram username", "instagram url", "tiktok", "tiktok handle",
        "tiktok username", "tiktok url", "instagram profile", "tiktok profile", "youtube", "youtube url",
        "youtube handle", "youtube username", "youtube profile", "handle", "username", "social",
        "profile url", "name", "full name", "first name", "last name", "creator", "id", "applicant id",
        "aspire applicant id", "member id", "creator id", "email", "email address", "e-mail",
        "e-mail address", "phone",
        "phone number", "mobile", "mobile number", "address", "street", "city", "state", "country",
        "region", "zip", "zip code", "postal code"}
DIGITS = re.compile(r"\d(?:[ -]?\d){12,}")
IBAN = re.compile(r"\b[A-Z]{2}\d{2}(?:[ -]?[A-Z0-9]){11,30}", re.I)
# Each IBAN country's fixed length.
IBAN_LEN = {c[:2]: int(c[2:]) for c in (
    "AD24 AE23 AL28 AT20 AZ28 BA20 BE16 BG22 BH22 BR29 CH21 CR22 CY28 CZ24 DE22 DK18 DO28 EE20 EG29 "
    "ES24 FI18 FO18 FR27 GB22 GE22 GI23 GL18 GR27 GT28 HR21 HU28 IE22 IL23 IQ23 IS26 IT27 JO30 KW30 "
    "KZ20 LB28 LC32 LI21 LT20 LU20 LV21 MC27 MD24 ME22 MK19 MR27 MT31 MU30 NL18 NO15 PK24 PL28 PS29 "
    "PT25 QA29 RO24 RS22 SA24 SC31 SE24 SI19 SK24 SM27 ST25 SV28 TL23 TN24 TR26 UA29 VA22 VG24 XK20").split()}
LIMIT = 20000


def luhn(s):
    d = [int(c) for c in reversed(s)]
    return (sum(d[0::2]) + sum(sum(divmod(2 * x, 10)) for x in d[1::2])) % 10 == 0


def card(m):
    # The whole run, or the run without one short group (an expiry or CVV) at its start or end.
    if m.start() and m.string[m.start() - 1] in "/=":
        return m.group()  # a number in a link (a video or user id), not a card
    groups = re.split(r"[ -]", m.group())
    tries = [groups]
    if len(groups) > 1 and 2 <= len(groups[-1]) <= 4:
        tries.append(groups[:-1])
    if len(groups) > 1 and 3 <= len(groups[0]) <= 4:
        tries.append(groups[1:])
    # A card is one block, or groups of 4 to 6 digits (4-4-4-4, 4-6-5); phone numbers and dates are not.
    hit = any(13 <= len("".join(t)) <= 19 and luhn("".join(t))
              and (len(t) == 1 or all(4 <= len(g) <= 6 for g in t)) for t in tries)
    return "[left out]" if hit else m.group()


def iban(m):
    # Exactly the country's length, ending at the end of a group, with the right check digits.
    g = m.group()
    want, n = IBAN_LEN.get(g[:2].upper()), 0
    for end, c in enumerate(g, 1):
        n += c not in " -"
        if n == want:
            s = re.sub(r"[ -]", "", g[:end]).upper()
            if (end == len(g) or g[end] in " -") and int("".join(str(int(c, 36)) for c in s[4:] + s[:4])) % 97 == 1:
                return "[left out]" + g[end:]
            break
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
        # Mixed: UTF-8 that cp1252 text does not form by chance, a 3- or 4-byte character (’ “ € …) or
        # a lowercase accented letter (é is "Ã©" read as cp1252); an uppercase one before ’ or … can be cp1252.
        if any(ord(c) > 0x7FF or 0xE0 <= ord(c) <= 0xFF for c in raw.decode("utf-8", errors="ignore")):
            print(json.dumps({"error": "The file mixes UTF-8 with another encoding; save it again as CSV UTF-8."}))
            sys.exit(2)
        try:
            text, enc = raw.decode("cp1252"), "cp1252"
        except UnicodeDecodeError:
            text, enc = raw.decode("latin-1"), "latin-1"
# The header line's separator, outside quotes: a tab whenever there is one (questions often hold
# commas, never tabs), else a semicolon when there are more of them than commas.
first = re.sub(r'"[^"]*"', "", text.split("\n", 1)[0])
delim = "\t" if "\t" in first else ";" if first.count(";") > first.count(",") else ","
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


def line(n, got, room):
    cells = {keys[i]: s for i, s, _ in got if i not in out}
    text = json.dumps({"row": n, "cells": cells}, ensure_ascii=False)
    if len(text) <= room:
        return text
    # One row too long for a run: cut its long cells to share what the keys leave, halving until it fits.
    bare = len(json.dumps({"row": n, "cells": {k: "…[cut, 1000000 characters]" for k in cells}},
                          ensure_ascii=False))
    cap = max(40, (room - bare) // max(len(cells), 1))
    while True:
        short = {k: f"{v[:cap]}…[cut, {len(v)} characters]" if len(v) > cap else v for k, v in cells.items()}
        text = json.dumps({"row": n, "cells": short}, ensure_ascii=False)
        if len(text) <= room or cap == 40:
            return text
        cap = max(40, cap // 2)


size = 0
if arg == "0":
    head_line = json.dumps({"rows": len(body), "encoding": enc,
                            "kept": [k for i, k in enumerate(keys) if i not in out],
                            "left_out": [k for i, k in enumerate(keys) if i in out],
                            "cells_left_out": sum(x for _, got in body for i, _, x in got if i not in out)},
                           ensure_ascii=False)
    print(head_line)
    size = len(head_line)
    if size > LIMIT // 2:
        print(json.dumps({"next": "r0"}))  # a long header: the rows start in the next run
        sys.exit(0)
for k in range(start, len(body)):
    text = line(*body[k], LIMIT - size)
    if k > start and size + len(text) > LIMIT:
        print(json.dumps({"next": k}))
        break
    print(text)
    size += len(text)
```
<!-- /applicant-csv -->
