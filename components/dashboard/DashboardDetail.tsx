"use client";

import { ETaskStatus } from "@/enum/taskStatus.enum";
import { useGetProjectMembers } from "@/hooks/member/useGetProjectMembers";
import { useGetTaskBoard } from "@/hooks/taskboard/useGetTaskBoard";
import { useSessionStore } from "@/store/session.store";

import DashboardActivity from "./DashboardActivity";
import AssignedToMe, { AssignedTask } from "./Sections/AssignedToMe";
import BoardColumnsCard from "./Sections/BoardColumnsCard";
import MembersOverview from "./Sections/MembersOverview";
import OverallProgress from "./Sections/OverallProgress";
import StatCard from "./Sections/StatCard";

export default function DashboardDetail() {
  const userId = useSessionStore((s) => s.userId);
  const projectId = useSessionStore((s) => s.projectId);

  const { data: boards } = useGetTaskBoard({
    userId: userId ?? "",
    projectId: projectId ?? "",
  });
  const { data: members } = useGetProjectMembers({ projectId });

  const allBoards = boards ?? [];
  const allTasks = allBoards.flatMap((board) =>
    board.tasks.map((task) => ({ ...task, boardTitle: board.title })),
  );

  // Progress is driven by each task's `status` field (independent of which
  // board column it sits in), not by board position.
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
    .filter((task) =>
      task.assignees?.some((a) => a.projectMember.user.id === userId),
    )
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
          <MembersOverview members={members} />
        </div>
        <div className="lg:col-span-1">
          <AssignedToMe tasks={assignedTasks} projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
