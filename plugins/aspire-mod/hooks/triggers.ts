// What switches the mod on and which tool is whose: the aspire skill and prompt, aspire agents, Atlas's tools by
// name and by the connector that answered as Atlas, and the Artifact links the mod remembers. Pure helpers and the
// module's own sets: nothing here takes $ or touches $.state. `claude plugin validate` reads a state call only
// against an atom made in the same file, so every hook and state call stays in register.tsx.

import { isAtlasToolName } from './atlas-usage'
import { PROGRESS_TOOL, STEP_TOOL } from './register'

// The plugin whose skill and agents switch the mod on; this mod ships as its own plugin, aspire-mod.
const ASPIRE_PLUGIN = 'aspire'

/** The aspire skill: `/aspire`, `/aspire:aspire`, or the Skill tool's `aspire:aspire`. */
export const ASPIRE_SKILL = /^(aspire:)?aspire$/
/** A prompt typed as `/aspire` or `/aspire:aspire`, with or without arguments; not `/aspire-agents-info`. */
export const ASPIRE_PROMPT = /^\s*\/(aspire:)?aspire(?=\s|$)/
// ---------------------------------------------------------------------------
// Switching on.

export const isAspireAgent = (type: string, plugin: string | undefined): boolean => type.startsWith('aspire:') || plugin === ASPIRE_PLUGIN

/** `get_status` from `mcp__<server>__get_status`, for the status line. */
export const shortTool = (tool: string): string => tool.replace(/^mcp__.*__/, '')

/** `mcp__<server>__` of each connector that has answered as Aspire Atlas, for a server whose name does not say so. Names only. */
export const atlasServers = new Set<string>()
export const serverOf = (tool: string): string => /^(mcp__.+?__)/.exec(tool)?.[1] ?? ''
/** Atlas's analytics checkpoint (`report_checkpoint`), by its bare name: its rows keep Claude Code's own drawing, from any connector. */
export const isCheckpointTool = (tool: string): boolean => shortTool(tool) === 'report_checkpoint'
/** An Atlas connector tool (the progress and step tools are the mod's own and never count, nor does the checkpoint). */
export const isAtlasTool = (tool: string): boolean =>
  tool.startsWith('mcp__') && tool !== PROGRESS_TOOL && tool !== STEP_TOOL && !isCheckpointTool(tool) && (isAtlasToolName(tool) || atlasServers.has(serverOf(tool)))
/** A call's `context` without the `[runId]` an agent puts first (only the minted shape), so the row reads as the sentence alone. */
export const withoutRunId = (context: string): string => context.replace(/^\s*\[(?:aspire|atlas-[a-z0-9-]{2,60})-\d{8}t\d{6}-[0-9a-f]{4}\]\s*/, '')

// ---------------------------------------------------------------------------
// The Artifact card: the transcript's result row for a published Artifact.

/** What a publish call said about its page, by the call's id: the result carries the URL, the call carries the title and description. */
export const published = new Map<string, { title?: string; description?: string; file?: string }>()
export const MAX_PUBLISHED = 50
export const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
export const ARTIFACT_URL_RE = /https:\/\/claude\.ai\/(?:code\/)?artifact\/[A-Za-z0-9_-]+/g
/** Artifact links a subagent hand-back has already logged, bounded. */
export const loggedLinks = new Set<string>()
export const MAX_LOGGED = 100
export const artifactUrl = (out: unknown, depth = 0): string | undefined => {
  if (typeof out === 'string') return out.match(ARTIFACT_URL_RE)?.[0]
  if (!out || typeof out !== 'object' || depth > 3) return undefined
  const direct = str((out as Record<string, unknown>).url)
  if (direct) return direct
  for (const v of Array.isArray(out) ? out : Object.values(out)) {
    const found = artifactUrl(v, depth + 1)
    if (found) return found
  }
  return undefined
}
export const slackDraft = (url: string): string =>
  `Share this artifact on Slack: ${url}. Ask me with AskUserQuestion which channel or person, write a short message, show it, and post only after I confirm.`
