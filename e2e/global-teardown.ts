import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

async function globalTeardown() {
  const idsPath = path.join(__dirname, ".auth", "test-ids.json");
  if (!fs.existsSync(idsPath)) return;

  const { userId } = JSON.parse(fs.readFileSync(idsPath, "utf-8"));

  const connectionString =
    process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
  if (!connectionString) return;

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    // Cascade deletes sessions, projects, memberships, etc.
    await prisma.user.deleteMany({ where: { id: userId } });
  } finally {
    await prisma.$disconnect();
  }
}

export default globalTeardown;
