"use client";

import CustomButton from "@/components/button/CustomButton";
import { useState } from "react";

import { Card, Drawer } from "@heroui/react";
import { useGetTaskDetail } from "@/hooks/task/useGetTaskDetail";

interface TaskDetailDrawerProps {
  id: string;
  title: string;
}

export default function TaskDetailDrawer({ id, title }: TaskDetailDrawerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data, isLoading } = useGetTaskDetail({ id, isOpen });

  console.log(data);

  const handleOpenChange = () => {
    setIsOpen(!isOpen);
  };

  if (isLoading) return "Loading";

  return (
    <div>
      <Drawer>
        <span
          onClick={handleOpenChange}
          className="hover:bg-transparent hover:underline cursor-pointer"
        >
          {title}
        </span>
        <Drawer.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="min-w-175">
              <Drawer.Header>{title}</Drawer.Header>
              <Drawer.Body className="max-h-[75vh] min-h-[85vh] pt-6">
                {/* <TiptapEditor
                  users={data}
                  value={data?.description || ""}
                  onChange={setDescription}
                /> */}
                <Card>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: data?.description || "",
                    }}
                  />
                </Card>
              </Drawer.Body>
              <Drawer.Footer className="mt-auto">
                <CustomButton
                  title="Submit"
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
