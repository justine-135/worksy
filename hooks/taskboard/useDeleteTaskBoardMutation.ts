import { useMutation } from "@tanstack/react-query";

import deleteTaskBoard from "@/lib/taskboard/deleteTaskBoard.lib";

export default function useDeleteTaskBoardMutation({
  invalidateTaskBoards,
}: {
  invalidateTaskBoards: () => Promise<void>;
}) {
  const mutation = useMutation({
    mutationFn: deleteTaskBoard,
    onSettled: invalidateTaskBoards,
  });

  return { mutation };
}
