// backend/prisma/prisma.config.ts
import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,

    shadowDatabaseUrl: process.env.DATABASE_URL,
  },
  generators: {
    client: {
      provider: "prisma-client-js",
      output: "../src/generated/prisma", // Prisma client path
    },
  },
});
