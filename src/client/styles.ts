/**
 * The page's stylesheet, owned by this bundle.
 *
 * This plugin is fetched outside the shell's own build, so it cannot use the
 * repository's CSS-module pipeline: the sheet below is one string, injected
 * once into the document head when the plugin materializes, and every class
 * name is prefixed so nothing it declares can collide with the shell's own
 * rules. `styles.<name>` resolves to the prefixed class for that name, and the
 * build script checks that each class the source names exists in the sheet.
 *
 * Colours come from the shell's `--dsw-alias-*` custom properties, so the page
 * follows the application theme instead of carrying a palette of its own.
 *
 * @module dsh-reasoning-setup/client/styles
 */

/** Every class this page's markup names; the sheet below must declare each one. */
export const STYLE_CLASSES = [
  'page', 'pageHint', 'summaryBar', 'summaryMissing', 'summaryOk', 'scanStatus', 'scanError',
  'group', 'groupHead', 'groupTitle', 'groupId', 'groupBadge', 'groupBadgeReadonly', 'groupNote',
  'modelRow', 'modelName', 'modelMeta',
  'chip', 'chipMissing', 'chipOk', 'chipDefault',
  'editor', 'editorHead', 'editorHint', 'levelTable', 'levelRow', 'levelCheck', 'levelName',
  'levelWire', 'formatRow', 'formatSelect', 'editorActions', 'editorError',
] as const

/** One class name this page uses. */
export type StyleClass = (typeof STYLE_CLASSES)[number]

const PREFIX = 'drs-'

const SHEET = `
.drs-page { display: flex; flex-direction: column; gap: 22px; }

.drs-pageHint {
  margin: 0;
  font-size: 13px; line-height: 20px;
  color: var(--dsw-alias-label-tertiary);
}

.drs-summaryBar {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; line-height: 20px;
  color: var(--dsw-alias-label-secondary);
}
.drs-summaryMissing { color: var(--dsw-alias-state-warn-label); font-weight: 600; }
.drs-summaryOk { color: var(--dsw-alias-label-secondary); }

.drs-scanStatus {
  margin: 0;
  font-size: 13px; line-height: 20px;
  color: var(--dsw-alias-label-tertiary);
}
.drs-scanError {
  margin: 0;
  font-size: 13px; line-height: 20px;
  color: var(--dsw-alias-state-error-primary);
}

.drs-group { display: flex; flex-direction: column; gap: 8px; }
.drs-groupHead {
  display: flex; align-items: baseline; gap: 8px;
  min-width: 0;
}
.drs-groupTitle {
  font-size: 14px; font-weight: 600; line-height: 22px;
  color: var(--dsw-alias-label-primary);
}
.drs-groupId {
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
  font-family: var(--dsw-alias-font-mono, monospace);
}
.drs-groupBadge {
  font-size: 11px; line-height: 18px; padding: 0 8px; border-radius: 9px;
  background: var(--dsw-alias-fill-secondary);
  color: var(--dsw-alias-label-secondary);
  white-space: nowrap;
}
.drs-groupBadgeReadonly { color: var(--dsw-alias-label-tertiary); }
.drs-groupNote {
  margin: 0;
  font-size: 12px; line-height: 18px;
  color: var(--dsw-alias-state-warn-label);
}

.drs-modelRow {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--dsw-alias-fill-secondary);
  min-width: 0;
}
.drs-modelName {
  font-size: 13px; line-height: 20px;
  color: var(--dsw-alias-label-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.drs-modelMeta {
  display: flex; align-items: center; gap: 8px;
  margin-left: auto;
  min-width: 0;
}

.drs-chip {
  font-size: 11px; line-height: 18px; padding: 0 8px; border-radius: 9px;
  background: var(--dsw-alias-fill-tertiary);
  color: var(--dsw-alias-label-secondary);
  white-space: nowrap;
}
.drs-chipMissing {
  background: var(--dsw-alias-state-warn-fill);
  color: var(--dsw-alias-state-warn-label);
}
.drs-chipOk {
  background: var(--dsw-alias-state-success-fill);
  color: var(--dsw-alias-state-success-label);
}
.drs-chipDefault { font-style: normal; }

.drs-editor {
  display: flex; flex-direction: column; gap: 10px;
  padding: 12px;
  border: 1px solid var(--dsw-alias-border-secondary);
  border-radius: 8px;
}
.drs-editorHead {
  display: flex; align-items: baseline; gap: 8px; min-width: 0;
}
.drs-editorHint {
  margin: 0;
  font-size: 12px; line-height: 18px;
  color: var(--dsw-alias-label-tertiary);
}

.drs-levelTable { display: flex; flex-direction: column; gap: 6px; }
.drs-levelRow {
  display: grid;
  grid-template-columns: 18px 90px 1fr;
  align-items: center; gap: 8px;
}
.drs-levelCheck { margin: 0; }
.drs-levelName {
  font-size: 13px; line-height: 20px;
  color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-alias-font-mono, monospace);
}
.drs-levelWire {
  padding: 4px 8px;
  font-size: 12px;
  font-family: var(--dsw-alias-font-mono, monospace);
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-fill-primary);
  border: 1px solid var(--dsw-alias-border-secondary);
  border-radius: 6px;
  min-width: 0;
}
.drs-levelWire:disabled { color: var(--dsw-alias-label-tertiary); }

.drs-formatRow {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; line-height: 20px;
  color: var(--dsw-alias-label-secondary);
}
.drs-formatSelect {
  padding: 4px 8px;
  font-size: 12px;
  font-family: var(--dsw-alias-font-mono, monospace);
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-fill-primary);
  border: 1px solid var(--dsw-alias-border-secondary);
  border-radius: 6px;
  min-width: 0;
}

.drs-editorActions { display: flex; align-items: center; gap: 8px; }
.drs-editorError {
  margin: 0;
  font-size: 12px; line-height: 18px;
  color: var(--dsw-alias-state-error-primary);
}
`

/** The prefixed class-name table the markup reads. */
export const styles = Object.fromEntries(
  STYLE_CLASSES.map(name => [name, `${PREFIX}${name}`]),
) as { readonly [K in StyleClass]: string }

/** The whole stylesheet as one string. */
export const STYLE_SHEET = SHEET

/**
 * Inject the stylesheet once per document.
 * @returns nothing; safe to call repeatedly.
 */
export function ensureStyles(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById('dsh-reasoning-setup-styles') !== null) return
  const element = document.createElement('style')
  element.id = 'dsh-reasoning-setup-styles'
  element.textContent = STYLE_SHEET
  document.head.append(element)
}
