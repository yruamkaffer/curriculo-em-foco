import { defineConfig, devices } from "@playwright/test";

const browserBaseUrl = process.env.PLAYWRIGHT_BASE_URL || (process.env.CI ? "http://127.0.0.1:3000" : "http://192.168.160.1:3000");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: { baseURL: browserBaseUrl, trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
