import { useMutation } from "@tanstack/react-query";

import updateTaskBoard from "@/lib/taskboard/updateTaskBoard.lib";

export default function useUpdateTaskBoardMutation({
  invalidateTaskBoards,
}: {
  invalidateTaskBoards: () => Promise<void>;
}) {
  const mutation = useMutation({
    mutationFn: updateTaskBoard,
    onSettled: invalidateTaskBoards,
  });

  return { mutation };
}
