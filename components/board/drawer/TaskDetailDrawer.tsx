"use client";

import {
  Button,
  Card,
  Drawer,
  Dropdown,
  Form,
  ListBox,
  Select,
  Skeleton,
  toast,
  Typography,
} from "@heroui/react";
import { Modal } from "@heroui/react/modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Key } from "react-aria-components";
import { useForm } from "react-hook-form";
import { BiCog, BiTrash } from "react-icons/bi";

import TaskRelationCombobox from "@/components/board/common/TaskRelationCombobox";
import ActivityLog from "@/components/common/ActivityLog";
import CustomAvatar from "@/components/common/custom/CustomAvatar";
import CustomButton from "@/components/common/custom/CustomButton";
import TiptapEditor from "@/components/common/TiptapEditor";
import { QUERY_KEYS } from "@/constant/queryKeys";
import { EActivityLog } from "@/enum/activityLog.enum";
import {
  ETaskStatus,
  TASK_STATUS_LABELS,
  TASK_STATUS_OPTIONS,
} from "@/enum/taskStatus.enum";
import useCreateComment from "@/hooks/activity/useCreateComment";
import { useGetProjectMembers } from "@/hooks/member/useGetProjectMembers";
import { useGetTaskDetail } from "@/hooks/task/useGetTaskDetail";
import useUpdateTaskAssignees from "@/hooks/task/useUpdateTaskAssignees";
import useUpdateTaskRelation from "@/hooks/task/useUpdateTaskRelation";
import useUpdateTaskStatus from "@/hooks/task/useUpdateTaskStatus";
import { useGetTaskBoard } from "@/hooks/taskboard/useGetTaskBoard";
import useInvalidateQuery from "@/hooks/taskboard/useInvalidateQuery";
import useSaveTaskPositionMutation from "@/hooks/taskboard/useSaveTaskPositionMutation";
import { useGetUser } from "@/hooks/user/useGetUser";
import {
  CreateCommentInput,
  createCommentSchema,
} from "@/lib/validations/createComment.schema";
import { useSessionStore } from "@/store/session.store";
import { TaskResponseDTO, TaskSearchResultDTO } from "@/types/task.dto";
import { timeAgo } from "@/utils/timeAgo";

// "parent": move THIS task under the picked task (this.parentId = picked.id).
// "child":  add the picked task as a subtask of THIS task (picked.parentId = this.id).
type RelationType = "parent" | "child";

const CommentForm = ({
  projectId,
  taskId,
}: {
  projectId?: string;
  taskId?: string;
}) => {
  const userId = useSessionStore((s) => s.userId);
  const { data: currentUser } = useGetUser({ userId });
  const { mutation } = useCreateComment({ taskId });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
  });

  const onSubmit = (data: CreateCommentInput) => {
    if (!projectId || !userId || !taskId || !data) return;

    mutation.mutate(
      {
        ...data,
        taskId,
        projectId,
        userId,
        type: EActivityLog.COMMENT,
      },
      {
        onSuccess: () => {
          reset();
          toast("Task board is created");
        },
        onError: () => {
          reset();
          toast.danger("Task not created");
        },
      },
    );
  };

  return (
    <div className="flex gap-4 mt-8">
      <CustomAvatar
        avatarProps={{ className: "size-10" }}
        avatarImageProps={{
          src: currentUser.image || "",
          alt: currentUser.name,
        }}
        avatarFallbackProps={{ className: "text-xs" }}
        fallback={currentUser.name || ""}
      />
      <Form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col space-y-6 w-full">
          <Typography.Heading level={6} className="mt-2">
            Add comment
          </Typography.Heading>
          <TiptapEditor
            onChange={(e) => {
              setValue("value", e);
            }}
          />
          {errors.value && <p>{errors.value.message}</p>}
          <CustomButton
            title="Submit"
            loadingTitle="Submitting"
            type="submit"
            isPending={mutation.isPending}
            className="ml-auto"
          />
        </div>
      </Form>
    </div>
  );
};

/**
 * A simple avatar + name row, reused for the Assignees and Participants lists
 * in the right-hand sidebar.
 */
const PersonRow = ({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) => (
  <div className="flex items-center gap-2">
    <CustomAvatar
      avatarProps={{ className: "size-7 shrink-0" }}
      avatarImageProps={{ src: image || "", alt: name }}
      avatarFallbackProps={{ className: "text-xs" }}
      fallback={name}
    />
    <span className="truncate text-sm text-gray-700">{name}</span>
  </div>
);

const SidebarSection = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h4>
      {action}
    </div>
    {children}
  </div>
);

