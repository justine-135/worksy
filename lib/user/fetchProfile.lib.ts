import { UserProfileDTO } from "@/types/user.dto";

export default async function fetchProfile(): Promise<UserProfileDTO> {
  const res = await fetch("/api/user/profile");

  if (!res.ok) throw new Error("Failed to fetch profile");

  const json = await res.json();
  return json.data;
}
