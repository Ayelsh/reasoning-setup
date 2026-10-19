/**
 * Preview entry for the reasoning-setup settings page.
 *
 * Bundled by `scripts/preview.mjs` with esbuild, then imported into a jsdom
 * document where `mount()` renders the REAL `EffortPanel` for one scenario.
 * The captured markup is written into a standalone HTML page that also inlines
 * the harness theme CSS and this plugin's own stylesheet, so a browser (and
 * therefore a screenshot) sees the page exactly as the settings shell would
 * paint it.
 */

import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { EffortPanel } from '../src/client/EffortPanel.tsx'
import { en, zh } from '../src/client/locales.ts'

export { STYLE_SHEET } from '../src/client/styles.ts'

/** The level vocabulary the host catalog gates on, in escalation order. */
const LEVELS = ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max']

/** The thinking-format vocabulary the host catalog gates on. */
const FORMATS = [
  'openai', 'deepseek', 'openrouter', 'together', 'baseten', 'zai',
  'qwen', 'chat-template', 'qwen-chat-template', 'string-thinking', 'ant-ling',
]

/**
 * Build a translator over one dictionary.
 * @param dictionary - the locale dictionary.
 * @returns a `t` function that interpolates `{name}` placeholders.
 */
function translate(dictionary) {
  return (key, params) => {
    let text = dictionary[key] ?? key
    if (params !== undefined) {
      for (const [name, value] of Object.entries(params)) text = text.split(`{${name}}`).join(String(value))
    }
    return text
  }
}

/**
 * The four-provider fixture: three editable routes (one of which reports a
 * route error), one read-only adapter, and a mix of declared, undeclared and
 * noted models.
 * @returns a scan report.
 */
function readyReport() {
  return {
    levels: LEVELS,
    formats: FORMATS,
    providers: [
      {
        id: 'deepseek',
        name: 'DeepSeek',
        editable: true,
        models: [
          {
            id: 'deepseek-chat',
            name: 'DeepSeek Chat',
            hasReasoning: true,
            efforts: ['off', 'low', 'medium', 'high'],
            defaultEffort: 'medium',
            editable: true,
          },
          {
            id: 'deepseek-reasoner',
            name: 'DeepSeek Reasoner',
            hasReasoning: true,
            efforts: ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'],
            defaultEffort: 'high',
            editable: true,
            declaredLevels: { off: null, low: 'low', medium: 'medium', high: 'high', max: 'max' },
            declaredFormat: 'deepseek',
          },
        ],
      },
      {
        id: 'zhipu',
        name: '智谱 GLM',
        editable: true,
        models: [
          {
            id: 'glm-4.6',
            name: 'GLM-4.6',
            hasReasoning: false,
            efforts: [],
            editable: true,
          },
          {
            id: 'glm-4.5-air',
            name: 'GLM-4.5 Air',
            hasReasoning: false,
            efforts: [],
            editable: true,
            note: '目录中没有该模型的思考档位，需要手动声明',
          },
        ],
      },
      {
        id: 'openrouter',
        name: 'OpenRouter',
        editable: false,
        models: [
          {
            id: 'anthropic/claude-sonnet-4.5',
            name: 'Claude Sonnet 4.5',
            hasReasoning: true,
            efforts: ['off', 'low', 'medium', 'high'],
            defaultEffort: 'medium',
            editable: false,
          },
        ],
      },
      {
        id: 'local',
        name: '本地 vLLM',
        editable: true,
        note: 'provider 路由读取超时，档位以目录声明为准',
        models: [
          {
            id: 'qwen3-32b',
            name: 'Qwen3 32B',
            hasReasoning: false,
            efforts: [],
            editable: true,
          },
        ],
      },
    ],
  }
}

/** Wait for React to flush effects and the scan promise to settle. */
async function settle(rounds = 4) {
  for (let index = 0; index < rounds; index += 1) {
    await new Promise(resolve => setTimeout(resolve, 40))
  }
}

/**
 * Click the first button whose trimmed text matches.
 * @param container - the mounted host element.
 * @param label - the visible label to look for.
 * @returns whether a button was found.
 */
function clickByText(container, label) {
  const button = Array.from(container.querySelectorAll('button'))
    .find(candidate => (candidate.textContent ?? '').trim() === label)
  if (button === undefined) return false
  button.click()
  return true
}

/**
 * Render one scenario into a container.
 * @param container - an attached DOM element.
 * @param scenario - the scenario id.
 * @returns a promise that resolves once the scenario has settled.
 */
export async function mount(container, scenario) {
  const t = translate(scenario.locale === 'en' ? en : zh)

  const loadScan = async () => {
    if (scenario.id === 'loading') return new Promise(() => {})
    if (scenario.id === 'error') throw new Error('settings document is not readable')
    if (scenario.id === 'empty') return { levels: LEVELS, formats: FORMATS, providers: [] }
    return readyReport()
  }

  const applyEdit = async () => {}

  const root = createRoot(container)
  root.render(createElement(EffortPanel, { t, loadScan, applyEdit }))
  await settle()

  if (scenario.id === 'editor') {
    clickByText(container, t('edit'))
    await settle(3)
  }

  if (scenario.id === 'notice') {
    clickByText(container, t('edit'))
    await settle(2)
    clickByText(container, t('save'))
    await settle(4)
  }

  if (scenario.id === 'filtered') {
    clickByText(container, t('filterMissing'))
    await settle(3)
  }

  if (scenario.id === 'press') {
    const action = container.querySelector('button[class*="rowAction"]')
    action?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await settle(1)
  }

  return () => { root.unmount() }
}
