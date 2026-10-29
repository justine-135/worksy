"use client";

import { Button, Card, Drawer } from "@heroui/react";
import DOMPurify from "dompurify";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import ActivityLog from "@/components/common/ActivityLog";
import CustomAvatar from "@/components/common/custom/CustomAvatar";
import { Permissions } from "@/enum/permissions.enum";
import { usePermission } from "@/hooks/permission/usePermission";
import { useGetTaskDetail } from "@/hooks/task/useGetTaskDetail";
import { timeAgo } from "@/utils/timeAgo";

import CommentForm from "./CommentForm";
import { TaskDetailDrawerSkeleton } from "./TaskDetailDrawerSkeleton";
import { SubtaskList } from "./TaskDetailParts";
import TaskSidebar from "./TaskSidebar";

interface TaskDetailDrawerProps {
  id: string;
  title: string;
}

export default function TaskDetailDrawer({ id, title }: TaskDetailDrawerProps) {
  const [manualOpen, setManualOpen] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Viewing a task's details requires task.view. Without it the title stays as
  // plain, non-clickable text and the drawer never opens — including via the
  // `?task=` deep-link (isOpen is forced false, so no detail is fetched).
  const { hasPermission } = usePermission();
  const canViewTask = hasPermission(Permissions.TaskView);

  const isDeepLinked = searchParams.get("task") === id;

  // Open when the user clicks the title OR when the board is deep-linked with
  // `?task=<id>` (e.g. from a member's activity feed). Deriving `isOpen` from
  // the URL avoids syncing state in an effect.
  const isOpen = canViewTask && (manualOpen || isDeepLinked);

  const { data, isLoading } = useGetTaskDetail({ id, isOpen });

  const handleOpenChange = (open: boolean) => {
    setManualOpen(open);
    // Strip the deep-link param on close so the URL stays clean and the drawer
    // doesn't immediately re-open from the derived state.
    if (!open && isDeepLinked) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("task");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
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
        <Button
          variant="ghost"
          isDisabled={!canViewTask}
          onPress={canViewTask ? () => handleOpenChange(true) : undefined}
          className={
            canViewTask
              ? "h-auto min-w-0 p-0 text-left hover:bg-transparent hover:underline"
              : "h-auto min-w-0 p-0 text-left cursor-default"
          }
        >
          {title}
        </Button>
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
                  <TaskDetailDrawerSkeleton />
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
                            <span className="text-sm font-semibold text-foreground hover:underline cursor-pointer">
                              {createdBy.name}
                            </span>
                            <span>opened {timeAgo(data.createdAt)}</span>
                          </div>
                          <Card className="w-full border shadow-xs min-h-50 mt-1">
                            {/* Sanitize before injecting: the description is
                                user-authored HTML from Tiptap, so strip any
                                script/handler that could slip through. */}
                            <div
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                  data.description || "<i>No description</i>",
                                ),
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
                      <CommentForm
                        projectId={data.projectId}
                        taskId={data.id}
                        currentUser={data.currentUser}
                      />
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
