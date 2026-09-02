import "server-only";
import { auth } from "@/lib/auth";

/** Defense in depth: every admin Server Action re-checks the session itself, not just the proxy. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
