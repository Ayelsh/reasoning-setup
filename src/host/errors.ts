/**
 * Stable failure vocabulary for the reasoning-effort setup page. Every code is
 * one a caller can branch on; the message is safe to show the user.
 *
 * @module dsh-reasoning-setup/host/errors
 */

import { RemoteError } from '@deepseek-ai/dsh-typert-protocol'

/** Every failure the setup service can report, as the wire codes a caller branches on. */
export type ReasoningSetupErrorCode =
  /** The edit names a route or model the llm-pi-ai settings document does not hold. */
  | 'reasoning-setup/unknown-target'
  /** The edit's level declaration is one the llm-pi-ai resolver would refuse. */
  | 'reasoning-setup/invalid-levels'
  /** The settings document moved between the scan and the write; re-scan and retry. */
  | 'reasoning-setup/conflict'
  /** The settings write was refused for a reason outside this page's vocabulary. */
  | 'reasoning-setup/write-refused'

/**
 * Build one setup failure with its wire code.
 * @param code - the failure class a caller branches on.
 * @param message - what happened, safe to show the user.
 * @param options - the machine-readable reason and the underlying error.
 * @returns the error to throw.
 */
export function reasoningSetupError(
  code: ReasoningSetupErrorCode,
  message: string,
  options: { readonly reason?: string; readonly cause?: unknown } = {},
): RemoteError {
  return new RemoteError(code, message, { reason: options.reason ?? code }, options.cause === undefined ? {} : { cause: options.cause })
}
