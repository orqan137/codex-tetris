---
name: goal-tetris
description: Track the user's requested features in native Goal Tetris boards inside the Codex conversation.
---

# Goal Tetris workflow

Goal Tetris is a visual session companion, not a pet and not a raw log viewer. The plugin renders a native embedded Codex panel through the MCP UI resource `ui://goal-tetris/board.v7.html`. Each user-requested feature gets its own classic 10x20 Tetris map. Meaningful milestones become deterministic tetrominoes:

- `planning` -> S
- `frontend` -> T
- `backend` -> L
- `testing` -> I
- `review` -> O
- `approval` -> Z

## Start of a Codex conversation

When Goal Tetris is available, call `goal_tetris_open` first. Use the label `Current Codex session` unless the user gives another label. Never invent a session ID; pass one only when the host supplies it. This opens the native panel in the current Codex conversation and attaches the shared board state to that context.

## Track features

When the user asks to track a new feature, call `goal_tetris_start` once. Use GPT-5.6 to decompose the feature into 3-6 meaningful milestones and pass them as `{title, kind}` objects. Use separate boards for separate features. The tool result updates the native panel automatically.

After a meaningful state change, call `goal_tetris_update` with the board's `goalId`, the milestone's `milestoneId`, and one of `active`, `completed`, `blocked`, or `approval`. Do not call it for every shell command or file edit. Prefer milestones such as frontend complete, backend connected, tests passing, review complete, or approval needed.

When every milestone on a board is completed, the native panel reserves and shows one full bottom line. The developer must press the confirmation button before calling `goal_tetris_acknowledge`; this removes the line and records the acknowledgement. Do not claim a line was cleared before the user confirms it.

Include a short `summary` and `rationale`. These are user-facing explanations of the decision and evidence, not hidden chain-of-thought. Never expose private chain-of-thought; provide concise summaries, evidence, blockers, and next actions instead.

When the user asks for the current state, call `goal_tetris_snapshot`. The native panel can refresh its state by calling this tool through the host UI bridge.

When the user communicates in Korean, keep milestone summaries and next actions in Korean. The embedded panel automatically localizes its chrome labels when the host locale is Korean.

The plugin uses explicit milestone calls because passive access to undocumented private Codex session events is not guaranteed. The local dashboard is only a fallback visual harness for development; it is not the primary product surface.
