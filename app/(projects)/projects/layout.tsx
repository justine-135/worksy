import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Worksy | Projects",
  description: "Create and manage your project.",
};

export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className={`${inter.className} min-h-screen bg-gray-50`}>
      {children}
    </div>
  );
}
