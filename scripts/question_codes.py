"""Question codes, as orchestration.md section 3 and the agent specs' "Questions answered" tables
write them. The checks and the agent generator import this module, so the row format is read in
one place:

    sys.dont_write_bytecode = True
    sys.path.insert(0, "scripts")
    from question_codes import code_rows, section3
"""
import re

CODE = r"[IPOA][0-9]+"
ROW = re.compile(r"^\| (%s) \|(.*)$" % CODE, re.M)


def section3(orchestration):
    """The text of orchestration.md's section 3 (Question codes), or None when it has none."""
    found = re.search(r"^## 3\. .*?(?=^## )", orchestration, re.S | re.M)
    return found.group(0) if found else None


def code_rows(table):
    """[(code, the rest of the row)] for every table row that opens with a question code."""
    return ROW.findall(table or "")
