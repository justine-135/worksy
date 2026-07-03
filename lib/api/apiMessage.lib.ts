/**
 * Framework-agnostic helpers for turning an API response/error into a string
 * the UI can display. No React, no HeroUI here on purpose — this runs in
 * `lib/**` fetch wrappers and is trivially testable. The `useApiMessage` hook
 * layers the actual toast UI on top of these.
 */

/** Shape both success and error bodies share (see `apiResponse.lib.ts`). */
export type ApiMessageBody = {
  message?: string;
  error?: string;
};

/**
 * Pull a human-readable message off a thrown value.
 *
 * `throwApiError` (below) throws `new Error(serverMessage)`, so by the time an
 * error reaches a React Query `onError`, the server's message is on
 * `error.message`. This centralizes the `error instanceof Error ? … : fallback`
 * ternary that was copy-pasted across call sites.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

/**
 * Read the display message off a parsed response body, tolerating both the new
 * `{ message }` envelope and the legacy `{ error }` shape.
 */
export function getApiBodyMessage(
  body: ApiMessageBody | null | undefined,
  fallback: string,
): string {
  return body?.message || body?.error || fallback;
}

/**
 * Throw the server's error message for a non-OK `Response`.
 *
 * Standardizes the round-trip: route returns `{ message | error }` + non-2xx →
 * `throwApiError` throws `Error(thatMessage)` → React Query `onError(error)` →
 * `showError(error)` shows it. Call it right after the `!res.ok` check:
 *
 * ```ts
 * if (!res.ok) await throwApiError(res, "Failed to search tasks");
 * return res.json();
 * ```
 */
export async function throwApiError(
  response: Response,
  fallback: string,
): Promise<never> {
  const body = (await response.json().catch(() => null)) as ApiMessageBody | null;

  throw new Error(getApiBodyMessage(body, fallback));
}
