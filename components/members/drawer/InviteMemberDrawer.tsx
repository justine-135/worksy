"use client";

import { Button } from "@heroui/react/button";
import { Drawer } from "@heroui/react/drawer";

import CustomButton from "@/components/button/CustomButton";
import { UserComboBox } from "./UserComboBox";
import { PermissionTab } from "./PermissionTab";
import { UserResponseDTO } from "@/types/user.dto";
import { useState } from "react";
import UserSurface from "./UserSurface";

const AddNewTaskBoard = ({ onClick }: { onClick: () => void }) => {
  return <Button onClick={onClick}>Invite Member</Button>;
};

export default function InviteMemberDrawer() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [member, setMember] = useState<UserResponseDTO | undefined>(undefined);

  const handleOpenChange = () => {
    if (!isOpen) {
      setMember(undefined);
    }

    setIsOpen(!isOpen);
  };

  return (
    <div>
      <AddNewTaskBoard onClick={handleOpenChange} />
      <Drawer.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading aria-label="Drawer title">
                Invite Member
              </Drawer.Heading>
              <UserComboBox setMember={setMember} />
              {member && <UserSurface member={member} />}
            </Drawer.Header>
            <Drawer.Body>{member && <PermissionTab />}</Drawer.Body>
            <Drawer.Footer>
              <CustomButton slot="close" title="Send Invite" />
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </div>
  );
}
