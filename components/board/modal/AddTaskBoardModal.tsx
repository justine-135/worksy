"use client";

import { Button } from "@heroui/react/button";
import { Modal } from "@heroui/react/modal";
import { Form, Input, toast } from "@heroui/react";
import { BiPlus } from "react-icons/bi";
import { useState } from "react";
import useCreateTaskBoardMutation from "@/hooks/taskboard/useCreateTaskBoardMutation";
import { useForm } from "react-hook-form";
import {
  CreateTaskBoardInput,
  createTaskBoardSchema,
} from "@/lib/validations/createTaskBoard.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomButton from "@/components/button/CustomButton";

const AddNewTaskBoard = ({ onClick }: { onClick: () => void }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <Button
      className="flex h-full w-65 flex-col rounded-xl border border-default-200/80 p-1 shadow-none opacity-50 hover:opacity-100"
      variant="ghost"
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        {isHovered ? "Add Column" : <BiPlus />}
      </div>
    </Button>
  );
};

export default function AddTaskBoardModal({
  invalidateTaskBoards,
  projectId,
}: {
  invalidateTaskBoards: () => Promise<void>;
  projectId: string;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { mutation } = useCreateTaskBoardMutation({ invalidateTaskBoards });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskBoardInput>({
    resolver: zodResolver(createTaskBoardSchema),
  });

  const onSubmit = (data: CreateTaskBoardInput) => {
    mutation.mutate(
      {
        ...data,
        projectId,
      },
      {
        onSuccess: (e) => {
          console.log(e);
          reset();
          setIsOpen(false);
          toast("Task board is created");
        },
        onError: () => {
          reset();
          setIsOpen(false);
          toast.danger("Task not created");
        },
      },
    );
  };

  return (
    <div>
      <AddNewTaskBoard onClick={() => setIsOpen(!isOpen)} />
      <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Add New Board</Modal.Heading>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Body className="space-y-4 p-1">
                <Input
                  className="w-full"
                  {...register("title")}
                  placeholder="e.g: Backlog"
                />
                {errors.title && <p>{errors.title.message}</p>}
              </Modal.Body>
              <Modal.Footer>
                <CustomButton
                  title="Create"
                  loadingTitle="Creating"
                  isPending={mutation.isPending}
                />
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
