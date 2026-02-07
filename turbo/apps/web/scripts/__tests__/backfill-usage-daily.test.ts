import { describe, it, expect, beforeEach, vi } from "vitest";
import { backfillUsageDaily } from "../backfill-usage-daily";
import { testContext, uniqueId } from "../../src/__tests__/test-helpers";
import {
  createTestCompose,
  createCompletedTestRun,
  findUsageDaily,
  getTestDb,
} from "../../src/__tests__/api-test-helpers";

vi.mock("@clerk/nextjs/server");
vi.mock("@e2b/code-interpreter");
vi.mock("@aws-sdk/client-s3");
vi.mock("@aws-sdk/s3-request-presigner");
vi.mock("@axiomhq/js");

const context = testContext();

describe("backfillUsageDaily", () => {
  let composeVersionId: string;
  let userId: string;

  beforeEach(async () => {
    context.setupMocks();
    const user = await context.setupUser();
    userId = user.userId;
    const { versionId } = await createTestCompose(uniqueId("backfill"));
    composeVersionId = versionId;
  });

  it("should return 0 when beforeDate precedes all data", async () => {
    // Use a date far in the past so the while loop never executes
    const farPast = new Date("2000-01-01T00:00:00Z");

    const result = await backfillUsageDaily(getTestDb(), farPast);

    expect(result).toBe(0);
  });

  it("should backfill completed runs into usage_daily", async () => {
    const threeDaysAgo = new Date(
      Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate() - 3,
      ),
    );
    const threeDaysAgoAt10 = new Date(threeDaysAgo.getTime() + 10 * 3600000);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split("T")[0]!;

    // Create 2 completed runs on the same day
    await createCompletedTestRun({
      composeVersionId,
      userId,
      createdAt: threeDaysAgoAt10,
      startedAt: threeDaysAgoAt10,
      completedAt: new Date(threeDaysAgoAt10.getTime() + 5000),
    });

    const run2Start = new Date(threeDaysAgoAt10.getTime() + 60000);
    await createCompletedTestRun({
      composeVersionId,
      userId,
      createdAt: run2Start,
      startedAt: run2Start,
      completedAt: new Date(run2Start.getTime() + 8000),
    });

    const todayMidnight = new Date(
      Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate(),
      ),
    );

    const result = await backfillUsageDaily(getTestDb(), todayMidnight);

    expect(result).toBeGreaterThanOrEqual(1);

    const usage = await findUsageDaily(userId, threeDaysAgoStr);
    expect(usage).toBeDefined();
    expect(usage!.runCount).toBe(2);
    expect(usage!.runTimeMs).toBe(13000);
  });

  it("should be idempotent on rerun", async () => {
    const twoDaysAgo = new Date(
      Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate() - 2,
      ),
    );
    const twoDaysAgoAt10 = new Date(twoDaysAgo.getTime() + 10 * 3600000);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split("T")[0]!;

    await createCompletedTestRun({
      composeVersionId,
      userId,
      createdAt: twoDaysAgoAt10,
      startedAt: twoDaysAgoAt10,
      completedAt: new Date(twoDaysAgoAt10.getTime() + 7000),
    });

    const todayMidnight = new Date(
      Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate(),
      ),
    );

    // First run
    await backfillUsageDaily(getTestDb(), todayMidnight);

    // Second run
    await backfillUsageDaily(getTestDb(), todayMidnight);

    const usage = await findUsageDaily(userId, twoDaysAgoStr);
    expect(usage).toBeDefined();
    expect(usage!.runCount).toBe(1);
    expect(usage!.runTimeMs).toBe(7000);
  });
});
