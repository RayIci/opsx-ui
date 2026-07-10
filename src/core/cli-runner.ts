import { execFile } from "node:child_process";
import { OpenSpecCliError, OpenSpecNotFoundError } from "./errors.js";

/**
 * Runs `openspec` and returns stdout. Abstracted so the source can be tested
 * against captured fixtures without spawning a real process (D2: the CLI is a
 * volatile dependency isolated behind one seam).
 */
export interface CliRunner {
  run(args: string[]): Promise<string>;
}

export interface ExecCliRunnerOptions {
  /** Working directory the CLI resolves the OpenSpec root from. */
  cwd: string;
  /** Executable name/path; overridable for tests. */
  bin?: string;
  /** Max buffer for large JSON payloads. */
  maxBuffer?: number;
}

/** Production runner: spawns the real `openspec` binary. */
export class ExecCliRunner implements CliRunner {
  private readonly cwd: string;
  private readonly bin: string;
  private readonly maxBuffer: number;

  constructor(options: ExecCliRunnerOptions) {
    this.cwd = options.cwd;
    this.bin = options.bin ?? "openspec";
    this.maxBuffer = options.maxBuffer ?? 32 * 1024 * 1024;
  }

  run(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(
        this.bin,
        [...args, "--no-color"],
        { cwd: this.cwd, maxBuffer: this.maxBuffer },
        (error, stdout, stderr) => {
          if (error) {
            if ((error as NodeJS.ErrnoException).code === "ENOENT") {
              reject(new OpenSpecNotFoundError());
              return;
            }
            reject(
              new OpenSpecCliError(
                `openspec ${args.join(" ")} failed: ${error.message}`,
                args,
                stderr,
              ),
            );
            return;
          }
          resolve(stdout);
        },
      );
    });
  }
}
