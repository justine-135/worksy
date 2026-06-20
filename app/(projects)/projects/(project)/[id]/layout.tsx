import "@/app/globals.css";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import SessionHydrator from "@/components/common/SessionHydrator";
import TabRoutesNav from "@/components/layout/project/TabRoutesNav";
import { authConfig } from "@/lib/auth/auth";
import { assertProjectMember } from "@/lib/auth/project-access.lib";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authConfig);

  if (!session || !session.user?.id) {
    redirect("/sign-in");
  }

  await assertProjectMember({
    userId: session?.user.id,
    projectId: id,
  });

  return (
    <div>
      <TabRoutesNav />
      <section className="p-4">{children}</section>
      <SessionHydrator userId={session?.user.id} projectId={id} />
    </div>
  );
}
