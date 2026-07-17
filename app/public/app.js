const boards = document.querySelector("#boards");
const empty = document.querySelector("#empty");
const form = document.querySelector("#goal-form");
const titleInput = document.querySelector("#goal-title");
const reset = document.querySelector("#reset");
let previous = new Map();

const demoMilestones = [
  { title: "Plan the feature", kind: "planning" },
  { title: "Build the frontend", kind: "frontend" },
  { title: "Connect the backend", kind: "backend" },
  { title: "Run tests", kind: "testing" },
  { title: "Review the result", kind: "review" }
];

async function request(url, options) {
  const response = await fetch(url, { headers: { "content-type": "application/json" }, ...options });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error || "Request failed");
  return value;
}

function changed(goal, milestone) {
  const key = `${goal.id}:${milestone.id}`;
  const old = previous.get(key);
  previous.set(key, milestone.status);
  return old !== undefined && old !== milestone.status && milestone.status === "completed";
}

function pieceMarkup(milestone, index, goal) {
  const cells = milestone.cells || [[0, 0]];
  const col = (index * 3) % 7;
  const row = Math.floor(index / 3);
  const cellSize = 10;
  const top = 100 - (row + 1) * 10;
  const isNew = changed(goal, milestone);
  const classes = ["piece", milestone.status, isNew ? "falling" : ""].filter(Boolean).join(" ");
  return `<div class="${classes}" style="--piece:${milestone.color};left:${col * cellSize}%;bottom:${Math.max(3, row * 10 + 3)}%" title="${escapeHtml(milestone.title)}">${cells.map(([x, y]) => `<i class="cell" style="--piece:${milestone.color};left:${x * 30}px;top:${y * 30}px"></i>`).join("")}</div>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
}

function boardMarkup(goal) {
  const completed = goal.milestones.filter((item) => item.status === "completed").length;
  const isComplete = goal.status === "completed";
  const pieces = goal.milestones.filter((item) => item.status !== "pending").map((item, index) => pieceMarkup(item, index, goal)).join("");
  const milestones = goal.milestones.map((item) => `<div class="milestone ${item.status} ${item.attention ? "attention" : ""}"><i class="dot"></i><div><small>${escapeHtml(item.kind)}</small><b>${escapeHtml(item.title)}</b></div></div>`).join("");
  const firstAttention = goal.milestones.find((item) => item.attention || item.status === "blocked" || item.status === "approval");
  return `<article class="board-card panel ${isComplete ? "completed" : ""}">
    <div class="board-title"><div><div class="eyebrow">FEATURE MAP · ${completed}/${goal.milestones.length} LOCKED</div><h2>${escapeHtml(goal.title)}</h2><p>${escapeHtml(firstAttention?.summary || "Waiting for the next meaningful Codex milestone.")}</p></div><span class="badge ${isComplete ? "done" : ""}">${isComplete ? "COMPLETE" : "BUILDING"}</span></div>
    <div class="board-wrap"><div class="tetris-board">${pieces}<div class="board-floor"></div></div><div class="milestones">${milestones}</div></div>
  </article>`;
}

function render(state) {
  const goals = state.goals || [];
  boards.innerHTML = goals.map(boardMarkup).join("");
  empty.classList.toggle("hidden", goals.length > 0);
  document.querySelector("#active-count").textContent = goals.filter((goal) => goal.status !== "completed").length;
  document.querySelector("#locked-count").textContent = goals.reduce((sum, goal) => sum + goal.milestones.filter((item) => item.status === "completed").length, 0);
  const attention = goals.flatMap((goal) => goal.milestones.map((item) => ({ goal, item }))).find(({ item }) => item.attention || item.status === "blocked" || item.status === "approval");
  document.querySelector("#attention-text").textContent = attention ? `${attention.goal.title}: ${attention.item.title}` : "Waiting for a Codex milestone…";
}

async function refresh() {
  try { render(await request("/api/state")); } catch (error) { document.querySelector("#attention-text").textContent = error.message; }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  await request("/api/goals", { method: "POST", body: JSON.stringify({ title, milestones: demoMilestones }) });
  titleInput.value = "";
  await refresh();
});

reset.addEventListener("click", async () => { previous.clear(); await request("/api/reset", { method: "POST", body: "{}" }); await refresh(); });
refresh();
setInterval(refresh, 1000);
