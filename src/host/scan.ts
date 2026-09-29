/**
 * Pure reads and writes over the `llm-pi-ai` settings document — the same
 * document the Models page and dsh-zhipu-plan edit.
 *
 * Everything here is detached data in, detached data out: the service feeds it
 * the stored form value and the edit, and receives the settings ops to write,
 * so the rules this module mirrors can be exercised without a running host.
 *
 * @module dsh-reasoning-setup/host/scan
 */

import type { SettingsPathOp } from '@deepseek-ai/dsh-settings'
import type { DeclaredLevels, EffortConfigPath, ReasoningEffortEdit, ReasoningLevel } from './types.ts'

/** The settings namespace whose document this page edits. */
export const PI_AI_SETTINGS_NS = 'llm-pi-ai'

/**
 * The reasoning-effort level vocabulary, in escalation order. Mirrors
 * `THINKING_LEVELS` in `dsh-llm-pi-ai`'s catalog (the package does not export
 * it); `scripts/verify.mjs` fails when the two lists drift.
 */
export const REASONING_LEVELS: readonly ReasoningLevel[] = [
  'off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max',
]

/**
 * The thinkingFormat vocabulary an edit may name, most-reached first. Mirrors
 * `SUPPORTED_THINKING_FORMATS` in `dsh-llm-pi-ai`'s catalog; `scripts/verify.mjs`
 * fails when the two lists drift.
 */
export const THINKING_FORMATS: readonly string[] = [
  'openai', 'deepseek', 'openrouter', 'together', 'baseten', 'zai', 'qwen',
  'chat-template', 'qwen-chat-template', 'string-thinking', 'ant-ling',
]

/** One `models` list entry or `modelOverrides` value as this page reads it. */
interface EntryFormSlice {
  readonly reasoningEfforts?: DeclaredLevels
  readonly compat?: { readonly thinkingFormat?: string }
}

/** One pi-ai route's stored profile as this page reads it. */
export interface RouteFormSlice {
  readonly models?: readonly ({ readonly id: string } & EntryFormSlice)[]
  readonly modelOverrides?: Readonly<Record<string, EntryFormSlice>>
}

/** Where one model's effort declaration lives, and what it says. */
export interface ModelDeclaration {
  /** Which kind of settings site the entry occupies. */
  readonly path: EffortConfigPath
  /** Settings-document path from the section root to the model's entry object. */
  readonly entryPath: readonly string[]
  /** Levels the entry already declares, when any. */
  readonly levels?: DeclaredLevels
  /** thinkingFormat the entry's compat already declares, when any. */
  readonly format?: string
  /** The entry's whole compat object, when any, so a format write merges instead of replacing. */
  readonly compat?: Readonly<Record<string, unknown>>
}

/**
 * Narrow one raw value to a JSON object record.
 * @param value - the value to test.
 * @returns the value when it is a plain object, otherwise undefined.
 */
function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}

/**
 * Read one route's profile out of the `llm-pi-ai` form value.
 * @param value - the descriptor's `value` for the llm-pi-ai settings namespace.
 * @param provider - provider route key.
 * @returns the route's slice, or undefined when the document holds no such route.
 */
export function routeFormSlice(value: unknown, provider: string): RouteFormSlice | undefined {
  const providers = record(record(value)?.['providers'])
  return record(providers?.[provider]) as RouteFormSlice | undefined
}

/**
 * Narrow one entry slice defensively: the stored form is cross-plugin data
 * whose shape the llm-pi-ai schema guarantees, but a read that trusts it
 * would turn a schema change into a crash on this page.
 */
function entrySlice(value: unknown): EntryFormSlice {
  const entry = record(value)
  if (entry === undefined) return {}
  const levels = record(entry['reasoningEfforts'])
  const compat = record(entry['compat'])
  return {
    ...levels === undefined ? {} : { reasoningEfforts: levels as DeclaredLevels },
    ...compat === undefined ? {} : { compat: compat as { readonly thinkingFormat?: string } },
  }
}

