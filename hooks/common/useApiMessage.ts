"use client";

import { toast } from "@heroui/react/toast";
import { useCallback, useMemo } from "react";

import { getApiErrorMessage } from "@/lib/api/apiMessage.lib";

/** Any object that might carry a server-provided message (a success body). */
type MessageSource = { message?: string } | null | undefined;

type ToastVariant = "default" | "danger";

const DEFAULT_SUCCESS_MESSAGE = "Done.";
const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

/**
 * Reusable hook for showing a message returned by the API.
 *
 * The message comes from the server by default (`result.message` /
 * `error.message`), and the component may override it by passing a second
 * argument. This keeps copy in one place (the API route) while still letting a
 * specific screen say something more contextual when it needs to.
 *
 * ```ts
 * const { showSuccess, showError } = useApiMessage();
 *
 * mutation.mutate(vars, {
 *   onSuccess: (result) => showSuccess(result),                 // API message
 *   onError:   (error)  => showError(error, "Couldn't link task"), // override
 * });
 * ```
 *
 * Every toast is deferred with `queueMicrotask` so calling it from a render-
 * adjacent path (e.g. a mutation `onError`) never fires a state update during
 * React's render phase.
 */
export function useApiMessage() {
  const showMessage = useCallback(
    (message: string, variant: ToastVariant = "default") => {
      queueMicrotask(() => {
        if (variant === "danger") {
          toast.danger(message);
        } else {
          toast(message);
        }
      });
    },
    [],
  );

  /**
   * Show a success toast. `source` may be the API result (message read from
   * `source.message`) or a literal string. `override` always wins when passed.
   */
  const showSuccess = useCallback(
    (source?: MessageSource | string, override?: string) => {
      const fromSource =
        typeof source === "string" ? source : source?.message;

      showMessage(override || fromSource || DEFAULT_SUCCESS_MESSAGE, "default");
    },
    [showMessage],
  );

  /**
   * Show an error toast. Uses the message thrown by `throwApiError`
   * (i.e. the server's message) unless the component passes an `override`.
   */
  const showError = useCallback(
    (error: unknown, override?: string) => {
      showMessage(
        override || getApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
        "danger",
      );
    },
    [showMessage],
  );

  return useMemo(
    () => ({ showSuccess, showError, showMessage }),
    [showSuccess, showError, showMessage],
  );
}

export default useApiMessage;
