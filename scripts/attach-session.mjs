import { attachSession, createGoal, readState, updateMilestone } from "../lib/state.mjs";

const sessionId = process.argv[2] || null;
const title = process.argv[3] || "Current Codex session work";

await attachSession({ label: "Current Codex session", id: sessionId });
const goal = await createGoal({
  title,
  description: "Track meaningful work performed in the active Codex conversation.",
  milestones: [
    { title: "Attach to the current Codex session", kind: "planning" },
    { title: "Render the native Codex panel", kind: "frontend" },
    { title: "Connect milestone state to the MCP bridge", kind: "backend" },
    { title: "Run plugin and MCP verification", kind: "testing" },
    { title: "Review the current session flow", kind: "review" }
  ]
});

for (const [index, summary] of [
  "The board is attached to the current Codex conversation context.",
  "The UI resource is a native embedded Codex panel with feature boards and falling tetrominoes.",
  "Open, start, update, snapshot, and reset return the same full session state.",
  "Syntax checks, MCP smoke tests, and plugin manifest validation passed."
].entries()) {
  await updateMilestone({
    goalId: goal.id,
    milestoneId: goal.milestones[index].id,
    status: "completed",
    summary,
    rationale: "Confirmed by the Goal Tetris plugin implementation and local verification."
  });
}

await updateMilestone({
  goalId: goal.id,
  milestoneId: goal.milestones[4].id,
  status: "active",
  attention: true,
  summary: "Reload the plugin in Codex so this existing task can render the new widget.",
  rationale: "Codex caches plugin tools per task; the current tool list does not yet include Goal Tetris."
});

console.log(JSON.stringify(await readState(), null, 2));
