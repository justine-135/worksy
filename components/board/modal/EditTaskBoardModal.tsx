"use client";

import {
  Dropdown,
  Form,
  Header,
  Input,
  Label,
  ListBox,
  Select,
  toast,
} from "@heroui/react";
import { Modal } from "@heroui/react/modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Key } from "react-aria-components";
import { Controller, useForm } from "react-hook-form";
import {
  BiDotsVerticalRounded,
  BiEditAlt,
  BiLeftArrowAlt,
  BiRightArrowAlt,
  BiTrash,
} from "react-icons/bi";

import ConfirmModal from "@/components/common/ConfirmModal";
import CustomButton from "@/components/common/custom/CustomButton";
import {
  ETaskStatus,
  TASK_STATUS_LABELS,
  TASK_STATUS_OPTIONS,
} from "@/enum/taskStatus.enum";
import useDeleteTaskBoardMutation from "@/hooks/taskboard/useDeleteTaskBoardMutation";
import { useGetTaskBoard } from "@/hooks/taskboard/useGetTaskBoard";
import useInvalidateQuery from "@/hooks/taskboard/useInvalidateQuery";
import useSaveTaskBoardPositionMutation from "@/hooks/taskboard/useSaveTaskBoardPositionMutation";
import useUpdateTaskBoardMutation from "@/hooks/taskboard/useUpdateTaskBoardMutation";
import {
  EditTaskBoardInput,
  editTaskBoardSchema,
} from "@/lib/validations/editTaskBoard.schema";
import { useSessionStore } from "@/store/session.store";
import {
  DeleteTaskBoardTarget,
  TaskBoardResponseDTO,
} from "@/types/taskboard.dto";

const sectionTitleClass = "px-2 pt-2 pb-1 text-xs font-medium text-default-400";

