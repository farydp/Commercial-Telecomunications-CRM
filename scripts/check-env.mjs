import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const envFiles = [".env.local", ".env"];
const quiet = process.argv.includes("--quiet");

const requiredEnvVars = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    error: "debe ser una URL valida",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    validate: (value) => value.trim().length > 0,
    error: "no puede estar vacia",
  },
];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf8");
  const entries = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries[key] = value;
  }

  return entries;
}

const fileEnv = envFiles.reduce((acc, file) => {
  const parsed = parseEnvFile(path.join(rootDir, file));
  return { ...acc, ...parsed };
}, {});

const mergedEnv = {
  ...fileEnv,
  ...process.env,
};

const errors = requiredEnvVars
  .map(({ key, validate, error }) => {
    const value = mergedEnv[key];

    if (typeof value !== "string" || !validate(value)) {
      return `${key}: ${error}`;
    }

    return null;
  })
  .filter(Boolean);

if (errors.length > 0) {
  console.error("Faltan variables requeridas para build/deploy:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  console.error("");
  console.error("Define estas variables en uno de estos lugares:");
  console.error("- .env.local para desarrollo local");
  console.error("- Variables del proyecto en Vercel para preview y production");
  console.error("- CLI de Vercel: vercel env add NEXT_PUBLIC_SUPABASE_URL");
  console.error("- CLI de Vercel: vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

if (!quiet) {
  console.log("Variables requeridas disponibles:");
  for (const { key } of requiredEnvVars) {
    const value = mergedEnv[key];
    const preview =
      key === "NEXT_PUBLIC_SUPABASE_URL"
        ? value
        : `${value.slice(0, 6)}...${value.slice(-4)}`;
    console.log(`- ${key}=${preview}`);
  }
}
