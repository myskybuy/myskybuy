import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const r = spawnSync("npx", ["tsx", "scripts/expand-descriptions.ts"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});
process.exit(r.status ?? 1);
