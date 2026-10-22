import { chromium } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

async function globalSetup() {
  const connectionString =
    process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    // Clean up any leftover E2E data from a previous aborted run
    await prisma.user.deleteMany({ where: { email: "e2e-owner@playwright.test" } });

    const user = await prisma.user.create({
      data: { email: "e2e-owner@playwright.test", name: "E2E Owner" },
    });

    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: { sessionToken, userId: user.id, expires },
    });

    // Write session cookie to storageState so tests can reuse it
    const authDir = path.join(__dirname, ".auth");
    fs.mkdirSync(authDir, { recursive: true });

    const browser = await chromium.launch();
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: sessionToken,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);
    await context.storageState({ path: path.join(authDir, "user.json") });
    await browser.close();

    // Persist IDs so globalTeardown can clean up
    fs.writeFileSync(
      path.join(authDir, "test-ids.json"),
      JSON.stringify({ userId: user.id }),
    );
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;
