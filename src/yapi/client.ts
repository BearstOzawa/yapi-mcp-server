import type { Logger } from "../logger.js";
import type { ServerConfig } from "../config.js";
import { YapiApiError, YapiHttpError } from "./errors.js";
import type { YapiResponse } from "./types.js";

export interface RequestOptions {
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  requireToken?: boolean;
  allowApiError?: boolean;
}

const commonHeaders = {
  Accept: "application/json, text/plain, */*",
  "User-Agent": "YApi-MCP-Server/0.1.0",
};

export class YapiClient {
  constructor(
    private readonly config: ServerConfig,
    private readonly logger: Logger,
  ) {}

  get<T>(path: string, options: RequestOptions = {}): Promise<YapiResponse<T>> {
    return this.request<T>("GET", path, options);
  }

  post<T>(path: string, options: RequestOptions = {}): Promise<YapiResponse<T>> {
    return this.request<T>("POST", path, options);
  }

  async request<T>(
    method: "GET" | "POST",
    path: string,
    options: RequestOptions = {},
  ): Promise<YapiResponse<T>> {
    const url = this.buildUrl(path, options.query, options.requireToken);
    const headers: Record<string, string> = { ...commonHeaders };

    if (this.config.cookie) {
      headers.Cookie = this.config.cookie;
    }

    const init: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.config.timeoutMs),
    };

    if (method === "POST") {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(this.withToken(options.body ?? {}, options.requireToken));
    }

    this.logger.debug("request", {
      method,
      url: this.redactUrl(url.toString()),
      hasCookie: Boolean(this.config.cookie),
    });

    const response = await fetch(url, init);
    const responseText = await response.text();

    if (!response.ok) {
      throw new YapiHttpError(
        `YApi HTTP error: ${response.status} ${response.statusText}`,
        response.status,
        responseText,
      );
    }

    const payload = this.parseJson<T>(responseText);
    this.logger.debug("response", {
      errcode: payload.errcode,
      errmsg: payload.errmsg,
    });

    if (payload.errcode !== 0 && !options.allowApiError) {
      throw new YapiApiError(`YApi API error ${payload.errcode}: ${payload.errmsg}`, payload.errcode, payload.data);
    }

    return payload;
  }

  private buildUrl(
    path: string,
    query: Record<string, unknown> | undefined,
    requireToken = true,
  ): URL {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.config.baseUrl}${normalizedPath}`);
    const params = this.withToken(query ?? {}, requireToken);

    for (const [key, value] of Object.entries(params)) {
      appendSearchParam(url, key, value);
    }

    return url;
  }

  private withToken(
    params: Record<string, unknown>,
    requireToken = true,
  ): Record<string, unknown> {
    if (!requireToken || !this.config.token || params.token !== undefined) {
      return params;
    }

    return {
      token: this.config.token,
      ...params,
    };
  }

  private parseJson<T>(responseText: string): YapiResponse<T> {
    try {
      return JSON.parse(responseText) as YapiResponse<T>;
    } catch {
      throw new Error(`YApi returned non-JSON response: ${responseText.slice(0, 500)}`);
    }
  }

  private redactUrl(value: string): string {
    const url = new URL(value);
    if (url.searchParams.has("token")) {
      url.searchParams.set("token", "***");
    }
    return url.toString();
  }
}

function appendSearchParam(url: URL, key: string, value: unknown): void {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      appendSearchParam(url, key, item);
    }
    return;
  }

  url.searchParams.append(key, String(value));
}
