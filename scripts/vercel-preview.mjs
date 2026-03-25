import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const isProd = process.argv.includes("--prod");
const cliName = process.platform === "win32" ? "vercel.cmd" : "vercel";
const envCheck = spawnSync(process.execPath, [path.join("scripts", "check-env.mjs"), "--quiet"], {
  cwd: rootDir,
  stdio: "inherit",
});

if (envCheck.status !== 0) {
  process.exit(envCheck.status ?? 1);
}

const versionCheck = spawnSync(cliName, ["--version"], {
  cwd: rootDir,
  stdio: "pipe",
  encoding: "utf8",
});

if (versionCheck.status !== 0) {
  console.error("No encontre la CLI de Vercel en este entorno.");
  console.error("Instalala o ejecuta el deploy desde un entorno donde `vercel` este disponible.");
  process.exit(versionCheck.status ?? 1);
}

const projectLinkPath = path.join(rootDir, ".vercel", "project.json");

if (!fs.existsSync(projectLinkPath)) {
  console.log("Aviso: este directorio no parece estar vinculado todavia con un proyecto de Vercel.");
  console.log("Si es la primera vez, corre `vercel link` antes del deploy para dejar el proyecto enlazado.");
}

const args = ["deploy", "-y"];

if (isProd) {
  args.push("--prod");
}

console.log(`Iniciando deploy ${isProd ? "production" : "preview"} con Vercel...`);

const deployResult = spawnSync(cliName, args, {
  cwd: rootDir,
  stdio: "inherit",
});

process.exit(deployResult.status ?? 1);
