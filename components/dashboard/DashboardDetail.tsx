"use client";

import { ETaskStatus } from "@/enum/taskStatus.enum";
import { useGetDashboardData } from "@/hooks/dashboard/useGetDashboardData";
import { useGetProjectMembers } from "@/hooks/member/useGetProjectMembers";
import { useSessionStore } from "@/store/session.store";

import DashboardActivity from "./DashboardActivity";
import DashboardSkeleton from "./DashboardSkeleton";
import AssignedToMe, { AssignedTask } from "./Sections/AssignedToMe";
import BoardColumnsCard from "./Sections/BoardColumnsCard";
import MembersOverview from "./Sections/MembersOverview";
import OverallProgress from "./Sections/OverallProgress";
import StatCard from "./Sections/StatCard";

export default function DashboardDetail() {
  const projectId = useSessionStore((s) => s.projectId);

  const { data: dashboardData, isLoading: isLoadingDashboard } =
    useGetDashboardData({
      projectId: projectId ?? "",
    });

  const { data: members, isLoading: isLoadingMembers } = useGetProjectMembers({
    projectId,
    skip: 0,
    take: 100,
  });

  if (isLoadingDashboard || isLoadingMembers) return <DashboardSkeleton />;

  const allBoards = dashboardData ?? [];
  const allTasks = allBoards.flatMap((board) =>
    board.tasks.map((task) => ({ ...task, boardTitle: board.title })),
  );

  const total = allTasks.length;
  const doneCount = allTasks.filter(
    (task) => task.status === ETaskStatus.DONE,
  ).length;
  const inProgressCount = allTasks.filter(
    (task) => task.status === ETaskStatus.IN_PROGRESS,
  ).length;
  const todoCount = allTasks.filter(
    (task) => task.status === ETaskStatus.TODO,
  ).length;

  const assignedTasks: AssignedTask[] = allTasks
    .filter((task) => task.assignees.length > 0)
    .map((task) => ({
      id: task.id,
      ticketNumber: task.ticketNumber,
      title: task.title,
      priority: task.priority,
      boardTitle: task.boardTitle,
    }));

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={total} accent="total" />
        <StatCard label="Done" value={doneCount} accent="completed" />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          accent="progress"
        />
        <StatCard label="Todo" value={todoCount} accent="todo" />
      </section>

      <OverallProgress completed={doneCount} total={total} />

      <BoardColumnsCard boards={allBoards} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DashboardActivity projectId={projectId} />
          <MembersOverview members={members?.data} />
        </div>
        <div className="lg:col-span-1">
          <AssignedToMe tasks={assignedTasks} projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
