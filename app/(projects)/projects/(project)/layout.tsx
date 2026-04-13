import { Inter } from "next/font/google";
import "../../../globals.css";
import SidebarNavigation from "@/components/layout/project/SidebarNavigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-project",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} font-project min-h-screen bg-gray-50`}>
      <div className="flex justify-center">
        <div className="flex w-[90%] max-w-550">
          <SidebarNavigation />
          <main className="py-8 px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
