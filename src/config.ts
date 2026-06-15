import { z } from "zod";

const rawConfigSchema = z.object({
  YAPI_BASE_URL: z.string().url(),
  YAPI_TOKEN: z.string().optional(),
  YAPI_COOKIE: z.string().optional(),
  YAPI_PROJECT_ID: z.coerce.number().int().positive().optional(),
  YAPI_DEFAULT_PROJECT: z.string().optional(),
  YAPI_PROJECTS: z.string().optional(),
  YAPI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  YAPI_DEBUG: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((value) => value === "true" || value === "1"),
});

const projectConfigSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().min(1).optional(),
  baseUrl: z.string().url().optional(),
  token: z.string().optional(),
  cookie: z.string().optional(),
});

export type ProjectRef = number | string | undefined;

export interface ProjectConfig {
  id: number;
  name?: string;
  baseUrl?: string;
  token?: string;
  cookie?: string;
}

export interface ServerConfig {
  baseUrl: string;
  token?: string;
  cookie?: string;
  projectId?: number;
  defaultProject?: string;
  projects: ProjectConfig[];
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

  const rawToken = emptyToUndefined(parsed.data.YAPI_TOKEN);
  const cookie = emptyToUndefined(parsed.data.YAPI_COOKIE);
  const tokenProjects = parseTokenProjects(rawToken);
  const token = tokenProjects.length > 0 ? undefined : rawToken;
  const projects = mergeProjects(tokenProjects, parseProjects(parsed.data.YAPI_PROJECTS));

  if (!token && !cookie && projects.length === 0) {
    throw new Error("Invalid YApi MCP configuration: set YAPI_TOKEN, YAPI_COOKIE, or YAPI_PROJECTS.");
  }

  return {
    baseUrl: parsed.data.YAPI_BASE_URL.replace(/\/+$/, ""),
    token,
    cookie,
    projectId: parsed.data.YAPI_PROJECT_ID,
    defaultProject: emptyToUndefined(parsed.data.YAPI_DEFAULT_PROJECT),
    projects,
    timeoutMs: parsed.data.YAPI_REQUEST_TIMEOUT_MS,
    debug: Boolean(parsed.data.YAPI_DEBUG),
  };
}

export interface ResolvedProject {
  id?: number;
  name?: string;
  baseUrl: string;
  token?: string;
  cookie?: string;
}

export function resolveProject(config: ServerConfig, ref?: ProjectRef): ResolvedProject {
  const selectedRef = ref ?? config.defaultProject ?? config.projectId;

  if (selectedRef === undefined) {
    return {
      id: config.projectId,
      baseUrl: config.baseUrl,
      token: config.token,
      cookie: config.cookie,
    };
  }

  const project = findProject(config.projects, selectedRef);
  if (project) {
    return {
      id: project.id,
      name: project.name,
      baseUrl: normalizeBaseUrl(project.baseUrl ?? config.baseUrl),
      token: project.token ?? config.token,
      cookie: project.cookie ?? config.cookie,
    };
  }

  if (typeof selectedRef === "number" || /^\d+$/.test(selectedRef)) {
    return {
      id: Number(selectedRef),
      baseUrl: config.baseUrl,
      token: config.token,
      cookie: config.cookie,
    };
  }

  throw new Error(`Unknown YApi project: ${selectedRef}`);
}

export function listConfiguredProjects(config: ServerConfig): Array<{
  id: number;
  name?: string;
  baseUrl: string;
  hasToken: boolean;
  hasCookie: boolean;
}> {
  return config.projects.map((project) => ({
    id: project.id,
    name: project.name,
    baseUrl: normalizeBaseUrl(project.baseUrl ?? config.baseUrl),
    hasToken: Boolean(project.token ?? config.token),
    hasCookie: Boolean(project.cookie ?? config.cookie),
  }));
}

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parseProjects(raw: string | undefined): ProjectConfig[] {
  const value = emptyToUndefined(raw);
  if (!value) {
    return [];
  }

  let json: unknown;
  try {
    json = JSON.parse(value);
  } catch (error) {
    throw new Error(
      `Invalid YAPI_PROJECTS: expected JSON array. ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  const parsed = z.array(projectConfigSchema).safeParse(json);
  if (!parsed.success) {
    const message = parsed.error.errors
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid YAPI_PROJECTS:\n${message}`);
  }

  return parsed.data.map((project) => ({
    ...project,
    baseUrl: project.baseUrl ? normalizeBaseUrl(project.baseUrl) : undefined,
    token: emptyToUndefined(project.token),
    cookie: emptyToUndefined(project.cookie),
  }));
}

function parseTokenProjects(raw: string | undefined): ProjectConfig[] {
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

function mergeProjects(baseProjects: ProjectConfig[], overrideProjects: ProjectConfig[]): ProjectConfig[] {
  const projects = new Map<number, ProjectConfig>();

  for (const project of baseProjects) {
    projects.set(project.id, project);
  }

  for (const project of overrideProjects) {
    const existing = projects.get(project.id);
    projects.set(project.id, {
      ...existing,
      ...project,
      token: project.token ?? existing?.token,
      cookie: project.cookie ?? existing?.cookie,
      baseUrl: project.baseUrl ?? existing?.baseUrl,
    });
  }

  return [...projects.values()];
}

function findProject(projects: ProjectConfig[], ref: number | string): ProjectConfig | undefined {
  const normalizedRef = String(ref);
  return projects.find((project) => {
    return String(project.id) === normalizedRef || project.name === normalizedRef;
  });
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}
