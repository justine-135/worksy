"use client";

import { Button } from "@heroui/react/button";

import CustomButton from "@/components/button/CustomButton";
import { useState } from "react";

import { useSessionStore } from "@/store/session.store";
import {
  Avatar,
  AvatarFallback,
  Drawer,
  Label,
  Separator,
} from "@heroui/react";

import useAddRoleMutation from "@/hooks/role/useAddRoleMutation";
import { CgEye } from "react-icons/cg";

const ViewButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button onClick={onClick} isIconOnly size="sm" variant="tertiary">
      <CgEye />
    </Button>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex">
      <span className="w-36">{label}</span>
      <span className="text-sm text-black">{value}</span>
    </div>
  );
};

export default function ViewMemberDrawer({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const projectId = useSessionStore((s) => s.projectId);

  const { mutation } = useAddRoleMutation({ projectId });

  const handleOpenChange = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <Drawer>
        <ViewButton onClick={handleOpenChange} />
        <Drawer.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
          <Drawer.Content placement="right">
            <Drawer.Dialog>
              <Drawer.Header>
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar size="sm">
                    {/* <AvatarImage src={user.image} /> */}
                    <AvatarFallback>JU</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <Label className="text-lg font-bold">Justine Upano</Label>
                  </div>
                </div>
              </Drawer.Header>
              <Drawer.Body className="max-h-[75vh] min-h-[85vh] pt-6">
                <div className="space-y-8">
                  <Separator />
                  <div className="space-y-6">
                    <div>
                      <span className="font-medium text-black">
                        Member details
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Detail label="Email" value="asdas@yaasd.com" />
                      <Detail label="Joined" value="January 1, 2023" />
                      <Detail label="Role" value="Owner" />
                      <Detail label="Status" value="Owner" />
                    </div>
                  </div>
                </div>
              </Drawer.Body>
              <Drawer.Footer className="mt-auto">
                <CustomButton
                  title="Submit"
                  isPending={mutation.isPending}
                  loadingTitle="Submitting"
                  type="submit"
                />
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}
