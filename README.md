# Goal Tetris

Goal Tetris is a native Codex plugin for the OpenAI Build Week Developer Tools track. It turns each requested feature into its own Tetris map inside the Codex conversation. As Codex reaches meaningful milestones, the corresponding tetromino falls into place.

![Goal Tetris](assets/thumbnail.png)

## Native Codex experience

The primary product surface is the embedded MCP UI resource `ui://goal-tetris/board.html`: a compact dark panel that renders inside Codex with multiple feature boards, falling T/L/I/O/S/Z blocks, a next-action card, session context, and a milestone timeline. There is no pet and no browser window in the plugin experience.

The plugin flow is:

1. `goal_tetris_open` attaches the panel to the current Codex conversation.
2. `goal_tetris_start` creates one board for each requested feature.
3. `goal_tetris_update` locks a shape when a meaningful milestone changes.
4. `goal_tetris_snapshot` refreshes all boards.

## What works

- Multiple feature boards in one native panel
- Deterministic shapes for planning, frontend, backend, testing, review, and approval
- Animated block drops when a milestone becomes active or completed
- Shared state bridge between the native panel and the MCP server
- Explicit Codex instructions for opening, creating, and updating boards
- Concise summaries, rationale, evidence, blockers, and next actions without exposing private chain-of-thought

## Codex connection boundary

The plugin can render a native panel and receive explicit updates from the current Codex conversation. Public plugin APIs do not provide a documented passive subscription to every private Codex session event, so the skill calls the bridge at meaningful milestones instead of pretending to observe undocumented internals. If Codex exposes a supported session-event stream in the future, the board model can consume it without changing the UI.

## Local fallback harness

The local dashboard is only for development and visual testing. It is not the main app surface.

```bash
npm start
```

Then open `http://localhost:4173`. The dashboard and installed plugin copy share `~/.goal-tetris/state.json`.

## Plugin files

- `.codex-plugin/plugin.json` - plugin manifest and Codex UI assets
- `.mcp.json` - local MCP server registration
- `mcp/server.mjs` - tools and native UI resource
- `mcp/widget.mjs` - embedded Codex panel HTML/CSS/JS
- `skills/goal-tetris/SKILL.md` - agent workflow
- `assets/codex-app-popup-mockup.png` - visual concept for the native panel
