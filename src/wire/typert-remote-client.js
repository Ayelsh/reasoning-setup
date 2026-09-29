/*
 * Hand-written in the shape `@deepseek-ai/dsh-typert-generator` emits for the
 * browser contribution, kept in step with `typert-host.js` by
 * `scripts/build.mjs`.
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

export const TYPERT_REMOTE = {
  package: 'dsh-reasoning-setup',
  descriptors: [
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
}

export default TYPERT_REMOTE
