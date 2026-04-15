import { Button, ButtonProps, Spinner } from "@heroui/react";
import React from "react";

interface Props extends ButtonProps {
  loadingTitle?: string;
  title: string;
}

export default function CustomButton(props: Props) {
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
