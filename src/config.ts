import { z } from "zod";

const rawConfigSchema = z.object({
  YAPI_BASE_URL: z.string().url(),
  YAPI_TOKEN: z.string().optional(),
  YAPI_COOKIE: z.string().optional(),
  YAPI_PROJECT_ID: z.coerce.number().int().positive().optional(),
  YAPI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  YAPI_DEBUG: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((value) => value === "true" || value === "1"),
});

export interface ServerConfig {
  baseUrl: string;
  token?: string;
  cookie?: string;
  projectId?: number;
  timeoutMs: number;
  debug: boolean;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const parsed = rawConfigSchema.safeParse(env);

  if (!parsed.success) {
    const message = parsed.error.errors
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid YApi MCP configuration:\n${message}`);
  }

  const token = emptyToUndefined(parsed.data.YAPI_TOKEN);
  const cookie = emptyToUndefined(parsed.data.YAPI_COOKIE);

  if (!token && !cookie) {
    throw new Error("Invalid YApi MCP configuration: set YAPI_TOKEN or YAPI_COOKIE.");
  }

  return {
    baseUrl: parsed.data.YAPI_BASE_URL.replace(/\/+$/, ""),
    token,
    cookie,
    projectId: parsed.data.YAPI_PROJECT_ID,
    timeoutMs: parsed.data.YAPI_REQUEST_TIMEOUT_MS,
    debug: Boolean(parsed.data.YAPI_DEBUG),
  };
}

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
