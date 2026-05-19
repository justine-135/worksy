"use client";

import { ERoles } from "@/enum/role";
import type { Selection } from "@heroui/react";

import { Button, Dropdown, Header, Label } from "@heroui/react";
import { useState } from "react";

const ROLE_LABELS: Record<ERoles, string> = {
  [ERoles.OWNER]: "Project Owner",
  [ERoles.ADMIN]: "Admin",
  [ERoles.MEMBER]: "Member",
};

export function RoleFilter() {
  const [selected, setSelected] = useState<Selection>(new Set([ERoles.OWNER]));

  return (
    <Dropdown>
      <Button aria-label="Menu" variant="secondary">
        Role
      </Button>
      <Dropdown.Popover className="min-w-[256px]">
        <Dropdown.Menu
          selectedKeys={selected}
          selectionMode="multiple"
          onSelectionChange={setSelected}
        >
          <Dropdown.Section>
            <Header>Select role</Header>
            {Object.values(ERoles).map((role, idx) => {
              return (
                <Dropdown.Item
                  id={role}
                  textValue={ROLE_LABELS[role as ERoles]}
                  key={idx}
                >
                  <Dropdown.ItemIndicator />
                  <Label>{ROLE_LABELS[role as ERoles]}</Label>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
