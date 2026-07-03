import { NextResponse } from "next/server";

/**
 * Standard JSON envelope every API route returns.
 *
 * The `message` field is the single source of truth for what the client shows
 * the user (a toast, usually). Success and error responses both carry it, so
 * the component doesn't have to invent copy after a network call — it just
 * displays what the server sent (see `useApiMessage`).
 */
export type ApiSuccessBody<TData = unknown> = {
  success: true;
  message: string;
  data?: TData;
};

export type ApiErrorBody = {
  success: false;
  message: string;
  /** Optional field-level errors (e.g. Zod `fieldErrors`) for forms. */
  details?: unknown;
};

/**
 * Build a success response: `{ success: true, message, data? }`.
 *
 * @param message  human-readable, toast-ready (e.g. "Task created.")
 * @param data     optional payload the client needs back
 * @param status   HTTP status (defaults to 200)
 */
export function apiSuccess<TData>(
  message: string,
  data?: TData,
  status = 200,
): NextResponse<ApiSuccessBody<TData>> {
  const body: ApiSuccessBody<TData> = { success: true, message };

  if (data !== undefined) {
    body.data = data;
  }

  return NextResponse.json(body, { status });
}

/**
 * Build an error response: `{ success: false, message, details? }`.
 *
 * @param message  human-readable reason (e.g. "You must be signed in.")
 * @param status   HTTP status (defaults to 400)
 * @param details  optional field-level errors for forms
 */
export function apiError(
  message: string,
  status = 400,
  details?: unknown,
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { success: false, message };

  if (details !== undefined) {
    body.details = details;
  }

  return NextResponse.json(body, { status });
}
