/**
 * The reasoning-effort setup page.
 *
 * The scan runs on the host — the page only shows which models resolve
 * without a `reasoning` block and edits their `reasoningEfforts` declaration
 * through the `reasoningSetup` namespace, so the settings document is never
 * read or written by the renderer.
 *
 * Layout follows Apple's Liquid Glass material model: a sticky glass bar that
 * floats above the content and carries the page's state, one glass surface
 * per provider holding flat hairline-divided rows, and a solid recessed well
 * for the inline editor (a form never sits on the blur). Selection is one
 * pill that travels between filters; nothing cross-fades.
 *
 * @module dsh-reasoning-setup/client/EffortPanel
 */

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { DeclaredLevels, ReasoningEffortEdit, ReasoningModelView, ReasoningScanReport } from '../host/types.ts'
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

/** Which models the page is showing. */
type Filter = 'all' | 'missing' | 'supported'

/** The filters, in segment order. */
const FILTERS: readonly { readonly id: Filter; readonly key: EffortLocaleKey }[] = [
  { id: 'all', key: 'filterAll' },
  { id: 'missing', key: 'filterMissing' },
  { id: 'supported', key: 'filterSupported' },
]

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

/**
 * Whether one model passes the active filter.
 * @param model - the model row.
 * @param filter - the active filter.
 * @returns whether the row is shown.
 */
