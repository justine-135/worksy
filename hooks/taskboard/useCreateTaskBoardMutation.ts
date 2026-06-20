import { useMutation } from "@tanstack/react-query";

import createTaskBoard from "@/lib/taskboard/createTaskBoard.lib";

export default function useCreateTaskBoardMutation({
  invalidateTaskBoards,
}: {
  invalidateTaskBoards: () => Promise<void>;
}) {
  const mutation = useMutation({
    mutationFn: createTaskBoard,
    onSettled: invalidateTaskBoards,
  });

  return { mutation };
}
