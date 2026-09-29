/**
 * Reasoning-effort setup page, browser half.
 *
 * Two things happen here that an in-tree client plugin gets for free. The
 * application's own Remote assembly mounts only the namespaces it was built
 * with, so this plugin mounts its own `reasoningSetup` contribution — the
 * artifact `src/wire/typert-remote-client.js`, written in the shape the
 * Typert generator emits — through `ctx.remote.$mount`. And because the
 * contribution is mounted at activation rather than declared, the namespace
 * is read through `ctx.get` instead of an `inject` entry that would deadlock
 * the plugin against the service it is itself creating.
 *
 * Every string this page renders lives in `./locales.ts`.
 *
 * @module dsh-reasoning-setup/client
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import contribution from '../wire/typert-remote-client.js'
import { EffortPanel, type EffortPanelProps } from './EffortPanel.tsx'
import type { ReasoningEffortEdit, ReasoningScanReport } from '../host/types.ts'
import { ensureStyles } from './styles.ts'
import { en, zh, type EffortLocaleKey } from './locales.ts'

/** Dictionary namespace this page's copy lives in. */
export const NS = 'settings.reasoningSetup'

/** Cordis services this plugin needs: the slot registry, this page's dictionary, and the Remote carrier. */
export const inject = ['slots', 'locale', 'remote']

/** One Remote call's outcome, as the carrier reports it. */
type RemoteResult<Value> =
  | { readonly ok: true; readonly value: Value }
  | { readonly ok: false; readonly error: { readonly message: string } }

/** The mounted `reasoningSetup` namespace, method for method. */
interface ReasoningSetupNamespace {
  scan: () => Promise<RemoteResult<ReasoningScanReport>>
  apply: (edit: ReasoningEffortEdit) => Promise<RemoteResult<{ readonly applied: true }>>
}

/** What the section registration hands its component. */
type SectionEffort = Pick<EffortPanelProps, 'loadScan' | 'applyEdit'>

/**
 * The mounted namespace, read through the service table.
 *
 * Reading it through `inject` is impossible: this plugin creates the namespace,
 * and a fiber that waits for a service it provides never activates.
 * @param ctx - this plugin's context.
 * @returns the namespace service.
 * @throws {Error} when the namespace is not mounted.
 */
function reasoningSetupNamespace(ctx: ClientContext): ReasoningSetupNamespace {
  const namespace = ctx.get('remote.reasoningSetup') as ReasoningSetupNamespace | undefined
  if (namespace === undefined) {
    throw new Error('dsh-reasoning-setup: the reasoningSetup Remote namespace is not mounted')
  }
  return namespace
}

/** Unwrap one Remote result, turning a refusal into a thrown error the panel renders. */
function unwrap<Value>(endpoint: string, result: RemoteResult<Value>): Value {
  if (!result.ok) throw new Error(`${endpoint} rejected: ${result.error.message}`)
  return result.value
}

/**
 * Mount the Remote namespace and contribute the setup page to Settings.
 * @param ctx - client context carrying the slot registry, locale runtime, and Remote carrier.
 */
export function apply(ctx: ClientContext): void {
  ensureStyles()
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-reasoning-setup: copy dictionaries')

  // Mounting is the plugin's own responsibility: the shell's Remote assembly
  // carries only the namespaces the application was built with. The disposer
  // is held by the effect so a plugin reload withdraws the namespace too.
  ctx.effect(async () => {
    const dispose = await ctx.remote.$mount(contribution)
    return () => dispose()
  }, 'dsh-reasoning-setup: remote namespace')

  // The nav label is read on every projection, so it follows a locale switch
  // without re-registering the entry.
  const t = ctx.locale.bind(NS) as (key: EffortLocaleKey, params?: Record<string, unknown>) => string

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'reasoning-setup',
    order: 21,
    label: () => t('nav'),
    locale: NS,
    inject: (): SectionEffort => ({
      loadScan: async () => unwrap('reasoningSetup/scan', await reasoningSetupNamespace(ctx).scan()),
      applyEdit: async (edit: ReasoningEffortEdit) => {
        unwrap('reasoningSetup/apply', await reasoningSetupNamespace(ctx).apply(edit))
      },
    }),
  }, function ReasoningSetupSection(props) {
    return (
      <section>
        <EffortPanel
          loadScan={props.loadScan}
          applyEdit={props.applyEdit}
          t={props.t as Parameters<typeof EffortPanel>[0]['t']}
        />
      </section>
    )
  }))
}
