import { z } from "zod";

export const projectIdSchema = z.object({
  project_id: z.number().int().positive().optional().describe("YApi project ID. Defaults to YAPI_PROJECT_ID."),
});

export const listInterfacesSchema = z.object({
  project_id: z.number().int().positive().optional().describe("YApi project ID. Defaults to YAPI_PROJECT_ID."),
  page: z.number().int().positive().optional().default(1),
  limit: z.union([z.number().int().positive(), z.literal("all")]).optional().default(20),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  tag: z.union([z.string(), z.array(z.string())]).optional(),
});

export const listCategorySchema = z.object({
  catid: z.number().int().positive(),
  page: z.number().int().positive().optional().default(1),
  limit: z.union([z.number().int().positive(), z.literal("all")]).optional().default(20),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  tag: z.union([z.string(), z.array(z.string())]).optional(),
});

export const interfaceIdSchema = z.object({
  id: z.number().int().positive().describe("YApi interface ID."),
});

export const searchSchema = z.object({
  project_id: z.number().int().positive().optional().describe("YApi project ID. Defaults to YAPI_PROJECT_ID."),
  keyword: z.string().min(1),
  limit: z.number().int().positive().max(200).optional().default(30),
});

export const addCategorySchema = z.object({
  project_id: z.number().int().positive().optional().describe("YApi project ID. Defaults to YAPI_PROJECT_ID."),
  name: z.string().min(1),
  desc: z.string().optional(),
});

export const interfacePayloadSchema = z
  .object({
    id: z.number().int().positive().optional().describe("Required for update/save existing interface."),
    project_id: z.number().int().positive().optional().describe("YApi project ID. Defaults to YAPI_PROJECT_ID."),
    catid: z.number().int().positive().optional(),
    title: z.string().min(1).optional(),
    path: z.string().min(1).optional(),
    method: z.string().optional(),
    status: z.string().optional(),
    req_query: z.unknown().optional(),
    req_headers: z.unknown().optional(),
    req_body_type: z.string().optional(),
    req_body_form: z.unknown().optional(),
    req_body_other: z.string().optional(),
    res_body_type: z.string().optional(),
    res_body: z.string().optional(),
    desc: z.string().optional(),
    markdown: z.string().optional(),
    tag: z.array(z.string()).optional(),
  })
  .catchall(z.unknown());

export const importDataSchema = z
  .object({
    project_id: z.number().int().positive().optional().describe("YApi project ID. Defaults to YAPI_PROJECT_ID."),
    data: z.string().min(1).describe("Import payload, usually JSON string such as swagger/openapi data."),
    type: z.string().optional().default("swagger"),
    merge: z.union([z.string(), z.boolean()]).optional(),
    jsonType: z.string().optional(),
    token: z.string().optional().describe("Override YAPI_TOKEN for this import only."),
  })
  .catchall(z.unknown());

export const rawRequestSchema = z.object({
  method: z.enum(["GET", "POST"]),
  path: z
    .string()
    .regex(/^\/api\//, "Only /api/* paths are allowed.")
    .describe("YApi API path, for example /api/interface/get."),
  query: z.record(z.unknown()).optional(),
  body: z.record(z.unknown()).optional(),
  allow_api_error: z.boolean().optional(),
});
