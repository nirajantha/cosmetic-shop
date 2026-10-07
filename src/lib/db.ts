import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Shared hosting caps MySQL connections per user (`max_user_connections`), and
 * Passenger may run several app processes. The driver's default pool of 10 per
 * process exhausts that cap, so keep the pool small and release idle
 * connections quickly. Values set in DATABASE_URL take precedence.
 */
function withPoolDefaults(connectionString: string): string {
  const url = new URL(connectionString);
  const defaults = { connectionLimit: "3", idleTimeout: "60" };
  for (const [key, value] of Object.entries(defaults)) {
    if (!url.searchParams.has(key)) url.searchParams.set(key, value);
  }
  return url.toString();
}

const adapter = new PrismaMariaDb(withPoolDefaults(process.env.DATABASE_URL!));

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

/**
 * Retries a query once on a dropped/closed connection. MySQL connection
 * pools (including shared hosting) can recycle an idle connection out
 * from under a query; a single retry on a fresh connection is standard
 * practice and costs nothing on the happy path.
 */
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const isConnectionError = /connection|ECONNREFUSED|ECONNRESET/i.test(message);
    if (!isConnectionError) throw error;
    return fn();
  }
}
