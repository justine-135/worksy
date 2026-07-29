import { type Selection, Typography } from "@heroui/react";
import { Dropdown } from "@heroui/react/dropdown";
import { Header } from "@heroui/react/header";
import { Label } from "@heroui/react/label";
import { useState } from "react";

import CustomButton from "@/components/common/custom/CustomButton";
import { useTheme } from "@/hooks/useTheme";
import { THEME_OPTIONS } from "@/lib/theme/theme";

export default function GeneralTab() {
  const { theme, setTheme } = useTheme();
  const [selected, setSelected] = useState<Selection>(new Set([theme]));

  return (
    <div>
      <h3 className="mb-2 font-semibold">General Settings</h3>
      <div className="flex items-center justify-between">
        <Typography type="body-sm">Appearance</Typography>
        <Dropdown>
          <CustomButton
            title={theme.charAt(0).toUpperCase() + theme.slice(1)}
            variant="ghost"
          />
          <Dropdown.Popover className="min-w-[256px]">
            <Dropdown.Menu
              selectedKeys={selected}
              selectionMode="single"
              onSelectionChange={setSelected}
            >
              <Dropdown.Section>
                <Header>Select theme mode</Header>
                {THEME_OPTIONS.map((option) => {
                  return (
                    <Dropdown.Item
                      id={option.value}
                      textValue={option.label}
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                    >
                      <Dropdown.ItemIndicator />
                      <Label>{option.label}</Label>
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Section>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </div>
  );
}
