# Devpost submission pack

Use the copy below for the public project page. Replace the two marked placeholders after recording the video and retrieving the `/feedback` Session ID.

## Project title

Goal Tetris

## Elevator pitch

Goal Tetris turns Codex feature milestones into stable, colorful tetrominoes that fall, lock, and clear only after you confirm the completed line.

## Suggested headline

Build the feature. Watch it lock into place.

## Project Story

## Inspiration

Long-running coding tasks are difficult to monitor from a stream of status messages. A developer can have a plan, a partial implementation, tests, and an approval decision all moving at once, but the important state changes are easy to lose in the conversation.

I wanted a progress view that felt more tangible than another checklist. Tetris was a natural metaphor: a request becomes a route of work, each meaningful milestone becomes a recognizable block, and completed work becomes a line that the developer can acknowledge and clear. The board is intentionally playful, but the underlying state is serious: it should never invent progress or make already-completed work jump around.

## What I built

Goal Tetris is a native Codex plugin for the Developer Tools track. Opening the plugin attaches a compact arcade-style panel to the current Codex conversation. Each requested feature gets its own 10x20 board. A feature such as “add login” can be decomposed into planning, frontend, backend, testing, review, and approval milestones. Each milestone is assigned one of the seven canonical tetrominoes and appears in the route queue on the right.

The current-work tab shows active feature boards. When all milestones for a board are complete, a full line appears and stays visible until the developer presses **Confirm - Clear line**. Only then does the plugin record the acknowledgement and remove the row. Completed boards remain available in the previous-work tab.

## How it works

The plugin exposes a small MCP bridge:

- `goal_tetris_open` attaches the board to the current Codex session.
- `goal_tetris_start` creates a board with ordered milestones.
- `goal_tetris_update` records meaningful milestone state changes.
- `goal_tetris_snapshot` refreshes the panel.
- `goal_tetris_acknowledge` records the developer's confirmation of a completed line.

The panel uses a real bottom-up 10x20 coordinate model. For every non-pending milestone, it evaluates legal columns, moves the piece downward until the next move would collide, and locks it at the lowest legal position. Placement scoring prefers fewer holes, lower stack height, and a smoother surface, with a stable route-column tie breaker. This gives the board a Tetris-like landing behavior without random placement or reflowing old blocks when new work arrives.

Goal Tetris intentionally tracks explicit meaningful updates from the current conversation. Public plugin APIs do not provide a documented passive subscription to every private Codex event, so the implementation does not pretend to observe undocumented internals. The local dashboard is included as a fallback harness; the primary product surface is the native Codex panel.

## How Codex and GPT-5.6 were used

Codex was used throughout the build to inspect the plugin boundary, implement the MCP server and embedded UI, iterate on the classic arcade design, debug state transitions, run smoke tests, and review the README.

GPT-5.6 was used for the meaningful planning pass: turning feature requests into ordered milestones, selecting concise user-facing summaries, and reviewing the routing algorithm and confirmation flow for edge cases. The final repository contains the state model, collision-aware placement code, native panel, and tests so judges can inspect how the behavior works.

## What I learned

The hardest part was not drawing a tetromino; it was preserving trust in the visual state. A progress visualization is misleading if pieces move when unrelated work arrives, if a pending task looks complete, or if a completed line disappears without a human confirmation. Treating the board as a deterministic projection of ordered milestone state made the UI easier to reason about and the animation more satisfying.

I also learned that a native Codex experience needs a clear boundary. The plugin can be useful today with explicit milestone updates, while leaving room for a future supported session-event stream instead of coupling the product to private host behavior.

## Built with

OpenAI Codex, GPT-5.6, MCP, Codex native UI, Node.js, JavaScript, HTML, CSS, JSON state, deterministic algorithms, Tetris mechanics, Developer Tools

## Try it out

Source repository: https://github.com/orqan137/codex-tetris

The repository contains the plugin manifest, MCP server, native panel, skill instructions, local fallback harness, screenshots, and smoke tests. For the fallback harness:

```bash
git clone https://github.com/orqan137/codex-tetris.git
cd codex-tetris
node app/server.mjs
```

Open `http://localhost:4173` to inspect the state model and test the visual harness. For the native plugin path, load the repository as a local Codex plugin; the package root contains `.codex-plugin/plugin.json` and `.mcp.json`.

## Project media

Upload these files to the Devpost image gallery:

1. `assets/goal-tetris-devpost-thumbnail.png` - final no-mascot arcade thumbnail.
2. `assets/codex-app-popup-mockup.png` - native Codex popup concept showing multiple feature boards and a next-piece area.

## Video demo link

`[PASTE PUBLIC YOUTUBE URL HERE]`

## 90-second demo script

**0:00-0:10 - The problem**

“Long-running Codex work can become a wall of status updates. Goal Tetris turns the important state changes into a board I can scan in one glance.”

**0:10-0:25 - Open the native panel**

“This is a native panel attached to the current Codex conversation. I can track several requested features in the same session, and the right-hand NEXT route shows the upcoming milestones for the selected feature.”

**0:25-0:50 - Route work into blocks**

“When a milestone becomes active, its canonical tetromino falls once. When the milestone is complete, the block locks. The board uses collision-aware bottom-up placement, so pieces land like Tetris and previously locked pieces do not jump when a later milestone arrives.”

**0:50-1:05 - Complete a feature**

“The panel separates current work from previous work. When every milestone is complete, the board reserves a full line. It does not clear automatically: the developer must press Confirm - Clear line.”

**1:05-1:20 - Show the confirmation and history**

“After confirmation, the line clears and the action is stored in shared state. The finished feature remains available in Previous work, so the current tab stays focused on what still needs attention.”

**1:20-1:30 - Explain the build**

“I built the plugin with Codex and used GPT-5.6 for milestone decomposition and state summaries. The repository includes the MCP bridge, native UI, deterministic placement algorithm, and smoke tests.”

## Additional info for judges and organizers

- Category: Developer Tools
- Repository: https://github.com/orqan137/codex-tetris
- Public demo: none; use the repository's local harness or install the native Codex plugin.
- `/feedback` Session ID: `[PASTE THE PRIMARY CODEX SESSION ID HERE]`
- Supported path: Codex plugin host for the native panel; Node.js 20+ for the local harness.
- Test command: `node scripts/smoke-test.mjs` (the test uses a temporary state path when run in a restricted environment).
- No credentials are required for the local harness.

## Final checklist

- [ ] Replace the YouTube placeholder with a public video under three minutes.
- [ ] Paste the primary `/feedback` Session ID.
- [ ] Add the repository URL to both public and judge-only fields where requested.
- [ ] Upload both media files.
- [ ] Confirm the README documents Codex and GPT-5.6 usage.
- [ ] Add all team members and confirm their invitations.
- [ ] Select Developer Tools and submit the saved form.
