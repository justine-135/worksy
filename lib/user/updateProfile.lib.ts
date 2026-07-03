import { UpdateProfileInput } from "@/lib/validations/updateProfile.schema";
import { UserProfileDTO } from "@/types/user.dto";

export default async function updateProfile(
  data: UpdateProfileInput,
): Promise<UserProfileDTO> {
  const res = await fetch("/api/user/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.error?.toString() ?? "Failed to update profile");
  }

  const json = await res.json();
  return json.data;
}
