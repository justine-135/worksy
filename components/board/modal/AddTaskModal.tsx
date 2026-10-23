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
import { BiCalendar, BiPlus, BiX } from "react-icons/bi";

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
  const { data } = useGetAssignees({ projectId, enabled: isOpen });
  const { data: project, isLoading } = useGetProject({ projectId, enabled: isOpen });
  const [description, setDescription] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [priorityOverride, setPriorityOverride] = useState<ETaskPriority | null>(null);
  const [parentTask, setParentTask] = useState<TaskSearchResultDTO | null>(null);
  const [dueDate, setDueDate] = useState<string>("");

  const queryClient = useQueryClient();
  const { showSuccess, showError } = useApiMessage();

  const projectDefaultPriority =
    (project?.defaultTaskPriority as ETaskPriority) ?? DEFAULT_TASK_PRIORITY;
  const priority = priorityOverride ?? projectDefaultPriority;

  const { invalidateTaskBoards } = useInvalidateQuery(projectId, queryClient);
  const { mutation } = useCreateTaskMutation({ invalidateTasks: invalidateTaskBoards });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskInput>({ resolver: zodResolver(createTaskSchema) });

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (!nextOpen) {
      reset();
      setDescription("");
      setSelectedAssignees([]);
      setParentTask(null);
      setPriorityOverride(null);
      setDueDate("");
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
        parentId: parentTask?.id,
        dueDate: dueDate || null,
      },
      {
        onSuccess: () => {
          reset();
          setDescription("");
          setSelectedAssignees([]);
          setParentTask(null);
          setPriorityOverride(null);
          setDueDate("");
          setIsOpen(false);
          showSuccess("Task created");
        },
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
              <Modal.Heading className="font-semibold">New task</Modal.Heading>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Body className="p-1">
                {/* Title — most important field, gets the most visual weight */}
                <div className="mb-5">
                  <TextField>
                    <Label className="text-xs font-medium text-muted">Title</Label>
                    <Input
                      className="mt-1 text-base"
                      placeholder="What needs to be done?"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="mt-1 text-xs text-danger">{errors.title.message}</p>
                    )}
                  </TextField>
                </div>

                {/* Meta row: Priority + Due Date side by side */}
                <div className="mb-5 grid grid-cols-2 gap-3">
                  <div>
                    <Select
                      aria-label="Task priority"
                      value={priority}
                      onChange={(key) => setPriorityOverride(key as ETaskPriority)}
                    >
                      <Label className="text-xs font-medium text-muted">Priority</Label>
                      <Select.Trigger className="mt-1 flex w-full items-center justify-between rounded-lg border border-default-200 bg-surface p-2">
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
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted">Due date</Label>
                    <div className="relative mt-1">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted">
                        <BiCalendar size={15} />
                      </span>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="h-[38px] w-full rounded-lg border border-default-200 bg-surface pl-8 pr-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                      {dueDate && (
                        <button
                          type="button"
                          onClick={() => setDueDate("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                          aria-label="Clear due date"
                        >
                          <BiX size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assignees */}
                <div className="mb-5">
                  <Select
                    fullWidth
                    placeholder="Select assignees"
                    selectionMode="multiple"
                    value={selectedAssignees}
                    onChange={(keys) => setSelectedAssignees(keys as string[])}
                  >
                    <Label className="text-xs font-medium text-muted">Assignees</Label>
                    {isLoading ? (
                      <Skeleton className="mt-1 h-9.5 w-full" />
                    ) : (
                      <Select.Trigger className="mt-1 flex w-full items-center justify-between rounded-lg border border-default-200 bg-surface p-2">
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
                </div>

                {/* Parent task — optional hierarchy link */}
                <div className="mb-5 space-y-1.5">
                  <Label className="text-xs font-medium text-muted">Parent task</Label>
                  {parentTask ? (
                    <div className="mt-1 flex items-center justify-between rounded-lg border border-default-200 px-3 py-2">
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
                    <div className="mt-1">
                      <TaskRelationCombobox
                        projectId={projectId}
                        onSelect={setParentTask}
                        placeholder="Search a parent task…"
                      />
                    </div>
                  )}
                </div>

                {/* Description — full width, last field */}
                <div className="mb-1">
                  <TextField>
                    <Label className="text-xs font-medium text-muted">Description</Label>
                    <div className="mt-1">
                      <TiptapEditor
                        users={data?.data}
                        value={description}
                        onChange={setDescription}
                      />
                    </div>
                  </TextField>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <CustomButton
                  className="font-semibold"
                  title="Create task"
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
