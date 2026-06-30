import { ETaskStatus } from "@/enum/taskStatus.enum";

/**
 * Column-position rule for the "auto-suggest on move" behaviour: derive a task
 * status from the board column it lands in, using the project's columns in
 * display order.
 *
 *   first column  -> TODO
 *   last column   -> DONE
 *   any middle    -> IN_PROGRESS
 *   single column -> TODO (no progression possible)
 *
 * This is the single source of truth shared by the move handler
 * (`updateTaskPositionsDB`), task creation, and the one-time backfill so the
 * drawer, the dashboard, and historical data all agree.
 *
 * @param targetBoardId   the column the task is moving into / created in
 * @param orderedBoardIds every column id in the project, ordered by `order`
 * @returns the derived status, or `null` if the target column isn't in the list
 */
export function deriveStatusFromColumn(
  targetBoardId: string,
  orderedBoardIds: string[],
): ETaskStatus | null {
  const index = orderedBoardIds.indexOf(targetBoardId);
  if (index === -1) return null;

  if (index === 0) return ETaskStatus.TODO;
  if (index === orderedBoardIds.length - 1) return ETaskStatus.DONE;
  return ETaskStatus.IN_PROGRESS;
}
