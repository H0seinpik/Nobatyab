import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

/** Interactive transaction limits for booking flows (default Prisma timeout is 5s). */
export const prismaTransactionOptions: {
  maxWait: number;
  timeout: number;
} = {
  maxWait: 10_000,
  timeout: 15_000,
};

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.app.nodeEnv === "development" ? ["error", "warn"] : ["error"],
  });

if (env.app.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
