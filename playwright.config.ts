import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.test.local") });
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const DATABASE_URL =
  process.env.DATABASE_URL_TEST || process.env.DATABASE_URL || "";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }]],
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "next dev --no-turbopack -p 3001",
    url: "http://localhost:3001",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL,
      NEXTAUTH_URL: "http://localhost:3001",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "e2e-test-secret",
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "e2e",
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "e2e",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "e2e",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "e2e",
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || "",
    },
  },
});
