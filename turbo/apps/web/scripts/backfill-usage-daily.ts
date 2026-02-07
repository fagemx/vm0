#!/usr/bin/env tsx

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { agentRuns } from "../src/db/schema/agent-run";
import { usageDaily } from "../src/db/schema/usage-daily";
import { schema } from "../src/db/db";
import { sql, and, gte, lt, isNotNull } from "drizzle-orm";
import type { Database } from "../src/types/global";

const MS_PER_DAY = 86400000;
const CHUNK_DAYS = 30;

/**
 * Backfill usage_daily from historical agent_runs data.
 *
 * Processes in 30-day chunks from the earliest completed run up to
 * (but not including) `beforeDate`. Uses upsert so it is safe to rerun.
 */
export async function backfillUsageDaily(
  db: Database,
  beforeDate: Date,
): Promise<number> {
  const [earliest] = await db
    .select({
      minDate: sql<Date>`MIN(${agentRuns.createdAt})`,
    })
    .from(agentRuns)
    .where(isNotNull(agentRuns.completedAt));

  if (!earliest?.minDate) {
    console.log("No completed runs found. Nothing to backfill.");
    return 0;
  }

  const minDate = new Date(earliest.minDate);
  const startDate = new Date(
    Date.UTC(
      minDate.getUTCFullYear(),
      minDate.getUTCMonth(),
      minDate.getUTCDate(),
    ),
  );

  console.log(
    `Backfill range: ${startDate.toISOString().split("T")[0]} to ${beforeDate.toISOString().split("T")[0]} (exclusive)`,
  );

  let totalUpserted = 0;
  let chunkFrom = startDate;

  while (chunkFrom < beforeDate) {
    const chunkTo = new Date(
      Math.min(
        chunkFrom.getTime() + CHUNK_DAYS * MS_PER_DAY,
        beforeDate.getTime(),
      ),
    );

    const rows = await db
      .select({
        userId: agentRuns.userId,
        date: sql<string>`DATE(${agentRuns.createdAt})`.as("date"),
        runCount: sql<number>`COUNT(*)::int`.as("run_count"),
        runTimeMs:
          sql<number>`COALESCE(SUM(EXTRACT(EPOCH FROM (${agentRuns.completedAt} - ${agentRuns.startedAt})) * 1000), 0)::bigint`.as(
            "run_time_ms",
          ),
      })
      .from(agentRuns)
      .where(
        and(
          gte(agentRuns.createdAt, chunkFrom),
          lt(agentRuns.createdAt, chunkTo),
          isNotNull(agentRuns.completedAt),
        ),
      )
      .groupBy(agentRuns.userId, sql`DATE(${agentRuns.createdAt})`);

    for (const row of rows) {
      await db
        .insert(usageDaily)
        .values({
          userId: row.userId,
          date: String(row.date),
          runCount: row.runCount,
          runTimeMs: Number(row.runTimeMs),
        })
        .onConflictDoUpdate({
          target: [usageDaily.userId, usageDaily.date],
          set: {
            runCount: row.runCount,
            runTimeMs: Number(row.runTimeMs),
            updatedAt: new Date(),
          },
        });
    }

    totalUpserted += rows.length;
    console.log(
      `  ${chunkFrom.toISOString().split("T")[0]} .. ${chunkTo.toISOString().split("T")[0]}: ${rows.length} rows`,
    );

    chunkFrom = chunkTo;
  }

  console.log(`Backfill complete. Total rows upserted: ${totalUpserted}`);
  return totalUpserted;
}

// Auto-execute when run as a script
// Usage: DATABASE_URL=... npx tsx scripts/backfill-usage-daily.ts
const isDirectExecution = process.argv[1]?.includes("backfill-usage-daily");

if (isDirectExecution) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const conn = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(conn, { schema });

  try {
    const now = new Date();
    const todayMidnight = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    await backfillUsageDaily(db as Database, todayMidnight);
  } finally {
    await conn.end();
  }
}
