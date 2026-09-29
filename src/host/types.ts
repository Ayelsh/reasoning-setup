/**
 * The wire types behind the `reasoningSetup` Remote namespace. Every field is
 * JSON-representable and optional members are absent rather than `undefined`,
 * because the Typert boundary carries JSON only.
 *
 * @module dsh-reasoning-setup/host/types
 */

/** The reasoning-effort level vocabulary pi-ai accepts, in escalation order. */
export type ReasoningLevel = 'off' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'

/**
 * Wire spellings one model's declared levels carry, keyed by level. A level
 * absent from the record is not offered; `off` may carry `null`, which means
 * "supported, send nothing".
 */
export type DeclaredLevels = Record<string, string | null>

/** Where one model's effort declaration writes to inside its route's profile. */
export type EffortConfigPath = 'models-entry' | 'model-override'

/** One model as the scan reports it. */
export interface ReasoningModelView {
  readonly id: string
  readonly name: string
  /** Whether the resolved route offers this model a thinking-level selector at all. */
  readonly hasReasoning: boolean
  /** Effort ids the model offers now, in adapter order; empty when none. */
  readonly efforts: readonly string[]
  readonly defaultEffort?: string
  /** Whether this page can edit the model's declaration. */
  readonly editable: boolean
  /** Where an edit writes; absent when not editable. */
  readonly configPath?: EffortConfigPath
  /** Levels the settings document already declares for this model, when any. */
  readonly declaredLevels?: DeclaredLevels
  /** Model-level thinkingFormat the settings document already declares, when any. */
  readonly declaredFormat?: string
  /** Per-model diagnostic, when resolution refused this model. */
  readonly note?: string
}

/** One provider route as the scan reports it. */
export interface ReasoningProviderView {
  readonly id: string
  readonly name: string
  /** Whether the route's models are editable through the llm-pi-ai settings document. */
  readonly editable: boolean
  /** Route-level diagnostic, when listing refused the whole route. */
  readonly note?: string
  readonly models: readonly ReasoningModelView[]
}

/** The complete scan reply. */
export interface ReasoningScanReport {
  readonly providers: readonly ReasoningProviderView[]
  /** The level vocabulary an edit may declare. */
  readonly levels: readonly ReasoningLevel[]
  /** The thinkingFormat vocabulary an edit may name. */
  readonly formats: readonly string[]
}

/** One edit the page asks the host to write. */
export type ReasoningEffortEdit =
  | {
    readonly kind: 'set'
    readonly provider: string
    readonly model: string
    readonly levels: DeclaredLevels
    readonly thinkingFormat?: string
  }
  | {
    readonly kind: 'remove'
    readonly provider: string
    readonly model: string
  }
