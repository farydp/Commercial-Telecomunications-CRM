import { spawnSync } from "node:child_process";
import path from "node:path";

const cliPath = path.join(process.cwd(), "node_modules", ".bin", process.platform === "win32" ? "eslint.cmd" : "eslint");
const result = process.platform === "win32"
  ? spawnSync("cmd.exe", ["/d", "/s", "/c", `""${cliPath}" . --ext .js,.jsx,.ts,.tsx"`], {
      stdio: "inherit",
      env: {
        ...process.env,
        ESLINT_USE_FLAT_CONFIG: "false",
      },
    })
  : spawnSync(cliPath, [".", "--ext", ".js,.jsx,.ts,.tsx"], {
      stdio: "inherit",
      env: {
        ...process.env,
        ESLINT_USE_FLAT_CONFIG: "false",
      },
    });

process.exit(result.status ?? 1);
