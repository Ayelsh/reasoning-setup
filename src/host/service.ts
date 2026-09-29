/**
 * Reasoning-effort setup service, exposed to the browser as the
 * `reasoningSetup` Remote namespace.
 *
 * The scan reads two seams and joins them: the LLM runtime's provider/model
 * listing says which models resolve without a `reasoning` block (and so show
 * no thinking-level selector anywhere), and the `llm-pi-ai` settings document
 * says where an editable model's declaration would land. The write path goes
 * through `ctx.settings.mutate` with the revision the scan observed, so a
 * document that moved underneath an open editor is refused rather than
 * clobbered.
 *
 * @module dsh-reasoning-setup/host
 */

import { Context } from '@deepseek-ai/cordis'
import type { LlmModelInfo, LlmResolvedModelInfo } from '@deepseek-ai/dsh-llm'
import { SettingsConflictError } from '@deepseek-ai/dsh-settings'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import z from '@deepseek-ai/schemastery'
import { reasoningSetupError } from './errors.ts'
import {
  PI_AI_SETTINGS_NS,
  REASONING_LEVELS,
  THINKING_FORMATS,
  effortOps,
  modelDeclaration,
  routeFormSlice,
  validateLevels,
} from './scan.ts'
import type {
  ReasoningEffortEdit, ReasoningModelView, ReasoningProviderView, ReasoningScanReport,
} from './types.ts'

/** Service configuration; the page has no tunables of its own. */
export interface Config {}

/** Validated configuration schema; empty because every fact lives in llm-pi-ai's document. */
export const Config: z<Config> = z.object({})

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Reasoning-effort setup service, owner of the `reasoningSetup` Remote namespace. */
    reasoningSetup: ReasoningSetupService
  }
}

/**
 * One error's user-facing text.
 * @param error - the thrown value.
 * @returns its message.
 */
function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** Reasoning-effort setup service. */
export class ReasoningSetupService extends TypertRemoteService {
  static inject = ['llm', 'settings']

  static Config: z<Config> = Config

  /**
   * @param ctx - host context carrying the LLM runtime and the settings forms.
   * @param _config - validated (empty) configuration.
   */
  constructor(ctx: Context, _config: Config) {
    super(ctx, 'reasoningSetup', { namespace: 'reasoningSetup' })
  }

  /**
   * Report every registered provider's models with their reasoning state.
   *
   * A model is editable when its provider route is configurable through the
   * `llm-pi-ai` settings document and the route's shape gives the model a
   * declaration site; other providers still appear, marked read-only, so the
   * page can show the whole picture rather than a silent subset.
   * @returns the scan report, including the level and format vocabularies.
   */
  @Remote
  async scan(): Promise<ReasoningScanReport> {
    const configurable = new Map(this.ctx.llm.listConfigurableProviders().map(entry => [entry.provider, entry]))
    const form = this.piAiFormValue()
    const providers: ReasoningProviderView[] = []
    for (const provider of this.ctx.llm.listProviders()) {
      const editable = configurable.get(provider.id)?.settingsNs === PI_AI_SETTINGS_NS
      const route = editable ? routeFormSlice(form, provider.id) : undefined
      const models: ReasoningModelView[] = []
      let note: string | undefined
      try {
        for (const model of await this.ctx.llm.listModels(provider.id)) {
          models.push(await this.modelView(provider.id, editable, route, model))
        }
      } catch (error) {
        // A route whose listing refuses reports the refusal beside its name;
        // the rest of the scan still settles.
        note = message(error)
      }
      providers.push({
        id: provider.id,
        name: provider.name,
        editable,
        ...note === undefined ? {} : { note },
        models,
      })
    }
    return { providers, levels: REASONING_LEVELS, formats: THINKING_FORMATS }
  }

