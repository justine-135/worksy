import { Inter } from "next/font/google";
import "@/app/globals.css";
import SidebarNavigation from "@/components/layout/project/SidebarNavigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/auth";
import { Metadata } from "next";
import { assertProjectMember } from "@/lib/auth/project-access.lib";
import SessionHydrator from "@/components/common/SessionHydrator";
import { redirect } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-project",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Worksy | Your project",
  description: "Manage your project and track progress.",
};

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
    <div className={`${inter.className} font-project min-h-screen bg-gray-50`}>
      <div className="flex justify-center">
        <div className="flex w-[90%] max-w-550">
          <SidebarNavigation />
          <main className="py-8 px-6 flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <SessionHydrator userId={session?.user.id} projectId={id} />;
    </div>
  );
}
