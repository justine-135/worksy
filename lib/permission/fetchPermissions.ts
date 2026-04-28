export default async function fetchPermissions() {
  const res = await fetch(`/api/permission`);
  if (!res.ok) throw new Error("Failed to fetch permissions");
  return res.json();
}
