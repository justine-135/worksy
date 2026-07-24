import type { Prisma } from "@prisma/client";

import { touchProjectActivity } from "@/db/projectMember.db";
import { EActivityLog } from "@/enum/activityLog.enum";
import { NotificationType } from "@/enum/notifications.enum";
import { ETaskStatus } from "@/enum/taskStatus.enum";
import { prisma } from "@/lib/prisma";
import {
  CreateTaskDTO,
  UpdateTaskAssigneesDTO,
  UpdateTaskPositionDTO,
  UpdateTaskRelationDTO,
  UpdateTaskStatusDTO,
} from "@/types/task.dto";

import { bulkNotify } from "./notification.db";

export async function createTaskDB(data: CreateTaskDTO) {
  return prisma.$transaction(async (tx) => {
    const lastTask = await tx.task.findFirst({
      where: {
        taskBoardId: data.taskBoardId,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const updatedProject = await tx.project.update({
      where: { id: data.projectId },
      data: {
        ticketCounter: {
          increment: 1,
        },
      },
      select: {
        ticketCounter: true,
      },
    });

    const currentTicketNumber = updatedProject.ticketCounter - 1;

    const member = await tx.projectMember.findFirst({
      where: {
        projectId: data.projectId,
        userId: data.userId,
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // The task inherits the status the destination column is configured to
    // stamp (columns own their status now — see TaskBoard.status). Falls back
    // to TODO if the column somehow has none.
    const board = await tx.taskBoard.findUnique({
      where: { id: data.taskBoardId },
      select: { status: true },
    });
    const status = board?.status ?? ETaskStatus.TODO;

    const res = await tx.task.create({
      data: {
        title: data.title,
        ticketNumber: currentTicketNumber,
        description: data.description,
        priority: data.priority,
        status,
        projectId: data.projectId,
        taskBoardId: data.taskBoardId,
        order: (lastTask?.order ?? 0) + 1,
        assignees: {
          createMany: {
            data: (data.assignees ?? []).map((memberId) => ({
              projectMemberId: memberId,
            })),
          },
        },
        creatorId: member?.id || "",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        assignees: {
          select: {
            projectMember: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (res.assignees && res.assignees.length > 0) {
      await bulkNotify(
        {
          senderId: data.userId,
          receiverIds: res.assignees.map(
            (assignee) => assignee.projectMember.userId,
          ),
          type: NotificationType.ASSIGNED,
          title: "assigned you to",
          data: {
            projectId: data.projectId,
            taskId: res.id,
            name: res.title,
            user: { ...member?.user },
          },
        },
        tx,
      );
    }

    // Optionally link the new task under a parent (chosen in AddTaskModal). A
    // brand-new task has no descendants, so no cycle is possible here.
    if (data.parentId) {
      await tx.taskRelation.create({
        data: { parentId: data.parentId, childId: res.id },
      });
    }

    // Audit trail: record that this member created the task (powers the task
    // detail timeline).
    if (member?.id) {
      await tx.activityLog.create({
        data: {
          type: EActivityLog.TASK_CREATE,
          taskId: res.id,
          projectId: data.projectId,
          actorId: member.id,
        },
      });
    }

    // Float this project to the top of the user's "Recents".
    await touchProjectActivity({
      userId: data.userId,
      projectId: data.projectId,
    });

    return res;
  });
}

export async function updateTaskPositionsDB({
  projectId,
  userId,
  taskId,
  taskBoardId,
  orderedTaskIdsByBoard,
}: UpdateTaskPositionDTO) {
  const accessibleBoards = await prisma.taskBoard.findMany({
    where: {
      id: {
        in: orderedTaskIdsByBoard.map((board) => board.taskBoardId),
      },
      projectId,
      project: {
        members: {
          some: { userId },
        },
      },
    },
    select: { id: true },
  });

  if (accessibleBoards.length !== orderedTaskIdsByBoard.length) {
    throw new Error("One or more task boards are inaccessible");
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      taskBoard: {
        projectId,
        project: {
          members: { some: { userId } },
        },
      },
    },
    select: {
      id: true,
      taskBoardId: true,
      status: true,
    },
  });

  if (!task) {
    throw new Error("Task is inaccessible");
  }

  const currentMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
    select: { id: true },
  });

  if (!currentMember) {
    throw new Error("User is not a member of this project");
  }

  // The destination column owns the status it stamps onto tasks that land in
  // it — read it so we can align the moved task's status below.
  const destinationBoard = await prisma.taskBoard.findUnique({
    where: { id: taskBoardId },
    select: { status: true },
  });

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const isColumnChanged = task.taskBoardId !== taskBoardId;

    if (isColumnChanged) {
      // Audit: the task moved between columns.
      await tx.activityLog.create({
        data: {
          type: EActivityLog.COLUMN_CHANGE,
          taskId: task.id,
          projectId,
          actorId: currentMember.id,
          columnChange: {
            create: {
              fromBoardId: task.taskBoardId,
              toBoardId: taskBoardId,
            },
          },
        },
      });

      // Align the status field with the destination column's configured
      // status. Overridable later via the drawer's Status dropdown.
      const suggestedStatus = destinationBoard?.status;

      if (suggestedStatus && suggestedStatus !== task.status) {
        await tx.task.update({
          where: { id: taskId },
          data: { status: suggestedStatus },
        });

        await tx.activityLog.create({
          data: {
            type: EActivityLog.STATUS_CHANGE,
            taskId: task.id,
            projectId,
            actorId: currentMember.id,
            statusChange: {
              create: {
                fromStatus: task.status,
                toStatus: suggestedStatus,
              },
            },
          },
        });
      }
    }

    await tx.task.update({
      where: { id: taskId },
      data: { taskBoardId },
    });

    for (const board of orderedTaskIdsByBoard) {
      for (const [index, orderedTaskId] of board.taskIds.entries()) {
        await tx.task.update({
          where: { id: orderedTaskId },
          data: {
            taskBoardId: board.taskBoardId,
            order: index + 1,
          },
        });
      }
    }

    // Float this project to the top of the user's "Recents".
    await touchProjectActivity({ userId, projectId }, tx);
  });
}

export async function updateTaskAssigneesDB({
  projectId,
  userId,
  taskId,
  assignees,
}: UpdateTaskAssigneesDTO) {
  // Make sure the task belongs to a project this user is a member of before
  // we touch its assignments.
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      project: {
        members: { some: { userId } },
      },
    },
    select: { id: true, title: true },
  });

  if (!task) {
    throw new Error("Task is inaccessible");
  }

  const currentMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
    select: { id: true },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      image: true,
      email: true,
    },
  });

  if (!currentMember) {
    throw new Error("User is not a member of this project");
  }

  return prisma.$transaction(async (tx) => {
    // Assignees are a full replacement: wipe the existing rows and recreate
    // them from the incoming selection (the TaskAssignment join table has a
    // composite [taskId, projectMemberId] key, so there's nothing to diff).
    await tx.taskAssignment.deleteMany({ where: { taskId } });

    if (assignees.length > 0) {
      await tx.taskAssignment.createMany({
        data: assignees.map((projectMemberId) => ({
          taskId,
          projectMemberId,
        })),
      });

      const members = await tx.projectMember.findMany({
        where: {
          id: { in: assignees },
        },
        select: {
          userId: true,
        },
      });

      const targetUserIds = members.map((m) => m.userId);

      // Notify users that are assigned
      await bulkNotify({
        senderId: userId,
        receiverIds: targetUserIds,
        type: NotificationType.ASSIGNED,
        title: task.title,
        data: {
          projectId,
          taskId,
          name: task.title,
          user,
        },
      });
    }

    // Audit trail entry powering the task timeline.
    await tx.activityLog.create({
      data: {
        type: EActivityLog.ASSIGNEE_CHANGE,
        taskId,
        projectId,
        actorId: currentMember.id,
      },
    });

    // Float this project to the top of the user's "Recents".
    await touchProjectActivity({ userId, projectId }, tx);
  });
}

