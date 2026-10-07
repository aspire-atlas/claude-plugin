# Security

## Reporting a vulnerability

Email **security@aspire.io** with a description, reproduction steps, and impact. Do not open a public issue for security reports. We acknowledge reports within 3 business days.

## What this plugin can and cannot do

- **Data access.** The bundled connectors talk only to `https://atlas.aspire.io/mcp` (Atlas data) and `https://atlas.aspire.io/mcp/admin-organization` (organization members) over HTTPS with OAuth. They read and write data for the organizations the signed-in user belongs to, within that user's role. They do not read Claude memory, chat history, or uploaded files beyond what the user hands it in the task.
- **What ships.** The plugin is markdown and JSON only: skills, agents, and an MCP definition. It ships no script files, hooks, or binaries, installs nothing, and needs no environment variables or API keys.
- **Snippets that run on your computer.** A few reference files include short Python snippets. Claude saves one to a temporary file and runs it to embed images on a page or card, read a brand's website colors, fonts, and logo, work out a color palette, work out creator metrics from search results it saved, or pick the US holiday a sample page is themed around. Every snippet:
  - is written out in full in the plugin, where anyone can read it, and is never downloaded;
  - uses only the Python standard library and Pillow, and runs only when Python is already installed;
  - starts no other programs and installs nothing;
  - only reads public web pages and images the flow names (Aspire's image server, the brand's website, its logo and product images, Google Fonts), or files Claude saved in the same temporary folder;
  - writes nothing except up to three logo files in the folder where it runs, and prints its results;
  - runs through the same permission checks as any command Claude runs.

  Creator vetting may use a browser tool already connected to the session to read a creator list from the Aspire app. You sign in yourself; Claude never types, reads, or stores a password or code, and changes nothing in the app.

  The PPA pitch builds its PowerPoint file with the PowerPoint skill already in the session, never with a snippet of its own. For Google Slides it hands you the file to open in Google Drive, or, with a Google Slides connector you have connected, builds the deck there only after you confirm.

  Influencer program flows may use a mail connector (Gmail, Outlook, Microsoft 365) or a store connector (Shopify or another commerce connector) that you connected to Claude yourself. The plugin bundles neither and never connects one for you. With your confirmation each time, they create email drafts, create discount codes, or place product orders, and they read the products, orders, and inventory a step needs. They read creator replies from your mailbox only when you turned that on during program setup, and only threads with creators on the program's roster. They never send a message unless you ask to send in that session and confirm the named recipients, and scheduled runs never send, create drafts, or change your store. Creator shipping addresses are kept on the program's order form and in your Atlas organization. Everyone the order form is shared with can see every address, so the plugin tells you to share it only inside your team and never suggests sharing it with creators; creators send their details by reply. Bank details, tax ids, and card numbers are never stored.

  Content review and post analysis may also use a video tool already on your computer (ffmpeg, OpenCV, or Swift on a Mac) to pull still frames from a post, and post analysis may use ffmpeg to time censored words in a post's audio. Neither installs one.
- **State changes need consent.** Every Atlas, organization admin, connected mailbox, and connected store write is confirmed through a multiple-choice question. Destructive actions each get their own confirmation. Invites to an organization never run in unattended sessions.
- **Aspire users get no extra access.** A flow may recognize an Aspire teammate by the email domain on the Atlas account and offer them presentation options (for example, presenting a pitch as Aspire's managed service). It never unlocks data, skips a confirmation, or changes what the account's Atlas role allows.
- **Unattended runs are constrained.** Scheduled runs never ask questions, never run destructive tools, and deliver only to Slack channels and email recipients the user saved during setup. A scheduled program reply check reads roster creators' replies from a connected mailbox only when program setup turned it on, and records nothing until a person confirms. Scheduled readouts start no discovery work at all; creator discovery is the sole agent permitted to run discovery unattended, and only under a cadence the user saved explicitly for that campaign.

## Supply chain

- Releases are tagged and pinned by version; installs update only when a new version is published.
- CI validates manifests, checks version sync, and scans for credential patterns on every push and pull request.
- Only maintainers in the `aspire-atlas` GitHub organization can publish releases.
