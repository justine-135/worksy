import { Tabs } from "@heroui/react";
import { PermissionList } from "./PermissionList";

export function PermissionTab() {
  return (
    <Tabs className="w-full pb-10" variant="secondary">
      <span>Set permission to this user.</span>
      <Tabs.ListContainer>
        <Tabs.List aria-label="Options" className="max-w-md">
          <Tabs.Tab id="pre-made">
            Pre-made
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="custom">
            Custom
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel className="w-full" id="pre-made">
        <p>View your project overview and recent activity.</p>
      </Tabs.Panel>
      <Tabs.Panel className="pt-4" id="custom">
        <PermissionList />
      </Tabs.Panel>
    </Tabs>
  );
}