export async function updateTaskStatusDB({
  projectId,
  userId,
  taskId,
  status,
}: UpdateTaskStatusDTO) {
  // Make sure the task belongs to a project this user is a member of before
  // we change its status.
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      project: {
        members: { some: { userId } },
      },
    },
    select: { id: true, status: true },
  });

  if (!task) {
    throw new Error("Task is inaccessible");
  }

  // No-op if the status didn't actually change (avoids a noisy audit entry).
  if (task.status === status) return;

  const currentMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
    select: { id: true },
  });

  if (!currentMember) {
    throw new Error("User is not a member of this project");
  }

  return prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { status },
    });

    // Audit trail entry powering the task timeline.
    await tx.activityLog.create({
      data: {
        type: EActivityLog.STATUS_CHANGE,
        taskId,
        projectId,
        actorId: currentMember.id,
        statusChange: {
          create: {
            fromStatus: task.status,
            toStatus: status,
          },
        },
      },
    });

    // Float this project to the top of the user's "Recents".
    await touchProjectActivity({ userId, projectId }, tx);
  });
}

/**
 * Powers the relationship picker. With no query, returns the 5 most-recent
 * tasks in the project (so the combobox is useful the instant it opens);
 * otherwise does a case-insensitive title search (capped at 10). `excludeId`
 * drops the current task so it can never be picked as its own parent.
 */
