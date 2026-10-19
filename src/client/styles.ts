/**
 * The page stylesheet, owned by this bundle.
 *
 * Designed with Apple Design principles:
 * - Fluid Inset Grouped cards mirroring macOS / iOS System Settings.
 * - Material depth with translucent layers, borders, and tokenized fills.
 * - Optical sizing, tracking, and leading following Apple Typography.
 * - Instant feedback and spring-like transitions for responsive interactions.
 * - Full support for reduced-motion and theme adaptation.
 *
 * Colours come from the shell --dsw-alias-* custom properties, so the page
 * follows the application theme seamlessly.
 *
 * @module dsh-reasoning-setup/client/styles
 */

/** Every class this page markup names; the sheet below must declare each one. */
export const STYLE_CLASSES = [
  "page", "pageHint", "summaryBar", "summaryMissing", "summaryOk", "scanStatus", "scanError",
  "group", "groupHead", "groupTitle", "groupId", "groupBadge", "groupBadgeReadonly", "groupNote", "groupCard",
  "modelItem", "modelRow", "modelRowActive", "modelName", "modelMeta",
  "chip", "chipMissing", "chipOk", "chipDefault",
  "editor", "editorHead", "editorHint", "levelTable", "levelRow", "levelCheck", "levelName",
  "levelWire", "formatRow", "formatSelect", "editorActions", "editorError",
  "statusDot",
] as const

/** One class name this page uses. */
export type StyleClass = (typeof STYLE_CLASSES)[number]

const PREFIX = "drs-"

