#!/usr/bin/env node
import { Command } from "commander";
import open from "open";
import path from "node:path";
import { ViewerServer } from "../server/viewer-server.js";
import { ProjectResolver } from "../server/project-resolver.js";
import type { ProjectView } from "@shared/contracts.js";

const DEFAULT_PORT = 4573;

interface CliOptions {
  global?: boolean;
  port: string;
  open: boolean;
  poll?: boolean;
}

async function main(): Promise<void> {
  const program = new Command();
  program
    .name("opsx-ui")
    .description("A read-only, live web viewer for everything OpenSpec touches.")
    .argument("[dir]", "project directory to open (defaults to current)")
    .option("-g, --global", "skip current directory; open the project picker")
    .option("-p, --port <port>", "preferred port", String(DEFAULT_PORT))
    .option("--poll", "use filesystem polling (WSL/network mounts)")
    .option("--no-open", "do not open a browser automatically")
    .action(async (dir: string | undefined, options: CliOptions) => {
      const cwd = process.cwd();
      const initialProject = resolveInitialProject(cwd, dir, options.global);

      const server = new ViewerServer({
        cwd,
        initialProject,
        usePolling: options.poll,
      });

      const port = await server.start(Number(options.port) || DEFAULT_PORT);
      const url = `http://localhost:${port}`;

      printBanner(url, initialProject, cwd, Boolean(options.global));
      if (options.open) await open(url).catch(() => undefined);

      const shutdown = async () => {
        await server.stop();
        process.exit(0);
      };
      process.on("SIGINT", shutdown);
      process.on("SIGTERM", shutdown);
    });

  await program.parseAsync(process.argv);
}

/** Decide what (if anything) to open at launch (viewer-cli spec). */
function resolveInitialProject(
  cwd: string,
  dir: string | undefined,
  global: boolean | undefined,
): ProjectView | null {
  if (global) return null; // `-g`: never auto-open; show the picker.
  if (dir) {
    const target = path.resolve(cwd, dir);
    return ProjectResolver.hasOpenSpec(target)
      ? ProjectResolver.forDirectory(target, "picked")
      : null;
  }
  return ProjectResolver.fromCwd(cwd); // null → UI offers init / pick.
}

function printBanner(
  url: string,
  project: ProjectView | null,
  cwd: string,
  global: boolean,
): void {
  console.log(`\n  opsx-ui  →  ${url}`);
  if (project) {
    console.log(`  project  →  ${project.name} (${project.root})`);
  } else if (global) {
    console.log(`  global mode: choose a project in the browser`);
  } else {
    console.log(`  no openspec/ in ${cwd} — initialize or pick one in the browser`);
  }
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