/**
 * Read-only assignee display: a single assignee shows avatar + name, while
 * multiple assignees collapse into the overlapping-avatar stack used on the
 * board's task cards (no names).
 */
const AssigneeDisplay = ({
  assignees,
}: {
  assignees: { name: string; image?: string | null }[];
}) => {
  if (assignees.length === 0) {
    return <p className="text-sm text-gray-400">No one assigned</p>;
  }

  if (assignees.length === 1) {
    return <PersonRow name={assignees[0].name} image={assignees[0].image} />;
  }

  return (
    <div className="flex -space-x-1">
      {assignees.slice(0, 6).map((assignee, idx) => (
        <CustomAvatar
          key={idx}
          avatarProps={{ className: "size-6 shrink-0" }}
          avatarImageProps={{ src: assignee.image || "", alt: assignee.name }}
          avatarFallbackProps={{ className: "text-xs" }}
          fallback={assignee.name}
        />
      ))}
    </div>
  );
};

/**
 * Subtasks (child tasks) shown below the description. Each row deep-links to the
 * child's own drawer.
 */
const SubtaskList = ({
  subtasks,
  onNavigate,
}: {
  subtasks: NonNullable<TaskResponseDTO["children"]>;
  onNavigate: (taskId: string) => void;
}) => (
  <div className="mt-6 space-y-2">
    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
      Subtasks
    </h4>
    <div className="divide-y divide-default-100 rounded-lg border border-default-200">
      {subtasks.map((child) => (
        <button
          key={child.id}
          type="button"
          onClick={() => onNavigate(child.id)}
          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-gray-50"
        >
          <span className="min-w-0 truncate text-sm">
            <span className="mr-1 text-xs font-medium text-gray-400">
              #{child.ticketNumber}
            </span>
            {child.title}
          </span>
          <span className="shrink-0 text-xs text-gray-500">
            {TASK_STATUS_LABELS[child.status]}
          </span>
        </button>
      ))}
    </div>
  </div>
);

/**
 * Right-hand sidebar: Assignees, the Column dropdown (which board the task
 * lives in), the Status dropdown (Todo / In Progress / Done — independent of
 * the column), and Participants (creator + assignees combined).
 *
 * Changing the Column reuses the same position-save flow that drag-and-drop
 * uses: we hand the API a fresh ordering for every board with the task removed
 * from its old column and appended to the chosen one. The server then
 * auto-suggests a matching status. Status can also be set directly here.
 */
