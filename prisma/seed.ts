import { prisma } from "@/lib/prisma";

import { PermissionsSeed } from "./permissionsSeed";

async function main() {
  console.log("DB URL:", process.env.DATABASE_URL);

  // 1. Create core named users (owner + a couple of leads we reference by name later)
  const [owner, member1, member2, invitee] = await Promise.all([
    prisma.user.create({
      data: { email: "owner@test.com", name: "Owner User" },
    }),
    prisma.user.create({
      data: { email: "member1@test.com", name: "Member One" },
    }),
    prisma.user.create({
      data: { email: "member2@test.com", name: "Member Two" },
    }),
    prisma.user.create({
      data: { email: "invitee@test.com", name: "Pending Invitee" },
    }),
  ]);

  // 2. Create Project
  const project = await prisma.project.create({
    data: {
      title: "Worksy Project",
      description: "A realistic seeded project",
      ownerId: owner.id,
    },
  });

  // 3. Create Roles
  const ownerRole = await prisma.role.create({
    data: {
      name: "Owner",
      projectId: project.id,
      permissions: {
        create: PermissionsSeed.map((key) => ({ key })),
      },
    },
  });

  const memberRole = await prisma.role.create({
    data: {
      name: "Member",
      projectId: project.id,
      permissions: {
        create: [
          "dashboard.view",
          "board.view",
          "board.task.create",
          "board.task.edit",
          "board.task.status.edit",
        ].map((key) => ({ key })),
      },
    },
  });

  const viewerRole = await prisma.role.create({
    data: {
      name: "Viewer",
      projectId: project.id,
      permissions: {
        create: ["dashboard.view", "board.view"].map((key) => ({ key })),
      },
    },
  });

  // 4. Add core members (owner + the two named members)
  const [ownerPM, member1PM, member2PM] = await Promise.all([
    prisma.projectMember.create({
      data: {
        userId: owner.id,
        projectId: project.id,
        roleId: ownerRole.id,
        status: "active",
        lastActivityAt: new Date(),
      },
    }),
    prisma.projectMember.create({
      data: {
        userId: member1.id,
        projectId: project.id,
        roleId: memberRole.id,
        status: "active",
        lastActivityAt: new Date(),
      },
    }),
    prisma.projectMember.create({
      data: {
        userId: member2.id,
        projectId: project.id,
        roleId: memberRole.id,
        status: "active",
        lastActivityAt: new Date(),
      },
    }),
  ]);

  // 4b. Bulk-create additional users + project members so the team has 20+ people.
  // We already have 3 real members (owner, member1, member2), so generate 18 more
  // to comfortably clear 20 total.
  const EXTRA_MEMBER_COUNT = 18;
  const extraUsers = [];

  for (let i = 1; i <= EXTRA_MEMBER_COUNT; i++) {
    const user = await prisma.user.create({
      data: {
        email: `teammate${i}@test.com`,
        name: `Teammate ${i}`,
      },
    });
    extraUsers.push(user);
  }

  // Distribute extra members across statuses/roles so the data looks realistic:
  // most active, a few inactive, and vary between Member/Viewer roles.
  const extraPMs = await Promise.all(
    extraUsers.map((user, idx) => {
      const isViewer = idx % 4 === 3; // every 4th person is a viewer
      const isInactive = idx % 7 === 6; // occasional inactive member

      return prisma.projectMember.create({
        data: {
          userId: user.id,
          projectId: project.id,
          roleId: isViewer ? viewerRole.id : memberRole.id,
          status: isInactive ? "inactive" : "active",
          lastActivityAt: isInactive ? null : new Date(),
        },
      });
    }),
  );

  const allMembers = [ownerPM, member1PM, member2PM, ...extraPMs];
  console.log(`👥 Created ${allMembers.length} project members`);

  // 5. Create Boards
  const [todo, inProgress, done] = await Promise.all([
    prisma.taskBoard.create({
      data: { title: "To Do", status: "TODO", projectId: project.id },
    }),
    prisma.taskBoard.create({
      data: {
        title: "In Progress",
        status: "IN_PROGRESS",
        projectId: project.id,
      },
    }),
    prisma.taskBoard.create({
      data: { title: "Done", status: "DONE", projectId: project.id },
    }),
  ]);

  // 6. Create Tasks
  // ticketNumber is unique per project, so we track it manually and
  // sync it back to Project.ticketCounter at the end.
  let ticketNumber = 0;
  const nextTicket = () => ++ticketNumber;

  const setupRepo = await prisma.task.create({
    data: {
      ticketNumber: nextTicket(),
      title: "Setup project repo",
      description: "Initialize Git + CI",
      priority: "high",
      status: "TODO",
      taskBoardId: todo.id,
      projectId: project.id,
      creatorId: ownerPM.id,
      assignees: {
        create: [{ projectMemberId: ownerPM.id }],
      },
    },
  });

  const designUI = await prisma.task.create({
    data: {
      ticketNumber: nextTicket(),
      title: "Design UI",
      description: "Mockups for the dashboard and board views",
      priority: "medium",
      status: "TODO",
      taskBoardId: todo.id,
      projectId: project.id,
      creatorId: ownerPM.id,
      assignees: {
        create: [{ projectMemberId: member1PM.id }],
      },
    },
  });

  const buildKanban = await prisma.task.create({
    data: {
      ticketNumber: nextTicket(),
      title: "Build Kanban Board",
      description: "Drag-and-drop board with column persistence",
      priority: "high",
      status: "IN_PROGRESS",
      taskBoardId: inProgress.id,
      projectId: project.id,
      creatorId: ownerPM.id,
      assignees: {
        create: [{ projectMemberId: member2PM.id }],
      },
    },
  });

  const implementAuth = await prisma.task.create({
    data: {
      ticketNumber: nextTicket(),
      title: "Implement Auth",
      description: "NextAuth with credentials + OAuth providers",
      priority: "high",
      status: "IN_PROGRESS",
      taskBoardId: inProgress.id,
      projectId: project.id,
      creatorId: ownerPM.id,
      assignees: {
        create: [
          { projectMemberId: ownerPM.id },
          { projectMemberId: member1PM.id },
        ],
      },
    },
  });

  const deployApp = await prisma.task.create({
    data: {
      ticketNumber: nextTicket(),
      title: "Deploy App",
      description: "Ship to production",
      priority: "low",
      status: "DONE",
      taskBoardId: done.id,
      projectId: project.id,
      creatorId: ownerPM.id,
      assignees: {
        create: [{ projectMemberId: ownerPM.id }],
      },
    },
  });

  // 6b. A few extra tasks assigned to some of the bulk-created teammates,
  // so the new members aren't just sitting there unused.
  const bugfixTask = await prisma.task.create({
    data: {
      ticketNumber: nextTicket(),
      title: "Fix pagination bug on task list",
      description: "Off-by-one error when paginating board tasks",
      priority: "medium",
      status: "TODO",
      taskBoardId: todo.id,
      projectId: project.id,
      creatorId: member1PM.id,
      assignees: {
        create: [{ projectMemberId: extraPMs[0].id }],
      },
    },
  });

  const writeDocsTask = await prisma.task.create({
    data: {
      ticketNumber: nextTicket(),
      title: "Write onboarding docs",
      description: "Doc covering project setup for new teammates",
      priority: "low",
      status: "IN_PROGRESS",
      taskBoardId: inProgress.id,
      projectId: project.id,
      creatorId: member2PM.id,
      assignees: {
        create: [
          { projectMemberId: extraPMs[1].id },
          { projectMemberId: extraPMs[2].id },
        ],
      },
    },
  });

  // Sync the project's ticket counter so future tasks continue from here
  await prisma.project.update({
    where: { id: project.id },
    data: { ticketCounter: ticketNumber },
  });

  // 7. Task hierarchy example (DAG): "Build Kanban Board" and "Implement Auth"
  // are both children of "Setup project repo"
  await prisma.taskRelation.createMany({
    data: [
      { parentId: setupRepo.id, childId: buildKanban.id },
      { parentId: setupRepo.id, childId: implementAuth.id },
    ],
  });

  // 8. Activity log examples

  // Task creation log for "Deploy App"
  await prisma.activityLog.create({
    data: {
      type: "TASK_CREATE",
      taskId: deployApp.id,
      projectId: project.id,
      actorId: ownerPM.id,
    },
  });

  // Status change: "Deploy App" moved IN_PROGRESS -> DONE
  await prisma.activityLog.create({
    data: {
      type: "STATUS_CHANGE",
      taskId: deployApp.id,
      projectId: project.id,
      actorId: ownerPM.id,
      statusChange: {
        create: { fromStatus: "IN_PROGRESS", toStatus: "DONE" },
      },
    },
  });

  // Column change: "Implement Auth" moved from To Do -> In Progress
  await prisma.activityLog.create({
    data: {
      type: "COLUMN_CHANGE",
      taskId: implementAuth.id,
      projectId: project.id,
      actorId: member1PM.id,
      columnChange: {
        create: { fromBoardId: todo.id, toBoardId: inProgress.id },
      },
    },
  });

  // Comment on "Design UI"
  await prisma.activityLog.create({
    data: {
      type: "COMMENT",
      taskId: designUI.id,
      projectId: project.id,
      actorId: member1PM.id,
      comment: {
        create: { value: "First pass on wireframes is up for review." },
      },
    },
  });

  // Assignee change on "Implement Auth"
  await prisma.activityLog.create({
    data: {
      type: "ASSIGNEE_CHANGE",
      taskId: implementAuth.id,
      projectId: project.id,
      actorId: ownerPM.id,
    },
  });

  // Comment on the bugfix task from one of the new teammates
  await prisma.activityLog.create({
    data: {
      type: "COMMENT",
      taskId: bugfixTask.id,
      projectId: project.id,
      actorId: extraPMs[0].id,
      comment: {
        create: {
          value: "Repro'd locally, looks like the offset calc is wrong.",
        },
      },
    },
  });

  // 9. Pending project invite
  await prisma.projectInvite.create({
    data: {
      senderId: owner.id,
      receiverId: invitee.id,
      projectId: project.id,
      status: "PENDING",
    },
  });

  // 10. Notification example
  await prisma.notification.create({
    data: {
      userId: member1.id,
      type: "ASSIGNED",
      title: "You were assigned a task",
      body: `You were assigned to "${designUI.title}"`,
      data: { taskId: designUI.id, projectId: project.id },
    },
  });

  console.log(
    `🌱 Seed completed: ${allMembers.length} members, 7 tasks, ${extraUsers.length} bulk teammates`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
