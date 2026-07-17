---
name: goal-tetris
description: Track the user's requested features in Goal Tetris boards and update meaningful Codex milestones.
---

# Goal Tetris workflow

Goal Tetris is a visual session companion, not a pet and not a raw log viewer. Each user-requested feature gets its own Tetris map. Meaningful milestones become deterministic tetrominoes:

- `planning` → S
- `frontend` → T
- `backend` → L
- `testing` → I
- `review` → O
- `approval` → Z

When the user asks to track a new feature, call `goal_tetris_start` once. Use GPT-5.6 to decompose the feature into 3–8 meaningful milestones and pass them as `{title, kind}` objects. Use separate boards for separate features.

After a meaningful state change, call `goal_tetris_update` with the board's `goalId`, the milestone's `milestoneId`, and one of `active`, `completed`, `blocked`, or `approval`. Do not call it for every shell command or file edit. Prefer milestones such as frontend complete, backend connected, tests passing, review complete, or approval needed.

Include a short `summary` and `rationale`. These are user-facing explanations of the decision and evidence, not hidden chain-of-thought. Never expose private chain-of-thought; provide concise summaries, evidence, blockers, and next actions instead.

When the user asks for the current state, call `goal_tetris_snapshot`.
