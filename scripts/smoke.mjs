import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function withClient(env, fn) {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
    env: {
      ...process.env,
      ...env,
    },
  });

  const client = new Client({ name: "smoke-test", version: "0.0.0" });
  await client.connect(transport);
  try {
    await fn(client);
  } finally {
    await client.close();
  }
}

function textResult(result) {
  return JSON.parse(result.content[0].text);
}

await withClient(
  {
    YAPI_BASE_URL: "https://example.com",
    YAPI_COOKIE: "_yapi_token=x; _yapi_uid=1",
  },
  async (client) => {
    const summary = textResult(
      await client.callTool({ name: "yapi_list_configured_projects", arguments: {} }),
    );
    assert.equal(summary.hasCookie, true);
    assert.equal(summary.hasToken, false);
    assert.equal(summary.projectIdRequired, true);
    assert.deepEqual(summary.tokenProjects, []);
  },
);

await withClient(
  {
    YAPI_BASE_URL: "https://example.com",
    YAPI_TOKEN: "40:token-a",
  },
  async (client) => {
    const summary = textResult(
      await client.callTool({ name: "yapi_list_configured_projects", arguments: {} }),
    );
    assert.equal(summary.hasToken, true);
    assert.equal(summary.projectIdRequired, false);
    assert.deepEqual(summary.tokenProjects, [{ id: 40, hasToken: true }]);

    try {
      await client.callTool({ name: "yapi_get_project", arguments: {} });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      assert.equal(message.includes("project_id is required"), false);
    }
  },
);

await withClient(
  {
    YAPI_BASE_URL: "https://example.com",
    YAPI_TOKEN: "40:token-a,41:token-b",
  },
  async (client) => {
    const summary = textResult(
      await client.callTool({ name: "yapi_list_configured_projects", arguments: {} }),
    );
    assert.equal(summary.projectIdRequired, true);
    assert.deepEqual(summary.tokenProjects, [
      { id: 40, hasToken: true },
      { id: 41, hasToken: true },
    ]);
  },
);

console.log("smoke tests passed");
