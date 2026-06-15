import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  listConfiguredProjects,
  resolveProject,
  type ProjectRef,
  type ServerConfig,
} from "../config.js";
import { YapiService } from "../yapi/service.js";
import {
  addCategorySchema,
  importDataSchema,
  interfaceIdSchema,
  interfacePayloadSchema,
  listCategorySchema,
  listInterfacesSchema,
  projectIdSchema,
  rawRequestSchema,
  searchSchema,
} from "./schemas.js";

type ToolResult = CallToolResult;

export function registerYapiTools(
  server: McpServer,
  service: YapiService,
  config: ServerConfig,
): void {
  server.registerTool(
    "yapi_list_configured_projects",
    {
      title: "List configured YApi projects",
      description: "List configured YApi projects without exposing token or cookie values.",
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async () => asJson(listConfiguredProjects(config)),
  );

  server.registerTool(
    "yapi_get_project",
    {
      title: "Get YApi project",
      description: "Get YApi project information and categories.",
      inputSchema: projectIdSchema.shape,
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async (args) => {
      const target = resolveToolProject(config, args.project, args.project_id);
      return asJson(await service.getProject(target.id, target.ref));
    },
  );

  server.registerTool(
    "yapi_get_category_menu",
    {
      title: "Get YApi categories",
      description: "Get all categories for a YApi project.",
      inputSchema: projectIdSchema.shape,
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async (args) => {
      const target = resolveToolProject(config, args.project, args.project_id);
      return asJson(await service.getCategoryMenu(target.id, target.ref));
    },
  );

  server.registerTool(
    "yapi_list_menu",
    {
      title: "List YApi interface menu",
      description: "Get categories with interface summaries.",
      inputSchema: projectIdSchema.shape,
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async (args) => {
      const target = resolveToolProject(config, args.project, args.project_id);
      return asJson(await service.listMenu(target.id, target.ref));
    },
  );

  server.registerTool(
    "yapi_list_interfaces",
    {
      title: "List YApi interfaces",
      description: "List interfaces under a project.",
      inputSchema: listInterfacesSchema.shape,
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async (args) =>
      asJson(
        await service.listInterfaces({
          ...withoutProjectSelector(args),
          ...resolveProjectParams(config, args.project, args.project_id),
        }),
      ),
  );

  server.registerTool(
    "yapi_list_category_interfaces",
    {
      title: "List YApi category interfaces",
      description: "List interfaces under a category.",
      inputSchema: listCategorySchema.shape,
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async (args) =>
      asJson(
        await service.listInterfacesByCategory({
          ...withoutProjectSelector(args),
          project: args.project,
        }),
      ),
  );

  server.registerTool(
    "yapi_search_interfaces",
    {
      title: "Search YApi interfaces",
      description: "Search interfaces by title, path, or method within a project menu.",
      inputSchema: searchSchema.shape,
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async (args) =>
      asJson(
        await service.searchInterfaces({
          ...withoutProjectSelector(args),
          ...resolveProjectParams(config, args.project, args.project_id),
        }),
      ),
  );

  server.registerTool(
    "yapi_get_interface",
    {
      title: "Get YApi interface",
      description: "Get complete YApi interface detail by interface ID.",
      inputSchema: interfaceIdSchema.shape,
      annotations: { readOnlyHint: true, destructiveHint: false },
    },
    async (args) => asJson(await service.getInterface(args.id, args.project)),
  );

  server.registerTool(
    "yapi_add_category",
    {
      title: "Add YApi category",
      description: "Create an interface category in a YApi project.",
      inputSchema: addCategorySchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (args) => {
      const target = resolveToolProject(config, args.project, args.project_id);
      return asJson(
        await service.addCategory(
          {
            ...withoutProjectName(args),
            project_id: target.id,
          },
          target.ref,
        ),
      );
    },
  );

  server.registerTool(
    "yapi_add_interface",
    {
      title: "Add YApi interface",
      description: "Create a YApi interface. Accepts YApi native interface fields.",
      inputSchema: interfacePayloadSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (args) => {
      const target = resolveToolProject(config, args.project, args.project_id);
      return asJson(
        await service.addInterface(
          {
            ...withoutProjectName(args),
            project_id: target.id,
          },
          target.ref,
        ),
      );
    },
  );

  server.registerTool(
    "yapi_update_interface",
    {
      title: "Update YApi interface",
      description: "Update a YApi interface through /api/interface/up. Accepts YApi native fields.",
      inputSchema: interfacePayloadSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (args) => {
      const target = args.project ? resolveToolProject(config, args.project, args.project_id) : undefined;
      return asJson(
        await service.updateInterface(
          {
            ...withoutProjectName(args),
            ...(target?.id && !args.project_id ? { project_id: target.id } : {}),
          },
          target?.ref,
        ),
      );
    },
  );

  server.registerTool(
    "yapi_save_interface",
    {
      title: "Save YApi interface",
      description: "Save a YApi interface through /api/interface/save. Accepts YApi native fields.",
      inputSchema: interfacePayloadSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (args) => {
      const target = args.project ? resolveToolProject(config, args.project, args.project_id) : undefined;
      return asJson(
        await service.saveInterface(
          {
            ...withoutProjectName(args),
            ...(target?.id && !args.project_id ? { project_id: target.id } : {}),
          },
          target?.ref,
        ),
      );
    },
  );

  server.registerTool(
    "yapi_import_data",
    {
      title: "Import YApi data",
      description: "Import Swagger/OpenAPI data through /api/open/import_data.",
      inputSchema: importDataSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (args) => {
      const target = resolveToolProject(config, args.project, args.project_id);
      return asJson(
        await service.importData(
          {
            ...withoutProjectName(args),
            project_id: target.id,
          },
          target.ref,
        ),
      );
    },
  );

  server.registerTool(
    "yapi_raw_request",
    {
      title: "Call YApi API",
      description:
        "Advanced escape hatch for custom YApi /api/* endpoints. Automatically sends token and cookie.",
      inputSchema: rawRequestSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: true },
    },
    async (args) => asJson(await service.rawRequest(args)),
  );
}

function resolveToolProject(
  config: ServerConfig,
  project: string | undefined,
  projectId: number | undefined,
): { id: number; ref: ProjectRef } {
  const ref = project ?? projectId;
  const resolved = resolveProject(config, ref);
  if (!resolved.id) {
    throw new Error("project_id is required. Pass project_id or set YAPI_PROJECT_ID.");
  }
  return {
    id: resolved.id,
    ref: ref ?? resolved.id,
  };
}

function resolveProjectParams(
  config: ServerConfig,
  project: string | undefined,
  projectId: number | undefined,
): { project_id: number; project?: string } {
  const resolved = resolveToolProject(config, project, projectId);
  return {
    project_id: resolved.id,
    project,
  };
}

function withoutProjectSelector<T extends { project?: unknown; project_id?: unknown }>(
  value: T,
): Omit<T, "project" | "project_id"> {
  const rest = { ...value };
  delete rest.project;
  delete rest.project_id;
  return rest;
}

function withoutProjectName<T extends { project?: unknown }>(value: T): Omit<T, "project"> {
  const rest = { ...value };
  delete rest.project;
  return rest;
}

function asJson(value: unknown): ToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}
