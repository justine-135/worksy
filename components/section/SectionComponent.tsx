"use client";

import { useParams } from "next/navigation";

import BoardComponent from "@/components/board/BoardComponent";
import DashboardComponent from "@/components/dashboard/DashboardComponent";
import MembersComponent from "@/components/members/MembersComponent";
import RolesComponent from "@/components/roles/RolesComponent";

// Note: "settings" is intentionally absent — it has its own static route tree
// (app/.../[id]/settings/**) which takes precedence over this [section] param.
const sectionMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardComponent />,
  board: <BoardComponent />,
  members: <MembersComponent />,
  roles: <RolesComponent />,
};

export default function SectionComponent() {
  const { section } = useParams<{ section: string }>();

  const Component = sectionMap[section];

  if (!Component) {
    return <div>404 - Section not found</div>;
  }

  return Component;
}
