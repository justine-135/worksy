"use client";

import {
  Button,
  Card,
  Drawer,
  Form,
  ListBox,
  Select,
  toast,
  Typography,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiCog } from "react-icons/bi";

import ActivityLog from "@/components/common/ActivityLog";
import CustomAvatar from "@/components/common/custom/CustomAvatar";
import CustomButton from "@/components/common/custom/CustomButton";
import TiptapEditor from "@/components/common/TiptapEditor";
import { QUERY_KEYS } from "@/constant/queryKeys";
import { EActivityLog } from "@/enum/activityLog.enum";
import useCreateComment from "@/hooks/activity/useCreateComment";
import { useGetProjectMembers } from "@/hooks/member/useGetProjectMembers";
import { useGetTaskDetail } from "@/hooks/task/useGetTaskDetail";
import useUpdateTaskAssignees from "@/hooks/task/useUpdateTaskAssignees";
import { useGetTaskBoard } from "@/hooks/taskboard/useGetTaskBoard";
import useInvalidateQuery from "@/hooks/taskboard/useInvalidateQuery";
import useSaveTaskPositionMutation from "@/hooks/taskboard/useSaveTaskPositionMutation";
import { useGetUser } from "@/hooks/user/useGetUser";
import {
  CreateCommentInput,
  createCommentSchema,
} from "@/lib/validations/createComment.schema";
import { useSessionStore } from "@/store/session.store";
import { TaskResponseDTO } from "@/types/task.dto";
import { timeAgo } from "@/utils/timeAgo";

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
 * Right-hand sidebar: Assignees, the status dropdown (which board the task
 * lives in), and Participants (creator + assignees combined).
 *
 * "Status" in this app is just which TaskBoard column the task sits in, so
 * changing it reuses the same position-save flow that drag-and-drop uses:
 * we hand the API a fresh ordering for every board with the task removed from
 * its old column and appended to the chosen one.
 */
const TaskSidebar = ({ task }: { task: TaskResponseDTO }) => {
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

  const handleStatusChange = (boardId?: string) => {
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
        // Refetch the open task so its status + activity timeline update.
        onSettled: () =>
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASK(task.id) }),
      },
    );
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

      <SidebarSection title="Status">
        <Select
          aria-label="Task status"
          value={task.taskBoardId}
          onChange={(key) => handleStatusChange(key as string)}
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

      <SidebarSection title="Participants">
        <div className="space-y-2">
          {participants.map((person, idx) => (
            <PersonRow key={idx} name={person.name} image={person.image} />
          ))}
        </div>
      </SidebarSection>
    </aside>
  );
};

interface TaskDetailDrawerProps {
  id: string;
  title: string;
}

export default function TaskDetailDrawer({ id, title }: TaskDetailDrawerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data, isLoading } = useGetTaskDetail({ id, isOpen });

  const handleOpenChange = () => {
    setIsOpen(!isOpen);
  };

  const createdBy = {
    src: data?.createdBy.user.image,
    name: data?.createdBy.user.name || "",
  };

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
                  "Loading"
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
                      <ActivityLog data={data.activityLog} />
                      <CommentForm projectId={data.projectId} taskId={data.id} />
                    </div>

                    {/* Right: assignees, status, participants */}
                    <TaskSidebar task={data} />
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
