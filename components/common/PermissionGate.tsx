"use client";

import { ReactNode } from "react";
import { MdLock } from "react-icons/md";

import { usePermission } from "@/hooks/permission/usePermission";

import CustomEmpty from "./custom/CustomEmpty";

interface PermissionGateProps {
  /** Permission required to view the page, e.g. `Permissions.BoardView`. */
  permission: string;
  /** Skeleton shown while permissions are still loading. */
  skeleton: ReactNode;
  /** Page content rendered once the permission is confirmed. */
  children: ReactNode;
}

/**
 * Guards a permission-protected page.
 *
 * Access page > show loading skeleton > no permission? show CustomEmpty
 * else render the page. This avoids flashing "No permission" while the
 * permission list is still being fetched into the session store.
 */
export default function PermissionGate({
  permission,
  skeleton,
  children,
}: PermissionGateProps) {
  const { hasPermission, isLoadingPermission } = usePermission();

  if (isLoadingPermission) return <>{skeleton}</>;

  if (!hasPermission(permission)) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <CustomEmpty
          title="No permission"
          message="You don't have access to view this page."
          icon={MdLock}
        />
      </div>
    );
  }

  return <>{children}</>;
}
