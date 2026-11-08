// Never log bodies, headers, tokens, passwords, email addresses, subjects,
// message text, action links, or raw Error objects.
interface LogFields {
  actorId?: string;
  targetId?: string;
  status?: number;
  code?: string;
  name?: string;
  durationMs?: number;
  count?: number;
}

export function createLogger(functionName: string, requestId: string) {
  function write(
    level: "info" | "error",
    step: string,
    fields: LogFields = {},
  ) {
    const { actorId, targetId, status, code, name, durationMs, count } = fields;
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      function: functionName,
      requestId,
      step,
      actorId,
      targetId,
      status,
      code,
      name,
      durationMs,
      count,
    });
    if (level === "error") console.error(entry);
    else console.info(entry);
  }
  return {
    info: (step: string, fields?: LogFields) => write("info", step, fields),
    error: (
      step: string,
      error: { status?: number; code?: string; name?: string },
    ) =>
      write("error", step, {
        status: error.status,
        code: error.code,
        name: error.name,
      }),
  };
}

export type Logger = ReturnType<typeof createLogger>;
