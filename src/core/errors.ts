/** Raised when the `openspec` executable cannot be found on the machine. */
export class OpenSpecNotFoundError extends Error {
  constructor(message = "The `openspec` CLI was not found on PATH.") {
    super(message);
    this.name = "OpenSpecNotFoundError";
  }
}

/** Raised when the installed `openspec` CLI is too old to be supported. */
export class UnsupportedCliError extends Error {
  constructor(
    public readonly found: string,
    public readonly required: string,
  ) {
    super(
      `Unsupported openspec CLI ${found}; opsx-ui requires >= ${required}.`,
    );
    this.name = "UnsupportedCliError";
  }
}

/** Raised when an `openspec` invocation exits non-zero or emits bad JSON. */
export class OpenSpecCliError extends Error {
  constructor(
    message: string,
    public readonly args: string[],
    public readonly stderr?: string,
  ) {
    super(message);
    this.name = "OpenSpecCliError";
  }
}
