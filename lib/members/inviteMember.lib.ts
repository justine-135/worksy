import { CreateProjectMemberDTO } from "@/types/projectMember.dto";

export default async function inviteMember({
  userId,
  projectId,
}: CreateProjectMemberDTO) {
  const response = await fetch("/api/member/invite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      project_id: projectId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to invite member");
  }

  return response.json();
}
