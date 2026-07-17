import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGoal, readState, resetState, updateMilestone } from "../lib/state.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "public");
const port = Number(process.env.PORT || 4173);

async function body(request) {
  let value = "";
  for await (const chunk of request) value += chunk;
  return value ? JSON.parse(value) : {};
}

function json(response, status, value) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(value));
}

async function serveStatic(request, response) {
  const requested = request.url === "/" ? "/index.html" : request.url.split("?")[0];
  const file = path.resolve(ROOT, `.${requested}`);
  if (!file.startsWith(ROOT)) return json(response, 403, { error: "Forbidden" });
  try {
    const data = await fs.readFile(file);
    const type = file.endsWith(".html") ? "text/html" : file.endsWith(".js") ? "text/javascript" : "text/css";
    response.writeHead(200, { "content-type": `${type}; charset=utf-8` });
    response.end(data);
  } catch {
    json(response, 404, { error: "Not found" });
  }
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.url === "/api/state" && request.method === "GET") return json(response, 200, await readState());
    if (request.url === "/api/goals" && request.method === "POST") return json(response, 201, await createGoal(await body(request)));
    if (request.url === "/api/update" && request.method === "POST") return json(response, 200, await updateMilestone(await body(request)));
    if (request.url === "/api/reset" && request.method === "POST") return json(response, 200, await resetState());
    return serveStatic(request, response);
  } catch (error) {
    return json(response, 400, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`Goal Tetris dashboard: http://localhost:${port}`);
});
