import { Description, Dropdown, Header, Label, Separator } from "@heroui/react";
import { signOut } from "next-auth/react";
import { IconType } from "react-icons";
import { BiDotsVertical } from "react-icons/bi";
import { BsGear, BsPersonCircle } from "react-icons/bs";
import { LuLogOut } from "react-icons/lu";

import CustomButton from "@/components/common/custom/CustomButton";

interface MenuItem {
  id: string;
  icon: IconType;
  label: string;
  description?: string;
  action?: () => void;
}

const ActionMenuItem: MenuItem[] = [
  {
    id: "update-profile",
    icon: BsPersonCircle,
    label: "Profile",
    description: "Make changes to profile",
  },
  {
    id: "update-settings",
    icon: BsGear,
    label: "Setting",
    description: "Make changes to settings",
  },
];

const UserActionItem: MenuItem[] = [
  {
    id: "logout-user",
    icon: LuLogOut,
    label: "Logout",
    description: "Logout this user",
    action: signOut,
  },
];

export default function UserMenuDropDown() {
  return (
    <Dropdown className="ml-auto">
      <CustomButton
        title={<BiDotsVertical />}
        size="sm"
        onClick={() => signOut()}
        variant="secondary"
        className="ml-auto"
      />
      <Dropdown.Popover>
        <Dropdown.Menu>
          <Dropdown.Section>
            <Header>Actions</Header>
            {ActionMenuItem.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Dropdown.Item id={item.id} textValue={item.label} key={idx}>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 pt-px">
                      <Icon />
                      <Label>{item.label}</Label>
                    </div>
                    {item.description && (
                      <Description className="ml-5.5">
                        {item?.description}
                      </Description>
                    )}
                  </div>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Section>
          <Separator />
          <Dropdown.Section>
            {UserActionItem.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Dropdown.Item
                  id={item.id}
                  textValue={item.label}
                  key={idx}
                  onAction={item.action}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 pt-px">
                      <Icon />
                      <Label>{item.label}</Label>
                    </div>
                    {item.description && (
                      <Description className="ml-5.5">
                        {item?.description}
                      </Description>
                    )}
                  </div>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
