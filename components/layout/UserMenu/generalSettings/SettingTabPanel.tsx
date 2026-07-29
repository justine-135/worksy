import { Tabs } from "@heroui/react/tabs";
import React from "react";

import { SettingIds } from "./SettingsTabs";

export default function SettingTabPanel({
  children,
  id,
}: {
  children: React.ReactNode;
  id: SettingIds;
}) {
  return (
    <Tabs.Panel className="px-4" id={id}>
      {children}
    </Tabs.Panel>
  );
}
