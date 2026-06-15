export interface YapiResponse<T = unknown> {
  errcode: number;
  errmsg: string;
  data: T;
}

export interface YapiCategory {
  _id: number;
  name: string;
  project_id: number;
  desc?: string | null;
  uid?: number;
  parent_id?: number;
  add_time?: number;
  up_time?: number;
  index?: number;
}

export interface YapiProject {
  _id: number;
  name: string;
  basepath?: string;
  project_type?: "private" | "public" | string;
  uid?: number;
  group_id?: number;
  env?: unknown[];
  cat?: YapiCategory[];
  role?: string;
}

export interface YapiInterfaceSummary {
  _id: number;
  title: string;
  path: string;
  method: string;
  project_id: number;
  catid: number;
  status?: string;
  tag?: string[];
  uid?: number;
  add_time?: number;
  up_time?: number;
}

export interface YapiListResult {
  count: number;
  total: number;
  list: YapiInterfaceSummary[];
}

export interface YapiMenuCategory extends YapiCategory {
  list?: YapiInterfaceSummary[];
}
