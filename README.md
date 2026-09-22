# Aspire Atlas plugins for Claude

Claude plugins for the [Aspire Atlas](https://atlas.aspire.io) platform. Works in Claude Cowork and Claude Code.

| Plugin | What it does | Command |
| ------ | ------------ | ------- |
| [`aspire`](plugins/aspire) | Onboards a brand onto Atlas, connects Instagram and TikTok, delivers first insights, plans weekly creator content briefs, and runs schedulable daily and weekly readouts. Bundles the Aspire Atlas connector. | `/aspire:aspire` |

## Install (official channel)

### Claude Cowork

1. Open **Customize** in the sidebar, then **Plugins**.
2. Choose **Add marketplace** and enter `aspire-atlas/claude-plugins`.
3. Install **Aspire Atlas**. Sign in to Atlas when prompted.
4. Start a new chat and type `/aspire:aspire`.

### Claude Code

```shell
/plugin marketplace add aspire-atlas/claude-plugins
/plugin install aspire@aspire-atlas
```

Releases on this channel are pinned by version and listed in [CHANGELOG.md](CHANGELOG.md). You receive an update only when a new version is published.

## Beta channel

The `develop` branch is the beta channel. It ships every commit, so you get new features days or weeks before the official release, with less testing behind them. Available in Claude Code:

```shell
/plugin marketplace add https://github.com/aspire-atlas/claude-plugins.git#develop
/plugin install aspire@aspire-atlas-beta
```

Notes:

- Install from one channel at a time. Both channels provide the plugin named `aspire`; if both are installed, Claude Code loads one and warns about the other.
- Beta updates arrive on `/plugin marketplace update aspire-atlas-beta`, or turn on auto-update for the marketplace under `/plugin` → **Marketplaces**.
- To leave the beta: `/plugin marketplace remove aspire-atlas-beta`, then install from the official channel.
- Report beta issues on [GitHub Issues](https://github.com/aspire-atlas/claude-plugins/issues) with the `beta` label.

## Update

- **Cowork:** open **Customize → Plugins**, select the marketplace, and click **Update**.
- **Claude Code:** `/plugin marketplace update aspire-atlas`

## Requirements

- An Aspire Atlas account. The connector points at `https://atlas.aspire.io/mcp` and authenticates with OAuth; no API keys or environment variables are needed.
- Do not add Atlas a second time as a custom connector. The plugin bundles it.

## Safety

- Every action that changes Atlas state is confirmed with a multiple-choice question first.
- Destructive actions (deleting a profile, unlinking a channel, retracting a calibration) each get their own confirmation.
- Paid creator discovery runs only on your explicit choice.
- Scheduled runs never ask questions, never run destructive or paid tools, and deliver only to destinations you saved during setup.

Full details in the [plugin README](plugins/aspire/README.md).

## Support

- Bugs and requests: [GitHub Issues](https://github.com/aspire-atlas/claude-plugins/issues)
- Security: see [SECURITY.md](SECURITY.md)
- Product: [atlas.aspire.io](https://atlas.aspire.io)

## License

[Apache-2.0](LICENSE). Copyright Aspire.