const SHEET = `
.drs-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
  color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif);
  font-optical-sizing: auto;
  -webkit-font-smoothing: antialiased;
}

.drs-pageHint {
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-secondary);
  letter-spacing: -0.005em;
  padding: 0 2px;
}

.drs-summaryBar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--dsw-radius-lg, 12px);
  background: var(--dsw-alias-settings-card-fill, var(--dsw-alias-bg-layer-2));
  border: 0.5px solid var(--dsw-alias-settings-card-stroke, var(--dsw-alias-border-l2));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  font-size: 13px;
  line-height: 20px;
}

.drs-statusDot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  background: var(--dsw-alias-state-success-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-success-primary) 20%, transparent);
}

.drs-summaryMissing {
  color: var(--dsw-alias-state-warn-label);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.drs-summaryOk {
  color: var(--dsw-alias-label-secondary);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.drs-scanStatus {
  margin: 0;
  padding: 10px 14px;
  border-radius: var(--dsw-radius-md, 10px);
  background: var(--dsw-alias-interactive-bg-hover);
  border: 0.5px solid var(--dsw-alias-border-l2);
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-secondary);
}

.drs-scanError {
  margin: 0;
  padding: 12px 16px;
  border-radius: var(--dsw-radius-md, 10px);
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);
  border: 0.5px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 20%, transparent);
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-state-error-primary);
  display: flex;
  align-items: center;
  gap: 12px;
}

.drs-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drs-groupHead {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 0 4px;
}

.drs-groupTitle {
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
  color: var(--dsw-alias-label-primary);
  letter-spacing: -0.01em;
}

.drs-groupId {
  font-size: 11px;
  line-height: 16px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-tertiary);
  font-family: var(--ds-font-family-code, monospace);
}

.drs-groupBadge {
  font-size: 11px;
  line-height: 16px;
  padding: 1px 8px;
  border-radius: 9999px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-secondary);
  border: 0.5px solid var(--dsw-alias-border-l2);
  white-space: nowrap;
}

.drs-groupBadgeReadonly {
  color: var(--dsw-alias-label-tertiary);
}

.drs-groupNote {
  margin: 0 0 4px;
  padding: 8px 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--dsw-alias-state-warn-label) 8%, transparent);
  border: 0.5px solid color-mix(in srgb, var(--dsw-alias-state-warn-label) 20%, transparent);
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-state-warn-label);
}

.drs-groupCard {
  border: 0.5px solid var(--dsw-alias-settings-card-stroke, var(--dsw-alias-border-l2));
  background: var(--dsw-alias-settings-card-fill, var(--dsw-alias-bg-layer-2));
  border-radius: var(--dsw-radius-xl, 14px);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.drs-modelItem {
  position: relative;
}

.drs-modelItem:not(:first-child) {
  border-top: 0.5px solid var(--dsw-alias-border-l1);
}

.drs-modelRow {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  min-width: 0;
  transition: background 120ms cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
}

.drs-modelRow:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}

.drs-modelRowActive {
  background: var(--dsw-alias-interactive-bg-hover-accent, var(--dsw-alias-interactive-bg-hover));
}

.drs-modelName {
  font-size: 13.5px;
  font-weight: 500;
  line-height: 20px;
  color: var(--dsw-alias-label-primary);
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drs-modelMeta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  min-width: 0;
  flex-shrink: 0;
}

.drs-chip {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 9999px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-secondary);
  border: 0.5px solid var(--dsw-alias-border-l2);
  white-space: nowrap;
  letter-spacing: 0.01em;
}

.drs-chipMissing {
  background: color-mix(in srgb, var(--dsw-alias-state-warn-label) 10%, transparent);
  color: var(--dsw-alias-state-warn-label);
  border-color: color-mix(in srgb, var(--dsw-alias-state-warn-label) 22%, transparent);
}

.drs-chipOk {
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent);
  color: var(--dsw-alias-state-success-primary);
  border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 22%, transparent);
}

.drs-chipDefault {
  color: var(--dsw-alias-label-tertiary);
  border-color: var(--dsw-alias-border-l1);
}

.drs-editor {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px;
  background: var(--dsw-alias-bg-module-platform);
  border-top: 0.5px solid var(--dsw-alias-border-l2);
  animation: drs-popIn 160ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes drs-popIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.drs-editorHead {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.drs-editorHint {
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-tertiary);
  letter-spacing: -0.005em;
}

.drs-levelTable {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px;
  background: var(--dsw-alias-settings-card-fill, var(--dsw-alias-bg-layer-2));
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-md, 10px);
}

.drs-levelRow {
  display: grid;
  grid-template-columns: 20px 84px 1fr;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 120ms ease;
  cursor: pointer;
}

.drs-levelRow:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}

.drs-levelCheck {
  margin: 0;
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--dsw-alias-state-business-primary);
}

.drs-levelName {
  font-size: 12.5px;
  font-weight: 500;
  line-height: 20px;
  color: var(--dsw-alias-label-primary);
  font-family: var(--ds-font-family-code, monospace);
  letter-spacing: -0.01em;
}

.drs-levelWire {
  box-sizing: border-box;
  padding: 5px 10px;
  font-size: 12px;
  font-family: var(--ds-font-family-code, monospace);
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  border: 0.5px solid var(--dsw-alias-border-l3);
  border-radius: 6px;
  min-width: 0;
  transition: border-color 140ms ease, box-shadow 140ms ease;
}

.drs-levelWire:focus {
  border-color: var(--dsw-alias-state-business-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-business-primary) 20%, transparent);
  outline: none;
}

.drs-levelWire:disabled {
  color: var(--dsw-alias-label-tertiary);
  background: transparent;
  border-color: transparent;
  cursor: default;
}

.drs-formatRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: var(--dsw-alias-settings-card-fill, var(--dsw-alias-bg-layer-2));
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-md, 10px);
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-secondary);
}

.drs-formatSelect {
  box-sizing: border-box;
  padding: 5px 10px;
  font-size: 12px;
  font-family: var(--ds-font-family-code, monospace);
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  border: 0.5px solid var(--dsw-alias-border-l3);
  border-radius: 6px;
  min-width: 0;
  cursor: pointer;
  transition: border-color 140ms ease, box-shadow 140ms ease;
}

.drs-formatSelect:focus {
  border-color: var(--dsw-alias-state-business-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-business-primary) 20%, transparent);
  outline: none;
}

.drs-editorActions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 4px;
}

.drs-editorError {
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-state-error-primary);
  font-weight: 500;
}

@media (prefers-reduced-motion: reduce) {
  .drs-editor,
  .drs-modelRow,
  .drs-levelRow,
  .drs-levelWire,
  .drs-formatSelect {
    animation: none !important;
    transition: none !important;
  }
}
`;

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
  if (typeof document === "undefined") return
  if (document.getElementById("dsh-reasoning-setup-styles") !== null) return
  const element = document.createElement("style")
  element.id = "dsh-reasoning-setup-styles"
  element.textContent = STYLE_SHEET
  document.head.append(element)
}
