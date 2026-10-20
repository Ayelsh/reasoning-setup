/**
 * The page stylesheet, owned by this bundle.
 *
 * Material model (Apple Liquid Glass, rung L2 — blur plus an ambient light
 * field). Every layer has one job, and only one material per layer:
 *
 *   layer 0  ambient light field  `.drs-field` — pure radial light. No fill,
 *                                  no border, no blur. It is the only thing
 *                                  the glass has to refract; without it the
 *                                  cards read as grey plastic.
 *   layer 1  floating chrome      `.drs-hero` — the page's own bar. Heaviest
 *                                  material: densest fill, widest blur,
 *                                  deepest shadow. Sticky, so the cards
 *                                  genuinely travel underneath it.
 *   layer 2  content surfaces     `.drs-card` — one glass surface per
 *                                  provider. Rows inside are flat content
 *                                  divided by hairlines, never their own
 *                                  cards (glass on glass is the failure this
 *                                  exists to avoid).
 *   layer 3  solid content        chips, the editor well, inputs. Anything
 *                                  that carries a colour meaning or accepts
 *                                  input is opaque on purpose, so it stays
 *                                  legible over whatever the blur sees.
 *
 * Backdrop budget: one hero plus one card per provider at rest. The field and
 * every control are plain paint, so nothing re-reads the backdrop per row.
 *
 * Theme: keyed on the host's `body[data-ds-dark-theme]` attribute — never on
 * `prefers-color-scheme`, which would paint light glass onto a dark page.
 * Dark glass is not light glass inverted: lower-alpha fill, brighter hairline,
 * much weaker sheen, deeper shadow.
 *
 * @module dsh-reasoning-setup/client/styles
 */

/** Every class this page's markup names; the sheet below declares each one. */
export const STYLE_CLASSES = [
  "page", "field", "hero", "heroMain", "heroOrb", "heroText", "heroTitle", "heroSub",
  "heroActions", "heroProgress", "segment", "segmentPill", "segmentItem",
  "pageHint", "skeleton", "skeletonCard", "skeletonLine",
  "bannerError", "bannerNotice",
  "group", "groupHead", "groupTitle", "groupCount", "groupId", "groupBadge", "groupNote",
  "card", "modelItem", "modelRow", "modelRowActive", "modelLead", "modelName", "modelId",
  "modelMeta", "ladder", "ladderBar", "chipMissing", "chipDefault", "chipDeclared",
  "modelNote", "rowAction",
  "editor", "editorHead", "editorTitle", "editorHint", "levelHead", "levelTable", "levelRow",
  "levelCheck", "levelName", "levelWire", "formatRow", "formatSelect", "editorError",
  "editorActions", "pushRight",
  "empty", "emptyTitle", "emptyHint",
] as const

/** One class name this page uses. */
export type StyleClass = (typeof STYLE_CLASSES)[number]

const PREFIX = "drs-"

