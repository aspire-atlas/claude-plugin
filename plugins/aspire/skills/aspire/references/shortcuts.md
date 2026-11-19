# Shortcuts

Loaded from **Shortcuts** in `SKILL.md` (**Orchestration contract** **4** points here), when the
argument is a shortcut. A bold section name with no file beside it is another part of this skill;
`SKILL.md`'s **Sections** index names its file.

A shortcut is a routing hint. `/aspire:aspire {shortcut}` still runs routing (**Orchestration contract** **1**), loads
memory, asks the setup reply, and holds every approval. It only skips working out what the person
needs.

| Shortcut | Also | Agent | Section |
| -------- | ---- | ----- | ------- |
| `vet` | `vetting` | `atlas-creator-vetting` | **Creator vetting** |
| `list review` | `review this list`, `review list` | `atlas-creator-vetting`, with the list as given | **Creator vetting** (it asks for the list first) |
| `applicant review` | `set up applicant review`, `applicant review setup`, `screening setup` | `atlas-creator-vetting`, after setup | **Applicant review** (setup, never an agent), then **Creator vetting** with the review when a list is given |
| `campaign` | `campaign status` | `atlas-deliverable-tracker` for an influencer program; the **CAS campaign** status for a creator ad campaign | **Deliverable tracker**, or **CAS campaign**, Status. With both saved, ask which in the Heard question |
| `content review` | `review a post` | `atlas-content-review` | **Content review** |
| `payments` | `payment`, `ledger` | `atlas-program-ledger` | **Program ledger** |
| `reports` | `report` | `atlas-daily-insights-report`, `atlas-weekly-insights-report`, or `atlas-quarterly-signal` | **Readouts** or **Quarterly signal**: the one the text after the shortcut names (`daily`, `weekly`, `quarter`); otherwise ask which in the Heard question (weekly first). An unattended run with none named stops with "setup needed" |
| `account` | `account analyst`, `analyze our account` | `atlas-profile-analyst` | Phase 6 |

`cas campaign` and `campaign manager` route to **CAS campaign**; `campaign` is the
shortcut that checks which kind exists. A new shortcut is a row here and a row in SKILL.md's
**Arguments** table, and its agent must exist; `scripts/check-orchestration.sh` fails otherwise.
