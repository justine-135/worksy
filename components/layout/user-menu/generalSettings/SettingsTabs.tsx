import { Tabs } from "@heroui/react/tabs";

import GeneralTab from "./GeneralTab";
import SettingTabPanel from "./SettingTabPanel";

export type SettingIds = "general" | "account";

interface SettingTabsConfig {
  id: SettingIds;
  label: string;
}

const SETTING_TABS: SettingTabsConfig[] = [
  {
    id: "general",
    label: "General",
  },
  {
    id: "account",
    label: "Account",
  },
];

export default function SettingsTabs() {
  return (
    <Tabs className="w-full max-w-lg" orientation="vertical">
      <Tabs.ListContainer>
        <Tabs.List aria-label="Vertical tabs">
          {SETTING_TABS.map((tab) => {
            return (
              <Tabs.Tab key={tab.id} id={tab.id}>
                {tab.label} <Tabs.Indicator />
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs.ListContainer>
      <SettingTabPanel id="account">
        <h3 className="mb-2 font-semibold">Account Settings</h3>
        <p className="text-sm text-muted">
          Manage your account information and preferences.
        </p>
      </SettingTabPanel>
      <SettingTabPanel id="general">
        <GeneralTab />
      </SettingTabPanel>
    </Tabs>
  );
}
