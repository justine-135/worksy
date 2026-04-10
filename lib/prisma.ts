import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "prisma/config";

// Create the adapter with the correct connection string
const adapter = new PrismaPg({
  connectionString: env("DATABASE_URL"),
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
