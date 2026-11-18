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
d=$(mktemp -d) && cp "{csv path}" "$d/applicants.csv" && awk '/^<!-- applicant-csv -->$/{f=1;next} /^<!-- \/applicant-csv -->$/{f=0} f' "${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/applicant-csv.md" | sed '1d;$d' > "$d/applicant_csv.py" && echo "$d" && python3 -I "$d/applicant_csv.py" "$d/applicants.csv" summary || rm -rf "$d"
```
<!-- /applicant-csv-run -->

The first run prints the summary line and `{"next": 0}`. Each later run prints rows up to about
20,000 characters, so its output is never cut, and ends with `{"next": n}` while rows remain: run
`python3 -I "{folder}/applicant_csv.py" "{folder}/applicants.csv" {n}` next, starting with `0`. After the last run, and whenever the import stops early
(an error, "Not now", or the user stopping), `rm -rf "{folder}"`. With no Python, say so: the
import stops, and a plain list is read with the `Read` tool instead. When a run prints `error`,
say it in one line and stop the import the same way.

## What it prints

The summary line holds `rows` (applicant rows, blank
rows not counted), `encoding` (`utf-8`, `utf-16`, `cp1252` for a file Excel saved in Windows
encoding, or `latin-1`), `kept` (the column keys printed), `left_out` (the columns left out), and
`cells_left_out`. A row run prints one line per row: `row`, its row number in the file (the header is row 1,
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
  digits as one block or groups of 4 to 6, that pass the Luhn check, alone or with up to two short
  expiry or CVV groups at either end, and not inside a link) and an IBAN (in any case, spaces or dashes
  allowed, 15 to 34 characters ending at a group's end, mostly digits after the country and check
  digits, with the right check digits). The match becomes `[left out]`, and
  `cells_left_out` counts the cells;
- such a column whole, when more than half its non-empty cells hold one.

## The snippet

<!-- applicant-csv -->
```python
import csv, io, json, re, sys

path, arg = sys.argv[1], sys.argv[2]  # "summary", or the position of the first row to print
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
# The card shape: 13 to 19 digits as one block or as groups of 4 to 6 (4-4-4-4, 4-6-5); phone numbers
# and dates, in groups of 2 or 3, are not. SHORT is an expiry or CVV group beside it.
CARD_CORE = re.compile(r"\d+|\d{4,6}(?: \d{4,6})+")
SHORT = re.compile(r"\d{2,4}")
URL = re.compile(r"(https?://|www\.)\S*$", re.I)
IBAN = re.compile(r"\b[A-Z]{2}\d{2}(?:[ -]?[A-Z0-9]){11,30}", re.I)
LIMIT = 20000


def luhn(s):
    d = [int(c) for c in reversed(s)]
    return (sum(d[0::2]) + sum(sum(divmod(2 * x, 10)) for x in d[1::2])) % 10 == 0


def mod97(s):
    return int("".join(str(int(c, 36)) for c in s[4:] + s[:4])) % 97 == 1


def card(m):
    # A card is CARD_CORE that passes Luhn, alone or with up to two SHORT groups (an expiry, a CVV) at
    # either end. Every way of setting those groups aside is tried, since one match can't retry them.
    # A number inside a link (a video or user id) is never a card.
    if URL.search(m.string[:m.start()]):
        return m.group()
    g = re.split(r"[ -]", m.group())
    for a in range(3):
        for b in range(3):
            core, ends = " ".join(g[a:len(g) - b]), g[:a] + g[len(g) - b:]
            digits = core.replace(" ", "")
            if (CARD_CORE.fullmatch(core) and all(SHORT.fullmatch(x) for x in ends)
                    and 13 <= len(digits) <= 19 and luhn(digits)):
                return "[left out]"
    return m.group()


def iban(m):
    # The longest prefix ending at the end of a group that is 15 to 34 characters, mostly digits after
    # the country and check digits (an account number, not words), with the right check digits.
    g = m.group()
    for end in range(len(g), 0, -1):
        if end < len(g) and g[end] not in " -" or g[end - 1] in " -":
            continue
        s = re.sub(r"[ -]", "", g[:end]).upper()
        digits = sum(c.isdigit() for c in s[4:])
        if 15 <= len(s) <= 34 and digits >= 8 and digits * 2 >= len(s) - 4 and mod97(s):
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
# Every non-empty cell, scrubbed once: body holds (row number, {column: text}), and scrubbed[column]
# says, cell by cell, whether a card or IBAN was cut from it.
body, scrubbed = [], {i: [] for i in check}
for n, r in enumerate(rows[1:], 2):
    got = {}
    for i, c in enumerate(r[:len(keys)]):
        c = c.strip()
        if c and i in check:
            got[i] = scrub(c)
            scrubbed[i].append(got[i] != c)
        elif c:
            got[i] = c
    if got:
        body.append((n, got))
out = {i for i, h in enumerate(head) if PAY.search(h)}
out |= {i for i, flags in scrubbed.items() if sum(flags) * 2 > len(flags)}


def line(n, got, room):
    cells = {keys[i]: v for i, v in got.items() if i not in out}
    out_line = json.dumps({"row": n, "cells": cells}, ensure_ascii=False)
    if len(out_line) <= room:
        return out_line
    # One row too long for a run alone: cut its long cells, halving the cap until the row fits.
    cap = max(40, room // len(cells))
    while True:
        short = {k: f"{v[:cap]}…[cut, {len(v)} characters]" if len(v) > cap else v for k, v in cells.items()}
        out_line = json.dumps({"row": n, "cells": short}, ensure_ascii=False)
        if len(out_line) <= room or cap == 40:
            return out_line
        cap = max(40, cap // 2)


if arg == "summary":
    head_line = json.dumps({"rows": len(body), "encoding": enc,
                            "kept": [k for i, k in enumerate(keys) if i not in out],
                            "left_out": [k for i, k in enumerate(keys) if i in out],
                            "cells_left_out": sum(sum(f) for i, f in scrubbed.items() if i not in out)},
                           ensure_ascii=False)
    print(head_line)
    print(json.dumps({"next": 0}))
    sys.exit(0)
start, size = int(arg), 0
for k in range(start, len(body)):
    # Only a run's first row is cut to fit; a later row too big for what is left moves to the next run.
    out_line = line(*body[k], LIMIT)
    if k > start and size + len(out_line) > LIMIT:
        print(json.dumps({"next": k}))
        break
    print(out_line)
    size += len(out_line)
```
<!-- /applicant-csv -->
