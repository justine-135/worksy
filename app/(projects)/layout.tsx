import "@/app/globals.css";

import { Metadata } from "next";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import SessionHydrator from "@/components/common/SessionHydrator";
import SidebarNavigation from "@/components/layout/SidebarNavigation";
import ToastLayout from "@/components/layout/ToastLayout";
import { authConfig } from "@/lib/auth/auth";

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
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  if (!session || !session.user?.id) {
    redirect("/sign-in");
  }

  return (
    <div className={`${inter.className} font-project`}>
      <ToastLayout>
        <div className="flex">
          <div className="w-61.5">
            <SidebarNavigation />
          </div>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
        <SessionHydrator userId={session?.user.id} />
      </ToastLayout>
    </div>
  );
}
