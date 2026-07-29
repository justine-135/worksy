"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { Permissions } from "@/enum/permissions.enum";
import { usePermission } from "@/hooks/permission/usePermission";

// Sub-navigation for the Settings section. Each tab is its own route so it can
// be deep-linked and (in the case of Project) permission-gated independently.
// A tab with no `permission` is visible to every project member.
const SETTINGS_TABS: {
  name: string;
  segment: string;
  permission?: Permissions;
}[] = [
  {
    name: "Project",
    segment: "project",
    permission: Permissions.SettingsProjectView,
  },
  { name: "Appearance", segment: "appearance" },
  { name: "Profile", segment: "profile" },
];

export default function SettingsNav() {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const { hasPermission } = usePermission();

  const base = `/projects/${id}/settings`;

  const visibleTabs = SETTINGS_TABS.filter(
    (tab) => !tab.permission || hasPermission(tab.permission),
  );

  return (
    <nav className="flex gap-1 rounded-lg border border-border bg-surface p-1">
      {visibleTabs.map((tab) => {
        const href = `${base}/${tab.segment}`;
        const isActive = pathname === href;

        return (
          <Link
            key={tab.segment}
            href={href}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary-soft text-primary"
                : "text-muted hover:bg-surface-muted"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
