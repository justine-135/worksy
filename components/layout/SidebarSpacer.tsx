"use client";

import { useSidebarStore } from "@/store/sidebar.store";

import SidebarNavigation from "./SidebarNavigation";

// The sidebar itself is `position: fixed`, so it's out of normal flow. This
// spacer occupies the flex row and reserves the sidebar's width; shrinking it
// when collapsed is what lets the `flex-1` main area stretch into the freed
// space. The width transition here is what the eye reads as the layout sliding.
export default function SidebarSpacer() {
  const collapsed = useSidebarStore((s) => s.collapsed);

  return (
    <div
      className={`transition-[width] duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-61.5"
      }`}
    >
      <SidebarNavigation />
    </div>
  );
}
