"use client";

import { ETaskStatus } from "@/enum/taskStatus.enum";
import { useGetDashboardData } from "@/hooks/dashboard/useGetDashboardData";
import { useSessionStore } from "@/store/session.store";

import DashboardActivity from "./DashboardActivity";
import DashboardSkeleton from "./DashboardSkeleton";
import AssignedToMe, { AssignedTask } from "./Sections/AssignedToMe";
import BoardColumnsCard from "./Sections/BoardColumnsCard";
import OverallProgress from "./Sections/OverallProgress";
import OverdueTasksCard from "./Sections/OverdueTasksCard";
import PriorityBreakdown from "./Sections/PriorityBreakdown";
import StatCard from "./Sections/StatCard";
import TeamWorkload from "./Sections/TeamWorkload";
import UpcomingTasksCard from "./Sections/UpcomingTasksCard";

export default function DashboardDetail() {
  const projectId = useSessionStore((s) => s.projectId);

  const { data: dashboardData, isLoading: isLoadingDashboard } =
    useGetDashboardData({ projectId: projectId ?? "" });

  if (isLoadingDashboard) return <DashboardSkeleton />;

  const allBoards = dashboardData?.boards ?? [];
  const overdueTasks = dashboardData?.overdueTasks ?? [];
  const upcomingTasks = dashboardData?.upcomingTasks ?? [];
  const memberWorkload = dashboardData?.memberWorkload ?? [];

  const allTasks = allBoards.flatMap((board) =>
    board.tasks.map((task) => ({ ...task, boardTitle: board.title })),
  );

  const total = allTasks.length;
  const doneCount = allTasks.filter(
    (t) => t.status === ETaskStatus.DONE,
  ).length;
  const inProgressCount = allTasks.filter(
    (t) => t.status === ETaskStatus.IN_PROGRESS,
  ).length;
  const todoCount = allTasks.filter(
    (t) => t.status === ETaskStatus.TODO,
  ).length;

  const donePct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const inProgressPct =
    total > 0 ? Math.round((inProgressCount / total) * 100) : 0;
  const todoPct = total > 0 ? Math.round((todoCount / total) * 100) : 0;

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
    <div className="space-y-4">
      {/* Row 1: Stat cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={total} accent="total" />
        <StatCard
          label="Done"
          value={doneCount}
          accent="completed"
          pct={donePct}
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          accent="progress"
          pct={inProgressPct}
        />
        <StatCard label="Todo" value={todoCount} accent="todo" pct={todoPct} />
      </section>

      {/* Row 2: Progress bar + Priority breakdown */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OverallProgress
            completed={doneCount}
            inProgress={inProgressCount}
            todo={todoCount}
            total={total}
          />
        </div>
        <PriorityBreakdown tasks={allTasks} />
      </div>

      {/* Row 3: Upcoming due + Team workload */}
      <div className="grid gap-4 lg:grid-cols-3">
        <UpcomingTasksCard tasks={upcomingTasks} projectId={projectId} />
        <div className="lg:col-span-2">
          <TeamWorkload members={memberWorkload} />
        </div>
      </div>

      {/* Row 4: Activity feed + Overdue + Assigned to me */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardActivity projectId={projectId} />
        </div>
        <div className="space-y-4">
          <OverdueTasksCard tasks={overdueTasks} projectId={projectId} />
          <AssignedToMe tasks={assignedTasks} projectId={projectId} />
        </div>
      </div>

      {/* Row 5: Board columns */}
      <BoardColumnsCard boards={allBoards} />
    </div>
  );
}
