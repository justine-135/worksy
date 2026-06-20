import { Typography } from "@heroui/react/typography";
import React from "react";
import { IconType } from "react-icons/lib";
import { MdPerson } from "react-icons/md";

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
  const IconComponent = Icon || MdPerson;
  return (
    <div className="flex flex-col items-center p-5">
      <div className="bg-slate-200 rounded-xl border mb-4 p-2">
        <IconComponent size={32} />
      </div>
      <Typography.Heading level={1} className="text-[16px]">
        {title || "No data available"}
      </Typography.Heading>
      <Typography.Paragraph className="text-gray-500 text-sm">
        {message ?? "No members yet"}
      </Typography.Paragraph>
      {action}
    </div>
  );
}
