import React from "react";
import { IconType } from "react-icons/lib";
import { MdInbox } from "react-icons/md";

interface CustomEmptyProps {
  title?: string;
  message?: string;
  icon?: IconType;
  action?: React.ReactNode;
}

export default function CustomEmpty({
  title,
  message,
  icon: Icon,
  action,
}: CustomEmptyProps) {
  const IconComponent = Icon || MdInbox;
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="flex items-center justify-center rounded-full bg-default-100 p-4">
        <IconComponent size={28} className="text-default-400" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">
          {title || "No data available"}
        </p>
        <p className="text-xs text-default-400">
          {message ?? "Nothing to show here yet."}
        </p>
      </div>
      {action}
    </div>
  );
}
