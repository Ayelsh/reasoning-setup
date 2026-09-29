/**
 * Check the built plugin against a deepseek-harness checkout.
 *
 * `pnpm run build` already checks this package against itself. This script
 * checks it against the application it will run inside, using the pieces that
 * decide whether it loads at all:
 *
 * - the host half is imported with `@deepseek-ai/*` resolved to the harness
 *   workspace (the same packages the profile's module fallback links point
 *   at), so a missing or misspelled import fails here instead of in the
 *   application;
 * - the published Typert manifest is handed to the loader's own
 *   `validateTypertManifest`, which is what the running Host calls before it
 *   registers the endpoints;
 * - the level and thinking-format vocabularies this package mirrors from
 *   `dsh-llm-pi-ai`'s catalog are compared against that source, so a harness
 *   upgrade that changes either fails here instead of writing declarations
 *   the pi-ai resolver would refuse;
 * - the scan module's pure rules (declaration lookup, validation mirror, op
 *   building) run against fixture documents.
 *
 * Usage: `node scripts/verify.mjs [path-to-harness-checkout]`
 *
 * @module dsh-reasoning-setup/scripts/verify
 */

import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const HARNESS = resolve(process.argv[2] ?? join(ROOT, '..', '..', 'deepseek-harness'))

/** Workspace package directories behind the bare specifiers the host half imports. */
const LINKS = {
  '@deepseek-ai/cordis': 'vendor/cordis',
  '@deepseek-ai/schemastery': 'vendor/schemastery',
  '@deepseek-ai/dsh-typert-protocol': 'packages/typert/protocol',
  '@deepseek-ai/dsh-settings': 'packages/settings/settings',
  'zod': null,
}

/**
 * Fail the verification with one named defect.
 * @param message - what is wrong.
 */
function fail(message) {
  throw new Error(`verify: ${message}`)
}

if (!existsSync(join(HARNESS, 'package.json'))) fail(`${HARNESS} is not a deepseek-harness checkout`)
for (const relative of ['lib/index.js', 'lib/typert.js', 'lib/client.js']) {
  if (!existsSync(join(ROOT, relative))) fail(`${relative} is missing — run \`pnpm run build\` first`)
}

// Resolution mirrors the profile the plugin installs into: the harness packages
// are linked beside it rather than declared as dependencies, exactly as the
// module fallback links do at runtime.
const scope = join(ROOT, 'node_modules', '@deepseek-ai')
mkdirSync(scope, { recursive: true })
for (const [specifier, relative] of Object.entries(LINKS)) {
  if (relative === null) continue
  const target = join(HARNESS, relative)
  if (!existsSync(join(target, 'package.json'))) fail(`${specifier} is not built in the harness checkout (${target})`)
  const link = join(ROOT, 'node_modules', specifier)
  rmSync(link, { force: true, recursive: true })
  symlinkSync(target, link, 'dir')
}

const service = (await import(pathToFileURL(join(ROOT, 'lib/index.js')).href)).default
if (typeof service !== 'function') fail('lib/index.js has no default-exported service class')
if (service.name !== 'ReasoningSetupService') fail(`lib/index.js exports ${service.name}, not ReasoningSetupService`)
if (!Array.isArray(service.inject)) fail('the service declares no inject list')
for (const required of ['llm', 'settings']) {
  if (!service.inject.includes(required)) fail(`the service does not inject ${required}`)
}

const { TYPERT } = await import(pathToFileURL(join(ROOT, 'lib/typert.js')).href)
const loader = await import(pathToFileURL(join(HARNESS, 'packages/typert/loader/lib/index.js')).href)
if (typeof loader.validateTypertManifest !== 'function') {
  fail('the harness typert-loader does not export validateTypertManifest')
}
try {
  loader.validateTypertManifest('dsh-reasoning-setup', TYPERT)
} catch (error) {
  fail(`the loader refused the published manifest: ${error.message}`)
}

/**
 * Extract one gate object's keys from the pi-ai catalog source, in declaration
 * order — the vocabulary this package mirrors lives only in that source, not
 * in the package's public exports.
 * @param name - the gate constant's name.
 * @returns its keys.
 */
