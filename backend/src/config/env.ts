import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().default("nobatyab"),
  DB_SCHEMA: z.string().default("public"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  APP_TIMEZONE: z.string().default("Asia/Tehran"),
  APP_URL: z.string().url(),
  CORS_ORIGIN: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().default(5_000),
  PAYMENT_PROVIDER: z.string().default("simulated"),
  SMS_PROVIDER: z.string().default("simulated"),
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_AVATAR_SIZE_MB: z.coerce.number().default(2),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

const databaseUrl =
  process.env.DATABASE_URL ??
  `postgresql://${encodeURIComponent(data.DB_USER)}:${encodeURIComponent(data.DB_PASSWORD)}@${data.DB_HOST}:${data.DB_PORT}/${data.DB_NAME}?schema=${data.DB_SCHEMA}`;

process.env.DATABASE_URL = databaseUrl;

export const env = {
  db: {
    host: data.DB_HOST,
    port: data.DB_PORT,
    user: data.DB_USER,
    password: data.DB_PASSWORD,
    name: data.DB_NAME,
    schema: data.DB_SCHEMA,
  },
  databaseUrl,
  jwt: {
    accessSecret: data.JWT_ACCESS_SECRET,
    refreshSecret: data.JWT_REFRESH_SECRET,
    accessExpiresIn: data.ACCESS_TOKEN_EXPIRES_IN,
    refreshExpiresIn: data.REFRESH_TOKEN_EXPIRES_IN,
  },
  app: {
    timezone: data.APP_TIMEZONE,
    url: data.APP_URL,
    nodeEnv: data.NODE_ENV,
    port: data.PORT,
  },
  corsOrigin: data.CORS_ORIGIN,
  rateLimit: {
    windowMs: data.RATE_LIMIT_WINDOW_MS,
    max: data.RATE_LIMIT_MAX,
  },
  integrations: {
    paymentProvider: data.PAYMENT_PROVIDER,
    smsProvider: data.SMS_PROVIDER,
  },
  upload: {
    dir: data.UPLOAD_DIR,
    maxAvatarSizeMb: data.MAX_AVATAR_SIZE_MB,
    maxAvatarSizeBytes: data.MAX_AVATAR_SIZE_MB * 1024 * 1024,
  },
  isProduction: data.NODE_ENV === "production",
};