function matches(model: ReasoningModelView, filter: Filter): boolean {
  if (filter === 'missing') return !model.hasReasoning
  if (filter === 'supported') return model.hasReasoning
  return true
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
  const [filter, setFilter] = useState<Filter>('all')
  const segmentRefs = useRef<Array<HTMLButtonElement | null>>([])

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
      // The rescan clears the notice as it starts, so the confirmation must be
      // raised only after the fresh document has landed.
      await rescan()
      setNotice(t('savedNotice'))
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
      await rescan()
      setNotice(t('savedNotice'))
    } catch (cause) {
      setEditError(t('editError', { message: message(cause) }))
    } finally {
      setSaving(false)
    }
  }

  /**
   * Move the filter with the keyboard: arrows step, Home/End jump.
   * @param event - the key event on a segment button.
   * @param index - that button's index.
   */
  const moveFilter = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const last = FILTERS.length - 1
    const next = event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
        : event.key === 'Home' ? 0
          : event.key === 'End' ? last
            : -1
    if (next < 0) return
    event.preventDefault()
    setFilter(FILTERS[next].id)
    segmentRefs.current[next]?.focus()
  }

  const missing = report?.providers
    .filter(provider => provider.editable)
    .flatMap(provider => provider.models)
    .filter(model => !model.hasReasoning)
    .length ?? 0

  const editable = report?.providers.some(provider => provider.editable) ?? false
  const tone = status === 'error' ? 'error'
    : status === 'loading' ? 'idle'
      : missing > 0 ? 'warn' : 'success'
  const subtitle = status === 'loading' ? t('scanPending')
    : status === 'error' ? t('scanError', { message: error ?? '' })
      : report === undefined || report.providers.length === 0 ? t('noProviders')
        : missing > 0 ? t('summaryMissing', { count: missing }) : t('summaryNone')
  const filterIndex = Math.max(0, FILTERS.findIndex(entry => entry.id === filter))
  const visible = (report?.providers ?? [])
    .map(provider => ({ provider, models: provider.models.filter(model => matches(model, filter)) }))
    .filter(entry => entry.models.length > 0)

  return (
    <div className={styles.page}>
      <div className={styles.field} aria-hidden="true" />

      <div className={styles.hero} data-busy={saving || status === 'loading' ? 'true' : 'false'}>
        <div className={styles.heroMain}>
          <span className={styles.heroOrb} data-tone={tone} aria-hidden="true" />
          <div className={styles.heroText}>
            <span className={styles.heroTitle}>{t('nav')}</span>
            <span className={styles.heroSub} title={subtitle}>{subtitle}</span>
          </div>
        </div>
        <div className={styles.heroActions}>
          <div
            className={styles.segment}
            role="tablist"
            aria-label={t('filterLabel')}
            data-index={filterIndex}
          >
            <span className={styles.segmentPill} aria-hidden="true" />
            {FILTERS.map((entry, index) => (
              <button
                key={entry.id}
                ref={element => { segmentRefs.current[index] = element }}
                type="button"
                role="tab"
                className={styles.segmentItem}
                data-active={filter === entry.id ? 'true' : 'false'}
                aria-selected={filter === entry.id}
                tabIndex={filter === entry.id ? 0 : -1}
                disabled={!editable && entry.id !== 'all'}
                onClick={() => { setFilter(entry.id) }}
                onKeyDown={event => { moveFilter(event, index) }}
              >
                {t(entry.key)}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={status === 'loading'}
            onClick={() => { void rescan() }}
          >
            {t('refresh')}
          </Button>
        </div>
        <span className={styles.heroProgress} aria-hidden="true" />
      </div>

      <p className={styles.pageHint}>{t('pageHint')}</p>

      {status === 'loading' && (
        <div className={styles.skeleton} role="status" aria-label={t('scanPending')}>
          <div className={styles.skeletonCard}>
            <span className={styles.skeletonLine} style={{ width: '38%' }} />
            <span className={styles.skeletonLine} style={{ width: '72%' }} />
            <span className={styles.skeletonLine} style={{ width: '58%' }} />
          </div>
          <div className={styles.skeletonCard}>
            <span className={styles.skeletonLine} style={{ width: '46%' }} />
            <span className={styles.skeletonLine} style={{ width: '66%' }} />
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.bannerError} role="alert">
          <span>{t('scanError', { message: error ?? '' })}</span>
          <Button variant="outline" size="sm" onClick={() => { void rescan() }}>{t('retry')}</Button>
        </div>
      )}

      {notice !== null && status === 'ready' && (
        <p className={styles.bannerNotice} role="status">{notice}</p>
      )}

      {status === 'ready' && report !== undefined && report.providers.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyTitle}>{t('emptyTitle')}</span>
          <span className={styles.emptyHint}>{t('emptyHint')}</span>
        </div>
      )}

      {status === 'ready' && report !== undefined && report.providers.length > 0 && visible.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyTitle}>{t('emptyFiltered')}</span>
          <span className={styles.emptyHint}>{t('emptyFilteredHint')}</span>
        </div>
      )}

      {status === 'ready' && report !== undefined && report.providers.length > 0 && visible.map(entry => (
        <section className={styles.group} key={entry.provider.id}>
          <div className={styles.groupHead}>
            <span className={styles.groupTitle}>{entry.provider.name}</span>
            <span className={styles.groupCount}>{entry.models.length}</span>
            <span className={styles.groupId}>{entry.provider.id}</span>
            {entry.provider.editable ? null : <span className={styles.groupBadge}>{t('providerReadonly')}</span>}
          </div>
          {entry.provider.note === undefined ? null : (
            <p className={styles.groupNote}>{t('routeError', { message: entry.provider.note })}</p>
          )}
          <div className={styles.card}>
            {entry.models.map((model: ReasoningModelView) => {
              const isEditing = editor?.provider === entry.provider.id && editor.model.id === model.id
              const levels = report.levels.map(level => (
                <span
                  key={level}
                  className={styles.ladderBar}
                  data-on={model.efforts.includes(level) ? 'true' : 'false'}
                />
              ))
              return (
                <div className={styles.modelItem} key={model.id}>
                  <div className={`${styles.modelRow}${isEditing ? ` ${styles.modelRowActive}` : ''}`}>
                    <span className={styles.modelLead}>
                      <span className={styles.modelName} title={model.id}>{model.name}</span>
                      <span className={styles.modelId}>{model.id}</span>
                    </span>
                    <span className={styles.modelMeta}>
                      <span
                        className={styles.ladder}
                        title={t('modelSupported', { levels: model.efforts.join(' / ') })}
                        aria-label={t('modelSupported', { levels: model.efforts.join(' / ') })}
                      >
                        {levels}
                      </span>
                      {model.declaredLevels === undefined ? null : (
                        <span className={styles.chipDeclared}>{t('modelDeclared')}</span>
                      )}
                      {model.hasReasoning ? null : (
                        <span className={styles.chipMissing}>{t('modelMissing')}</span>
                      )}
                      {model.defaultEffort === undefined ? null : (
                        <span className={styles.chipDefault}>{t('modelDefault', { level: model.defaultEffort })}</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className={styles.rowAction}
                        disabled={!model.editable || saving}
                        onClick={() => { isEditing ? closeEditor() : openEditor(entry.provider.id, model) }}
                      >
                        {model.declaredLevels === undefined ? t('edit') : t('editActive')}
                      </Button>
                    </span>
                  </div>
                  {model.note === undefined ? null : (
                    <p className={styles.modelNote}>{t('modelNote', { message: model.note })}</p>
                  )}
                  {isEditing && (
                    <div className={styles.editor}>
                      <div className={styles.editorHead}>
                        <span className={styles.editorTitle}>{t('editorTitle', { model: model.name })}</span>
                      </div>
                      <p className={styles.editorHint}>{t('editorHint')}</p>
                      {model.declaredLevels === undefined ? null : (
                        <p className={styles.editorHint}>{t('editorDeclaredHint')}</p>
                      )}
                      <div className={styles.levelHead} aria-hidden="true">
                        <span />
                        <span>{t('levelColumn')}</span>
                        <span>{t('wireColumn')}</span>
                      </div>
                      <div className={styles.levelTable}>
                        {report.levels.map(level => {
                          const box = editor.boxes[level]
                          const on = box?.on ?? false
                          return (
                            <label className={styles.levelRow} key={level} data-on={on ? 'true' : 'false'}>
                              <input
                                type="checkbox"
                                className={styles.levelCheck}
                                checked={on}
                                onChange={(event) => { toggleLevel(level, event.currentTarget.checked) }}
                              />
                              <span className={styles.levelName}>{level}</span>
                              <input
                                type="text"
                                className={styles.levelWire}
                                value={box?.wire ?? ''}
                                disabled={!on || saving}
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
                        <span className={styles.pushRight} />
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
    </div>
  )
}