export async function searchTasksDB({
  projectId,
  userId,
  query,
  excludeId,
}: {
  projectId: string;
  userId: string;
  query?: string | null;
  excludeId?: string | null;
}) {
  // Only members of the project may search its tasks.
  const isMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
    select: { id: true },
  });

  if (!isMember) {
    throw new Error("User is not a member of this project");
  }

  const trimmed = query?.trim();

  return prisma.task.findMany({
    where: {
      projectId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      ...(trimmed ? { title: { contains: trimmed, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: trimmed ? 10 : 5,
    select: {
      id: true,
      title: true,
      ticketNumber: true,
    },
  });
}

/**
 * All ancestor ids of `nodeId` (every task reachable by walking parent links
 * upward). Used for cycle detection in the task DAG.
 */
async function collectAncestors(nodeId: string): Promise<Set<string>> {
  const ancestors = new Set<string>();
  let frontier = [nodeId];

  while (frontier.length > 0) {
    const rows = await prisma.taskRelation.findMany({
      where: { childId: { in: frontier } },
      select: { parentId: true },
    });

    const next: string[] = [];
    for (const { parentId } of rows) {
      if (!ancestors.has(parentId)) {
        ancestors.add(parentId);
        next.push(parentId);
      }
    }
    frontier = next;
  }

  return ancestors;
}

/**
 * Adds or removes a single parent -> child edge in the task hierarchy (which is
 * a DAG: a task can have many parents and many children). Adding guards against
 * cycles — a task can't be linked to itself, and the new edge can't close a loop
 * (the child must not already be an ancestor of the parent).
 */
export async function updateTaskRelationDB({
  projectId,
  userId,
  parentId,
  childId,
  action,
}: UpdateTaskRelationDTO) {
  if (parentId === childId) {
    throw new Error("A task cannot be linked to itself");
  }

  // Both tasks must belong to a project this user is a member of.
  const tasks = await prisma.task.findMany({
    where: {
      id: { in: [parentId, childId] },
      projectId,
      project: { members: { some: { userId } } },
    },
    select: { id: true },
  });

  if (tasks.length !== 2) {
    throw new Error("Task is inaccessible");
  }

  const currentMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
    select: { id: true },
  });

  if (!currentMember) {
    throw new Error("User is not a member of this project");
  }

  if (action === "add") {
    // Adding parent -> child closes a cycle iff the child is already an ancestor
    // of the parent (child → … → parent → child).
    const ancestorsOfParent = await collectAncestors(parentId);
    if (ancestorsOfParent.has(childId)) {
      throw new Error("That link would create a cycle");
    }
  }

  return prisma.$transaction(async (tx) => {
    if (action === "add") {
      // Idempotent: the composite PK makes a duplicate link a no-op.
      await tx.taskRelation.upsert({
        where: { parentId_childId: { parentId, childId } },
        create: { parentId, childId },
        update: {},
      });
    } else {
      await tx.taskRelation.deleteMany({ where: { parentId, childId } });
    }

    // Audit on the child — it's the task whose parent set changed.
    await tx.activityLog.create({
      data: {
        type: EActivityLog.PARENT_CHANGE,
        taskId: childId,
        projectId,
        actorId: currentMember.id,
      },
    });

    // Float this project to the top of the user's "Recents".
    await touchProjectActivity({ userId, projectId }, tx);
  });
}

/** Resolve which project a task belongs to (for server-side permission checks). */
export async function getTaskProjectId(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  });

  return task?.projectId ?? null;
}

export async function getTaskDetail(id: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      projectId: true,
      taskBoardId: true,
      status: true,
      title: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      priority: true,
      // Parents: rows where this task is the child. Powers the sidebar list.
      parentLinks: {
        select: {
          parent: {
            select: { id: true, title: true, ticketNumber: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      // Subtasks: rows where this task is the parent. Ordered like board columns.
      childLinks: {
        select: {
          child: {
            select: {
              id: true,
              title: true,
              ticketNumber: true,
              status: true,
            },
          },
        },
        orderBy: { child: { order: "asc" } },
      },
      assignees: {
        select: {
          projectMember: {
            select: {
              id: true,
              user: {
                select: {
                  image: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      createdBy: {
        select: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
      activityLog: {
        select: {
          type: true,
          actor: {
            select: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
          columnChange: {
            select: {
              fromBoard: {
                select: {
                  title: true,
                },
              },
              toBoard: {
                select: {
                  title: true,
                },
              },
            },
          },
          statusChange: {
            select: {
              fromStatus: true,
              toStatus: true,
            },
          },
          comment: {
            select: {
              value: true,
              createdAt: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      project: {
        select: {
          members: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!task) return null;

  const currentUser = task.project.members.find(
    (member) => member.user.id === userId,
  );

  // Flatten the join rows into plain parent/child task arrays for the client.
  const { parentLinks, childLinks, ...rest } = task;
  return {
    ...rest,
    parents: parentLinks.map((link) => link.parent),
    children: childLinks.map((link) => link.child),
    currentUser: currentUser?.user,
  };
}