export default function EditTaskBoardModal({
  column,
}: {
  column: TaskBoardResponseDTO;
}) {
  const [isEditOpen, setEditOpen] = useState<boolean>(false);
  const [isDeleteBoardOpen, setDeleteBoardOpen] = useState<boolean>(false);
  const [isDeleteTasksOpen, setDeleteTasksOpen] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.userId);
  const projectId = useSessionStore((s) => s.projectId);

  const { invalidateTaskBoards } = useInvalidateQuery(
    projectId,
    userId,
    queryClient,
  );

  // All columns in display order — powers the left/right moves.
  const { data } = useGetTaskBoard({
    userId: userId || "",
    projectId: projectId || "",
  });
  const columns: TaskBoardResponseDTO[] = data ?? [];
  const currentIndex = columns.findIndex((c) => c.id === column.id);

  const { mutation } = useUpdateTaskBoardMutation({ invalidateTaskBoards });
  const { mutation: reorderMutation } = useSaveTaskBoardPositionMutation({
    userId: userId || "",
    projectId: projectId || "",
    invalidateTaskBoards,
  });
  const { mutation: deleteMutation } = useDeleteTaskBoardMutation({
    invalidateTaskBoards,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EditTaskBoardInput>({
    resolver: zodResolver(editTaskBoardSchema),
    values: {
      title: column.title,
      status: column.status,
    },
  });

  const handleEditOpenChange = (nextOpen: boolean) => {
    setEditOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const onSubmit = (formData: EditTaskBoardInput) => {
    if (!projectId || !userId) return;

    mutation.mutate(
      {
        projectId,
        userId,
        taskBoardId: column.id,
        title: formData.title,
        status: formData.status,
      },
      {
        onSuccess: () => {
          reset();
          setEditOpen(false);
          toast("Column updated");
        },
        onError: () => {
          setEditOpen(false);
          toast.danger("Failed to update column");
        },
      },
    );
  };

  // Move the column one slot left/right by swapping it with its neighbour and
  // persisting the new order through the existing reorder endpoint.
  const handleMove = (direction: "left" | "right") => {
    if (!userId || !projectId || currentIndex < 0) return;

    const swapWith = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (swapWith < 0 || swapWith >= columns.length) return;

    const ids = columns.map((c) => c.id);
    [ids[currentIndex], ids[swapWith]] = [ids[swapWith], ids[currentIndex]];

    reorderMutation.mutate(
      { orderedTaskBoardIds: ids },
      { onError: () => toast.danger("Failed to move column") },
    );
  };

  const handleDelete = (target: DeleteTaskBoardTarget) => {
    if (!userId || !projectId) return;

    deleteMutation.mutate(
      { projectId, userId, taskBoardId: column.id, target },
      {
        onSuccess: () => {
          if (target === "board") {
            setDeleteBoardOpen(false);
            toast("Column deleted");
          } else {
            setDeleteTasksOpen(false);
            toast("All tasks deleted");
          }
        },
        onError: () => toast.danger("Delete failed"),
      },
    );
  };

  // The menu closes on selection; each key routes to a move or opens a modal.
  const handleAction = (key: Key) => {
    switch (key) {
      case "edit":
        setEditOpen(true);
        break;
      case "delete":
        setDeleteBoardOpen(true);
        break;
      case "remove-all":
        setDeleteTasksOpen(true);
        break;
      case "move-left":
        handleMove("left");
        break;
      case "move-right":
        handleMove("right");
        break;
    }
  };

  const isLeftmost = currentIndex <= 0;
  const isRightmost = currentIndex < 0 || currentIndex >= columns.length - 1;

  // react-aria won't fire onAction for disabled keys — block off-board moves.
  const disabledKeys: Key[] = [];
  if (isLeftmost) disabledKeys.push("move-left");
  if (isRightmost) disabledKeys.push("move-right");

  return (
    <div>
      <Dropdown>
        <Dropdown.Trigger
          aria-label="Column actions"
          className="flex h-5 items-center justify-center rounded-md px-1 text-default-500 outline-none hover:bg-default-100"
        >
          <BiDotsVerticalRounded />
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu
            aria-label="Column actions"
            className="min-w-56 p-1"
            onAction={handleAction}
            disabledKeys={disabledKeys}
          >
            <Dropdown.Section>
              <Header className={sectionTitleClass}>Column</Header>
              <Dropdown.Item id="edit" textValue="Edit details">
                <div className="flex items-center gap-2">
                  <BiEditAlt />
                  Edit details
                </div>
              </Dropdown.Item>
              <Dropdown.Item id="delete" variant="danger" textValue="Delete">
                <div className="flex items-center gap-2">
                  <BiTrash />
                  Delete
                </div>
              </Dropdown.Item>
            </Dropdown.Section>

            <Dropdown.Section>
              <Header className={sectionTitleClass}>Items</Header>
              <Dropdown.Item
                id="remove-all"
                variant="danger"
                textValue="Remove all"
              >
                <div className="flex items-center gap-2">
                  <BiTrash />
                  Remove all
                </div>
              </Dropdown.Item>
            </Dropdown.Section>

            <Dropdown.Section>
              <Header className={sectionTitleClass}>Position</Header>
              <Dropdown.Item id="move-left" textValue="Move left">
                <div className="flex items-center gap-2">
                  <BiLeftArrowAlt />
                  <div className="flex flex-col">
                    <span>Move left</span>
                    {isLeftmost && (
                      <span className="text-xs text-default-400">
                        This is the left-most column
                      </span>
                    )}
                  </div>
                </div>
              </Dropdown.Item>
              <Dropdown.Item id="move-right" textValue="Move right">
                <div className="flex items-center gap-2">
                  <BiRightArrowAlt />
                  <div className="flex flex-col">
                    <span>Move right</span>
                    {isRightmost && (
                      <span className="text-xs text-default-400">
                        This is the right-most column
                      </span>
                    )}
                  </div>
                </div>
              </Dropdown.Item>
            </Dropdown.Section>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      <Modal.Backdrop isOpen={isEditOpen} onOpenChange={handleEditOpenChange}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Edit Column</Modal.Heading>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Body className="space-y-4 p-1">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    className="w-full"
                    placeholder="e.g: Backlog"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-danger text-sm">
                      {errors.title.message}
                    </p>
                  )}
                </div>

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
                  title="Update"
                  loadingTitle="Updating"
                  isPending={mutation.isPending}
                  type="submit"
                />
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <ConfirmModal
        isOpen={isDeleteTasksOpen}
        onOpenChange={setDeleteTasksOpen}
        onConfirm={() => handleDelete("tasks")}
        isPending={deleteMutation.isPending}
        title="Remove all tasks"
        description={`This permanently deletes every task in "${column.title}". This can't be undone.`}
        confirmLabel="Remove all"
        loadingLabel="Removing"
      />

      <ConfirmModal
        isOpen={isDeleteBoardOpen}
        onOpenChange={setDeleteBoardOpen}
        onConfirm={() => handleDelete("board")}
        isPending={deleteMutation.isPending}
        title="Delete column"
        description={`This permanently deletes the "${column.title}" column and all of its tasks. This can't be undone.`}
      />
    </div>
  );
}
