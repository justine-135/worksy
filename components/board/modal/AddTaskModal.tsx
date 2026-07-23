"use client";

import {
  Form,
  Input,
  Label,
  ListBox,
  Select,
  Skeleton,
  TextField,
} from "@heroui/react";
import { Button } from "@heroui/react/button";
import { Modal } from "@heroui/react/modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";

import TaskRelationCombobox from "@/components/board/common/TaskRelationCombobox";
import CustomButton from "@/components/common/custom/CustomButton";
import PermissionGuard from "@/components/common/PermissionGuard";
import TiptapEditor from "@/components/common/TiptapEditor";
import {
  DEFAULT_TASK_PRIORITY,
  PRIORITY_OPTIONS,
} from "@/constant/taskPriority";
import { Permissions } from "@/enum/permissions.enum";
import { ETaskPriority } from "@/enum/taskPriority.enum";
import { useApiMessage } from "@/hooks/common/useApiMessage";
import { useGetAssignees } from "@/hooks/member/useGetAssignees";
import { useGetProject } from "@/hooks/project/useGetProject";
import useCreateTaskMutation from "@/hooks/task/useCreateTask";
import useInvalidateQuery from "@/hooks/taskboard/useInvalidateQuery";
import {
  CreateTaskInput,
  createTaskSchema,
} from "@/lib/validations/createTask.schema";
import { TaskSearchResultDTO } from "@/types/task.dto";

export default function AddTaskModal({
  projectId,
  taskBoardID,
}: {
  projectId?: string | null;
  taskBoardID: string;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data } = useGetAssignees({
    projectId,

    enabled: isOpen,
  });
  const { data: project, isLoading } = useGetProject({
    projectId,
    enabled: isOpen,
  });
  const [description, setDescription] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  // Null = "follow the project default"; a value = the user picked one. Derived
  // (not effect-synced) so the picker tracks the project default until touched.
  const [priorityOverride, setPriorityOverride] =
    useState<ETaskPriority | null>(null);
  // The task this new one will be a child of (optional). Left empty → the new
  // task is a top-level parent.
  const [parentTask, setParentTask] = useState<TaskSearchResultDTO | null>(
    null,
  );

  const queryClient = useQueryClient();
  const { showSuccess, showError } = useApiMessage();

  const projectDefaultPriority =
    (project?.defaultTaskPriority as ETaskPriority) ?? DEFAULT_TASK_PRIORITY;
  const priority = priorityOverride ?? projectDefaultPriority;

  const { invalidateTaskBoards } = useInvalidateQuery(projectId, queryClient);

  const { mutation } = useCreateTaskMutation({
    invalidateTasks: invalidateTaskBoards,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);

    if (!nextOpen) {
      reset();
      setDescription("");
      setSelectedAssignees([]);
      setParentTask(null);
      setPriorityOverride(null);
    }
  };

  const onSubmit = (data: CreateTaskInput) => {
    if (!projectId) return;

    mutation.mutate(
      {
        ...data,
        description,
        priority,
        taskBoardId: taskBoardID,
        assignees: selectedAssignees,
        projectId,
        // Picking a parent makes this new task its child; otherwise top-level.
        parentId: parentTask?.id,
      },
      {
        onSuccess: () => {
          reset();
          setDescription("");
          setSelectedAssignees([]);
          setParentTask(null);
          setPriorityOverride(null);
          setIsOpen(false);
          showSuccess("Task created");
          // Recents/board invalidation lives in useCreateTaskMutation.onSettled.
        },
        // Leave the form intact on failure so the user can retry without
        // re-typing everything.
        onError: (error) => {
          showError(error, "Task not created");
        },
      },
    );
  };

  return (
    <Modal>
      <PermissionGuard permission={Permissions.TaskCreate}>
        <Button
          className="px-1 h-5"
          variant="tertiary"
          onClick={() => setIsOpen(true)}
        >
          <BiPlus scale={2} />
        </Button>
      </PermissionGuard>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
        <Modal.Container size="cover">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="font-semibold">Add Task</Modal.Heading>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Body className="space-y-4 p-1">
                <TextField>
                  <Label>Title</Label>
                  <Input placeholder="Enter title" {...register("title")} />
                  {errors.title && <p>{errors.title.message}</p>}
                </TextField>
                <Select
                  fullWidth
                  placeholder="Select assignees"
                  selectionMode="multiple"
                  value={selectedAssignees}
                  onChange={(keys) => setSelectedAssignees(keys as string[])}
                >
                  <Label>Assignees</Label>
                  {isLoading ? (
                    <Skeleton className="h-9.5 w-full" />
                  ) : (
                    <Select.Trigger className="flex w-full items-center justify-between rounded-lg border border-default-200 bg-surface p-2">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                  )}

                  <Select.Popover>
                    <ListBox selectionMode="multiple">
                      {data?.data.map((member) => (
                        <ListBox.Item
                          id={member.id}
                          key={member.id}
                          textValue={member.user.name}
                          className="flex items-center gap-2"
                        >
                          {member.user.name}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
                <Select
                  aria-label="Task priority"
                  value={priority}
                  onChange={(key) => setPriorityOverride(key as ETaskPriority)}
                >
                  <Label>Priority</Label>
                  <Select.Trigger className="flex w-full items-center justify-between rounded-lg border border-default-200 bg-surface p-2">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {PRIORITY_OPTIONS.map((option) => (
                        <ListBox.Item
                          id={option.value}
                          key={option.value}
                          textValue={option.label}
                          className="flex items-center justify-between gap-2"
                        >
                          {option.label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
                <div className="space-y-2">
                  <Label>Child of (optional)</Label>
                  {parentTask ? (
                    <div className="flex items-center justify-between rounded-lg border border-default-200 px-3 py-2">
                      <span className="truncate text-sm">
                        <span className="mr-1 text-xs font-medium text-subtle">
                          #{parentTask.ticketNumber}
                        </span>
                        {parentTask.title}
                      </span>
                      <Button
                        type="button"
                        variant="tertiary"
                        className="h-6 px-1 text-muted"
                        onClick={() => setParentTask(null)}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <TaskRelationCombobox
                      projectId={projectId}
                      onSelect={setParentTask}
                      placeholder="Search a parent task…"
                    />
                  )}
                </div>
                <TextField>
                  <Label>Description</Label>
                  <TiptapEditor
                    users={data?.data}
                    value={description}
                    onChange={setDescription}
                  />
                </TextField>
              </Modal.Body>
              <Modal.Footer>
                <CustomButton
                  className="font-semibold"
                  title="Create"
                  isPending={mutation.isPending}
                  loadingTitle="Creating"
                />
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
