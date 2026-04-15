import ProjectsComponent from "@/components/projects/ProjectsComponent";
import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function ProjectsPage() {
  const session = await getServerSession(authConfig);

  return <ProjectsComponent userId={session?.user.id || ""} />;
}
