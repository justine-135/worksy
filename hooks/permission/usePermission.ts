import { useSessionStore } from "@/store/session.store";

export function usePermission() {
  // Assume you fetch and populate userPermissions: string[] in your store on layout load
  const permissions = useSessionStore((s) => s.userPermissions) || [];
  const isLoadingPermission = useSessionStore((s) => s.isLoadingPermissions);

  const hasPermission = (requiredPermission: string) => {
    return permissions.includes(requiredPermission);
  };

  return { hasPermission, isLoadingPermission };
}
