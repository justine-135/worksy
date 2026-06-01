import { Inter } from "next/font/google";
import "@/app/globals.css";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/auth";
import { Metadata } from "next";
import SessionHydrator from "@/components/common/SessionHydrator";
import { redirect } from "next/navigation";
import ToastLayout from "@/components/layout/ToastLayout";
import SidebarNavigation from "@/components/layout/SidebarNavigation";

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

  return (
    <div className={`${inter.className} font-project`}>
      <ToastLayout>
        <div className="flex">
          <div className="w-57.5">
            <SidebarNavigation />
          </div>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
        <SessionHydrator userId={session?.user.id} projectId={id} />
      </ToastLayout>
    </div>
  );
}
