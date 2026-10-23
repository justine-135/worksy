"use client";

import {
  Description,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
  toast,
} from "@heroui/react";
import { Modal } from "@heroui/react/modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";

import CustomButton from "@/components/common/custom/CustomButton";
import PermissionGuard from "@/components/common/PermissionGuard";
import { Permissions } from "@/enum/permissions.enum";
import {
  ETaskStatus,
  TASK_STATUS_LABELS,
  TASK_STATUS_OPTIONS,
} from "@/enum/taskStatus.enum";
import useCreateTaskBoardMutation from "@/hooks/taskboard/useCreateTaskBoardMutation";
import {
  CreateTaskBoardInput,
  createTaskBoardSchema,
} from "@/lib/validations/createTaskBoard.schema";

const AddNewTaskBoard = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex shrink-0 flex-col gap-2 rounded-xl -mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      style={{ width: "var(--kanban-column-min-width, 280px)" }}
    >
      {/* Spacer aligns the dashed panel with sibling column bodies */}
      <div className="h-7.5 shrink-0" />
      <div
        className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-default-300 transition-colors duration-150 group-hover:border-primary/50 group-hover:bg-primary/5"
        style={{ minHeight: "var(--kanban-column-height, 480px)" }}
      >
        <div className="flex size-9 items-center justify-center rounded-full bg-default-100 text-default-500 transition-colors duration-150 group-hover:bg-primary/10 group-hover:text-primary">
          <BiPlus size={20} />
        </div>
        <span className="text-sm font-medium text-default-400 transition-colors duration-150 group-hover:text-primary">
          Add board
        </span>
      </div>
    </button>
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
    control,
    formState: { errors },
  } = useForm<CreateTaskBoardInput>({
    resolver: zodResolver(createTaskBoardSchema),
    values: {
      title: "",
      status: ETaskStatus.TODO,
    },
  });

  const onSubmit = (data: CreateTaskBoardInput) => {
    mutation.mutate(
      {
        ...data,
        projectId,
      },
      {
        onSuccess: () => {
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
      <PermissionGuard permission={Permissions.BoardCreate}>
        <AddNewTaskBoard onClick={() => setIsOpen(!isOpen)} />
      </PermissionGuard>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Add New Board</Modal.Heading>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Body className="space-y-4 p-1">
                <TextField>
                  <Label>Title</Label>
                  <Input
                    className="w-full"
                    {...register("title")}
                    placeholder="e.g: Backlog"
                  />
                  {errors.title && <p>{errors.title.message}</p>}
                </TextField>
                <Controller
                  name="status"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      className="flex flex-col gap-1"
                      value={value}
                      onChange={(key) => onChange(key as ETaskStatus)}
                    >
                      <Label>Status</Label>
                      <Description>
                        Value will determine the status of each tasks created to
                        this column, and calculated in dashboard.
                      </Description>
                      <Select.Trigger className="flex items-center justify-between rounded-lg border p-2 bg-surface">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {TASK_STATUS_OPTIONS.map((status) => (
                            <ListBox.Item
                              key={status}
                              id={status}
                              textValue={TASK_STATUS_LABELS[status]}
                            >
                              {TASK_STATUS_LABELS[status]}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  )}
                />

                {errors.status && (
                  <p className="text-danger text-sm">{errors.status.message}</p>
                )}
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
