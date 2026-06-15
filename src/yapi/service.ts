import type { ProjectRef } from "../config.js";
import { YapiClient } from "./client.js";
import type {
  YapiInterfaceSummary,
  YapiListResult,
  YapiMenuCategory,
  YapiProject,
  YapiResponse,
} from "./types.js";

export interface ListInterfacesParams extends Record<string, unknown> {
  project_id?: number;
  project?: string;
  catid?: number;
  page?: number;
  limit?: number | "all";
  status?: string | string[];
  tag?: string | string[];
}

export class YapiService {
  constructor(private readonly client: YapiClient) {}

  getProject(projectId: number, project?: ProjectRef): Promise<YapiResponse<YapiProject>> {
    return this.client.get<YapiProject>("/api/project/get", {
      query: { id: projectId },
      project,
    });
  }

  getCategoryMenu(projectId: number, project?: ProjectRef): Promise<YapiResponse<unknown>> {
    return this.client.get<unknown>("/api/interface/getCatMenu", {
      query: { project_id: projectId },
      project,
    });
  }

  listMenu(projectId: number, project?: ProjectRef): Promise<YapiResponse<YapiMenuCategory[]>> {
    return this.client.get<YapiMenuCategory[]>("/api/interface/list_menu", {
      query: { project_id: projectId },
      project,
    });
  }

  listInterfaces(params: ListInterfacesParams): Promise<YapiResponse<YapiListResult>> {
    const { project, ...query } = params;
    return this.client.get<YapiListResult>("/api/interface/list", {
      query,
      project,
    });
  }

  listInterfacesByCategory(params: ListInterfacesParams): Promise<YapiResponse<YapiListResult>> {
    const { project, ...query } = params;
    return this.client.get<YapiListResult>("/api/interface/list_cat", {
      query,
      project,
    });
  }

  getInterface(id: number, project?: ProjectRef): Promise<YapiResponse<unknown>> {
    return this.client.get<unknown>("/api/interface/get", {
      query: { id },
      project,
    });
  }

  addCategory(data: Record<string, unknown>, project?: ProjectRef): Promise<YapiResponse<unknown>> {
    return this.client.post<unknown>("/api/interface/add_cat", {
      body: data,
      project,
    });
  }

  addInterface(data: Record<string, unknown>, project?: ProjectRef): Promise<YapiResponse<unknown>> {
    return this.client.post<unknown>("/api/interface/add", {
      body: data,
      project,
    });
  }

  updateInterface(data: Record<string, unknown>, project?: ProjectRef): Promise<YapiResponse<unknown>> {
    return this.client.post<unknown>("/api/interface/up", {
      body: data,
      project,
    });
  }

  saveInterface(data: Record<string, unknown>, project?: ProjectRef): Promise<YapiResponse<unknown>> {
    return this.client.post<unknown>("/api/interface/save", {
      body: data,
      project,
    });
  }

  importData(data: Record<string, unknown>, project?: ProjectRef): Promise<YapiResponse<unknown>> {
    return this.client.post<unknown>("/api/open/import_data", {
      body: data,
      project,
    });
  }

  async searchInterfaces(params: {
    project_id: number;
    project?: string;
    keyword: string;
    limit?: number;
  }): Promise<YapiResponse<YapiInterfaceSummary[]>> {
    const menu = await this.listMenu(params.project_id, params.project);
    const keyword = params.keyword.toLowerCase();
    const max = params.limit ?? 30;
    const matches: YapiInterfaceSummary[] = [];

    for (const category of menu.data ?? []) {
      for (const item of category.list ?? []) {
        if (matches.length >= max) {
          break;
        }
        const haystack = `${item.title} ${item.path} ${item.method}`.toLowerCase();
        if (haystack.includes(keyword)) {
          matches.push(item);
        }
      }
      if (matches.length >= max) {
        break;
      }
    }

    return {
      errcode: 0,
      errmsg: "成功！",
      data: matches,
    };
  }

  rawRequest(params: {
    method: "GET" | "POST";
    path: string;
    query?: Record<string, unknown>;
    body?: Record<string, unknown>;
    allow_api_error?: boolean;
    project?: string;
  }): Promise<YapiResponse<unknown>> {
    if (params.method === "GET") {
      return this.client.get<unknown>(params.path, {
        query: params.query,
        allowApiError: params.allow_api_error,
        project: params.project,
      });
    }

    return this.client.post<unknown>(params.path, {
      query: params.query,
      body: params.body,
      allowApiError: params.allow_api_error,
      project: params.project,
    });
  }
}
