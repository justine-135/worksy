"use client";

import { Button, Dropdown, ListBox, Select } from "@heroui/react";
import { Modal } from "@heroui/react/modal";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Key } from "react-aria-components";
import { BiCalendar, BiCog, BiTrash, BiX } from "react-icons/bi";

import TaskRelationCombobox from "@/components/board/common/TaskRelationCombobox";
import CustomButton from "@/components/common/custom/CustomButton";
import { QUERY_KEYS } from "@/constant/queryKeys";
import { Permissions } from "@/enum/permissions.enum";
import {
  ETaskStatus,
  TASK_STATUS_LABELS,
  TASK_STATUS_OPTIONS,
} from "@/enum/taskStatus.enum";
import { useApiMessage } from "@/hooks/common/useApiMessage";
import { useGetProjectMembers } from "@/hooks/member/useGetProjectMembers";
import { usePermission } from "@/hooks/permission/usePermission";
import useUpdateTaskAssignees from "@/hooks/task/useUpdateTaskAssignees";
import useUpdateTaskDueDate from "@/hooks/task/useUpdateTaskDueDate";
import useUpdateTaskRelation from "@/hooks/task/useUpdateTaskRelation";
import useUpdateTaskStatus from "@/hooks/task/useUpdateTaskStatus";
import { useGetTaskBoard } from "@/hooks/taskboard/useGetTaskBoard";
import useInvalidateQuery from "@/hooks/taskboard/useInvalidateQuery";
import useSaveTaskPositionMutation from "@/hooks/taskboard/useSaveTaskPositionMutation";
import { useSessionStore } from "@/store/session.store";
import { TaskResponseDTO, TaskSearchResultDTO } from "@/types/task.dto";

import {
  AssigneeDisplay,
  PersonRow,
  SidebarSection,
} from "./TaskDetailParts";

// "parent": move THIS task under the picked task (this.parentId = picked.id).
// "child":  add the picked task as a subtask of THIS task (picked.parentId = this.id).
type RelationType = "parent" | "child";

