import { CheckboxGroup } from "@heroui/react";
import { useGetPermissions } from "@/hooks/permission/useGetPermission";
import { transformPermissions } from "@/utils/transform-permissions";
import { PermissionSection } from "./PermissionSection";

export function PermissionList() {
  const { data, isLoading } = useGetPermissions();

  if (isLoading) return <div>Loading permissions...</div>;

  const sections = data ? transformPermissions(data) : [];

  return (
    <CheckboxGroup name="permissions" className="space-y-6">
      {sections.map((section) => (
        <PermissionSection key={section.page} section={section} />
      ))}
    </CheckboxGroup>
  );
}
