import readline from "node:readline";
import { attachSession, createGoal, readState, resetState, updateMilestone } from "../lib/state.mjs";
import { RESOURCE_URI, widgetHtml } from "./widget.mjs";

const PROTOCOL_VERSION = "2024-11-05";

const tools = [
  {
    name: "goal_tetris_open",
    description: "Open the native Goal Tetris panel in the current Codex conversation and attach it to this session.",
    inputSchema: {
      type: "object",
      properties: {
        sessionLabel: { type: "string", description: "Optional label shown in the panel" },
        sessionId: { type: "string", description: "Optional session identifier supplied by the host" }
      }
    }
  },
  {
    name: "goal_tetris_start",
    description: "Create a Goal Tetris board for a requested feature. Call this once when the user starts tracking a new feature.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Feature or goal name" },
        description: { type: "string" },
        milestones: {
          type: "array",
          description: "Meaningful milestones generated from the user's goal",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              kind: { type: "string", enum: ["planning", "frontend", "backend", "testing", "review", "approval"] }
            },
            required: ["title", "kind"]
          }
        }
      },
      required: ["title"]
    }
  },
  {
    name: "goal_tetris_update",
    description: "Update one meaningful feature milestone. Use this after frontend, backend, testing, review, or approval state changes; do not call for every shell command.",
    inputSchema: {
      type: "object",
      properties: {
        goalId: { type: "string" },
        milestoneId: { type: "string" },
        status: { type: "string", enum: ["pending", "active", "completed", "blocked", "approval"] },
        summary: { type: "string" },
        rationale: { type: "string" },
        attention: { type: "boolean" }
      },
      required: ["goalId", "milestoneId", "status"]
    }
  },
  {
    name: "goal_tetris_snapshot",
    description: "Show all current Goal Tetris boards and milestone states.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "goal_tetris_reset",
    description: "Clear all Goal Tetris boards for a fresh demo.",
    inputSchema: { type: "object", properties: {} }
  }
];

function result(state, message) {
  return {
    content: [{ type: "text", text: `${message}\n${JSON.stringify(state)}` }],
    structuredContent: state,
    _meta: {
      "ui.resourceUri": RESOURCE_URI,
      "openai/outputTemplate": RESOURCE_URI,
      "openai/widgetAccessible": true,
      "openai/resultCanProduceWidget": true,
      "openai/toolInvocation/invoking": "Updating Goal Tetris",
      "openai/toolInvocation/invoked": "Goal Tetris updated"
    }
  };
}

async function callTool(name, args = {}) {
  if (name === "goal_tetris_open") {
    const state = await attachSession({ label: args.sessionLabel, id: args.sessionId });
    return result(state, `Goal Tetris opened for ${state.session.label}`);
  }
  if (name === "goal_tetris_start") {
    const goal = await createGoal(args);
    return result(await readState(), `Goal Tetris board created: ${goal.title}`);
  }
  if (name === "goal_tetris_update") {
    const update = await updateMilestone(args);
    return result(await readState(), `Goal Tetris updated: ${update.milestone.title} - ${update.milestone.status}`);
  }
  if (name === "goal_tetris_snapshot") return result(await readState(), "Current Goal Tetris snapshot");
  if (name === "goal_tetris_reset") return result(await resetState(), "Goal Tetris boards reset");
  throw new Error(`Unknown tool: ${name}`);
}

async function handle(message) {
  if (message.method === "notifications/initialized") return null;
  if (message.method === "initialize") {
    return {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: {}, resources: {} },
      serverInfo: { name: "goal-tetris", version: "0.1.0" }
    };
  }
  if (message.method === "tools/list") return { tools };
  if (message.method === "resources/list") {
    return { resources: [{ uri: RESOURCE_URI, name: "Goal Tetris native Codex panel", mimeType: "text/html+skybridge" }] };
  }
  if (message.method === "resources/read") {
    return {
      contents: [{
        uri: RESOURCE_URI,
        mimeType: "text/html+skybridge",
        text: widgetHtml(),
        _meta: {
          "openai/widgetDescription": "A native Codex panel showing one Tetris board per requested feature.",
          "openai/widgetPrefersBorder": true
        }
      }]
    };
  }
  if (message.method === "tools/call") return callTool(message.params?.name, message.params?.arguments);
  if (message.method === "ping") return {};
  return {};
}

const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
input.on("line", async (line) => {
  if (!line.trim()) return;
  let message;
  try {
    message = JSON.parse(line);
    const response = await handle(message);
    if (message.id === undefined || response === null) return;
    process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: message.id, result: response })}\n`);
  } catch (error) {
    if (message?.id === undefined) return;
    process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: message.id, error: { code: -32603, message: error.message } })}\n`);
  }
});
