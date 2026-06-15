# yapi-mcp-server

中文 | [English](#english)

一个面向 YApi 的现代 MCP Server。目标是提供开箱即用、配置简单、读写完整、适合日常接口管理工作流的 YApi MCP 接入。

## 特性

- 基于官方 `@modelcontextprotocol/sdk` 构建，支持标准 stdio MCP 传输。
- 支持通过 `npx -y @bearst/yapi-mcp-server` 启动。
- 支持项目 Token 和浏览器 Cookie 两种认证方式。
- 支持单项目和多项目配置，项目可通过 ID 或别名选择。
- 支持读取项目、分类、接口菜单、接口列表和接口详情。
- 支持按标题、路径、方法搜索接口。
- 支持创建分类、创建接口、更新接口、保存接口。
- 支持导入 Swagger/OpenAPI 数据。
- 提供 `yapi_raw_request` 作为高级扩展工具，用于兼容自定义 YApi API。

## 快速开始

npm 包方式：

```bash
npx -y @bearst/yapi-mcp-server
```

GitHub 方式：

```bash
npx -y github:BearstOzawa/yapi-mcp-server
```

## Codex 配置

npm 包方式：

```toml
[mcp_servers.yapi]
command = "npx"
args = ["-y", "@bearst/yapi-mcp-server"]
startup_timeout_sec = 60

[mcp_servers.yapi.env]
YAPI_BASE_URL = "https://your-yapi.example.com"
YAPI_PROJECT_ID = "40"
YAPI_TOKEN = "project-token"
YAPI_DEBUG = "false"
```

GitHub 方式：

```toml
[mcp_servers.yapi]
command = "npx"
args = ["-y", "github:BearstOzawa/yapi-mcp-server"]
startup_timeout_sec = 120

[mcp_servers.yapi.env]
YAPI_BASE_URL = "https://your-yapi.example.com"
YAPI_PROJECT_ID = "40"
YAPI_TOKEN = "project-token"
YAPI_DEBUG = "false"
```

Cookie 方式：

```toml
[mcp_servers.yapi.env]
YAPI_BASE_URL = "https://your-yapi.example.com"
YAPI_COOKIE = "_yapi_token=xxx; _yapi_uid=158"
YAPI_DEBUG = "false"
```

多项目 Token 简写：

```toml
[mcp_servers.yapi.env]
YAPI_BASE_URL = "https://your-yapi.example.com"
YAPI_DEFAULT_PROJECT = "40"
YAPI_TOKEN = "40:project-token-a,41:project-token-b"
YAPI_DEBUG = "false"
```

多项目完整配置：

```toml
[mcp_servers.yapi.env]
YAPI_BASE_URL = "https://your-yapi.example.com"
YAPI_DEFAULT_PROJECT = "city-brain"
YAPI_PROJECTS = '''
[
  {
    "id": 40,
    "name": "city-brain",
    "token": "project-token-a"
  },
  {
    "id": 41,
    "name": "traffic",
    "token": "project-token-b",
    "cookie": "_yapi_token=xxx; _yapi_uid=158"
  }
]
'''
```

## 环境变量

`YAPI_TOKEN`、`YAPI_COOKIE`、`YAPI_PROJECTS` 至少设置一个。

- `YAPI_BASE_URL`：YApi 服务地址，例如 `https://yapi.example.com`。
- `YAPI_PROJECT_ID`：可选的默认项目 ID，设置后项目级工具调用可以省略 `project_id`。
- `YAPI_DEFAULT_PROJECT`：可选的默认项目别名或 ID，优先用于多项目配置。
- `YAPI_PROJECTS`：可选的多项目 JSON 数组，每个项目支持 `id`、`name`、`baseUrl`、`token`、`cookie`。
- `YAPI_TOKEN`：YApi 项目 Token。支持单项目 token，也支持 `项目ID:token,项目ID:token` 多项目简写。
- `YAPI_COOKIE`：YApi 登录态 Cookie，例如 `_yapi_token=...; _yapi_uid=...`。
- `YAPI_REQUEST_TIMEOUT_MS`：可选的请求超时时间，默认 `30000`。
- `YAPI_DEBUG`：可选调试日志，输出到 stderr，不打印 token 和 cookie 原文。

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

## 开发

```bash
npm install
npm run typecheck
npm run build
npm run lint
```

本地运行：

```bash
YAPI_BASE_URL="https://your-yapi.example.com" \
YAPI_PROJECT_ID="40" \
YAPI_TOKEN="project-token" \
npm run dev
```

## English

A modern MCP server for YApi. It is designed to be easy to configure, convenient to run with `npx`, and complete enough for everyday API management workflows.

## Features

- Built with the official `@modelcontextprotocol/sdk`.
- Standard stdio MCP transport.
- Starts with `npx -y @bearst/yapi-mcp-server`.
- Supports project token and browser cookie authentication.
- Supports single-project and multi-project configuration. Projects can be selected by ID or alias.
- Reads projects, categories, interface menus, interface lists, and interface details.
- Searches interfaces by title, path, or method.
- Creates categories and creates, updates, or saves interfaces.
- Imports Swagger/OpenAPI data.
- Provides `yapi_raw_request` as an advanced extension tool for custom YApi APIs.

## Quick Start

npm package:

```bash
npx -y @bearst/yapi-mcp-server
```

GitHub package:

```bash
npx -y github:BearstOzawa/yapi-mcp-server
```

## Codex Configuration

npm package:

```toml
[mcp_servers.yapi]
command = "npx"
args = ["-y", "@bearst/yapi-mcp-server"]
startup_timeout_sec = 60

[mcp_servers.yapi.env]
YAPI_BASE_URL = "https://your-yapi.example.com"
YAPI_PROJECT_ID = "40"
YAPI_TOKEN = "project-token"
YAPI_DEBUG = "false"
```

Cookie authentication:

```toml
[mcp_servers.yapi.env]
YAPI_BASE_URL = "https://your-yapi.example.com"
YAPI_COOKIE = "_yapi_token=xxx; _yapi_uid=158"
YAPI_DEBUG = "false"
```

Multi-project token shorthand:

```toml
[mcp_servers.yapi.env]
YAPI_BASE_URL = "https://your-yapi.example.com"
YAPI_DEFAULT_PROJECT = "40"
YAPI_TOKEN = "40:project-token-a,41:project-token-b"
YAPI_DEBUG = "false"
```

Full multi-project configuration:

```toml
[mcp_servers.yapi.env]
YAPI_BASE_URL = "https://your-yapi.example.com"
YAPI_DEFAULT_PROJECT = "city-brain"
YAPI_PROJECTS = '''
[
  {
    "id": 40,
    "name": "city-brain",
    "token": "project-token-a"
  },
  {
    "id": 41,
    "name": "traffic",
    "token": "project-token-b",
    "cookie": "_yapi_token=xxx; _yapi_uid=158"
  }
]
'''
```

GitHub package:

```toml
[mcp_servers.yapi]
command = "npx"
args = ["-y", "github:BearstOzawa/yapi-mcp-server"]
startup_timeout_sec = 120

[mcp_servers.yapi.env]
YAPI_BASE_URL = "https://your-yapi.example.com"
YAPI_PROJECT_ID = "40"
YAPI_TOKEN = "project-token"
YAPI_DEBUG = "false"
```

## Environment Variables

Set at least one of `YAPI_TOKEN`, `YAPI_COOKIE`, and `YAPI_PROJECTS`.

- `YAPI_BASE_URL`: YApi base URL, for example `https://yapi.example.com`.
- `YAPI_PROJECT_ID`: optional default project ID, so project-scoped tool calls can omit `project_id`.
- `YAPI_DEFAULT_PROJECT`: optional default project alias or ID, mainly for multi-project setup.
- `YAPI_PROJECTS`: optional multi-project JSON array. Each item supports `id`, `name`, `baseUrl`, `token`, and `cookie`.
- `YAPI_TOKEN`: YApi project token. Supports a single token or `projectId:token,projectId:token` multi-project shorthand.
- `YAPI_COOKIE`: YApi login cookie, for example `_yapi_token=...; _yapi_uid=...`.
- `YAPI_REQUEST_TIMEOUT_MS`: optional request timeout, default `30000`.
- `YAPI_DEBUG`: optional request logging to stderr. Token and cookie values are not printed.

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

## Development

```bash
npm install
npm run typecheck
npm run build
npm run lint
```

Run locally:

```bash
YAPI_BASE_URL="https://your-yapi.example.com" \
YAPI_PROJECT_ID="40" \
YAPI_TOKEN="project-token" \
npm run dev
```
