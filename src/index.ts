#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { registerYapiTools } from "./tools/register.js";
import { YapiClient } from "./yapi/client.js";
import { YapiService } from "./yapi/service.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger(config.debug);

  logger.debug("configuration loaded", {
    baseUrl: config.baseUrl,
    hasToken: Boolean(config.token),
    hasCookie: Boolean(config.cookie),
    projectId: config.projectId,
    timeoutMs: config.timeoutMs,
  });

  const server = new McpServer({
    name: "yapi-mcp-server",
    version: "0.1.0",
  });

  const client = new YapiClient(config, logger);
  const service = new YapiService(client);
  registerYapiTools(server, service, config);

  await server.connect(new StdioServerTransport());
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[yapi-mcp:error] ${message}`);
  process.exit(1);
});