function catalogGate(name) {
  const text = readFileSync(join(HARNESS, 'packages/llm/llm-pi-ai/src/catalog.ts'), 'utf8')
  const start = text.indexOf(`const ${name}`)
  if (start < 0) fail(`the harness catalog no longer declares ${name}; this mirror needs re-reading`)
  const open = text.indexOf('{', start)
  const close = text.indexOf('}', open)
  const keys = []
  for (const match of text.slice(open, close).matchAll(/^\s*['"]?([\w-]+)['"]?\s*:/gmu)) keys.push(match[1])
  return keys
}

const {
  REASONING_LEVELS, THINKING_FORMATS, modelDeclaration, effortOps, validateLevels, routeFormSlice,
} = await import(pathToFileURL(join(ROOT, 'lib/index.js')).href)

const harnessLevels = catalogGate('THINKING_LEVEL_GATE')
if (JSON.stringify([...REASONING_LEVELS]) !== JSON.stringify(harnessLevels)) {
  fail(`REASONING_LEVELS [${[...REASONING_LEVELS].join(', ')}] does not match the harness THINKING_LEVEL_GATE [${harnessLevels.join(', ')}]`)
}
const harnessFormats = catalogGate('THINKING_FORMAT_GATE')
if (JSON.stringify([...THINKING_FORMATS]) !== JSON.stringify(harnessFormats)) {
  fail(`THINKING_FORMATS [${[...THINKING_FORMATS].join(', ')}] does not match the harness THINKING_FORMAT_GATE [${harnessFormats.join(', ')}]`)
}

// One document shaped like a real one: a hand-declared route with a models
// list, and a catalog route customizing through modelOverrides.
const document = {
  providers: {
    grok: {
      models: [
        { id: 'grok-4.20-reasoning', name: 'Grok 4.20 Reasoning' },
        { id: 'grok-4.3', name: 'Grok 4.3', reasoningEfforts: { off: null, low: 'low' } },
      ],
    },
    'zai-coding-cn': { apiKeyEnv: 'DSH_ZHIPU_PLAN_KEY' },
  },
}

const route = routeFormSlice(document, 'grok')
const declared = modelDeclaration('grok', route, 'grok-4.3')
if (declared?.path !== 'models-entry' || declared.entryPath.join('.') !== 'providers.grok.models.1') {
  fail(`modelDeclaration mis-located the models entry: ${JSON.stringify(declared)}`)
}
if (JSON.stringify(declared?.levels) !== JSON.stringify({ off: null, low: 'low' })) {
  fail(`modelDeclaration did not read the declared levels: ${JSON.stringify(declared?.levels)}`)
}
const catalog = modelDeclaration('zai-coding-cn', routeFormSlice(document, 'zai-coding-cn'), 'glm-5.3')
if (catalog?.path !== 'model-override' || catalog.entryPath.join('.') !== 'providers.zai-coding-cn.modelOverrides.glm-5.3') {
  fail(`modelDeclaration mis-located the override site: ${JSON.stringify(catalog)}`)
}
if (modelDeclaration('grok', route, 'absent') !== undefined) {
  fail('modelDeclaration located a model the models list does not carry')
}

if (validateLevels({ low: 'low' }) !== undefined) fail('validateLevels refused a valid declaration')
for (const [label, levels] of Object.entries({
  empty: {},
  offOnly: { off: null },
  unknownLevel: { turbo: 'turbo' },
  nullBeyondOff: { low: null },
  emptyWire: { low: '' },
})) {
  if (validateLevels(levels) === undefined) fail(`validateLevels accepted the ${label} declaration`)
}

const writeOps = effortOps(
  { kind: 'set', provider: 'grok', model: 'grok-4.20-reasoning', levels: { off: null, high: 'high' }, thinkingFormat: 'openai' },
  modelDeclaration('grok', route, 'grok-4.20-reasoning'),
)
if (writeOps[0]?.path?.join('.') !== 'providers.grok.models.0.reasoningEfforts') {
  fail(`effortOps did not address the model's entry: ${JSON.stringify(writeOps)}`)
}
const formatOp = writeOps.find(op => op.path.join('.').endsWith('.compat'))
if (formatOp === undefined || formatOp.value.thinkingFormat !== 'openai') {
  fail(`effortOps dropped or mis-wrote the format: ${JSON.stringify(writeOps)}`)
}
const removeOps = effortOps(
  { kind: 'remove', provider: 'grok', model: 'grok-4.3' },
  modelDeclaration('grok', route, 'grok-4.3'),
)
if (removeOps.length !== 1 || removeOps[0].op !== 'unset' || removeOps[0].path.join('.') !== 'providers.grok.models.1.reasoningEfforts') {
  fail(`effortOps built the wrong removal: ${JSON.stringify(removeOps)}`)
}
if (effortOps(
  { kind: 'set', provider: 'grok', model: 'grok-4.3', levels: { off: null, low: 'low' } },
  modelDeclaration('grok', route, 'grok-4.3'),
).length !== 0) {
  fail('effortOps rewrote an unchanged declaration')
}

console.log(`verify: ${service.name} loads against ${HARNESS}; manifest, vocabularies, and scan rules check out`)
