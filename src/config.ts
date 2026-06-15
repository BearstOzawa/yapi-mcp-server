import { z } from "zod";

const rawConfigSchema = z.object({
  YAPI_BASE_URL: z.string().url(),
  YAPI_TOKEN: z.string().optional(),
  YAPI_COOKIE: z.string().optional(),
  YAPI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  YAPI_DEBUG: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((value) => value === "true" || value === "1"),
});

export type ProjectRef = number | string | undefined;

export interface TokenProject {
  id: number;
  token: string;
}

export interface ServerConfig {
  baseUrl: string;
  token?: string;
  cookie?: string;
  tokenProjects: TokenProject[];
  timeoutMs: number;
  debug: boolean;
}

export interface ResolvedProject {
  id?: number;
  baseUrl: string;
  token?: string;
  cookie?: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const parsed = rawConfigSchema.safeParse(env);

  if (!parsed.success) {
    const message = parsed.error.errors
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid YApi MCP configuration:\n${message}`);
  }

  const rawToken = emptyToUndefined(parsed.data.YAPI_TOKEN);
  const cookie = emptyToUndefined(parsed.data.YAPI_COOKIE);
  const tokenProjects = parseTokenProjects(rawToken);
  const token = tokenProjects.length > 0 ? undefined : rawToken;

  if (!token && !cookie && tokenProjects.length === 0) {
    throw new Error("Invalid YApi MCP configuration: set YAPI_TOKEN or YAPI_COOKIE.");
  }

  return {
    baseUrl: normalizeBaseUrl(parsed.data.YAPI_BASE_URL),
    token,
    cookie,
    tokenProjects,
    timeoutMs: parsed.data.YAPI_REQUEST_TIMEOUT_MS,
    debug: Boolean(parsed.data.YAPI_DEBUG),
  };
}

export function resolveProject(config: ServerConfig, ref?: ProjectRef): ResolvedProject {
  const projectId = normalizeProjectRef(ref);

  if (projectId !== undefined) {
    const tokenProject = config.tokenProjects.find((project) => project.id === projectId);
    return {
      id: projectId,
      baseUrl: config.baseUrl,
      token: tokenProject?.token ?? config.token,
      cookie: config.cookie,
    };
  }

  if (config.tokenProjects.length === 1) {
    const [project] = config.tokenProjects;
    return {
      id: project.id,
      baseUrl: config.baseUrl,
      token: project.token,
      cookie: config.cookie,
    };
  }

  return {
    baseUrl: config.baseUrl,
    token: config.token,
    cookie: config.cookie,
  };
}

export function listConfiguredProjects(config: ServerConfig): Array<{
  id: number;
  baseUrl: string;
  hasToken: boolean;
  hasCookie: boolean;
}> {
  return config.tokenProjects.map((project) => ({
    id: project.id,
    baseUrl: config.baseUrl,
    hasToken: true,
    hasCookie: Boolean(config.cookie),
  }));
}

function parseTokenProjects(raw: string | undefined): TokenProject[] {
  const value = emptyToUndefined(raw);
  if (!value || !value.includes(":")) {
    return [];
  }

  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0 || parts.some((part) => !/^\d+:.+$/.test(part))) {
    return [];
  }

  return parts.map((part) => {
    const separatorIndex = part.indexOf(":");
    return {
      id: Number(part.slice(0, separatorIndex)),
      token: part.slice(separatorIndex + 1),
    };
  });
}

function normalizeProjectRef(ref: ProjectRef): number | undefined {
  if (ref === undefined) {
    return undefined;
  }

  if (typeof ref === "number") {
    return ref;
  }

  return /^\d+$/.test(ref) ? Number(ref) : undefined;
}

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}
