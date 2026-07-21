# Goal Tetris

Goal Tetris is a native Codex plugin for the OpenAI Build Week Developer Tools track. It turns each requested feature into its own Tetris map inside the Codex conversation. As Codex reaches meaningful milestones, the corresponding tetromino falls into place.

![Goal Tetris](assets/thumbnail.png)

![Native Codex popup mockup](assets/codex-app-popup-mockup.png)

## Native Codex experience

The primary product surface is the embedded MCP UI resource `ui://goal-tetris/board.v7.html`: a classic blue arcade-style 10x20 Tetris panel with square cells, canonical I/J/L/O/S/T/Z tetromino colors, one-shot falling motion for active work, and a confirmation-gated completed line. One Codex session can switch between multiple feature boards, while completed work moves to the previous-work tab. There is no pet and no browser window in the plugin experience.

The plugin flow is:

1. `goal_tetris_open` attaches the panel to the current Codex conversation.
2. `goal_tetris_start` creates one board for each requested feature.
3. `goal_tetris_update` locks a shape when a meaningful milestone changes.
4. `goal_tetris_snapshot` refreshes all boards.
5. When a board is complete, the developer presses `Confirm · Clear line`; the panel calls `goal_tetris_acknowledge` and removes the completed row.

## What works

- Multiple feature boards in one native panel
- Right-side task picker for switching between boards in the same Codex session
- Separate current-work and previous-work tabs; completed boards move to history automatically
- Classic square tetrominoes with deterministic I/J/L/O/S/T/Z shapes and colors
- One-shot falling motion for active work; completed pieces remain locked
- A completed bottom line that stays visible until the developer confirms it
- Shared state bridge between the native panel and the MCP server
- Explicit Codex instructions for opening, creating, and updating boards
- Korean UI mode when the Codex locale or browser locale starts with `ko`
- Concise summaries, rationale, evidence, blockers, and next actions without exposing private chain-of-thought

## Codex connection boundary

The plugin can render a native panel and receive explicit updates from the current Codex conversation. Public plugin APIs do not provide a documented passive subscription to every private Codex session event, so the skill calls the bridge at meaningful milestones instead of pretending to observe undocumented internals. If Codex exposes a supported session-event stream in the future, the board model can consume it without changing the UI.

## Local fallback harness

The local dashboard is only for development and visual testing. It is not the main app surface.

```bash
npm start
```

Then open `http://localhost:4173`. The dashboard and installed plugin copy share `~/.goal-tetris/state.json`.

For a manual bridge while developing against an already-open Codex task, seed the shared state with its host-provided task ID:

```bash
node scripts/attach-session.mjs <codex-task-id> "Current Codex plugin integration"
```

This is only a development fallback. In a loaded plugin task, the `goal_tetris_open` tool performs the same attachment from inside Codex.

## Plugin files

- `.codex-plugin/plugin.json` - plugin manifest and Codex UI assets
- `.mcp.json` - local MCP server registration
- `mcp/server.mjs` - tools and native UI resource
- `mcp/widget.mjs` - embedded Codex panel HTML/CSS/JS
- `skills/goal-tetris/SKILL.md` - agent workflow
- `assets/codex-app-popup-mockup.png` - visual concept for the native panel

## Korean version

The embedded panel automatically switches its chrome labels to Korean when Codex exposes a Korean locale or the host browser reports `ko` (for example, `ko-KR`). User-written milestone titles and summaries remain unchanged, so the developer's original wording is preserved.
