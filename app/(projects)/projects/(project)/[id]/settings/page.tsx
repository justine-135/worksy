import { redirect } from "next/navigation";

// /settings has no content of its own — send visitors to the first subsection.
export default async function SettingsIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/projects/${id}/settings/project`);
}
