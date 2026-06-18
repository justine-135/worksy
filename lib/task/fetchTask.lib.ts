export default async function fetchTask(id?: string) {
  const res = await fetch(`/api/task/${id}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  return res.json();
}
