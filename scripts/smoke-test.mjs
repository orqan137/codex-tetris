import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resetState } from "../lib/state.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function httpSmokeTest() {
  const app = spawn(process.execPath, ["app/server.mjs"], { cwd: root, stdio: "ignore" });
  try {
    await sleep(500);
    const reset = await fetch("http://localhost:4173/api/reset", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    if (!reset.ok) throw new Error("Dashboard reset endpoint failed");
    const created = await fetch("http://localhost:4173/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Login functionality", milestones: [{ title: "Build the frontend", kind: "frontend" }, { title: "Connect the backend", kind: "backend" }, { title: "Run tests", kind: "testing" }] })
    });
    if (!created.ok) throw new Error("Dashboard goal creation failed");
    const state = await (await fetch("http://localhost:4173/api/state")).json();
    if (state.goals.length !== 1 || state.goals[0].milestones.length !== 3) throw new Error("Dashboard state shape is incorrect");
    const first = state.goals[0].milestones[0];
    const updated = await fetch("http://localhost:4173/api/update", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ goalId: state.goals[0].id, milestoneId: first.id, status: "completed", summary: "Frontend is ready" }) });
    if (!updated.ok || (await (await fetch("http://localhost:4173/api/state")).json()).goals[0].milestones[0].status !== "completed") throw new Error("Dashboard update endpoint failed");
    return "dashboard: passed";
  } finally {
    app.kill();
  }
}

function mcpRequest(server, message) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`MCP request timed out: ${message.method}`)), 3000);
    const onData = (chunk) => {
      for (const line of chunk.toString().split("\n")) {
        if (!line.trim()) continue;
        const response = JSON.parse(line);
        if (response.id !== message.id) continue;
        clearTimeout(timer);
        server.stdout.off("data", onData);
        if (response.error) reject(new Error(response.error.message));
        else resolve(response.result);
      }
    };
    server.stdout.on("data", onData);
    server.stdin.write(`${JSON.stringify(message)}\n`);
  });
}

async function mcpSmokeTest() {
  const server = spawn(process.execPath, ["mcp/server.mjs"], { cwd: root });
  try {
    const initialized = await mcpRequest(server, { jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    if (!initialized.serverInfo) throw new Error("MCP initialize failed");
    const listed = await mcpRequest(server, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
    if (listed.tools.length !== 5) throw new Error("MCP tool list is incomplete");
    const opened = await mcpRequest(server, { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "goal_tetris_open", arguments: { sessionLabel: "Smoke Codex session" } } });
    if (opened.structuredContent?.session?.label !== "Smoke Codex session" || opened._meta?.["ui.resourceUri"] !== "ui://goal-tetris/board.v2.html") throw new Error("MCP native panel attach failed");
    const resource = await mcpRequest(server, { jsonrpc: "2.0", id: 4, method: "resources/read", params: { uri: "ui://goal-tetris/board.v2.html" } });
    if (!resource.contents?.[0]?.text?.includes("Feature progress") || resource.contents[0].text.includes("localhost:4173")) throw new Error("Native widget resource is incomplete");
    const started = await mcpRequest(server, { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "goal_tetris_start", arguments: { title: "Smoke goal", milestones: [{ title: "Frontend", kind: "frontend" }] } } });
    if (!started.structuredContent?.goals?.[0]?.id || started.structuredContent?.session?.label !== "Smoke Codex session") throw new Error("MCP goal creation failed");
    return "mcp: passed";
  } finally {
    server.kill();
  }
}

console.log(await httpSmokeTest());
console.log(await mcpSmokeTest());
await resetState();
