# Devpost submission pack — Goal Tetris

This file is a copy-ready English draft for the Devpost project page and judge-only fields. Replace the two bracketed placeholders before submitting: the public YouTube URL and the primary `/feedback` Session ID.

## Project title

Goal Tetris

## Elevator pitch

Goal Tetris turns meaningful Codex milestones into tetrominoes that fall, lock, and clear only when the developer confirms the completed work.

## Project story

### Inspiration

Long-running coding tasks can become a wall of status messages. Planning, implementation, testing, review, and approval may all be happening at once, but the changes that matter are easy to lose in a conversation.

I wanted a progress view that felt more tangible than another checklist. Tetris became the right metaphor: a feature request becomes a route of work, each meaningful milestone becomes a recognizable block, and completed work becomes a line the developer can explicitly acknowledge and clear. The board is playful, but its state needs to be trustworthy: it must not invent progress or make completed work move around.

### What I built

Goal Tetris is a native Codex plugin for the Developer Tools track. It adds a compact, classic blue arcade-style 10x20 Tetris panel to the current Codex conversation. Each requested feature gets its own board. For example, a login feature can be broken into planning, frontend, backend, testing, review, and approval milestones. Each milestone maps to one of the seven canonical tetrominoes and appears in the NEXT route queue.

The Current work tab shows active feature boards. When every milestone on a board is complete, the panel reserves a full line. That line remains visible until the developer presses **Confirm - Clear line**. The confirmation is recorded in shared state, and the finished board remains available in the Previous work tab.

### How it works

Goal Tetris exposes a small MCP bridge:

- `goal_tetris_open` attaches the board to the current Codex conversation.
- `goal_tetris_start` creates a feature board with ordered milestones.
- `goal_tetris_update` records a meaningful milestone change.
- `goal_tetris_snapshot` refreshes the panel state.
- `goal_tetris_acknowledge` records the developer's confirmation to clear a completed line.

The panel uses a real bottom-up coordinate model. For every non-pending milestone, it evaluates legal columns, drops the piece until the next move would collide, and locks the piece at the lowest legal position. Placement scoring prefers fewer holes, a lower stack, a smoother surface, and a stable route-column tie breaker. The result feels like Tetris without random placement or reflowing blocks that have already been locked.

Goal Tetris deliberately tracks explicit, meaningful updates from the current conversation. Public plugin APIs do not provide a documented passive subscription to every private Codex event, so the project does not claim to observe unsupported internals. The local dashboard is a development and visual-testing harness; the native Codex panel is the primary experience.

### Challenges I ran into

The hardest part was preserving trust in the visual state. A progress visualization becomes misleading if pending work looks finished, completed pieces move when unrelated work arrives, or a completed line disappears without human confirmation. I solved this by making the board a deterministic projection of ordered milestone state and by locking pieces permanently once they land.

I also had to define a clear integration boundary. Explicit bridge calls make the plugin useful with the supported Codex surface, while leaving room for a future documented Codex session-event stream without coupling the project to private host behavior.

### What I learned

I learned that playful interaction design can still communicate serious operational state when the rules are clear and deterministic. I also learned to treat a native AI-tool integration as a product boundary: show exactly what the system knows, update only on meaningful events, and preserve a user's final confirmation for consequential visual changes.

### How Codex and GPT-5.6 were used

Codex was used throughout the build to inspect the plugin host boundary, implement the MCP server and embedded panel, iterate on the arcade UI, debug state transitions, run smoke tests, and review the documentation.

GPT-5.6 was used for the planning pass: decomposing feature requests into ordered milestones, selecting concise user-facing summaries, and reviewing the deterministic routing and confirmation flow for edge cases. The repository includes the state model, collision-aware placement logic, native panel, and smoke tests so judges can inspect the implementation.

## Built with

OpenAI Codex, GPT-5.6, Model Context Protocol (MCP), Codex native UI, Node.js, JavaScript, React, Vite, HTML, CSS, JSON state, deterministic algorithms, and Tetris mechanics.

## Try it out links

- Source repository: https://github.com/orqan137/goal-tetris
- Public demo video: `[PASTE PUBLIC YOUTUBE URL HERE]`

## Project media

Upload these images to the Devpost gallery:

1. `assets/goal-tetris-devpost-thumbnail.png` — the main arcade-style project thumbnail.
2. `assets/codex-app-popup-mockup.png` — the native Codex panel concept with feature boards and the NEXT queue.

## Video demo script (about 90 seconds)

Long-running Codex work can turn into a wall of status updates. Goal Tetris turns meaningful changes into a board I can scan at a glance.

This is a native panel attached to the current Codex conversation. Each requested feature gets its own 10-by-20 board, and the NEXT route shows its upcoming milestones.

When a milestone changes, its canonical tetromino drops once and locks when the work is complete. Collision-aware placement makes it land like Tetris, while previously locked pieces never jump when later work arrives.

When every milestone is done, the board reserves a full line. It does not clear automatically: the developer must press **Confirm - Clear line**. The acknowledgement is stored, and the completed feature stays available in **Previous work**.

I built the plugin with Codex and used GPT-5.6 for milestone decomposition, concise summaries, and routing edge-case review. The repository includes the MCP bridge, native panel, deterministic placement logic, and smoke tests.

## Additional information for judges and organizers

- **Category:** Developer Tools
- **Repository URL:** https://github.com/orqan137/goal-tetris
- **Primary `/feedback` Session ID:** `[PASTE THE PRIMARY CODEX SESSION ID HERE]`
- **Native plugin path:** Load the repository as a local Codex plugin. The repository root contains `.codex-plugin/plugin.json` and `.mcp.json`.
- **Native resource:** `ui://goal-tetris/board.v10.html`
- **Supported platform:** Codex desktop app with Node.js 20+ available to the plugin MCP server.
- **Credentials:** None required.

### Local visual-testing path

```bash
git clone https://github.com/orqan137/goal-tetris.git
cd goal-tetris
npm install
npm start
```

Then open `http://localhost:4173`. The dashboard is a local development harness; the native Codex panel is the primary product surface.

### Smoke test

```bash
node scripts/smoke-test.mjs
```

## Final submission checklist

- [ ] Replace the YouTube placeholder with a public video under three minutes.
- [ ] Make sure the voiceover explains what was built and how Codex and GPT-5.6 were used.
- [ ] Paste the primary `/feedback` Session ID.
- [ ] Confirm the repository is public, or grant access to `testing@devpost.com` and `build-week-event@openai.com` if it is private.
- [ ] Verify that the README includes setup instructions and the Codex/GPT-5.6 usage explanation.
- [ ] Upload both gallery images.
- [ ] Add all team members and confirm their invitations.
- [ ] Select **Developer Tools**.
- [ ] Accept the terms and submit the form rather than leaving it as a draft.
