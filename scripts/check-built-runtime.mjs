import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const distDir = path.join(rootDir, "dist");
const nodeOutputDirs = ["cli", "server", "core"].map((dir) =>
  path.join(distDir, dir),
);

const files = (
  await Promise.all(nodeOutputDirs.map((dir) => listJavaScriptFiles(dir)))
).flat();

const aliasLeaks = [];
for (const file of files) {
  const content = await readFile(file, "utf8");
  if (content.includes("@shared/")) {
    aliasLeaks.push(path.relative(rootDir, file));
  }
}

if (aliasLeaks.length > 0) {
  throw new Error(
    `Built Node output contains unresolved @shared imports:\n${aliasLeaks
      .map((file) => `- ${file}`)
      .join("\n")}`,
  );
}

await Promise.all(
  [
    "dist/core/index.js",
    "dist/server/session.js",
    "dist/server/viewer-server.js",
  ].map((file) => import(pathToFileURL(path.join(rootDir, file)).href)),
);

async function listJavaScriptFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listJavaScriptFiles(fullPath);
      if (entry.isFile() && entry.name.endsWith(".js")) return [fullPath];
      return [];
    }),
  );

  return nested.flat();
}
