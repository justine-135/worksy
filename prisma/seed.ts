import { prisma } from "@/lib/prisma";
import { EProjectMember } from "@prisma/client";

async function main() {
  console.log("🌱 Starting seed...");

  // =========================
  // 1. USERS
  // =========================
  const owner = await prisma.user.create({
    data: {
      name: "Project Owner",
      email: "owner@test.com",
      image: "https://i.pravatar.cc/150?img=1",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@test.com",
      image: "https://i.pravatar.cc/150?img=2",
    },
  });

  const member = await prisma.user.create({
    data: {
      name: "Member User",
      email: "member@test.com",
      image: "https://i.pravatar.cc/150?img=3",
    },
  });

  console.log("✅ Users created");

  // =========================
  // 2. PROJECT
  // =========================
  const project = await prisma.project.create({
    data: {
      title: "Kanban SaaS Project",
      description: "Seeded project for development testing",
      ownerId: owner.id,
    },
  });

  console.log("✅ Project created");

  // =========================
  // 3. PROJECT MEMBERS
  // =========================
  const ownerMember = await prisma.projectMember.create({
    data: {
      role: EProjectMember.OWNER,
      userId: owner.id,
      projectId: project.id,
    },
  });

  const adminMember = await prisma.projectMember.create({
    data: {
      role: EProjectMember.ADMIN,
      userId: admin.id,
      projectId: project.id,
    },
  });

  const memberUser = await prisma.projectMember.create({
    data: {
      role: EProjectMember.MEMBER,
      userId: member.id,
      projectId: project.id,
    },
  });

  console.log("✅ Members created");

  // =========================
  // 4. TASK BOARDS
  // =========================
  const todo = await prisma.taskBoard.create({
    data: {
      title: "Todo",
      order: 1,
      projectId: project.id,
    },
  });

  const inProgress = await prisma.taskBoard.create({
    data: {
      title: "In Progress",
      order: 2,
      projectId: project.id,
    },
  });

  const done = await prisma.taskBoard.create({
    data: {
      title: "Done",
      order: 3,
      projectId: project.id,
    },
  });

  console.log("✅ Task boards created");

  // =========================
  // 5. TASKS
  // =========================
  await prisma.task.createMany({
    data: [
      {
        title: "Setup Next.js project",
        description: "Initialize frontend structure",
        priority: "HIGH",
        taskBoardId: todo.id,
        assigneeId: ownerMember.id,
      },
      {
        title: "Design database schema",
        description: "Finalize Prisma models",
        priority: "HIGH",
        taskBoardId: todo.id,
        assigneeId: adminMember.id,
      },
      {
        title: "Build authentication system",
        description: "Implement NextAuth or JWT",
        priority: "MEDIUM",
        taskBoardId: inProgress.id,
        assigneeId: memberUser.id,
      },
      {
        title: "Create Kanban UI",
        description: "Drag and drop boards",
        priority: "MEDIUM",
        taskBoardId: inProgress.id,
        assigneeId: memberUser.id,
      },
      {
        title: "Deploy app",
        description: "Production deployment",
        priority: "LOW",
        taskBoardId: done.id,
        assigneeId: ownerMember.id,
      },
    ],
  });

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