  /**
   * Write one model's effort declaration into the llm-pi-ai settings document.
   *
   * The draft is validated against the same rules the pi-ai resolver enforces,
   * so a refusal names this page's field rather than surfacing as a broken
   * provider route after the write.
   * @param edit - the declaration to write, or its removal.
   * @returns once the document holds the edit.
   * @throws RemoteError `reasoning-setup/unknown-target`, `reasoning-setup/invalid-levels`,
   * `reasoning-setup/conflict`, or `reasoning-setup/write-refused`.
   */
  @Remote('apply')
  async apply(edit: ReasoningEffortEdit): Promise<{ applied: true }> {
    if (edit.kind === 'set') {
      const invalid = validateLevels(edit.levels)
      if (invalid !== undefined) {
        throw reasoningSetupError('reasoning-setup/invalid-levels', invalid)
      }
      if (edit.thinkingFormat !== undefined && !THINKING_FORMATS.includes(edit.thinkingFormat)) {
        throw reasoningSetupError(
          'reasoning-setup/invalid-levels',
          `"${edit.thinkingFormat}" is not a thinking format; the vocabulary is ${THINKING_FORMATS.join(', ')}`,
        )
      }
    }
    const descriptor = this.ctx.settings.describe().find(row => row.ns === PI_AI_SETTINGS_NS)
    if (descriptor === undefined) {
      throw reasoningSetupError('reasoning-setup/unknown-target', 'the llm-pi-ai settings document is not available')
    }
    const route = routeFormSlice(descriptor.value, edit.provider)
    if (route === undefined) {
      throw reasoningSetupError(
        'reasoning-setup/unknown-target',
        `provider "${edit.provider}" is not a route in the llm-pi-ai settings document`,
      )
    }
    const declaration = modelDeclaration(edit.provider, route, edit.model)
    if (declaration === undefined) {
      throw reasoningSetupError(
        'reasoning-setup/unknown-target',
        `model "${edit.model}" has no editable declaration site on provider "${edit.provider}"`,
      )
    }
    const ops = effortOps(edit, declaration)
    if (ops.length === 0) return { applied: true }
    try {
      await this.ctx.settings.mutate(PI_AI_SETTINGS_NS, ops, descriptor.revision)
    } catch (error) {
      if (error instanceof SettingsConflictError) {
        throw reasoningSetupError(
          'reasoning-setup/conflict',
          'the settings document changed since the scan; reopen the page and retry',
          { cause: error },
        )
      }
      throw reasoningSetupError('reasoning-setup/write-refused', message(error), { cause: error })
    }
    return { applied: true }
  }

  /**
   * Project one model onto its scan view.
   * @param provider - provider route key.
   * @param routeEditable - whether the route is configurable through the llm-pi-ai document.
   * @param route - the route's stored slice, when routeEditable.
   * @param model - the listed model.
   * @returns the model's view, with the resolution refusal as its note when it refused.
   */
  private async modelView(
    provider: string,
    routeEditable: boolean,
    route: ReturnType<typeof routeFormSlice>,
    model: LlmModelInfo,
  ): Promise<ReasoningModelView> {
    try {
      const resolved: LlmResolvedModelInfo = await this.ctx.llm.resolveModelInfo(provider, model.id)
      const declaration = routeEditable ? modelDeclaration(provider, route, model.id) : undefined
      return {
        id: model.id,
        name: model.name,
        hasReasoning: resolved.reasoning !== undefined,
        efforts: resolved.reasoning === undefined ? [] : resolved.reasoning.efforts.map(effort => effort.id),
        ...resolved.reasoning?.defaultEffort === undefined ? {} : { defaultEffort: resolved.reasoning.defaultEffort },
        editable: declaration !== undefined,
        ...declaration === undefined ? {} : {
          configPath: declaration.path,
          ...declaration.levels === undefined ? {} : { declaredLevels: declaration.levels },
          ...declaration.format === undefined ? {} : { declaredFormat: declaration.format },
        },
      }
    } catch (error) {
      // A model whose resolution refuses — a deferred catalog diagnostic, a
      // route-level failure — still appears, marked uneditable with its note.
      return {
        id: model.id,
        name: model.name,
        hasReasoning: false,
        efforts: [],
        editable: false,
        note: message(error),
      }
    }
  }

  /** The stored form value of the llm-pi-ai settings namespace. */
  private piAiFormValue(): unknown {
    return this.ctx.settings.describe().find(row => row.ns === PI_AI_SETTINGS_NS)?.value
  }
}

export default ReasoningSetupService
