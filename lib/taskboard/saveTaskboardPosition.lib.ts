import { throwApiError } from "@/lib/api/apiMessage.lib";
import clientId from "@/lib/ws/clientId";
import { UserProjectParamsDTO } from "@/types/taskboard.dto";

interface Params extends Omit<UserProjectParamsDTO, "userId"> {
  orderedTaskBoardIds: string[];
}

export default async function saveTaskBoardPosition({
  projectId,
  orderedTaskBoardIds,
}: Params) {
  const response = await fetch("/api/taskboard", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": clientId,
    },
    body: JSON.stringify({
      projectId,
      orderedTaskBoardIds,
    }),
  });

  if (!response.ok)
    await throwApiError(response, "Failed to save task board order");

  return response.json();
}
