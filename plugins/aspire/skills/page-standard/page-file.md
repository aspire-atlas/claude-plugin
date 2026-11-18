# A page saved as a file: when the session cannot publish

Step 5 of the build loop (`SKILL.md`, section 4) points here. It holds over a flow reference that
says to publish with the Artifact tool.

- **When the session has no Artifact tool, save the page as a file.** Never skip the page, and
  never return only a summary, because it cannot be published. Write the same page as one full
  HTML document (doctype, head with the title, body) to `{page name}.html` in the session's
  scratchpad or temporary folder, with every style, script, and image inline as a published page
  has them. Send it with `SendUserFile` when the session has that tool.
- Put the file's absolute path wherever the link would go: `page` in the result packet and in the
  page check, and the summary's page line, as "Saved as a file: {path}". Add "Page saved as a
  file: this session cannot publish pages" to the audit trail's data gaps.
- A rerun for the same page writes the same file again. Steps 1 to 4 do not change.
