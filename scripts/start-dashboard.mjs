import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const child = spawn(process.execPath, ["app/server.mjs"], {
  cwd: root,
  detached: true,
  stdio: "ignore"
});

child.unref();
console.log(`Goal Tetris dashboard started on http://localhost:4173 (pid ${child.pid})`);
