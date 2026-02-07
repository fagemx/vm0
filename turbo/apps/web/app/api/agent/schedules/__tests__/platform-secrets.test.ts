import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../route";
import {
  createTestRequest,
  createTestCompose,
  createTestSecret,
} from "../../../../../src/__tests__/api-test-helpers";
import {
  testContext,
  uniqueId,
} from "../../../../../src/__tests__/test-helpers";

vi.mock("@clerk/nextjs/server");
vi.mock("@e2b/code-interpreter");
vi.mock("@aws-sdk/client-s3");
vi.mock("@aws-sdk/s3-request-presigner");
vi.mock("@axiomhq/js");

const context = testContext();

function deployScheduleRequest(
  composeId: string,
  name: string,
  options?: { secrets?: Record<string, string> },
) {
  return createTestRequest("http://localhost:3000/api/agent/schedules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      composeId,
      name,
      cronExpression: "0 9 * * *",
      timezone: "UTC",
      prompt: "Test prompt",
      secrets: options?.secrets,
    }),
  });
}

describe("POST /api/agent/schedules - Platform-managed secrets", () => {
  let composeId: string;

  beforeEach(async () => {
    context.setupMocks();
    await context.setupUser();

    // Create compose that requires secrets via ${{ secrets.XXX }} references
    const result = await createTestCompose(uniqueId("secret-agent"), {
      overrides: {
        environment: {
          SLACK_WEBHOOK_URL: "${{ secrets.SLACK_WEBHOOK_URL }}",
          PERPLEXITY_API_KEY: "${{ secrets.PERPLEXITY_API_KEY }}",
        },
      },
    });
    composeId = result.composeId;
  });

  it("should succeed when secrets exist as platform-managed secrets", async () => {
    // Store secrets via platform (simulates `vm0 secret set`)
    await createTestSecret("SLACK_WEBHOOK_URL", "https://hooks.slack.com/xxx");
    await createTestSecret("PERPLEXITY_API_KEY", "pplx-test-key");

    const response = await POST(
      deployScheduleRequest(composeId, uniqueId("schedule")),
    );
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.created).toBe(true);
    expect(data.schedule.name).toBeDefined();
  });

  it("should fail when secrets are missing from both CLI and platform", async () => {
    // No CLI secrets, no platform secrets
    const response = await POST(
      deployScheduleRequest(composeId, uniqueId("schedule")),
    );
    const data = await response.json();

    // BadRequestError from service is mapped to 409 in route handler
    expect(response.status).toBe(409);
    expect(data.error.message).toContain("SLACK_WEBHOOK_URL");
    expect(data.error.message).toContain("PERPLEXITY_API_KEY");
  });

  it("should succeed when secrets are provided via CLI", async () => {
    const response = await POST(
      deployScheduleRequest(composeId, uniqueId("schedule"), {
        secrets: {
          SLACK_WEBHOOK_URL: "https://hooks.slack.com/xxx",
          PERPLEXITY_API_KEY: "pplx-test-key",
        },
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.created).toBe(true);
  });

  it("should succeed with mix of CLI and platform secrets", async () => {
    // One secret via platform, one via CLI
    await createTestSecret("SLACK_WEBHOOK_URL", "https://hooks.slack.com/xxx");

    const response = await POST(
      deployScheduleRequest(composeId, uniqueId("schedule"), {
        secrets: {
          PERPLEXITY_API_KEY: "pplx-test-key",
        },
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.created).toBe(true);
  });

  it("should fail when only some platform secrets exist", async () => {
    // Only one of the two required secrets is stored
    await createTestSecret("SLACK_WEBHOOK_URL", "https://hooks.slack.com/xxx");

    const response = await POST(
      deployScheduleRequest(composeId, uniqueId("schedule")),
    );
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error.message).toContain("PERPLEXITY_API_KEY");
    expect(data.error.message).not.toContain("SLACK_WEBHOOK_URL");
  });
});
