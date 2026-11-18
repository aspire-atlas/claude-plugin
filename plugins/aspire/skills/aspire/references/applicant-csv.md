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
  allowed, in any bank's grouping, from a country that issues IBANs, 15 to 34 characters ending at
  a group's end, mostly digits after the country and check digits, with the right check digits). The match becomes `[left out]`, and
  `cells_left_out` counts the cells;
- such a column whole, when more than half its non-empty cells hold one.

## The snippet

<!-- applicant-csv -->
```python
import csv, io, itertools, json, re, sys

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
# and dates, in groups of 2 or 3, are not. SHORT is an expiry or CVV group beside it: 2 or 3 digits, or
# 4 that read as an expiry (MMYY 0127, YYMM 2701, a year 2027); an Amex card's CID may be any 4 digits.
# Any other 4-digit group is not set aside, so a tracking number's groups are not taken for one.
CARD_CORE = re.compile(r"\d+|\d{4,6}(?: \d{4,6})+")
SHORT = re.compile(r"\d{2,3}|(0[1-9]|1[0-2])\d\d|[2-3]\d(0[1-9]|1[0-2])|20[2-4]\d")
AMEX = re.compile(r"3[47]\d{13}")
# A number inside a link (a video, post or user id): the rest of an https:// or www. link, up to a space
# or , ; | (a card joined to a link by those is still a card), or right after / or = in a bare one.
URL = re.compile(r"(https?://|www\.)[^\s,;|]*$|\b[\w-]+\.[a-z]{2,}/\S*[/=]$", re.I)
IBAN = re.compile(r"\b[A-Z]{2}\d{2}(?:[ -]?[A-Z0-9]){11,}", re.I | re.A)
# The countries that issue IBANs (codes only: their lengths keep changing).
IBAN_COUNTRIES = set((
    "AD AE AL AT AZ BA BE BG BH BI BR BY CH CR CY CZ DE DJ DK DO EE EG ES FI FK FO FR GB GE GI GL GR GT "
    "HN HR HU IE IL IQ IS IT JO KW KZ LB LC LI LT LU LV LY MC MD ME MK MN MR MT MU NI NL NO OM PK PL PS "
    "PT QA RO RS RU SA SC SD SE SI SK SM SO ST SV TL TN TR UA VA VG XK YE").split())
LIMIT = 20000


def luhn(s):
    d = [int(c) for c in reversed(s)]
    return (sum(d[0::2]) + sum(sum(divmod(2 * x, 10)) for x in d[1::2])) % 10 == 0


def mod97(s):
    return int("".join(str(int(c, 36)) for c in s[4:] + s[:4])) % 97 == 1


def is_card(core, ends):
    # The whole card rule in one place (the shapes are explained beside CARD_CORE and SHORT).
    digits = core.replace(" ", "")
    amex = bool(AMEX.fullmatch(digits))
    return (bool(CARD_CORE.fullmatch(core)) and 13 <= len(digits) <= 19 and luhn(digits)
            and all(SHORT.fullmatch(x) or (amex and len(x) == 4) for x in ends))


def card(m):
    # A card alone or with up to two SHORT groups at either end. Every way of setting those groups aside
    # is tried, since one match can't retry them.
    if URL.search(m.string[:m.start()]):
        # Only the part of the run inside the link is the link's; a card after a space is still a card.
        head, sep, rest = m.group().partition(" ")
        return head + sep + DIGITS.sub(card, rest)
    g = re.split(r"[ -]", m.group())
    for a, b in itertools.product(range(3), repeat=2):
        if is_card(" ".join(g[a:len(g) - b]), g[:a] + g[len(g) - b:]):
            return "[left out]"
    return m.group()


def mostly_digits(s):
    # An account number, not words: at least 8 digits after the country and check digits, and at
    # least half of them.
    digits = sum(c.isdigit() for c in s[4:])
    return digits >= 8 and digits * 2 >= len(s) - 4


def iban(m):
    # An IBAN country, then its groups, in any bank's layout (4-4-4, 8-8-8, 5-5-11-2, 3-7-2): every
    # group of digits, and groups holding a letter of at most 4 characters (a longer word is never part
    # of it). It is 15 to 34 characters, mostly digits, with the right check digits. Where it ends is
    # tried in rounds, longest first in each: at the last group or just before a group holding a letter;
    # then between two groups of digits (a year or an amount after it), but only before any word that
    # comes once it is already long enough, so a cut never stops inside a card typed after a word.
    g = m.group()
    if g[:2].upper() not in IBAN_COUNTRIES:
        return g
    groups = []
    for i, group in enumerate(re.finditer(r"[A-Z0-9]+", g, re.I | re.A)):
        if i and not group.group().isdigit() and len(group.group()) > 4:
            break
        groups.append(group)
    size = lambda end: len(re.sub(r"[ -]", "", g[:end]))  # characters, without separators
    digits = [x.group()[2 if i == 0 else 0:].isdigit() for i, x in enumerate(groups)]  # after the country
    at_letters, between_digits, open_ = [groups[-1].end()], [], True
    for i, (before, group) in enumerate(zip(groups, groups[1:])):
        if digits[i + 1]:
            if digits[i] and open_:
                between_digits.append(before.end())
        else:
            at_letters.append(before.end())
            open_ = open_ and size(before.end()) < 15
    # Between digit groups, first after a group shorter than the one before it (an IBAN's last group
    # is its short one: 4-4-4-2), so a card typed right after it is not cut into.
    short_end = [e for e in between_digits if any(x.end() == e and i and len(x.group()) < len(groups[i - 1].group())
                                                  for i, x in enumerate(groups))]
    tries = sorted(at_letters, reverse=True) + sorted(short_end, reverse=True) + sorted(between_digits, reverse=True)
    def card_from(end):
        # The digits right after this group end hold a card (with any expiry, year or CVV beside it).
        run = DIGITS.match(m.string[m.start() + end:].lstrip(" -"))
        return bool(run) and card(run) != run.group()

    def valid(end):
        s = re.sub(r"[ -]", "", g[:end]).upper()
        return 15 <= len(s) <= 34 and mostly_digits(s) and mod97(s)

    for end in tries:
        if any(j < end and valid(j) and card_from(j) for j in between_digits):
            continue  # a valid IBAN ends earlier and a card starts there: this end would cut into it
        if valid(end):
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
    print(json.dumps({"next": 0}))  # so every run, this one too, ends by saying where to go next
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
