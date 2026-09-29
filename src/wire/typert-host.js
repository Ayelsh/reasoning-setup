/*
 * Hand-written in the shape `@deepseek-ai/dsh-typert-generator` emits, because
 * the generator analyzes a ts.Program over the harness workspace, which an
 * out-of-tree package does not have. `scripts/build.mjs` fails when this file
 * and `src/host/service.ts` disagree about which methods are Remote.
 */
import { z } from 'zod'

let _dsh_reasoning_setup_reasoningSetup_scan_result$schema$value
const _dsh_reasoning_setup_reasoningSetup_scan_result$schema = () => (_dsh_reasoning_setup_reasoningSetup_scan_result$schema$value ??= z.object({
  'providers': z.array(z.object({
    'id': z.string().readonly(),
    'name': z.string().readonly(),
    'editable': z.boolean().readonly(),
    'note': z.string().readonly().optional(),
    'models': z.array(z.object({
      'id': z.string().readonly(),
      'name': z.string().readonly(),
      'hasReasoning': z.boolean().readonly(),
      'efforts': z.array(z.string()).readonly(),
      'defaultEffort': z.string().readonly().optional(),
      'editable': z.boolean().readonly(),
      'configPath': z.enum(['models-entry', 'model-override']).readonly().optional(),
      'declaredLevels': z.record(z.string(), z.union([z.string(), z.null()])).readonly().optional(),
      'declaredFormat': z.string().readonly().optional(),
      'note': z.string().readonly().optional(),
    })).readonly(),
  })).readonly(),
  'levels': z.array(z.enum(['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'])).readonly(),
  'formats': z.array(z.string()).readonly(),
}).readonly())

let _dsh_reasoning_setup_reasoningSetup_apply_parameter_0$schema$value
const _dsh_reasoning_setup_reasoningSetup_apply_parameter_0$schema = () => (_dsh_reasoning_setup_reasoningSetup_apply_parameter_0$schema$value ??= z.union([
  z.object({
    'kind': z.literal('set'),
    'provider': z.string(),
    'model': z.string(),
    'levels': z.record(z.string(), z.union([z.string(), z.null()])),
    'thinkingFormat': z.string().optional(),
  }),
  z.object({
    'kind': z.literal('remove'),
    'provider': z.string(),
    'model': z.string(),
  }),
]))

let _dsh_reasoning_setup_reasoningSetup_apply_result$schema$value
const _dsh_reasoning_setup_reasoningSetup_apply_result$schema = () => (_dsh_reasoning_setup_reasoningSetup_apply_result$schema$value ??= z.object({
  'applied': z.literal(true),
}))

export const TYPERT = {
  package: 'dsh-reasoning-setup',
  face: 'host',
  schemas: [
  ],
  invocations: [
    {
      id: 'dsh-reasoning-setup#reasoningSetup/scan',
      service: 'reasoningSetup',
      namespace: 'reasoningSetup',
      method: 'scan',
      invocation: { kind: 'direct' },
      parameters: [
      ],
      result: {
        mode: 'strict',
        typeSymbol: 'dsh-reasoning-setup/types#ReasoningScanReport',
        create: _dsh_reasoning_setup_reasoningSetup_scan_result$schema,
      },
      sourceLocation: { "file": "src/host/service.ts", "line": 74, "column": 3 },
    },
    {
      id: 'dsh-reasoning-setup#reasoningSetup/apply',
      service: 'reasoningSetup',
      namespace: 'reasoningSetup',
      method: 'apply',
      invocation: { kind: 'direct' },
      parameters: [
        {
          name: 'edit',
          wire: 'edit',
          source: 'json',
          codec: {
            mode: 'strict',
            typeSymbol: 'dsh-reasoning-setup/types#ReasoningEffortEdit',
            create: _dsh_reasoning_setup_reasoningSetup_apply_parameter_0$schema,
          },
        },
      ],
      result: {
        mode: 'strict',
        typeSymbol: 'dsh-reasoning-setup#reasoningSetup/apply:result',
        create: _dsh_reasoning_setup_reasoningSetup_apply_result$schema,
      },
      sourceLocation: { "file": "src/host/service.ts", "line": 110, "column": 3 },
    },
  ],
  model: {
    "services": [
      {
        "description": "Reasoning-effort setup service.",
        "summary": "Reasoning-effort setup service.",
        "tags": [],
        "jsDoc": "/** Reasoning-effort setup service. */",
        "key": "reasoningSetup",
        "exportName": "ReasoningSetupService",
        "members": [
          {
            "kind": "method",
            "name": "scan",
            "signature": "scan(): Promise<ReasoningScanReport>",
            "jsDoc": "/** Report every registered provider's models with their reasoning state. */",
            "tags": [],
          },
          {
            "kind": "method",
            "name": "apply",
            "signature": "apply(edit: ReasoningEffortEdit): Promise<{ applied: true }>",
            "jsDoc": "/** Write one model's effort declaration into the llm-pi-ai settings document. */",
            "tags": [],
          },
        ],
        "types": [
          {
            "name": "ReasoningLevel",
            "declaration": "export type ReasoningLevel = 'off' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max';"
          },
          {
            "name": "DeclaredLevels",
            "declaration": "export type DeclaredLevels = Record<string, string | null>;"
          },
          {
            "name": "EffortConfigPath",
            "declaration": "export type EffortConfigPath = 'models-entry' | 'model-override';"
          },
          {
            "name": "ReasoningModelView",
            "declaration": "export interface ReasoningModelView {\n    readonly id: string;\n    readonly name: string;\n    readonly hasReasoning: boolean;\n    readonly efforts: readonly string[];\n    readonly defaultEffort?: string;\n    readonly editable: boolean;\n    readonly configPath?: EffortConfigPath;\n    readonly declaredLevels?: DeclaredLevels;\n    readonly declaredFormat?: string;\n    readonly note?: string;\n}"
          },
          {
            "name": "ReasoningProviderView",
            "declaration": "export interface ReasoningProviderView {\n    readonly id: string;\n    readonly name: string;\n    readonly editable: boolean;\n    readonly note?: string;\n    readonly models: readonly ReasoningModelView[];\n}"
          },
          {
            "name": "ReasoningScanReport",
            "declaration": "export interface ReasoningScanReport {\n    readonly providers: readonly ReasoningProviderView[];\n    readonly levels: readonly ReasoningLevel[];\n    readonly formats: readonly string[];\n}"
          },
          {
            "name": "ReasoningEffortEdit",
            "declaration": "export type ReasoningEffortEdit = { readonly kind: 'set'; readonly provider: string; readonly model: string; readonly levels: DeclaredLevels; readonly thinkingFormat?: string; } | { readonly kind: 'remove'; readonly provider: string; readonly model: string; };"
          }
        ]
      }
    ],
    "events": [],
    "objects": []
  },
}
