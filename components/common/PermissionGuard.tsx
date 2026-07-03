"use client";

import { ReactNode } from "react";

import { usePermission } from "@/hooks/permission/usePermission";

interface PermissionGuardProps {
  /** Permission required to render the children, e.g. `Permissions.TaskDelete`. */
  permission: string;
  /** UI to render when the user holds the permission. */
  children: ReactNode;
  /** Optional UI to render when the user lacks the permission (defaults to nothing). */
  fallback?: ReactNode;
}

/**
 * Inline guard for action UI (icon buttons, dropdown triggers, menus).
 *
 * Renders nothing while permissions are still loading, `fallback` (or nothing)
 * when the user lacks the permission, and the children once it is confirmed.
 * Use this to hide create/edit/delete controls the user isn't allowed to use.
 *
 * Note: do NOT wrap individual HeroUI `<DropdownItem>`s with this — menu
 * collections require direct item children. Inside a menu, call
 * `usePermission()` and conditionally include each item instead.
 */
export default function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, isLoadingPermission } = usePermission();

  if (isLoadingPermission) return null;

  if (!hasPermission(permission)) return <>{fallback}</>;

  return <>{children}</>;
}
