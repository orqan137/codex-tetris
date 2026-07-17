import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const STATE_PATH = process.env.GOAL_TETRIS_STATE_PATH || path.join(os.homedir(), ".goal-tetris", "state.json");

const SHAPES = {
  planning: {
    label: "Planning",
    shape: "S",
    color: "#f59e0b",
    cells: [[1, 0], [2, 0], [0, 1], [1, 1]]
  },
  frontend: {
    label: "Frontend",
    shape: "T",
    color: "#8b5cf6",
    cells: [[0, 0], [1, 0], [2, 0], [1, 1]]
  },
  backend: {
    label: "Backend",
    shape: "L",
    color: "#06b6d4",
    cells: [[0, 0], [0, 1], [0, 2], [1, 2]]
  },
  testing: {
    label: "Testing",
    shape: "I",
    color: "#22c55e",
    cells: [[0, 0], [1, 0], [2, 0], [3, 0]]
  },
  review: {
    label: "Review",
    shape: "O",
    color: "#f97316",
    cells: [[0, 0], [1, 0], [0, 1], [1, 1]]
  },
  approval: {
    label: "Approval",
    shape: "Z",
    color: "#ef4444",
    cells: [[0, 0], [1, 0], [1, 1], [2, 1]]
  }
};

const DEFAULT_MILESTONES = [
  { title: "Plan the feature", kind: "planning" },
  { title: "Build the frontend", kind: "frontend" },
  { title: "Connect the backend", kind: "backend" },
  { title: "Run tests", kind: "testing" },
  { title: "Review the result", kind: "review" }
];

function now() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function shapeFor(kind) {
  return SHAPES[kind] ?? SHAPES.planning;
}

export function emptyState() {
  return { version: 1, updatedAt: now(), goals: [] };
}

export async function readState() {
  try {
    const raw = await fs.readFile(STATE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    const state = emptyState();
    await writeState(state);
    return state;
  }
}

export async function writeState(state) {
  await fs.mkdir(path.dirname(STATE_PATH), { recursive: true });
  state.updatedAt = now();
  await fs.writeFile(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  return state;
}

export function normalizeMilestones(milestones) {
  const source = Array.isArray(milestones) && milestones.length ? milestones : DEFAULT_MILESTONES;
  return source.slice(0, 12).map((item, index) => {
    const kind = typeof item === "string" ? "planning" : (item.kind || "planning");
    const shape = shapeFor(kind);
    return {
      id: id("milestone"),
      order: index,
      title: typeof item === "string" ? item : (item.title || `${shape.label} milestone`),
      kind,
      shape: shape.shape,
      color: shape.color,
      cells: shape.cells,
      status: "pending",
      summary: "",
      rationale: "",
      attention: false,
      updatedAt: now(),
      completedAt: null
    };
  });
}

export async function createGoal({ title, description = "", milestones }) {
  const state = await readState();
  const goal = {
    id: id("goal"),
    title: title?.trim() || "Untitled goal",
    description,
    status: "active",
    createdAt: now(),
    updatedAt: now(),
    milestones: normalizeMilestones(milestones)
  };
  state.goals.push(goal);
  await writeState(state);
  return goal;
}

export async function updateMilestone({ goalId, milestoneId, status, summary = "", rationale = "", attention = false }) {
  const state = await readState();
  const goal = state.goals.find((item) => item.id === goalId);
  if (!goal) throw new Error(`Unknown goal: ${goalId}`);
  const milestone = goal.milestones.find((item) => item.id === milestoneId || item.title === milestoneId);
  if (!milestone) throw new Error(`Unknown milestone: ${milestoneId}`);

  const allowed = new Set(["pending", "active", "completed", "blocked", "approval"]);
  milestone.status = allowed.has(status) ? status : milestone.status;
  milestone.summary = summary;
  milestone.rationale = rationale;
  milestone.attention = Boolean(attention);
  milestone.updatedAt = now();
  if (milestone.status === "completed" && !milestone.completedAt) milestone.completedAt = now();

  goal.status = goal.milestones.every((item) => item.status === "completed") ? "completed" : "active";
  goal.updatedAt = now();
  await writeState(state);
  return { goal, milestone };
}

export async function resetState() {
  const state = emptyState();
  await writeState(state);
  return state;
}

export { DEFAULT_MILESTONES, SHAPES };
