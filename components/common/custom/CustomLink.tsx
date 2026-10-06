"use client";

import Link, { LinkProps } from "next/link";

import { useProgress } from "@/components/provider/ProgressProvider";

type Props = LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function CustomLink({ children, onClick, ...props }: Props) {
  const { start } = useProgress();

  return (
    <Link
      {...props}
      onClick={(e) => {
        start();
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
