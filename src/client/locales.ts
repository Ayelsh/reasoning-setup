/**
 * Copy for the reasoning-effort setup settings page, in both languages.
 * Simplified Chinese is the key source of truth; the English dictionary is
 * checked against it key by key at build time, so a missing translation fails
 * the build instead of rendering an unlabeled control.
 *
 * @module dsh-reasoning-setup/client/locales
 */

/** Simplified Chinese dictionary and key source of truth. */
export const zh = {
  nav: '思考强度',
  pageHint: '自动扫描已注册的 Provider 与模型：未声明思考能力的模型不会在任何模型选择器里出现「思考强度」。在本页为自定义 Provider 的模型声明思考档位后，重新打开模型选择器即可看到该设置。',
  scanPending: '正在扫描模型…',
  scanError: '扫描失败：{message}',
  noProviders: '当前没有已注册的 Provider。',
  retry: '重试',
  summaryMissing: '{count} 个模型未声明思考强度',
  summaryNone: '所有可编辑模型均已声明思考强度',
  providerReadonly: '其它适配器',
  routeError: '路由读取失败：{message}',
  modelMissing: '未声明思考强度',
  modelSupported: '已支持：{levels}',
  modelDefault: '默认 {level}',
  modelNote: '注意：{message}',
  edit: '配置',
  editActive: '编辑',
  editorTitle: '{model} 的思考档位',
  editorHint: '勾选要提供的档位并填写发送值（wire spelling，即请求里发给网关的字符串）；"off" 可留空，表示选择该档时不发送思考参数。',
  editorDeclaredHint: '该模型已由设置声明档位；修改会直接写入 llm-pi-ai 的设置文档。',
  formatLabel: '思考参数格式',
  formatInherit: '不设置（沿用目录与自动检测）',
  save: '保存',
  saving: '保存中…',
  cancel: '取消',
  removeDeclared: '移除此声明',
  editWireRequired: '档位 "{level}" 需要一个发送值',
  editNoneBeyondOff: '至少需要勾选一个 "off" 之外的档位',
  editError: '保存失败：{message}',
  savedNotice: '已保存；重新打开模型选择器后生效',
} as const

/** English dictionary, key-aligned with the Chinese source of truth. */
export const en: typeof zh = {
  nav: 'Thinking levels',
  pageHint: 'Scans registered providers and models: a model with no declared reasoning capability shows no thinking-level control in any model picker. Declare levels for a custom provider\'s models here, then reopen the model picker to see the setting.',
  scanPending: 'Scanning models…',
  scanError: 'Scan failed: {message}',
  noProviders: 'No providers are registered.',
  retry: 'Retry',
  summaryMissing: '{count} models declare no thinking levels',
  summaryNone: 'Every editable model declares thinking levels',
  providerReadonly: 'other adapter',
  routeError: 'Route listing failed: {message}',
  modelMissing: 'No thinking levels',
  modelSupported: 'Supported: {levels}',
  modelDefault: 'Default {level}',
  modelNote: 'Note: {message}',
  edit: 'Configure',
  editActive: 'Edit',
  editorTitle: 'Thinking levels for {model}',
  editorHint: 'Check the levels to offer and fill in the wire spelling (the string sent to the gateway in the request); "off" may stay empty, meaning "send no thinking parameter".',
  editorDeclaredHint: 'This model\'s levels are already declared in settings; saving writes straight into the llm-pi-ai settings document.',
  formatLabel: 'Thinking parameter format',
  formatInherit: 'Not set (catalog and auto-detection apply)',
  save: 'Save',
  saving: 'Saving…',
  cancel: 'Cancel',
  removeDeclared: 'Remove declaration',
  editWireRequired: 'Level "{level}" needs a wire spelling',
  editNoneBeyondOff: 'Check at least one level beyond "off"',
  editError: 'Save failed: {message}',
  savedNotice: 'Saved; reopen the model picker to see it',
}

/** Every dictionary key the page can ask for. */
export type EffortLocaleKey = keyof typeof zh