const TaskSidebar = ({
  task,
  onNavigateTask,
}: {
  task: TaskResponseDTO;
  onNavigateTask: (taskId: string) => void;
}) => {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.userId);
  const projectId = useSessionStore((s) => s.projectId);

  const { data: boards } = useGetTaskBoard({
    userId: userId || "",
    projectId: projectId || "",
  });

  const { invalidateTaskBoards } = useInvalidateQuery(
    projectId,
    userId,
    queryClient,
  );

  const { mutation: saveTaskPosition } = useSaveTaskPositionMutation({
    userId: userId || "",
    projectId: projectId || "",
    invalidateTaskBoards,
  });

  const { data: members } = useGetProjectMembers({ projectId });
  const { mutation: updateAssignees } = useUpdateTaskAssignees();
  const { mutation: updateStatus } = useUpdateTaskStatus();
  const { mutation: updateRelation } = useUpdateTaskRelation();

  // The relationship direction chosen from the cog dropdown (null = closed, so
  // the section shows its read-only parents list instead of the picker).
  const [relationType, setRelationType] = useState<RelationType | null>(null);
  // The parent link queued for removal (drives the confirmation modal).
  const [parentToRemove, setParentToRemove] = useState<{
    id: string;
    ticketNumber: number;
    title: string;
  } | null>(null);

  // Add one parent -> child edge. The direction picks which end is THIS task:
  //   "parent" → add the picked task as a parent of this task.
  //   "child"  → add the picked task as a subtask (child) of this task.
  // The server rejects cycles (self / would-be loop), surfaced via the toast.
  const handleSelectRelation = (picked: TaskSearchResultDTO) => {
    if (!projectId || !userId) return;

    const edge =
      relationType === "parent"
        ? { parentId: picked.id, childId: task.id }
        : { parentId: task.id, childId: picked.id };

    updateRelation.mutate(
      { ...edge, projectId, userId, action: "add" },
      {
        onSuccess: () => setRelationType(null),
        onError: (error) =>
          toast.danger(
            error instanceof Error ? error.message : "Failed to link task",
          ),
      },
    );
  };

  // Remove the confirmed parent -> this-task edge.
  const confirmRemoveParent = () => {
    if (!projectId || !userId || !parentToRemove) return;

    updateRelation.mutate(
      {
        parentId: parentToRemove.id,
        childId: task.id,
        projectId,
        userId,
        action: "remove",
      },
      { onSettled: () => setParentToRemove(null) },
    );
  };

  // Toggles the assignee editor (cog button) and tracks the in-progress
  // selection of projectMember ids while editing.
  const [isEditingAssignees, setIsEditingAssignees] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const assigneeUsers =
    task.assignees?.map((assignee) => assignee.projectMember.user) ?? [];
  const currentAssigneeIds =
    task.assignees?.map((assignee) => assignee.projectMember.id) ?? [];

  const openAssigneeEditor = () => {
    setSelectedAssignees(currentAssigneeIds);
    setIsEditingAssignees(true);
  };

  const handleSaveAssignees = () => {
    if (!projectId || !userId) return;

    updateAssignees.mutate(
      { taskId: task.id, projectId, userId, assignees: selectedAssignees },
      { onSettled: () => setIsEditingAssignees(false) },
    );
  };

  // Participants = creator + assignees, de-duplicated by name (the creator
  // payload only carries name/image, so name is the only key we share).
  const seen = new Set<string>();
  const participants = [
    { name: task.createdBy.user.name || "", image: task.createdBy.user.image },
    ...assigneeUsers.map((user) => ({ name: user.name, image: user.image })),
  ].filter((person) => {
    if (!person.name || seen.has(person.name)) return false;
    seen.add(person.name);
    return true;
  });

  const handleColumnChange = (boardId?: string) => {
    if (!boardId || !boards || boardId === task.taskBoardId) return;

    // Rebuild every board's ordering with the task pulled out of its current
    // column and appended to the target column — matching the drag-drop payload.
    const orderedTaskIdsByBoard = boards.map((board) => {
      const taskIds = board.tasks
        .map((columnTask) => columnTask.id)
        .filter((id) => id !== task.id);

      if (board.id === boardId) taskIds.push(task.id);

      return { taskBoardId: board.id, taskIds };
    });

    saveTaskPosition.mutate(
      { taskId: task.id, taskBoardId: boardId, orderedTaskIdsByBoard },
      {
        // Refetch the open task so its column, auto-suggested status, and
        // activity timeline update.
        onSettled: () =>
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASK(task.id) }),
      },
    );
  };

  const handleStatusChange = (status?: string) => {
    if (!projectId || !userId || !status || status === task.status) return;

    updateStatus.mutate({
      taskId: task.id,
      projectId,
      userId,
      status: status as ETaskStatus,
    });
  };

  return (
    <aside className="w-64 shrink-0 space-y-6 border-l border-default-200 pl-6">
      <SidebarSection
        title="Assignees"
        action={
          !isEditingAssignees ? (
            <Button
              aria-label="Edit assignees"
              variant="tertiary"
              className="h-6 px-1 text-gray-500"
              onClick={openAssigneeEditor}
            >
              <BiCog className="size-4" />
            </Button>
          ) : null
        }
      >
        {isEditingAssignees ? (
          <div className="space-y-3">
            <Select
              fullWidth
              aria-label="Select assignees"
              placeholder="Select assignees"
              selectionMode="multiple"
              value={selectedAssignees}
              onChange={(keys) => setSelectedAssignees(keys as string[])}
            >
              <Select.Trigger className="flex w-full items-center justify-between rounded-lg border border-default-200 bg-surface p-2">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox selectionMode="multiple">
                  {members.map((member) => (
                    <ListBox.Item
                      id={member.id}
                      key={member.id}
                      textValue={member.name}
                      className="flex items-center gap-2"
                    >
                      {member.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            <div className="flex justify-end gap-2">
              <Button
                variant="tertiary"
                className="h-7 px-2 text-sm"
                onClick={() => setIsEditingAssignees(false)}
                isDisabled={updateAssignees.isPending}
              >
                Cancel
              </Button>
              <CustomButton
                type="button"
                title="Save"
                loadingTitle="Saving"
                className="h-7 px-3 text-sm"
                onClick={handleSaveAssignees}
                isPending={updateAssignees.isPending}
              />
            </div>
          </div>
        ) : (
          <AssigneeDisplay
            assignees={assigneeUsers.map((user) => ({
              name: user.name,
              image: user.image,
            }))}
          />
        )}
      </SidebarSection>

      <SidebarSection
        title="Relationships"
        action={
          <Dropdown>
            <Dropdown.Trigger
              aria-label="Add relationship"
              className="flex h-6 items-center justify-center rounded-md px-1 text-gray-500 outline-none hover:bg-default-100"
            >
              <BiCog className="size-4" />
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu
                aria-label="Add relationship"
                className="min-w-44 p-1"
                onAction={(key: Key) => setRelationType(key as RelationType)}
              >
                <Dropdown.Item id="parent" textValue="Add a parent">
                  Add a parent
                </Dropdown.Item>
                <Dropdown.Item id="child" textValue="Add a subtask">
                  Add a subtask
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        }
      >
        {relationType ? (
          <div className="space-y-3">
            <TaskRelationCombobox
              projectId={projectId}
              // Exclude self + already-linked tasks so they can't be picked twice.
              excludeTaskIds={[
                task.id,
                ...(relationType === "parent"
                  ? (task.parents ?? []).map((p) => p.id)
                  : (task.children ?? []).map((c) => c.id)),
              ]}
              onSelect={handleSelectRelation}
              isPending={updateRelation.isPending}
              placeholder={
                relationType === "parent"
                  ? "Search a parent task…"
                  : "Search a task to add as a subtask…"
              }
            />

            <div className="flex justify-end">
              <Button
                variant="tertiary"
                className="h-7 px-2 text-sm"
                onClick={() => setRelationType(null)}
                isDisabled={updateRelation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : task.parents && task.parents.length > 0 ? (
          // This task can have multiple parents — list each with a link
          // (deep-links via ?task=) and a destructive remove.
          <ul className="space-y-1">
            {task.parents.map((parent) => (
              <li
                key={parent.id}
                className="flex items-center justify-between gap-2"
              >
                <button
                  type="button"
                  onClick={() => onNavigateTask(parent.id)}
                  className="min-w-0 truncate text-left text-sm text-primary hover:underline"
                >
                  <span className="mr-1 text-xs font-medium text-gray-400">
                    #{parent.ticketNumber}
                  </span>
                  {parent.title}
                </button>
                <Button
                  aria-label={`Remove parent ${parent.title}`}
                  variant="danger"
                  isIconOnly
                  className="h-6 w-6 shrink-0 p-0"
                  onClick={() => setParentToRemove(parent)}
                  isDisabled={updateRelation.isPending}
                >
                  <BiTrash className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No parent</p>
        )}
      </SidebarSection>

      <SidebarSection title="Column">
        <Select
          aria-label="Task column"
          value={task.taskBoardId}
          onChange={(key) => handleColumnChange(key as string)}
          isDisabled={saveTaskPosition.isPending}
        >
          <Select.Trigger className="flex w-full items-center justify-between rounded-lg border border-default-200 bg-surface p-2">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {(boards ?? []).map((board) => (
                <ListBox.Item
                  id={board.id}
                  key={board.id}
                  textValue={board.title}
                  className="flex items-center justify-between gap-2"
                >
                  {board.title}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </SidebarSection>

      <SidebarSection title="Status">
        <Select
          aria-label="Task status"
          value={task.status}
          onChange={(key) => handleStatusChange(key as string)}
          isDisabled={updateStatus.isPending}
        >
          <Select.Trigger className="flex w-full items-center justify-between rounded-lg border border-default-200 bg-surface p-2">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {TASK_STATUS_OPTIONS.map((status) => (
                <ListBox.Item
                  id={status}
                  key={status}
                  textValue={TASK_STATUS_LABELS[status]}
                  className="flex items-center justify-between gap-2"
                >
                  {TASK_STATUS_LABELS[status]}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </SidebarSection>

      <SidebarSection title="Participants">
        <div className="space-y-2">
          {participants.map((person, idx) => (
            <PersonRow key={idx} name={person.name} image={person.image} />
          ))}
        </div>
      </SidebarSection>

      {/* Confirmation before removing a parent link. */}
      <Modal.Backdrop
        isOpen={!!parentToRemove}
        onOpenChange={(open) => {
          if (!open) setParentToRemove(null);
        }}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="font-semibold">
                Remove parent link
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-gray-600">
                Remove{" "}
                <span className="font-medium text-gray-900">
                  #{parentToRemove?.ticketNumber} {parentToRemove?.title}
                </span>{" "}
                as a parent of this task? This only unlinks them — no task is
                deleted.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="tertiary"
                onClick={() => setParentToRemove(null)}
                isDisabled={updateRelation.isPending}
              >
                Cancel
              </Button>
              <CustomButton
                type="button"
                variant="danger"
                title="Remove"
                loadingTitle="Removing"
                onClick={confirmRemoveParent}
                isPending={updateRelation.isPending}
              />
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </aside>
  );
};

/**
 * Placeholder shown while the task detail query is in flight. Mirrors the real
 * drawer's two-column layout (details/activity on the left, sidebar on the
 * right) so the content doesn't visually jump when data arrives.
 */
const TaskDetailSkeleton = () => (
  <div className="flex gap-6">
    {/* Left: author row + description + activity/comment placeholders */}
    <div className="min-w-0 flex-1">
      <div className="flex gap-4">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-1 h-32 w-full rounded-xl" />
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex gap-4">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex w-full flex-col gap-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Right: sidebar sections (assignees, column, status, participants) */}
    <aside className="w-64 shrink-0 space-y-6 border-l border-default-200 pl-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      ))}
    </aside>
  </div>
);

interface TaskDetailDrawerProps {
  id: string;
  title: string;
}

export default function TaskDetailDrawer({ id, title }: TaskDetailDrawerProps) {
  const [manualOpen, setManualOpen] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDeepLinked = searchParams.get("task") === id;

  // Open when the user clicks the title OR when the board is deep-linked with
  // `?task=<id>` (e.g. from a member's activity feed). Deriving `isOpen` from
  // the URL avoids syncing state in an effect.
  const isOpen = manualOpen || isDeepLinked;

  const { data, isLoading } = useGetTaskDetail({ id, isOpen });

  const handleOpenChange = (open: boolean) => {
    setManualOpen(open);
    // Strip the deep-link param on close so the URL stays clean and the drawer
    // doesn't immediately re-open from the derived state.
    if (!open && isDeepLinked) {
      router.replace(pathname);
    }
  };

  // Close this drawer and open another task's via the `?task=` deep-link (used by
  // the parent link and subtask rows). Clearing manualOpen lets the current
  // drawer close once the URL no longer points at it.
  const navigateToTask = (taskId: string) => {
    setManualOpen(false);
    router.push(`${pathname}?task=${taskId}`);
  };

  const createdBy = {
    src: data?.createdBy.user.image,
    name: data?.createdBy.user.name || "",
  };

  return (
    <div>
      <Drawer>
        <span
          onClick={() => handleOpenChange(true)}
          className="hover:bg-transparent hover:underline cursor-pointer"
        >
          {title}
        </span>
        <Drawer.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="min-w-5xl max-w-[95vw]">
              {/* Stop pointer events from bubbling to the parent task card's
                  drag-and-drop listeners — React events propagate through the
                  component tree even though the drawer is portaled, so without
                  this, dragging inside the drawer would start a task drag. */}
              <Drawer.Header onPointerDown={(e) => e.stopPropagation()}>
                {title}
              </Drawer.Header>
              <Drawer.Body
                className="max-h-[89vh] min-h-[85vh] pt-6"
                onPointerDown={(e) => e.stopPropagation()}
              >
                {isLoading || !data ? (
                  <TaskDetailSkeleton />
                ) : (
                  <div className="flex gap-6">
                    {/* Left: task details, activity, comments */}
                    <div className="min-w-0 flex-1">
                      <div className="flex gap-4">
                        <CustomAvatar
                          avatarProps={{ className: "size-10" }}
                          avatarImageProps={{
                            src: createdBy.src || "",
                            alt: createdBy.name,
                          }}
                          avatarFallbackProps={{ className: "text-xs" }}
                          fallback={createdBy.name}
                        />
                        <div className="flex flex-col w-full">
                          <div className="space-x-1">
                            <span className="text-sm font-semibold text-gray-900 hover:underline cursor-pointer">
                              {createdBy.name}
                            </span>
                            <span>opened {timeAgo(data.createdAt)}</span>
                          </div>
                          <Card className="w-full border shadow-xs min-h-50 mt-1">
                            <div
                              dangerouslySetInnerHTML={{
                                __html:
                                  data.description || "<i>No description</i>",
                              }}
                            />
                          </Card>
                        </div>
                      </div>
                      {data.children && data.children.length > 0 && (
                        <SubtaskList
                          subtasks={data.children}
                          onNavigate={navigateToTask}
                        />
                      )}
                      <ActivityLog data={data.activityLog} />
                      <CommentForm projectId={data.projectId} taskId={data.id} />
                    </div>

                    {/* Right: assignees, relationships, status, participants */}
                    <TaskSidebar task={data} onNavigateTask={navigateToTask} />
                  </div>
                )}
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}
