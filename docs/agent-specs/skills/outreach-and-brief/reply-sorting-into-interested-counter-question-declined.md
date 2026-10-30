---
name: Reply sorting into interested, counter, question, declined
owner: 13-outreach-and-brief
---

# Reply sorting into interested, counter, question, declined

## What it does

Matches each creator reply to the roster, sums it up in one line, and sorts it into a class with the record and next move it needs.

## Inputs

- From brand memory: the roster, the sent drafts, and earlier recorded replies.
- From the launch message: the pasted replies (text, sender, channel, date), or a request to read the connected mailbox when the program allows it.

## Output

A reply packet, one line per reply: the creator, the class (interested, accepted, counter, question, declined, details, rights, auto-reply, or other), a summary of 20 words at most, the proposed stage, and the next agent. Unmatched replies are listed apart. Nothing is recorded until the person confirms, and a summary never holds an address, phone number, or payment detail.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
