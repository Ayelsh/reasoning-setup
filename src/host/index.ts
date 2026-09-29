/**
 * Host half of the reasoning-effort setup plugin: the `reasoningSetup` cordis
 * service behind the Settings page that scans for models without thinking
 * levels and writes their `reasoningEfforts` declaration.
 *
 * The service is the package's default export, so the profile row that mounts
 * this plugin (`dsh-reasoning-setup` in `cordis.patch.yml`) needs no separate
 * entry: the Loader instantiates the class with the row's validated config.
 * The Typert wire face the browser calls is published separately as
 * `exports["./typert"]`, which `@deepseek-ai/dsh-typert-loader` picks up from
 * any mounted package that declares it.
 *
 * @module dsh-reasoning-setup/host
 */

export * from './errors.ts'
export * from './scan.ts'
export type * from './types.ts'
export { default } from './service.ts'
export { Config, ReasoningSetupService } from './service.ts'
