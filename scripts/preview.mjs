/**
 * Render the reasoning-setup settings page into standalone HTML files.
 *
 * The page is a settings *section*, so it only makes sense inside the shell's
 * real geometry. Each scenario is therefore written twice:
 *
 *   - `preview/<scenario>-<theme>.html`         the section content alone,
 *                                               on the shell's own page colour.
 *   - `preview/<scenario>-<theme>-framed.html`  the same markup inside a
 *                                               reproduction of the settings
 *                                               panel: 800px wide, 28px panel
 *                                               radius, 54px header, and the
 *                                               `.options` scroll column with
 *                                               `padding: 0 24px 24px` — zero
 *                                               top padding, which is exactly
 *                                               the geometry that clips a glass
 *                                               surface's top edge.
 *
 * The theme CSS is inlined from the harness (base + design-platform + focus +
 * corner-shape), and the plugin's own `STYLE_SHEET` is appended last so the
 * page's material tokens win.
 *
 * Usage: node scripts/preview.mjs
 */

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const HARNESS = process.env.DSH_HARNESS ?? join(ROOT, '..', '..', 'deepseek-harness')
const OUT = join(ROOT, 'preview')
const THEME = join(HARNESS, 'packages', 'client', 'ui-theme', 'src', 'styles')

/** React, react-dom and jsdom resolve from the harness's dependency graph. */
const harnessRequire = createRequire(join(HARNESS, 'packages', 'client', 'ui-primitives', 'package.json'))
/** esbuild is this plugin's own devDependency, used exactly as `build.mjs` uses it. */
const esbuild = createRequire(join(ROOT, 'package.json'))('esbuild')

/** Scenarios the shots script captures, in render order. */
const SCENARIOS = [
  { id: 'ready', title: 'Ready — mixed providers' },
  { id: 'editor', title: 'Editor open on a declared model' },
  { id: 'filtered', title: 'Filtered to undeclared models' },
  { id: 'loading', title: 'Loading' },
  { id: 'error', title: 'Scan failed' },
  { id: 'empty', title: 'No providers' },
  { id: 'notice', title: 'Saved notice' },
  { id: 'press', title: 'Row action pressed' },
]

/**
 * Install a jsdom document on `globalThis` so React can render.
 * @returns the jsdom window.
 */
async function installDom() {
  const { JSDOM } = harnessRequire('jsdom')
  const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', {
    pretendToBeVisual: true,
    url: 'http://localhost/',
  })
  const { window } = dom
  globalThis.window = window
  globalThis.document = window.document
  globalThis.HTMLElement = window.HTMLElement
  globalThis.HTMLButtonElement = window.HTMLButtonElement
  globalThis.HTMLInputElement = window.HTMLInputElement
  globalThis.Element = window.Element
  globalThis.Node = window.Node
  globalThis.Event = window.Event
  globalThis.MouseEvent = window.MouseEvent
  globalThis.KeyboardEvent = window.KeyboardEvent
  globalThis.getComputedStyle = window.getComputedStyle.bind(window)
  globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window)
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window)
  Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true })
  globalThis.IS_REACT_ACT_ENVIRONMENT = false
  return window
}

/**
 * Bundle the preview entry with esbuild.
 * @returns the built JavaScript, as text.
 */
async function bundle() {
  const result = await esbuild.build({
    entryPoints: [join(ROOT, 'scripts', 'preview-entry.jsx')],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    jsx: 'automatic',
    loader: { '.ts': 'ts', '.tsx': 'tsx', '.jsx': 'jsx' },
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [{
      name: 'preview-aliases',
      setup(build) {
        build.onResolve({ filter: /^react$/ }, () => ({ path: harnessRequire.resolve('react') }))
        build.onResolve({ filter: /^react\/jsx-runtime$/ }, () => ({ path: harnessRequire.resolve('react/jsx-runtime') }))
        build.onResolve({ filter: /^react-dom\/client$/ }, () => ({ path: harnessRequire.resolve('react-dom/client') }))
        build.onResolve({ filter: /^react-dom$/ }, () => ({ path: harnessRequire.resolve('react-dom') }))
        build.onResolve({ filter: /^@deepseek-ai\/dsh-client-ui-primitives$/ }, () => ({
          path: join(ROOT, 'scripts', 'preview-primitives.jsx'),
        }))
      },
    }],
  })
  return result.outputFiles[0].text
}

/**
 * Read the harness theme CSS and this plugin's sheet.
 * @returns the concatenated CSS.
 */
async function themeCss(styleSheet) {
  const files = ['base.css', 'design-platform.css', 'focus.css', 'corner-shape.css', 'scrollbar.css']
  const parts = []
  for (const file of files) {
    parts.push(`/* ---- ${file} ---- */\n${await readFile(join(THEME, file), 'utf8')}`)
  }
  parts.push(`/* ---- dsh-reasoning-setup styles.ts ---- */\n${styleSheet}`)
  return parts.join('\n\n')
}

