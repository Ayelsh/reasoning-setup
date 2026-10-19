/**
 * The reasoning-effort setup page.
 *
 * The scan runs on the host — the page only shows which models resolve
 * without a `reasoning` block and edits their `reasoningEfforts` declaration
 * through the `reasoningSetup` namespace, so the settings document is never
 * read or written by the renderer.
 *
 * Designed with Apple Design principles:
 * - Inset Grouped layout matching macOS System Settings.
 * - Fluid status badges, interactive model cards, and tactile feedback.
 * - Smooth spring-like open/close transitions for inline editors.
 *
 * @module dsh-reasoning-setup/client/EffortPanel
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { DeclaredLevels, ReasoningEffortEdit, ReasoningModelView, ReasoningProviderView, ReasoningScanReport } from '../host/types.ts'
import type { EffortLocaleKey } from './locales.ts'
import { styles } from './styles.ts'

/** This page's copy seat. */
type Translate = (key: EffortLocaleKey, params?: Record<string, unknown>) => string

/** Host operations the panel needs, injected by the registration. */
export interface EffortPanelProps {
  readonly t: Translate
  /** Read the host's provider/model reasoning scan. */
  readonly loadScan: () => Promise<ReasoningScanReport>
  /** Write one model's effort declaration (or its removal). */
  readonly applyEdit: (edit: ReasoningEffortEdit) => Promise<void>
}

/** One level row's draft state inside the editor. */
interface LevelDraft {
  readonly on: boolean
  readonly wire: string
}

/** The editor's whole draft, plus the model it belongs to. */
interface EditorState {
  readonly provider: string
  readonly model: ReasoningModelView
  readonly boxes: Readonly<Record<string, LevelDraft>>
  readonly format: string
}

/**
 * One error's user-facing text.
 * @param error - the thrown value.
 * @returns its message.
 */
function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * The draft a model with no declaration opens with: `low` and `high` offered
 * with their own names as the wire spelling, everything else off.
 * @param levels - the level vocabulary.
 * @returns the initial boxes.
 */
function defaultBoxes(levels: readonly string[]): Readonly<Record<string, LevelDraft>> {
  return Object.fromEntries(levels.map(level => [level, {
    on: level === 'low' || level === 'high',
    wire: level === 'off' ? '' : level,
  }]))
}

/**
 * The draft a model with an existing declaration opens with.
 * @param levels - the level vocabulary.
 * @param declared - the declared levels and their wire spellings.
 * @returns the initial boxes.
 */
function declaredBoxes(levels: readonly string[], declared: DeclaredLevels): Readonly<Record<string, LevelDraft>> {
  return Object.fromEntries(levels.map(level => [level, {
    on: Object.hasOwn(declared, level),
    wire: declared[level] ?? '',
  }]))
}

