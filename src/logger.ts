export interface Logger {
  debug(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

export function createLogger(debugEnabled: boolean): Logger {
  return {
    debug(message, meta) {
      if (!debugEnabled) {
        return;
      }
      write("debug", message, meta);
    },
    error(message, meta) {
      write("error", message, meta);
    },
  };
}

function write(level: "debug" | "error", message: string, meta?: unknown): void {
  const suffix = meta === undefined ? "" : ` ${safeStringify(meta)}`;
  console.error(`[yapi-mcp:${level}] ${message}${suffix}`);
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
