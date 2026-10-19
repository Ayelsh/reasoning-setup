/**
 * Screenshot the preview pages produced by `scripts/preview.mjs`.
 *
 * Chromium and playwright-core are resolved out of the harness's own install
 * (the plugin has no browser dependency of its own), the page is opened at
 * deviceScaleFactor 2, motion is frozen so a shot is deterministic, and each
 * scenario element is captured to `preview/shots/`.
 *
 * Usage: node scripts/preview-shots.mjs [scenario ...]
 */

import { access, readdir, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const HARNESS = process.env.DSH_HARNESS ?? join(ROOT, '..', '..', 'deepseek-harness')
const OUT = join(ROOT, 'preview')
const SHOTS = join(OUT, 'shots')

/** Scenarios to shoot, and the element to clip to for each. */
const TARGETS = [
  { id: 'ready', selector: '.pv-frame' },
  { id: 'ready', selector: '.pv-bare', suffix: 'bare' },
  { id: 'ready', selector: '.pv-frame', variant: 'busy' },
  { id: 'editor', selector: '.pv-frame' },
  { id: 'editor', selector: '.pv-bare', suffix: 'bare' },
  { id: 'filtered', selector: '.pv-frame' },
  { id: 'loading', selector: '.pv-frame' },
  { id: 'error', selector: '.pv-frame' },
  { id: 'empty', selector: '.pv-frame' },
  { id: 'notice', selector: '.pv-frame' },
  { id: 'press', selector: '.pv-frame', press: 'button[class*="rowAction"]' },
  // The scroll column is the host's own geometry, so a scrolled shot proves
  // the sticky hero keeps its edge and the field is not clipped at the top.
  { id: 'ready', selector: '.pv-frame', suffix: 'scrolled', scroll: 620 },
  // Preference extremes: the checklist requires each answer to be rendered.
  { id: 'ready', selector: '.pv-frame', suffix: 'rt', profiles: ['reduced-transparency'] },
  { id: 'ready', selector: '.pv-frame', suffix: 'hc', profiles: ['contrast'] },
  { id: 'editor', selector: '.pv-frame', suffix: 'rm', profiles: ['reduced-motion'] },
]

/**
 * Resolve playwright-core from the harness pnpm store.
 * @returns the module's namespace.
 */
async function loadPlaywright() {
  const store = join(HARNESS, 'node_modules', '.pnpm')
  const entries = (await readdir(store)).filter(name => name.startsWith('playwright-core@')).sort()
  if (entries.length === 0) throw new Error(`no playwright-core in ${store}`)
  const modulePath = join(store, entries.at(-1), 'node_modules', 'playwright-core', 'index.mjs')
  return import(pathToFileURL(modulePath).href)
}

/**
 * Pick an installed Chromium build.
 *
 * The cached build on disk is usually a different revision from the one the
 * resolved playwright-core expects, so the executable is located directly
 * instead of trusting `chromium.executablePath()`.
 * @param chromium - playwright's chromium handle.
 * @returns the executable path.
 */
async function chromiumPath(chromium) {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? join(process.env.HOME ?? '', '.cache', 'ms-playwright')
  const builds = (await readdir(root)).filter(name => /^chromium(_headless_shell)?-\d+$/.test(name)).sort()
  for (const build of builds.reverse()) {
    for (const relative of ['chrome-linux64/chrome', 'chrome-linux/chrome', 'chrome-headless-shell-linux64/chrome-headless-shell']) {
      const candidate = join(root, build, relative)
      try {
        await access(candidate)
        return candidate
      } catch { /* try the next layout */ }
    }
  }
  const fallback = chromium.executablePath()
  if (fallback !== '') return fallback
  throw new Error(`no chromium build under ${root}`)
}

/** Freeze animation and transition so every shot is the settled state. */
const FREEZE = `*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
  caret-color: transparent !important;
}`

/**
 * The preview page a target is shot from.
 * @param target - the shot target.
 * @param theme - light or dark.
 * @returns the HTML file name.
 */
function pageName(target, theme) {
  if (target.variant !== undefined) return `${target.id}-${theme}-${target.variant}.html`
  if (target.selector === '.pv-bare') return `${target.id}-${theme}.html`
  return `${target.id}-${theme}-framed.html`
}

async function main() {
  const wanted = process.argv.slice(2)
  const { chromium } = await loadPlaywright()
  await mkdir(SHOTS, { recursive: true })

  const browser = await chromium.launch({
    executablePath: await chromiumPath(chromium),
    args: ['--no-sandbox', '--font-render-hinting=none'],
  })

  for (const target of TARGETS) {
    if (wanted.length > 0 && !wanted.includes(target.id)) continue
    for (const theme of ['light', 'dark']) {
      for (const profile of target.profiles ?? ['default']) {
        const variant = target.variant === undefined ? '' : `-${target.variant}`
        const file = join(OUT, pageName(target, theme))
        const page = await browser.newPage({
          viewport: { width: 980, height: 1000 },
          deviceScaleFactor: 2,
        })
        // Preference extremes are answered by CSS media queries, so they are
        // emulated through CDP rather than by a second stylesheet.
        if (profile !== 'default') {
          const cdp = await page.context().newCDPSession(page)
          await cdp.send('Emulation.setEmulatedMedia', {
            features: [
              { name: 'prefers-reduced-transparency', value: profile === 'reduced-transparency' ? 'reduce' : 'no-preference' },
              { name: 'prefers-contrast', value: profile === 'contrast' ? 'more' : 'no-preference' },
              { name: 'prefers-reduced-motion', value: profile === 'reduced-motion' ? 'reduce' : 'no-preference' },
            ],
          })
        }
        await page.goto(pathToFileURL(file).href)
        if (target.scroll !== undefined) {
          await page.evaluate(top => {
            const column = document.querySelector('.pv-options')
            if (column !== null) column.scrollTop = top
          }, target.scroll)
        }
        await page.addStyleTag({ content: FREEZE })
        await page.waitForTimeout(220)
        const element = await page.$(target.selector)
        if (element === null) throw new Error(`missing ${target.selector} in ${file}`)
        const suffix = [
          variant,
          target.suffix === undefined ? '' : `-${target.suffix}`,
          profile === 'default' ? '' : `-${profile}`,
        ].join('')
        const name = `${target.id}${suffix}-${theme}.png`
        // A pressed state only exists while the pointer is held, so the press
        // shot holds a real mouse button over the row action and shoots before
        // releasing it.
        if (target.press !== undefined) {
          const action = await page.$(target.press)
          if (action === null) throw new Error(`missing ${target.press} in ${file}`)
          const box = await action.boundingBox()
          if (box === null) throw new Error(`unmeasurable ${target.press} in ${file}`)
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
          await page.mouse.down()
          await page.waitForTimeout(90)
          await element.screenshot({ path: join(SHOTS, name) })
          await page.mouse.up()
        } else {
          await element.screenshot({ path: join(SHOTS, name) })
        }
        await page.close()
        process.stdout.write(`shots: ${name}\n`)
      }
    }
  }

  await browser.close()
  process.stdout.write(`shots: wrote to ${SHOTS}\n`)
}

await main()