const SHEET = `
/* ---------------------------------------------------------------- tokens */

.drs-page {
  --drs-fill: rgba(255, 255, 255, 0.58);
  /* Floating chrome is the heaviest layer, and it must stay readable while
     content scrolls underneath it: 0.86 alpha + 34px blur is what stops row
     text from ghosting through the bar. */
  --drs-fill-chrome: rgba(255, 255, 255, 0.86);
  --drs-solid: var(--dsw-alias-bg-layer-1, #ffffff);
  --drs-edge: rgba(255, 255, 255, 0.72);
  --drs-hair: rgba(0, 0, 0, 0.07);
  --drs-row-hair: rgba(0, 0, 0, 0.055);
  --drs-sheen: linear-gradient(168deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0) 46%);
  --drs-blur: blur(24px) saturate(180%);
  --drs-blur-chrome: blur(34px) saturate(200%);
  --drs-shadow: 0 1px 1px rgba(0, 0, 0, 0.03), 0 10px 28px -10px rgba(0, 0, 0, 0.13), 0 28px 56px -28px rgba(0, 0, 0, 0.18);
  --drs-shadow-chrome: 0 1px 1px rgba(0, 0, 0, 0.04), 0 14px 34px -12px rgba(0, 0, 0, 0.18), 0 34px 64px -30px rgba(0, 0, 0, 0.24);
  --drs-well: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 4.5%, var(--dsw-alias-bg-base, #ffffff));
  --drs-pill: rgba(255, 255, 255, 0.94);
  --drs-track: rgba(120, 120, 128, 0.16);
  --drs-radius: 18px;
  --drs-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --drs-field-a: rgba(10, 132, 255, 0.26);
  --drs-field-b: rgba(191, 90, 242, 0.24);
  --drs-field-c: rgba(100, 210, 255, 0.22);
  --drs-field-a-weak: rgba(10, 132, 255, 0.15);
  --drs-field-b-weak: rgba(191, 90, 242, 0.14);
  --drs-field-base: rgba(120, 170, 255, 0.10);

  /* 18px of top padding is load-bearing: the settings shell's scrolling
     column supplies none, and without it the hero's rounding, its shadow and
     the field's top edge are clipped by the scrollport. */
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  max-width: 800px;
  padding: 18px 0 12px;
  color: var(--dsw-alias-label-primary);
  font-family: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif);
  font-optical-sizing: auto;
  -webkit-font-smoothing: antialiased;
}

body[data-ds-dark-theme] .drs-page {
  --drs-fill: rgba(28, 28, 30, 0.54);
  --drs-fill-chrome: rgba(44, 44, 46, 0.86);
  --drs-solid: var(--dsw-alias-bg-layer-3, #2c2c2e);
  --drs-edge: rgba(255, 255, 255, 0.12);
  --drs-hair: rgba(255, 255, 255, 0.10);
  --drs-row-hair: rgba(255, 255, 255, 0.075);
  --drs-sheen: linear-gradient(168deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0) 46%);
  --drs-shadow: 0 1px 1px rgba(0, 0, 0, 0.24), 0 12px 32px -12px rgba(0, 0, 0, 0.50), 0 32px 64px -32px rgba(0, 0, 0, 0.60);
  --drs-shadow-chrome: 0 1px 1px rgba(0, 0, 0, 0.30), 0 16px 38px -14px rgba(0, 0, 0, 0.58), 0 38px 72px -32px rgba(0, 0, 0, 0.66);
  --drs-well: color-mix(in srgb, #ffffff 7%, var(--dsw-alias-bg-base, #151517));
  --drs-pill: rgba(120, 120, 128, 0.62);
  --drs-track: rgba(120, 120, 128, 0.22);
  --drs-field-a: rgba(10, 132, 255, 0.30);
  --drs-field-b: rgba(191, 90, 242, 0.28);
  --drs-field-c: rgba(100, 210, 255, 0.20);
  --drs-field-a-weak: rgba(10, 132, 255, 0.16);
  --drs-field-b-weak: rgba(191, 90, 242, 0.15);
  --drs-field-base: rgba(90, 140, 240, 0.13);
}

/* ------------------------------------------------------- ambient field */

.drs-field {
  position: absolute;
  /* Top stays at 0, never negative: the settings column clips at its
     padding-box, so a field bleeding upward loses its top rounding. The page
     supplies 18px of padding instead, and the field rounds inside it. */
  inset: 0 -14px -14px;
  z-index: -1;
  /* All four corners round. Squared top corners leave the light band as a hard
     rectangle floating under the header — the wash has to read as one soft
     shape, not as a clipped panel. */
  border-radius: 26px;
  background:
    radial-gradient(120% 90% at 50% 38%, var(--drs-field-base), transparent 74%),
    radial-gradient(58% 24% at 14% 0%, var(--drs-field-a), transparent 70%),
    radial-gradient(52% 22% at 97% 1%, var(--drs-field-b), transparent 70%),
    radial-gradient(64% 24% at 84% 34%, var(--drs-field-b-weak), transparent 72%),
    radial-gradient(58% 24% at 8% 60%, var(--drs-field-a-weak), transparent 72%),
    radial-gradient(72% 22% at 88% 82%, var(--drs-field-b-weak), transparent 74%),
    radial-gradient(86% 30% at 46% 102%, var(--drs-field-c), transparent 74%);
  pointer-events: none;
}

/* ------------------------------------------------------ floating chrome */

.drs-hero {
  position: sticky;
  top: 0;
  z-index: 2;
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px 11px 14px;
  border-radius: 16px;
  background-color: var(--drs-fill-chrome);
  background-image: var(--drs-sheen);
  -webkit-backdrop-filter: var(--drs-blur-chrome);
  backdrop-filter: var(--drs-blur-chrome);
  box-shadow: inset 0 0.5px 0 var(--drs-edge), var(--drs-shadow-chrome);
  animation: drs-materialize 340ms var(--drs-ease) both;
}

.drs-heroMain {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.drs-heroOrb {
  flex: none;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--dsw-alias-state-success-primary, #30b350);
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-success-primary, #30b350) 18%, transparent),
    0 0 12px color-mix(in srgb, var(--dsw-alias-state-success-primary, #30b350) 45%, transparent);
  transition: background-color 220ms var(--drs-ease), box-shadow 220ms var(--drs-ease);
}

.drs-heroOrb[data-tone="warn"] {
  background: var(--dsw-alias-state-warn-primary, #f0a020);
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f0a020) 18%, transparent),
    0 0 12px color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f0a020) 45%, transparent);
}

.drs-heroOrb[data-tone="error"] {
  background: var(--dsw-alias-state-error-primary, #e5484d);
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5484d) 18%, transparent),
    0 0 12px color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5484d) 45%, transparent);
}

.drs-heroOrb[data-tone="idle"] {
  background: var(--dsw-alias-label-tertiary, #999999);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-label-tertiary, #999999) 16%, transparent);
}

.drs-heroText {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.drs-heroTitle {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 19px;
  letter-spacing: -0.012em;
  color: var(--dsw-alias-label-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drs-heroSub {
  font-size: 11.5px;
  line-height: 15px;
  font-weight: 450;
  letter-spacing: -0.004em;
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drs-heroActions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
}

/* Selection travels; it never cross-fades. Solid fills only — the pill sits
   inside the glass hero, so it must not be a second translucent surface. */
.drs-segment {
  position: relative;
  display: flex;
  flex: none;
  padding: 3px;
  border-radius: 13px;
  background: var(--drs-track);
  box-shadow: inset 0 0 0 0.5px var(--drs-hair), inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.drs-segmentPill {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc((100% - 6px) / 3);
  border-radius: 10px;
  background-color: var(--drs-pill);
  background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.35));
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.95), 0 0.5px 1px rgba(0, 0, 0, 0.10), 0 1px 3px rgba(0, 0, 0, 0.07);
  transition: transform 320ms var(--drs-ease);
  pointer-events: none;
}

body[data-ds-dark-theme] .drs-segmentPill {
  background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.04));
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.16), 0 1px 2px rgba(0, 0, 0, 0.32);
}

.drs-segment[data-index="0"] .drs-segmentPill { transform: translateX(0); }
.drs-segment[data-index="1"] .drs-segmentPill { transform: translateX(100%); }
.drs-segment[data-index="2"] .drs-segmentPill { transform: translateX(200%); }

.drs-segmentItem {
  position: relative;
  z-index: 1;
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
  height: 24px;
  padding: 0 11px;
  border: 0;
  border-radius: 10px;
  background: none;
  font: inherit;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: -0.004em;
  color: var(--dsw-alias-label-secondary);
  white-space: nowrap;
  cursor: pointer;
  transition: color 180ms var(--drs-ease);
}

.drs-segmentItem[data-active="true"] {
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
}

.drs-segmentItem:active {
  transform: scale(0.97);
  transition-duration: 0ms;
}

.drs-heroProgress {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 1px;
  height: 1.5px;
  border-radius: 2px;
  overflow: hidden;
  opacity: 0;
  transition: opacity 180ms var(--drs-ease);
}

.drs-hero[data-busy="true"] .drs-heroProgress {
  opacity: 1;
}

.drs-heroProgress::after {
  content: "";
  display: block;
  width: 38%;
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--dsw-alias-state-business-primary, #4d6bfe), transparent);
  animation: drs-sweep 1.1s linear infinite;
}

/* -------------------------------------------------------------- caption */

.drs-pageHint {
  margin: 0;
  padding: 0 4px;
  font-size: 11.5px;
  line-height: 17px;
  /* Vibrancy: this text sits straight on the ambient light field, not on a
     surface, so it takes a near-primary tone and slightly more tracking
     rather than flat secondary grey. */
  font-weight: 480;
  letter-spacing: 0;
  text-wrap: pretty;
  color: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 82%, transparent);
}

/* ------------------------------------------------------------- skeleton */

.drs-skeleton {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.drs-skeletonCard {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 15px 16px;
  border-radius: var(--drs-radius);
  background-color: var(--drs-fill);
  background-image: var(--drs-sheen);
  -webkit-backdrop-filter: var(--drs-blur);
  backdrop-filter: var(--drs-blur);
  box-shadow: inset 0 0.5px 0 var(--drs-edge), var(--drs-shadow);
}

.drs-skeletonLine {
  height: 10px;
  border-radius: 5px;
  background-image: linear-gradient(90deg, var(--drs-track) 0%, color-mix(in srgb, var(--drs-track) 55%, transparent) 50%, var(--drs-track) 100%);
  background-size: 220% 100%;
  animation: drs-shimmer 1.4s ease-in-out infinite;
}

/* -------------------------------------------------------------- banners */

.drs-bannerError {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 14px;
  font-size: 12.5px;
  line-height: 18px;
  color: var(--dsw-alias-state-error-primary, #e5484d);
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5484d) 9%, var(--dsw-alias-bg-base, #ffffff));
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, var(--dsw-alias-state-error-primary, #e5484d) 30%, transparent);
  animation: drs-materialize 300ms var(--drs-ease) both;
}

.drs-bannerError > span:first-child {
  flex: 1;
  min-width: 0;
}

.drs-bannerNotice {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 11.5px;
  line-height: 16px;
  font-weight: 500;
  color: var(--dsw-alias-state-success-primary, #30b350);
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #30b350) 10%, var(--dsw-alias-bg-base, #ffffff));
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, var(--dsw-alias-state-success-primary, #30b350) 26%, transparent);
  animation: drs-materialize 300ms var(--drs-ease) both;
}

.drs-bannerNotice::before {
  content: "";
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* --------------------------------------------------------------- groups */

.drs-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
  animation: drs-materialize 340ms var(--drs-ease) both;
}

.drs-groupHead {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  padding: 0 6px;
}

.drs-groupTitle {
  font-size: 11.5px;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: 0.012em;
  /* Also on the field rather than on glass: one step stronger than secondary
     so it survives the busiest backdrop. */
  color: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 78%, transparent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drs-groupCount {
  flex: none;
  padding: 0 5px;
  border-radius: 999px;
  font-size: 10px;
  line-height: 15px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-tertiary);
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 6%, transparent);
}

.drs-groupId {
  flex: none;
  font-size: 10.5px;
  line-height: 15px;
  font-family: var(--ds-font-family-code, ui-monospace, monospace);
  letter-spacing: -0.002em;
  color: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 62%, transparent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drs-groupBadge {
  margin-left: auto;
  flex: none;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10px;
  line-height: 15px;
  font-weight: 500;
  white-space: nowrap;
  color: var(--dsw-alias-label-tertiary);
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 5%, transparent);
  box-shadow: inset 0 0 0 0.5px var(--drs-hair);
}

.drs-groupNote {
  margin: 0 6px;
  padding: 6px 10px;
  border-radius: 9px;
  font-size: 11px;
  line-height: 16px;
  color: var(--dsw-alias-state-warn-label, #b26a00);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f0a020) 13%, var(--dsw-alias-bg-base, #ffffff));
}

/* --------------------------------------------------------- content card */

.drs-card {
  position: relative;
  border-radius: var(--drs-radius);
  background-color: var(--drs-fill);
  background-image: var(--drs-sheen);
  -webkit-backdrop-filter: var(--drs-blur);
  backdrop-filter: var(--drs-blur);
  box-shadow: inset 0 0.5px 0 var(--drs-edge), var(--drs-shadow);
  overflow: hidden;
}

.drs-modelItem {
  position: relative;
}

.drs-modelItem + .drs-modelItem {
  border-top: 0.5px solid var(--drs-row-hair);
}

.drs-modelRow {
  /* Anchors the accent rail: without this the ::before below resolves against
     .drs-modelItem and runs down the whole editor as a stray blue line. */
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 8px 14px;
  transition: background-color 140ms var(--drs-ease);
}

.drs-modelRow:hover {
  background-color: var(--dsw-alias-interactive-bg-hover);
}

/* The open row is marked with a soft brand wash and a 2px accent rail, not a
   neutral grey band — grey on glass reads as disabled, not as selected. */
.drs-modelRowActive {
  background-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 7%, transparent);
}

.drs-modelRowActive::before {
  content: "";
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 0;
  width: 2px;
  border-radius: 0 2px 2px 0;
  background: var(--dsw-alias-state-business-primary, #4d6bfe);
}

.drs-modelLead {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.drs-modelName {
  font-size: 13.5px;
  font-weight: 550;
  line-height: 19px;
  letter-spacing: -0.012em;
  color: var(--dsw-alias-label-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drs-modelId {
  font-size: 10.5px;
  line-height: 14px;
  font-family: var(--ds-font-family-code, ui-monospace, monospace);
  letter-spacing: -0.002em;
  color: var(--dsw-alias-label-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drs-modelMeta {
  display: flex;
  align-items: center;
  gap: 7px;
  flex: none;
  min-width: 0;
}

/* The level ladder: one bar per level in escalation order, tall enough for
   the top level and filled for the ones this model offers. Height encodes
   escalation, fill encodes support, so the shape is readable at a glance. */
.drs-ladder {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 11px;
  padding: 0 2px;
}

.drs-ladderBar {
  width: 3px;
  border-radius: 1.5px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 14%, transparent);
  transition: background-color 180ms var(--drs-ease);
}

.drs-ladderBar[data-on="true"] {
  background: var(--dsw-alias-label-primary);
}

.drs-ladderBar:nth-child(1) { height: 3px; }
.drs-ladderBar:nth-child(2) { height: 4px; }
.drs-ladderBar:nth-child(3) { height: 5px; }
.drs-ladderBar:nth-child(4) { height: 6.5px; }
.drs-ladderBar:nth-child(5) { height: 8px; }
.drs-ladderBar:nth-child(6) { height: 9.5px; }
.drs-ladderBar:nth-child(7) { height: 11px; }

/* Colour meaning lives on opaque chips, never on the blur. */
.drs-chipMissing {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.002em;
  white-space: nowrap;
  color: var(--dsw-alias-state-warn-label, #b26a00);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f0a020) 16%, var(--dsw-alias-bg-base, #ffffff));
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f0a020) 34%, transparent);
}

.drs-chipDefault {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  line-height: 16px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--dsw-alias-label-secondary);
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 6%, var(--dsw-alias-bg-base, #ffffff));
  box-shadow: inset 0 0 0 0.5px var(--drs-hair);
}

.drs-chipDeclared {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  line-height: 16px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--dsw-alias-state-business-primary, #4d6bfe);
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 13%, var(--dsw-alias-bg-base, #ffffff));
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 26%, transparent);
}

.drs-modelNote {
  margin: 0;
  padding: 0 14px 9px;
  font-size: 11px;
  line-height: 16px;
  color: var(--dsw-alias-state-warn-label, #b26a00);
}

/* The row's action is a solid, tactile pill rather than a bordered ghost, so
   it reads as an object on the glass instead of a rectangle drawn on it. */
.drs-page .drs-modelMeta .drs-rowAction {
  height: 26px;
  padding: 0 11px;
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 550;
  letter-spacing: -0.004em;
  color: var(--dsw-alias-label-primary);
  background-color: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 5%, var(--drs-solid));
  background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.8),
    inset 0 0 0 0.5px var(--drs-hair),
    0 1px 1.5px rgba(0, 0, 0, 0.05);
  transition: transform 130ms var(--drs-ease), background-color 130ms var(--drs-ease), box-shadow 130ms var(--drs-ease);
}

.drs-page .drs-modelMeta .drs-rowAction:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 8%, var(--drs-solid));
}

body[data-ds-dark-theme] .drs-page .drs-modelMeta .drs-rowAction {
  background-color: color-mix(in srgb, #ffffff 9%, var(--drs-solid));
  background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0));
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.12),
    inset 0 0 0 0.5px var(--drs-hair),
    0 1px 2px rgba(0, 0, 0, 0.30);
}

.drs-page .drs-modelMeta .drs-rowAction:active:not(:disabled) {
  transform: scale(0.96);
  transition-duration: 0ms;
}

/* --------------------------------------------------------------- editor */

/* A recessed well inside the glass card. One material per layer, so the
   editor is opaque: form controls never sit on the blur. Radius is
   concentric with the card: 18px card − 8px gap = 10px. */
.drs-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 8px 10px;
  padding: 13px 13px 12px;
  border-radius: 10px;
  background: var(--drs-well);
  box-shadow: inset 0 0.5px 0 var(--drs-hair), inset 0 1px 3px rgba(0, 0, 0, 0.05);
  animation: drs-materialize 300ms var(--drs-ease) both;
}

.drs-editorHead {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.drs-editorTitle {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 18px;
  letter-spacing: -0.01em;
  color: var(--dsw-alias-label-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drs-editorHint {
  margin: 0;
  font-size: 11px;
  line-height: 16px;
  letter-spacing: -0.002em;
  text-wrap: pretty;
  color: var(--dsw-alias-label-secondary);
}

.drs-levelHead {
  display: grid;
  grid-template-columns: 18px 62px minmax(0, 1fr);
  gap: 8px;
  padding: 0 6px;
  font-size: 10px;
  line-height: 14px;
  font-weight: 500;
  letter-spacing: 0.03em;
  color: var(--dsw-alias-label-tertiary);
}

.drs-levelTable {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drs-levelRow {
  display: grid;
  grid-template-columns: 18px 62px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 3px 6px;
  border-radius: 7px;
  cursor: pointer;
  transition: background-color 120ms var(--drs-ease);
}

.drs-levelRow:hover {
  background-color: var(--dsw-alias-interactive-bg-hover);
}

.drs-levelCheck {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
  width: 16px;
  height: 16px;
  border-radius: 5px;
  background-color: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 7%, transparent);
  box-shadow: inset 0 0 0 0.5px color-mix(in srgb, var(--dsw-alias-label-primary, #000) 24%, transparent);
  cursor: pointer;
  transition: background-color 140ms var(--drs-ease), box-shadow 140ms var(--drs-ease);
}

.drs-levelCheck:checked {
  background-color: var(--dsw-alias-state-business-primary, #4d6bfe);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3.6 8.4l2.9 2.9 5.9-5.9' fill='none' stroke='%23ffffff' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 13px 13px;
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.32), 0 1px 2px rgba(0, 0, 0, 0.14);
}

.drs-levelName {
  font-size: 11.5px;
  line-height: 18px;
  font-weight: 500;
  font-family: var(--ds-font-family-code, ui-monospace, monospace);
  letter-spacing: -0.01em;
  color: var(--dsw-alias-label-primary);
  transition: color 140ms var(--drs-ease);
}

.drs-levelRow[data-on="false"] .drs-levelName {
  color: var(--dsw-alias-label-tertiary);
}

/* Inputs read as recessed slots in the well: no drawn border until the field
   is actually in use, so the table stays a table and not a grid of boxes. */
.drs-levelWire {
  box-sizing: border-box;
  width: 100%;
  height: 26px;
  padding: 0 9px;
  font-size: 11.5px;
  font-family: var(--ds-font-family-code, ui-monospace, monospace);
  color: var(--dsw-alias-label-primary);
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 4%, var(--dsw-alias-bg-base, #ffffff));
  border: 0.5px solid transparent;
  border-radius: 7px;
  min-width: 0;
  transition: border-color 140ms var(--drs-ease), box-shadow 140ms var(--drs-ease), background-color 140ms var(--drs-ease);
}

.drs-levelWire:hover:not(:disabled) {
  border-color: var(--dsw-alias-border-l3);
}

.drs-levelWire:focus {
  outline: none;
  background: var(--dsw-alias-bg-base, #ffffff);
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 55%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 18%, transparent);
}

.drs-levelWire:disabled {
  color: var(--dsw-alias-label-tertiary);
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  cursor: default;
}

.drs-formatRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 5px 6px 5px 8px;
  border-radius: 8px;
  font-size: 11.5px;
  line-height: 18px;
  color: var(--dsw-alias-label-secondary);
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 3.5%, transparent);
  box-shadow: inset 0 0 0 0.5px var(--drs-row-hair);
}

.drs-formatSelect {
  box-sizing: border-box;
  height: 24px;
  max-width: 62%;
  padding: 0 6px;
  font-size: 11px;
  font-family: var(--ds-font-family-code, ui-monospace, monospace);
  color: var(--dsw-alias-label-primary);
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 4%, var(--dsw-alias-bg-base, #ffffff));
  border: 0.5px solid transparent;
  border-radius: 6px;
  min-width: 0;
  cursor: pointer;
  transition: border-color 140ms var(--drs-ease), box-shadow 140ms var(--drs-ease);
}

.drs-formatSelect:hover:not(:disabled) {
  border-color: var(--dsw-alias-border-l3);
}

.drs-formatSelect:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 55%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 18%, transparent);
}

.drs-editorError {
  margin: 0;
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: var(--dsw-alias-state-error-primary, #e5484d);
}

.drs-editorActions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 2px;
}

.drs-pushRight {
  flex: 1;
}

/* ---------------------------------------------------------- empty state */

.drs-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 30px 20px;
  border-radius: var(--drs-radius);
  text-align: center;
  background-color: var(--drs-fill);
  background-image: var(--drs-sheen);
  -webkit-backdrop-filter: var(--drs-blur);
  backdrop-filter: var(--drs-blur);
  box-shadow: inset 0 0.5px 0 var(--drs-edge), var(--drs-shadow);
  animation: drs-materialize 340ms var(--drs-ease) both;
}

.drs-emptyTitle {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 18px;
  letter-spacing: -0.01em;
  color: var(--dsw-alias-label-primary);
}

.drs-emptyHint {
  font-size: 11.5px;
  line-height: 17px;
  color: var(--dsw-alias-label-secondary);
}

/* --------------------------------------------------------------- focus */

.drs-page :focus-visible {
  outline: 2.5px solid color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 55%, transparent);
  outline-offset: 2px;
}

.drs-levelWire:focus-visible,
.drs-formatSelect:focus-visible {
  outline: none;
  border-color: var(--dsw-alias-state-business-primary, #4d6bfe);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-business-primary, #4d6bfe) 22%, transparent);
}

/* ------------------------------------------------------------ keyframes */

@keyframes drs-materialize {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.994);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes drs-shimmer {
  from { background-position: 120% 0; }
  to { background-position: -120% 0; }
}

@keyframes drs-sweep {
  from { transform: translateX(-100%); }
  to { transform: translateX(320%); }
}

/* -------------------------------------------------- preference answers */

@media (prefers-reduced-transparency: reduce) {
  .drs-field {
    background: none;
  }

  .drs-hero,
  .drs-card,
  .drs-empty,
  .drs-skeletonCard {
    background-color: var(--drs-solid);
    background-image: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  .drs-segment {
    background: color-mix(in srgb, var(--dsw-alias-label-primary, #000) 9%, var(--drs-solid));
  }

  .drs-segmentPill {
    background-color: var(--drs-solid);
    background-image: none;
  }
}

@media (prefers-contrast: more) {
  .drs-hero,
  .drs-card,
  .drs-empty,
  .drs-skeletonCard {
    box-shadow: inset 0 0 0 1px var(--dsw-alias-border-strong, rgba(0, 0, 0, 0.5)), var(--drs-shadow);
  }

  .drs-groupTitle,
  .drs-heroSub,
  .drs-pageHint,
  .drs-modelId {
    color: var(--dsw-alias-label-primary);
  }
}

@media (prefers-reduced-motion: reduce) {
  .drs-hero,
  .drs-group,
  .drs-editor,
  .drs-empty,
  .drs-bannerError,
  .drs-bannerNotice {
    animation: none !important;
  }

  .drs-skeletonLine,
  .drs-heroProgress::after {
    animation: none !important;
  }

  .drs-hero,
  .drs-card,
  .drs-modelRow,
  .drs-page .drs-modelMeta .drs-rowAction,
  .drs-segmentItem,
  .drs-segmentPill,
  .drs-levelRow,
  .drs-levelCheck,
  .drs-levelWire,
  .drs-formatSelect,
  .drs-heroOrb {
    transition-property: background-color, color, box-shadow, opacity, border-color;
    transition-duration: 120ms;
  }

  .drs-segmentPill {
    transition: none;
  }

  .drs-segmentItem:active,
  .drs-page .drs-modelMeta .drs-rowAction:active:not(:disabled) {
    transform: none;
  }
}

/* Touch: the segment items and row actions are sized for a mouse. On a coarse
   pointer they grow to a 40px tap target; the track grows with them so the
   bar keeps its proportions. */
@media (pointer: coarse) {
  .drs-segment {
    border-radius: 17px;
  }

  .drs-segmentItem {
    height: 40px;
    line-height: 40px;
    padding: 0 13px;
  }

  .drs-segmentPill {
    border-radius: 14px;
  }

  .drs-page .drs-modelMeta .drs-rowAction {
    height: 40px;
    padding: 0 16px;
  }

  .drs-levelWire,
  .drs-formatSelect {
    height: 40px;
  }

  .drs-levelRow {
    min-height: 44px;
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
