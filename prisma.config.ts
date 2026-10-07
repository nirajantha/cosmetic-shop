import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // The app's driver adapter wants a mariadb:// URL, but the Prisma CLI only accepts mysql://.
    url: env("DATABASE_URL").replace(/^mariadb:\/\//, "mysql://"),
  },
});
