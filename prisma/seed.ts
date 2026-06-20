import { prisma } from "@/lib/prisma";

import { PermissionsSeed } from "./permissionsSeed";

async function main() {
  console.log("DB URL:", process.env.DATABASE_URL);
  // 1. Create Users
  const [owner, member1, member2] = await Promise.all([
    prisma.user.create({
      data: {
        email: "owner@test.com",
        name: "Owner User",
      },
    }),
    prisma.user.create({
      data: {
        email: "member1@test.com",
        name: "Member One",
      },
    }),
    prisma.user.create({
      data: {
        email: "member2@test.com",
        name: "Member Two",
      },
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

  // 4. Add Members
  const [ownerPM, member1PM, member2PM] = await Promise.all([
    prisma.projectMember.create({
      data: {
        userId: owner.id,
        projectId: project.id,
        roleId: ownerRole.id,
        status: "active",
      },
    }),
    prisma.projectMember.create({
      data: {
        userId: member1.id,
        projectId: project.id,
        roleId: memberRole.id,
        status: "active",
      },
    }),
    prisma.projectMember.create({
      data: {
        userId: member2.id,
        projectId: project.id,
        roleId: memberRole.id,
        status: "active",
      },
    }),
  ]);

  // 5. Create Boards
  const [todo, inProgress, done] = await Promise.all([
    prisma.taskBoard.create({
      data: { title: "To Do", projectId: project.id },
    }),
    prisma.taskBoard.create({
      data: { title: "In Progress", projectId: project.id },
    }),
    prisma.taskBoard.create({
      data: { title: "Done", projectId: project.id },
    }),
  ]);

  // 6. Create Tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Setup project repo",
        description: "Initialize Git + CI",
        priority: "HIGH",
        taskBoardId: todo.id,
        assigneeId: ownerPM.id,
      },
      {
        title: "Design UI",
        priority: "MEDIUM",
        taskBoardId: todo.id,
        assigneeId: member1PM.id,
      },
      {
        title: "Build Kanban Board",
        priority: "HIGH",
        taskBoardId: inProgress.id,
        assigneeId: member2PM.id,
      },
      {
        title: "Implement Auth",
        priority: "HIGH",
        taskBoardId: inProgress.id,
        assigneeId: ownerPM.id,
      },
      {
        title: "Deploy App",
        priority: "LOW",
        taskBoardId: done.id,
        assigneeId: ownerPM.id,
      },
    ],
  });

  console.log("🌱 Seed completed with realistic data");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