/** Chrome CSS for the preview pages themselves (not the plugin's). */
const PREVIEW_CSS = `
/* Primitive stand-in metrics: mirrors Button.module.css from the harness. */
.pv-btn {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: none;
  border-radius: var(--dsw-radius-md);
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  color: var(--dsw-alias-label-primary);
  background: transparent;
  padding: 0 14px;
}
.pv-btn:disabled { cursor: not-allowed; opacity: 0.4; }
.pv-btn-md { height: 36px; }
.pv-btn-sm { height: 28px; font-size: 12px; line-height: 18px; padding: 0 10px; border-radius: var(--dsw-radius-sm); }
.pv-btn-primary { background: var(--dsw-alias-button-primary-fill); color: var(--dsw-alias-label-primary-foreground); }
.pv-btn-ghost:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.pv-btn-outline { border: 0.5px solid var(--dsw-alias-border-l3); background: transparent; }
.pv-btn-outline:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }

html, body { margin: 0; padding: 0; }
body {
  min-height: 100vh;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-font-family);
  -webkit-font-smoothing: antialiased;
}

/* The bare page: the section content on the shell's own background. */
.pv-stage { padding: 0; }
.pv-bare { padding: 0; max-width: 800px; }

/* The framed page: the real settings panel geometry. */
.pv-frame {
  box-sizing: border-box;
  display: flex;
  width: 800px;
  max-width: calc(100vw - 48px);
  height: 760px;
  margin: 24px;
  overflow: hidden;
  border-radius: var(--dsw-radius-panel);
  background: var(--dsw-alias-bg-layer-2);
  box-shadow: var(--dsw-elevation-prominent);
}
.pv-nav {
  flex: none;
  width: 188px;
  padding: 22px 12px 0;
  border-right: 0.5px solid var(--dsw-alias-border-l1);
}
.pv-navItem {
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-radius: var(--dsw-radius-md);
  font-size: 13px;
  color: var(--dsw-alias-label-secondary);
}
.pv-navItem[data-active="true"] {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
  font-weight: 550;
}
.pv-content { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.pv-header {
  flex: none;
  box-sizing: border-box;
  height: 54px;
  padding: 20px 14px 8px 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}
/* The scroll column with ZERO top padding — failure mode #1's host. */
.pv-options {
  flex: 1;
  min-height: 0;
  padding: 0 24px 24px;
  overflow-y: auto;
}

/* A busy backdrop: what the material has to work over to prove it is glass. */
.pv-busy {
  background:
    radial-gradient(46% 38% at 12% 6%, rgba(255, 96, 148, 0.55), transparent 70%),
    radial-gradient(40% 34% at 88% 12%, rgba(64, 156, 255, 0.55), transparent 70%),
    radial-gradient(52% 42% at 52% 96%, rgba(120, 220, 180, 0.55), transparent 72%),
    linear-gradient(140deg, #1b1f2a, #2b2140 55%, #10222c);
}
body:not([data-ds-dark-theme]) .pv-busy {
  background:
    radial-gradient(46% 38% at 12% 6%, rgba(255, 96, 148, 0.55), transparent 70%),
    radial-gradient(40% 34% at 88% 12%, rgba(64, 156, 255, 0.55), transparent 70%),
    radial-gradient(52% 42% at 52% 96%, rgba(120, 220, 180, 0.55), transparent 72%),
    linear-gradient(140deg, #dfe7f5, #efe3f7 55%, #e2f4ef);
}
.pv-busy .pv-frame { background: transparent; box-shadow: none; }
.pv-busy .pv-options { background: transparent; }
`

/**
 * Wrap one captured markup string in a page.
 * @param options - the page's parts.
 * @returns the HTML document.
 */
function page(options) {
  const { title, css, markup, dark, bodyClass } = options
  return `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
${css}
${PREVIEW_CSS}
</style>
</head>
<body${dark ? ' data-ds-dark-theme' : ''} class="${bodyClass ?? ''}">
${markup}
</body>
</html>
`
}

/** Nav entries, purely so the frame looks like the real shell. */
const NAV = ['通用', '模型服务', '思考强度', '外观', '快捷键', '开发者']

/**
 * The framed markup around a captured section.
 * @param markup - the section's inner HTML.
 * @returns the frame's HTML.
 */
function frame(markup) {
  const items = NAV.map(name => {
    const active = name === '思考强度'
    return `<div class="pv-navItem"${active ? ' data-active="true"' : ''}>${name}</div>`
  }).join('')
  return `<div class="pv-frame">
<div class="pv-nav">${items}</div>
<div class="pv-content">
<div class="pv-header">设置</div>
<div class="pv-options">${markup}</div>
</div>
</div>`
}

async function main() {
  const window = await installDom()
  const css = await themeCss((await import('../src/client/styles.ts')).STYLE_SHEET)

  await rm(OUT, { recursive: true, force: true })
  await mkdir(join(OUT, 'shots'), { recursive: true })

  const code = await bundle()
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  const entry = await import(moduleUrl)

  for (const scenario of SCENARIOS) {
    const host = window.document.createElement('div')
    window.document.body.append(host)
    await entry.mount(host, { id: scenario.id, locale: 'zh' })
    const markup = host.innerHTML
    host.remove()

    for (const dark of [false, true]) {
      const suffix = dark ? 'dark' : 'light'
      const bare = page({
        title: `${scenario.title} (${suffix})`,
        css,
        markup: `<div class="pv-stage pv-bare">${markup}</div>`,
        dark,
      })
      const framed = page({
        title: `${scenario.title} framed (${suffix})`,
        css,
        markup: frame(markup),
        dark,
      })
      const busy = page({
        title: `${scenario.title} busy backdrop (${suffix})`,
        css,
        markup: frame(markup),
        dark,
        bodyClass: 'pv-busy',
      })
      await writeFile(join(OUT, `${scenario.id}-${suffix}.html`), bare)
      await writeFile(join(OUT, `${scenario.id}-${suffix}-framed.html`), framed)
      await writeFile(join(OUT, `${scenario.id}-${suffix}-busy.html`), busy)
    }
    process.stdout.write(`preview: ${scenario.id} (${scenario.title})\n`)
  }

  process.stdout.write(`preview: wrote ${SCENARIOS.length * 6} pages to ${OUT}\n`)
  process.exit(0)
}

await main()
