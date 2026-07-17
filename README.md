# Goal Tetris

Goal Tetris is a Codex session companion for the OpenAI Build Week Developer Tools track. It turns each requested feature into its own Tetris map. As Codex reaches meaningful milestones, the corresponding tetromino falls into place.

![Goal Tetris](assets/thumbnail.png)

## What works in this MVP

- Multiple feature boards in one dashboard
- Deterministic shapes for planning, frontend, backend, testing, review, and approval
- Animated block drops when a milestone becomes completed
- A shared state bridge between the local dashboard and the Goal Tetris MCP server
- Codex instructions that ask the agent to create boards and update meaningful milestones

## Run the dashboard

This repo has no runtime dependencies. Use Node.js 18+:

```bash
npm start
```

Open http://localhost:4173.

Create a feature in the dashboard, then mark milestones through the MCP tools or use the dashboard state API. The dashboard polls the shared state every second, so updates from the Codex session appear as animations.

## Codex connection

The plugin manifest is in `.codex-plugin/plugin.json` and the local MCP server is configured in `.mcp.json`. The bridge exposes:

- `goal_tetris_start`
- `goal_tetris_update`
- `goal_tetris_snapshot`
- `goal_tetris_reset`

The connection is intentionally explicit: Codex calls the update tool at meaningful milestones rather than the plugin pretending to have access to undocumented private session internals. This makes the behavior inspectable and safe. The dashboard and the installed plugin share `~/.goal-tetris/state.json`, so the local panel sees updates from the Codex-loaded copy. If a future Codex session-event subscription becomes available, it can replace the bridge without changing the board model.

## Demo flow

1. Create `Login functionality` in the dashboard.
2. Ask Codex to track the feature with Goal Tetris.
3. Codex creates a board with frontend, backend, testing, and review milestones.
4. As milestones complete, Codex calls `goal_tetris_update`.
5. Watch the T, L, I, and O blocks fall into place.

The UI shows concise summaries, rationale, evidence, blockers, and next actions. It does not expose private chain-of-thought.
