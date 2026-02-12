import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptFilePath = fileURLToPath(import.meta.url);
const scriptDirectory = path.dirname(scriptFilePath);
const envPath = path.resolve(scriptDirectory, "..", ".env.local");

export async function loadEnvFromLocalFile() {
  let raw = "";

  try {
    raw = await readFile(envPath, "utf8");
  } catch (_error) {
    return;
  }

  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      return;
    }

    process.env[key] = value;
  });
}
