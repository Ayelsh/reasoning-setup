/**
 * Stand-in for `@deepseek-ai/dsh-client-ui-primitives` in the preview build.
 *
 * Only `Button` is imported by this plugin. The stand-in keeps the primitive's
 * public props and reproduces its metric CSS (see
 * `<harness>/packages/client/ui-primitives/src/Button.module.css`) so a
 * screenshot of the preview shows the same control geometry the shell does.
 * `className` is forwarded untouched, which is what lets the plugin's own
 * `.drs-rowAction` rule size the row action exactly as it does in the app.
 */

import { createElement } from 'react'

/** The subset of the primitive's props this page uses. */
export function Button(props) {
  const { variant = 'ghost', size = 'md', icon, className, children, ...rest } = props
  const classes = ['pv-btn', `pv-btn-${variant}`, `pv-btn-${size}`]
  if (className !== undefined && className !== '') classes.push(className)
  return createElement('button', {
    ...rest,
    type: rest.type ?? 'button',
    className: classes.join(' '),
  }, icon === undefined ? children : [icon, children])
}

/** Not used by this plugin; present so the module shape matches the real one. */
export const Switch = () => null
/** Not used by this plugin; present so the module shape matches the real one. */
export const Pill = () => null