interface TaskSidebarProps {
  task: TaskResponseDTO;
  onNavigateTask: (taskId: string) => void;
}

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
const TaskSidebar = ({ task, onNavigateTask }: TaskSidebarProps) => {
  const queryClient = useQueryClient();
  const projectId = useSessionStore((s) => s.projectId);

  const { data: boards } = useGetTaskBoard({
    projectId: projectId || "",
  });

  const { invalidateTaskBoards } = useInvalidateQuery(projectId, queryClient);

  const { mutation: saveTaskPosition } = useSaveTaskPositionMutation({
    projectId: projectId || "",
    invalidateTaskBoards,
  });

  const { data: members } = useGetProjectMembers({
    projectId,
    skip: 0,
    take: 100,
  });
  const { mutation: updateAssignees } = useUpdateTaskAssignees();
  const { mutation: updateStatus } = useUpdateTaskStatus();
  const { mutation: updateRelation } = useUpdateTaskRelation();
  const { mutation: updateDueDate } = useUpdateTaskDueDate();
  const { showSuccess, showError } = useApiMessage();

  // Every mutating control in this sidebar (assignees, relationships, column,
  // status) edits the task, so they are all gated behind task.edit. Read-only
  // displays stay visible; only the edit affordances are hidden/disabled.
  const { hasPermission } = usePermission();
  const canEditTask = hasPermission(Permissions.TaskEdit);

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
    if (!projectId) return;

    const edge =
      relationType === "parent"
        ? { parentId: picked.id, childId: task.id }
        : { parentId: task.id, childId: picked.id };

    updateRelation.mutate(
      { ...edge, projectId, action: "add" },
      {
        onSuccess: (result) => {
          setRelationType(null);
          // API message by default ("Task link updated."); the component could
          // override it by passing a second arg to showSuccess.
          showSuccess(result);
        },
        // The server's message (e.g. the cycle-guard reason) reaches the toast.
        onError: (error) => showError(error, "Failed to link task"),
      },
    );
  };

  // Remove the confirmed parent -> this-task edge.
  const confirmRemoveParent = () => {
    if (!projectId || !parentToRemove) return;

    updateRelation.mutate(
      {
        parentId: parentToRemove.id,
        childId: task.id,
        projectId,
        action: "remove",
      },
      {
        onSuccess: (result) => showSuccess(result),
        onError: (error) => showError(error, "Failed to remove link"),
        onSettled: () => setParentToRemove(null),
      },
    );
  };

  // Due date inline editor
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [dueDateInput, setDueDateInput] = useState("");

  const openDueDateEditor = () => {
    const existing = task.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : "";
    setDueDateInput(existing);
    setIsEditingDueDate(true);
  };

  const handleSaveDueDate = (value: string | null) => {
    if (!projectId) return;
    updateDueDate.mutate(
      { taskId: task.id, projectId, dueDate: value },
      {
        onSuccess: () => showSuccess("Due date updated"),
        onError: (error) => showError(error, "Failed to update due date"),
        onSettled: () => setIsEditingDueDate(false),
      },
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
    if (!projectId) return;

    updateAssignees.mutate(
      { taskId: task.id, projectId, assignees: selectedAssignees },
      {
        onSuccess: () => showSuccess("Assignees updated"),
        onError: (error) => showError(error, "Failed to update assignees"),
        onSettled: () => setIsEditingAssignees(false),
      },
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
      { taskId: task.id, taskTitle: task.title, taskBoardId: boardId, orderedTaskIdsByBoard },
      {
        // Refetch the open task so its column, auto-suggested status, and
        // activity timeline update.
        onSettled: () =>
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASK(task.id) }),
      },
    );
  };

  const handleStatusChange = (status?: string) => {
    if (!projectId || !status || status === task.status) return;

    updateStatus.mutate(
      {
        taskId: task.id,
        projectId,
        status: status as ETaskStatus,
      },
      {
        onSuccess: () => showSuccess("Status updated"),
        onError: (error) => showError(error, "Failed to update status"),
      },
    );
  };

  return (
    <aside className="w-64 shrink-0 space-y-6 border-l border-default-200 pl-6">
      <SidebarSection
        title="Assignees"
        action={
          !isEditingAssignees && canEditTask ? (
            <Button
              aria-label="Edit assignees"
              variant="tertiary"
              className="h-6 px-1 text-muted"
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
                  {members?.data.map((member) => (
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
          canEditTask ? (
            <Dropdown>
              <Dropdown.Trigger
                aria-label="Add relationship"
                className="flex h-6 items-center justify-center rounded-md px-1 text-muted outline-none hover:bg-default-100"
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
          ) : undefined
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
                  <span className="mr-1 text-xs font-medium text-subtle">
                    #{parent.ticketNumber}
                  </span>
                  {parent.title}
                </button>
                {canEditTask && (
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
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-subtle">No parent</p>
        )}
      </SidebarSection>

      <SidebarSection title="Column">
        <Select
          aria-label="Task column"
          value={task.taskBoardId}
          onChange={(key) => handleColumnChange(key as string)}
          isDisabled={saveTaskPosition.isPending || !canEditTask}
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
          isDisabled={updateStatus.isPending || !canEditTask}
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

      <SidebarSection
        title="Due date"
        action={
          !isEditingDueDate && canEditTask ? (
            <Button
              aria-label="Edit due date"
              variant="tertiary"
              className="h-6 px-1 text-muted"
              onClick={openDueDateEditor}
            >
              <BiCog className="size-4" />
            </Button>
          ) : null
        }
      >
        {isEditingDueDate ? (
          <div className="space-y-2">
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted">
                <BiCalendar size={14} />
              </span>
              <input
                type="date"
                value={dueDateInput}
                onChange={(e) => setDueDateInput(e.target.value)}
                className="h-9 w-full rounded-lg border border-default-200 bg-surface pl-8 pr-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              {dueDateInput && (
                <Button
                  variant="tertiary"
                  className="h-7 px-2 text-sm text-danger"
                  type="button"
                  onClick={() => handleSaveDueDate(null)}
                  isDisabled={updateDueDate.isPending}
                >
                  <BiX className="size-4" />
                  Clear
                </Button>
              )}
              <Button
                variant="tertiary"
                className="h-7 px-2 text-sm"
                onClick={() => setIsEditingDueDate(false)}
                isDisabled={updateDueDate.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="h-7 px-3 text-sm"
                onClick={() => handleSaveDueDate(dueDateInput || null)}
                isDisabled={updateDueDate.isPending}
              >
                Save
              </Button>
            </div>
          </div>
        ) : task.dueDate ? (
          (() => {
            const due = new Date(task.dueDate);
            const isOverdue = due < new Date() && task.status !== "DONE";
            return (
              <div
                className={`flex items-center gap-1.5 text-sm ${isOverdue ? "text-danger font-medium" : "text-foreground"}`}
              >
                <BiCalendar className="size-4 shrink-0" />
                {due.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {isOverdue && (
                  <span className="text-xs font-normal text-danger">
                    (overdue)
                  </span>
                )}
              </div>
            );
          })()
        ) : (
          <p className="text-sm text-subtle">No due date</p>
        )}
      </SidebarSection>

      <SidebarSection title="Participants">
        <div className="space-y-2">
          {participants.map((person) => (
            <PersonRow
              key={person.name}
              name={person.name}
              image={person.image}
            />
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
              <p className="text-sm text-muted">
                Remove{" "}
                <span className="font-medium text-foreground">
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

export default TaskSidebar;