/** The thinking-effort setup page. */
export function EffortPanel(props: EffortPanelProps): ReactNode {
  const { t, loadScan, applyEdit } = props
  const [report, setReport] = useState<ReasoningScanReport | undefined>(undefined)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState | undefined>(undefined)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const rescan = useCallback(async () => {
    setStatus('loading')
    setError(null)
    setNotice(null)
    try {
      setReport(await loadScan())
      setStatus('ready')
    } catch (cause) {
      setError(message(cause))
      setStatus('error')
    }
  }, [loadScan])

  useEffect(() => { void rescan() }, [rescan])

  /**
   * Open the editor for one model.
   * @param provider - the provider route key.
   * @param model - the model to edit.
   */
  const openEditor = (provider: string, model: ReasoningModelView): void => {
    setEditError(null)
    setEditor({
      provider,
      model,
      boxes: model.declaredLevels === undefined
        ? defaultBoxes(report?.levels ?? [])
        : declaredBoxes(report?.levels ?? [], model.declaredLevels),
      format: model.declaredFormat ?? '',
    })
  }

  /**
   * Toggle one level box, filling its wire spelling with its own name when it
   * turns on empty.
   * @param level - the level whose box changed.
   * @param on - whether it is now checked.
   */
  const toggleLevel = (level: string, on: boolean): void => {
    setEditor(current => current === undefined ? undefined : {
      ...current,
      boxes: {
        ...current.boxes,
        [level]: { on, wire: on && current.boxes[level]?.wire === '' && level !== 'off' ? level : current.boxes[level]?.wire ?? '' },
      },
    })
  }

  /**
   * Edit one level's wire spelling.
   * @param level - the level being edited.
   * @param wire - the new spelling.
   */
  const editWire = (level: string, wire: string): void => {
    setEditor(current => current === undefined ? undefined : {
      ...current,
      boxes: { ...current.boxes, [level]: { on: current.boxes[level]?.on ?? false, wire } },
    })
  }

  /** Close the editor without writing. */
  const closeEditor = (): void => {
    setEditor(undefined)
    setEditError(null)
  }

  /** Write the draft, then re-open the scan so the page shows the document. */
  const save = async (): Promise<void> => {
    if (editor === undefined) return
    const levels: DeclaredLevels = {}
    for (const level of Object.keys(editor.boxes)) {
      const box = editor.boxes[level]
      if (!box.on) continue
      const wire = box.wire.trim()
      if (wire === '') {
        if (level !== 'off') {
          setEditError(t('editWireRequired', { level }))
          return
        }
        levels[level] = null
      } else {
        levels[level] = wire
      }
    }
    if (!Object.keys(levels).some(level => level !== 'off')) {
      setEditError(t('editNoneBeyondOff'))
      return
    }
    setSaving(true)
    try {
      await applyEdit({
        kind: 'set',
        provider: editor.provider,
        model: editor.model.id,
        levels,
        ...editor.format === '' ? {} : { thinkingFormat: editor.format },
      })
      setEditor(undefined)
      setEditError(null)
      setNotice(t('savedNotice'))
      await rescan()
    } catch (cause) {
      setEditError(t('editError', { message: message(cause) }))
    } finally {
      setSaving(false)
    }
  }

  /** Remove the model's declaration, then re-open the scan. */
  const remove = async (): Promise<void> => {
    if (editor === undefined) return
    setSaving(true)
    try {
      await applyEdit({ kind: 'remove', provider: editor.provider, model: editor.model.id })
      setEditor(undefined)
      setEditError(null)
      setNotice(t('savedNotice'))
      await rescan()
    } catch (cause) {
      setEditError(t('editError', { message: message(cause) }))
    } finally {
      setSaving(false)
    }
  }

  const missing = report?.providers
    .filter(provider => provider.editable)
    .flatMap(provider => provider.models)
    .filter(model => !model.hasReasoning)
    .length ?? 0

  return (
    <div className={styles.page}>
      <p className={styles.pageHint}>{t('pageHint')}</p>
      {status === 'loading' && <p className={styles.scanStatus}>{t('scanPending')}</p>}
      {status === 'error' && (
        <div className={styles.scanError}>
          <span>{t('scanError', { message: error ?? '' })}</span>
          <Button variant="outline" size="sm" onClick={() => { void rescan() }}>{t('retry')}</Button>
        </div>
      )}
      {notice !== null && status === 'ready' && <p className={styles.scanStatus}>{notice}</p>}
      {status === 'ready' && report !== undefined && (
        <>
          <div className={styles.summaryBar}>
            <span className={styles.statusDot} />
            {report.providers.length === 0
              ? <span className={styles.summaryOk}>{t('noProviders')}</span>
              : missing > 0
                ? <span className={styles.summaryMissing}>{t('summaryMissing', { count: missing })}</span>
                : <span className={styles.summaryOk}>{t('summaryNone')}</span>}
          </div>
          {report.providers.map((provider: ReasoningProviderView) => (
            <section className={styles.group} key={provider.id}>
              <div className={styles.groupHead}>
                <span className={styles.groupTitle}>{provider.name}</span>
                <span className={styles.groupId}>{provider.id}</span>
                {provider.editable
                  ? null
                  : <span className={`${styles.groupBadge} ${styles.groupBadgeReadonly}`}>{t('providerReadonly')}</span>}
              </div>
              {provider.note === undefined ? null : (
                <p className={styles.groupNote}>{t('routeError', { message: provider.note })}</p>
              )}
              <div className={styles.groupCard}>
                {provider.models.map((model: ReasoningModelView) => {
                  const isEditing = editor?.provider === provider.id && editor.model.id === model.id
                  return (
                    <div className={styles.modelItem} key={model.id}>
                      <div className={`${styles.modelRow}${isEditing ? ` ${styles.modelRowActive}` : ''}`}>
                        <span className={styles.modelName} title={model.id}>{model.name}</span>
                        <span className={styles.modelMeta}>
                          {model.note === undefined ? null : (
                            <span className={styles.chip} title={model.note}>{t('modelNote', { message: model.note })}</span>
                          )}
                          {model.hasReasoning
                            ? (
                              <span className={`${styles.chip} ${styles.chipOk}`}>
                                {t('modelSupported', { levels: model.efforts.join(' / ') })}
                              </span>
                            )
                            : <span className={`${styles.chip} ${styles.chipMissing}`}>{t('modelMissing')}</span>}
                          {model.defaultEffort === undefined ? null : (
                            <span className={`${styles.chip} ${styles.chipDefault}`}>{t('modelDefault', { level: model.defaultEffort })}</span>
                          )}
                          <Button
                            variant={isEditing ? 'ghost' : 'outline'}
                            size="sm"
                            disabled={!model.editable || saving}
                            onClick={() => { isEditing ? closeEditor() : openEditor(provider.id, model) }}
                          >
                            {model.declaredLevels === undefined ? t('edit') : t('editActive')}
                          </Button>
                        </span>
                      </div>
                      {isEditing && (
                        <div className={styles.editor}>
                          <div className={styles.editorHead}>
                            <span className={styles.groupTitle}>{t('editorTitle', { model: model.name })}</span>
                          </div>
                          <p className={styles.editorHint}>{t('editorHint')}</p>
                          {model.declaredLevels === undefined ? null : (
                            <p className={styles.editorHint}>{t('editorDeclaredHint')}</p>
                          )}
                          <div className={styles.levelTable}>
                            {report.levels.map(level => {
                              const box = editor.boxes[level]
                              return (
                                <label className={styles.levelRow} key={level}>
                                  <input
                                    type="checkbox"
                                    className={styles.levelCheck}
                                    checked={box?.on ?? false}
                                    onChange={(event) => { toggleLevel(level, event.currentTarget.checked) }}
                                  />
                                  <span className={styles.levelName}>{level}</span>
                                  <input
                                    type="text"
                                    className={styles.levelWire}
                                    value={box?.wire ?? ''}
                                    disabled={!(box?.on ?? false) || saving}
                                    placeholder={level === 'off' ? '—' : level}
                                    onChange={(event) => { editWire(level, event.currentTarget.value) }}
                                  />
                                </label>
                              )
                            })}
                          </div>
                          <label className={styles.formatRow}>
                            <span>{t('formatLabel')}</span>
                            <select
                              className={styles.formatSelect}
                              value={editor.format}
                              disabled={saving}
                              onChange={(event) => {
                                const value = event.currentTarget.value
                                setEditor(current => current === undefined ? undefined : { ...current, format: value })
                              }}
                            >
                              <option value="">{t('formatInherit')}</option>
                              {report.formats.map(format => <option key={format} value={format}>{format}</option>)}
                            </select>
                          </label>
                          {editError === null ? null : <p className={styles.editorError}>{editError}</p>}
                          <div className={styles.editorActions}>
                            <Button variant="primary" size="sm" disabled={saving} onClick={() => { void save() }}>
                              {saving ? t('saving') : t('save')}
                            </Button>
                            <Button variant="ghost" size="sm" disabled={saving} onClick={closeEditor}>{t('cancel')}</Button>
                            {model.declaredLevels === undefined && model.declaredFormat === undefined ? null : (
                              <Button variant="outline" size="sm" disabled={saving} onClick={() => { void remove() }}>
                                {t('removeDeclared')}
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  )
}
