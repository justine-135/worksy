import { Button, ButtonProps, Spinner } from "@heroui/react";
import React from "react";

import { usePermission } from "@/hooks/permission/usePermission";

export interface CustomButtonProps extends ButtonProps {
  loadingTitle?: string;
  title: React.ReactNode;
  /**
   * When set, the button only renders if the current user holds this
   * permission (e.g. `Permissions.TaskCreate`). While permissions are still
   * loading, or when the user lacks the permission, nothing is rendered.
   */
  permission?: string;
}

export default function CustomButton(props: CustomButtonProps) {
  const { loadingTitle, title, permission, ...rest } = props;

  const { hasPermission, isLoadingPermission } = usePermission();

  const buttonTitle = loadingTitle || title;

  // Permission-gated button: hide entirely until we know the user is allowed.
  if (permission && (isLoadingPermission || !hasPermission(permission))) {
    return null;
  }

  return (
    <Button className="font-semibold" type="submit" {...rest}>
      {({ isPending }) => (
        <>
          {isPending ? <Spinner color="current" size="sm" /> : null}
          {isPending ? buttonTitle : title}
        </>
      )}
    </Button>
  );
}
