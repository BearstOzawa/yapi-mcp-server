# yapi-mcp-server

中文 | [English](#english)

一个面向 YApi 的现代 MCP Server。目标是提供开箱即用、配置简单、读写完整、适合日常接口管理工作流的 YApi MCP 接入。

## 特性

- 基于官方 `@modelcontextprotocol/sdk` 构建，支持标准 stdio MCP 传输。
- 支持通过 `npx -y @bearst/yapi-mcp-server` 启动。
- 支持项目 Token 和浏览器 Cookie 两种认证方式。
- 支持单项目和多项目 Token，格式简单直观。
- 支持读取项目、分类、接口菜单、接口列表和接口详情。
- 支持按标题、路径、方法搜索接口。
- 支持创建分类、创建接口、更新接口、保存接口。
- 支持导入 Swagger/OpenAPI 数据。
- 提供 `yapi_raw_request` 作为高级扩展工具，用于兼容自定义 YApi API。

## 快速开始

```bash
npx -y @bearst/yapi-mcp-server
```

GitHub 方式：

```bash
npx -y github:BearstOzawa/yapi-mcp-server
```

## Codex 配置

单项目 Token：

```json
{
  "command": "npx",
  "args": ["-y", "@bearst/yapi-mcp-server"],
  "env": {
    "YAPI_BASE_URL": "https://your-yapi.example.com",
    "YAPI_TOKEN": "project-token"
  }
}
```

带项目 ID 的 Token：

```json
{
  "command": "npx",
  "args": ["-y", "@bearst/yapi-mcp-server"],
  "env": {
    "YAPI_BASE_URL": "https://your-yapi.example.com",
    "YAPI_TOKEN": "40:project-token"
  }
}
```

多项目 Token：

```json
{
  "command": "npx",
  "args": ["-y", "@bearst/yapi-mcp-server"],
  "env": {
    "YAPI_BASE_URL": "https://your-yapi.example.com",
    "YAPI_TOKEN": "40:project-token-a,41:project-token-b"
  }
}
```

Cookie：

```json
{
  "command": "npx",
  "args": ["-y", "@bearst/yapi-mcp-server"],
  "env": {
    "YAPI_BASE_URL": "https://your-yapi.example.com",
    "YAPI_COOKIE": "_yapi_token=xxx; _yapi_uid=158"
  }
}
```

Cookie 不包含项目 ID。只配置 Cookie 时，查询项目、分类、接口列表等项目级数据需要在工具调用中传 `project_id`。

## 环境变量

`YAPI_TOKEN` 和 `YAPI_COOKIE` 至少设置一个。

- `YAPI_BASE_URL`：YApi 服务地址，例如 `https://yapi.example.com`。
- `YAPI_TOKEN`：YApi 项目 Token。支持普通 token，也支持 `项目ID:token,项目ID:token` 多项目格式。
- `YAPI_COOKIE`：YApi 登录态 Cookie，例如 `_yapi_token=...; _yapi_uid=...`。
- `YAPI_REQUEST_TIMEOUT_MS`：可选的请求超时时间，默认 `30000`。
- `YAPI_DEBUG`：可选调试日志，输出到 stderr，不打印 token 和 cookie 原文。

如果 `YAPI_TOKEN` 只配置了一个 `项目ID:token`，该项目会自动作为默认项目。多项目时，项目级工具需要传 `project_id`。

## 工具

只读工具：

- `yapi_list_configured_projects`
- `yapi_get_project`
- `yapi_get_category_menu`
- `yapi_list_menu`
- `yapi_list_interfaces`
- `yapi_list_category_interfaces`
- `yapi_search_interfaces`
- `yapi_get_interface`

写入工具：

- `yapi_add_category`
- `yapi_add_interface`
- `yapi_update_interface`
- `yapi_save_interface`
- `yapi_import_data`

高级工具：

- `yapi_raw_request`：调用自定义 `/api/*` 接口，会自动附带已配置的认证信息。

`yapi_list_configured_projects` 会返回当前认证配置摘要，包括 `hasToken`、`hasCookie`、`projectIdRequired` 和从 `YAPI_TOKEN` 中解析出的项目 ID。

## 开发

```bash
npm install
npm run typecheck
npm run build
npm run lint
npm run smoke
```

本地运行：

```bash
YAPI_BASE_URL="https://your-yapi.example.com" \
YAPI_TOKEN="40:project-token" \
npm run dev
```

## 发布

发布由 GitHub Actions 完成：

1. 在 GitHub 仓库 Settings -> Secrets and variables -> Actions 中添加 `NPM_TOKEN`。
2. `NPM_TOKEN` 使用 npm granular access token，需具备发布 `@bearst/yapi-mcp-server` 的权限。
3. 更新 `package.json` 版本并合并到 `main`。
4. 在 GitHub 创建 Release，或手动运行 `Publish` workflow。

CI 会在 push 和 pull request 时运行：

- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run smoke`
- `npm pack --dry-run`

## English

A modern MCP server for YApi. It is designed to be easy to configure, convenient to run with `npx`, and complete enough for everyday API management workflows.

## Features

- Built with the official `@modelcontextprotocol/sdk`.
- Standard stdio MCP transport.
- Starts with `npx -y @bearst/yapi-mcp-server`.
- Supports project token and browser cookie authentication.
- Supports single-project and multi-project tokens with a simple format.
- Reads projects, categories, interface menus, interface lists, and interface details.
- Searches interfaces by title, path, or method.
- Creates categories and creates, updates, or saves interfaces.
- Imports Swagger/OpenAPI data.
- Provides `yapi_raw_request` as an advanced extension tool for custom YApi APIs.

## Quick Start

```bash
npx -y @bearst/yapi-mcp-server
```

GitHub package:

```bash
npx -y github:BearstOzawa/yapi-mcp-server
```

## Codex Configuration

Single project token:

```json
{
  "command": "npx",
  "args": ["-y", "@bearst/yapi-mcp-server"],
  "env": {
    "YAPI_BASE_URL": "https://your-yapi.example.com",
    "YAPI_TOKEN": "project-token"
  }
}
```

Token with project ID:

```json
{
  "command": "npx",
  "args": ["-y", "@bearst/yapi-mcp-server"],
  "env": {
    "YAPI_BASE_URL": "https://your-yapi.example.com",
    "YAPI_TOKEN": "40:project-token"
  }
}
```

Multi-project token:

```json
{
  "command": "npx",
  "args": ["-y", "@bearst/yapi-mcp-server"],
  "env": {
    "YAPI_BASE_URL": "https://your-yapi.example.com",
    "YAPI_TOKEN": "40:project-token-a,41:project-token-b"
  }
}
```

Cookie:

```json
{
  "command": "npx",
  "args": ["-y", "@bearst/yapi-mcp-server"],
  "env": {
    "YAPI_BASE_URL": "https://your-yapi.example.com",
    "YAPI_COOKIE": "_yapi_token=xxx; _yapi_uid=158"
  }
}
```

Cookies do not contain project IDs. With cookie-only configuration, project-scoped tools such as project, category, and interface-list queries should pass `project_id`.

## Environment Variables

Set at least one of `YAPI_TOKEN` and `YAPI_COOKIE`.

- `YAPI_BASE_URL`: YApi base URL, for example `https://yapi.example.com`.
- `YAPI_TOKEN`: YApi project token. Supports a plain token or `projectId:token,projectId:token`.
- `YAPI_COOKIE`: YApi login cookie, for example `_yapi_token=...; _yapi_uid=...`.
- `YAPI_REQUEST_TIMEOUT_MS`: optional request timeout, default `30000`.
- `YAPI_DEBUG`: optional request logging to stderr. Token and cookie values are not printed.

If `YAPI_TOKEN` contains exactly one `projectId:token`, that project is used as the default project automatically. With multiple projects, project-scoped tools should pass `project_id`.

## Tools

Read tools:

- `yapi_list_configured_projects`
- `yapi_get_project`
- `yapi_get_category_menu`
- `yapi_list_menu`
- `yapi_list_interfaces`
- `yapi_list_category_interfaces`
- `yapi_search_interfaces`
- `yapi_get_interface`

Write tools:

- `yapi_add_category`
- `yapi_add_interface`
- `yapi_update_interface`
- `yapi_save_interface`
- `yapi_import_data`

Advanced:

- `yapi_raw_request`: calls custom `/api/*` endpoints with configured authentication attached.

`yapi_list_configured_projects` returns the current authentication configuration summary, including `hasToken`, `hasCookie`, `projectIdRequired`, and project IDs parsed from `YAPI_TOKEN`.

## Development

```bash
npm install
npm run typecheck
npm run build
npm run lint
npm run smoke
```

Run locally:

```bash
YAPI_BASE_URL="https://your-yapi.example.com" \
YAPI_TOKEN="40:project-token" \
npm run dev
```

## Publishing

Publishing is handled by GitHub Actions:

1. Add `NPM_TOKEN` in GitHub repository Settings -> Secrets and variables -> Actions.
2. Use an npm granular access token with permission to publish `@bearst/yapi-mcp-server`.
3. Update the version in `package.json` and merge to `main`.
4. Create a GitHub Release, or manually run the `Publish` workflow.

CI runs on push and pull request:

- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run smoke`
- `npm pack --dry-run`