/**
 * Locate one model's effort declaration inside its route's profile.
 *
 * A route with a `models` list is editable only at its matching entry — the
 * list replaces the served catalog, so an override beside it would be refused
 * by the resolver. A route without one serves the installed catalog, where an
 * edit lands in `modelOverrides` keyed by model id.
 * @param provider - provider route key, the dict key above the slice.
 * @param route - the route's stored slice.
 * @param model - model id.
 * @returns the declaration, or undefined when the route's shape leaves no site to edit.
 */
export function modelDeclaration(
  provider: string,
  route: RouteFormSlice | undefined,
  model: string,
): ModelDeclaration | undefined {
  if (route === undefined) return undefined
  if (route.models !== undefined) {
    const index = route.models.findIndex(entry => entry.id === model)
    if (index < 0) return undefined
    return declarationAt('models-entry', ['providers', provider, 'models', String(index)], entrySlice(route.models[index]))
  }
  return declarationAt(
    'model-override',
    ['providers', provider, 'modelOverrides', model],
    entrySlice(route.modelOverrides?.[model]),
  )
}

/**
 * Assemble one located declaration from its entry slice.
 * @param path - which kind of settings site the entry occupies.
 * @param entryPath - settings-document path to the entry object.
 * @param entry - the entry's narrowed slice.
 * @returns the declaration.
 */
function declarationAt(path: EffortConfigPath, entryPath: readonly string[], entry: EntryFormSlice): ModelDeclaration {
  return {
    path,
    entryPath,
    ...entry.reasoningEfforts === undefined ? {} : { levels: entry.reasoningEfforts },
    ...entry.compat === undefined ? {} : { compat: entry.compat },
    ...entry.compat?.thinkingFormat === undefined ? {} : { format: entry.compat.thinkingFormat },
  }
}

/**
 * Validate one draft's level declaration the way llm-pi-ai's resolver will,
 * refusing at this boundary what the write path would reject later.
 * @param levels - the drafted declaration.
 * @returns the refusal text, or undefined when the declaration is valid.
 */
export function validateLevels(levels: DeclaredLevels): string | undefined {
  const entries = Object.entries(levels)
  for (const [level, wire] of entries) {
    if (!REASONING_LEVELS.includes(level as ReasoningLevel)) {
      return `"${level}" is not a reasoning level; the vocabulary is ${REASONING_LEVELS.join(', ')}`
    }
    if (wire === null) {
      if (level !== 'off') return `level "${level}" needs the wire value dispatch should send; only "off" may leave it empty`
    } else if (wire.length === 0) {
      return `level "${level}" must not be an empty string`
    }
  }
  if (!entries.some(([level]) => level !== 'off')) {
    return 'the declaration offers no level beyond "off"; declare a thinking level'
  }
  return undefined
}

/**
 * Build the settings ops one edit writes, skipping no-ops so an unchanged
 * document is not rewritten.
 * @param edit - the drafted edit.
 * @param declaration - where the model's declaration lives, from {@link modelDeclaration}.
 * @returns the ops for `ctx.settings.mutate`, in write order.
 */
export function effortOps(edit: ReasoningEffortEdit, declaration: ModelDeclaration): SettingsPathOp[] {
  if (edit.kind === 'remove') {
    if (declaration.levels === undefined && declaration.format === undefined) return []
    return [
      ...declaration.levels === undefined ? [] : [{ op: 'unset', path: [...declaration.entryPath, 'reasoningEfforts'] }],
      ...declaration.format === undefined ? [] : [{ op: 'unset', path: [...declaration.entryPath, 'compat', 'thinkingFormat'] }],
    ]
  }
  const ops: SettingsPathOp[] = []
  if (JSON.stringify(declaration.levels) !== JSON.stringify(edit.levels)) {
    ops.push({ op: 'set', path: [...declaration.entryPath, 'reasoningEfforts'], value: edit.levels })
  }
  if (edit.thinkingFormat !== undefined && declaration.format !== edit.thinkingFormat) {
    ops.push({
      op: 'set',
      path: [...declaration.entryPath, 'compat'],
      value: { ...declaration.compat, thinkingFormat: edit.thinkingFormat },
    })
  }
  return ops
}
