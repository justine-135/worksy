import { Button, ButtonProps, Spinner } from "@heroui/react";
import React from "react";

export interface CustomButtonProps extends ButtonProps {
  loadingTitle?: string;
  title: React.ReactNode;
}

export default function CustomButton(props: CustomButtonProps) {
  const { loadingTitle, title, ...rest } = props;

  const buttonTitle = loadingTitle || title;

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
