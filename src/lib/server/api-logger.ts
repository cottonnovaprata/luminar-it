type ApiLogContext = {
  route: string
  method: string
  operation: string
  attempt?: number
  statusCode?: number
  durationMs?: number
  prismaCode?: string | null
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    name: "UnknownError",
    message: String(error),
  }
}

function buildPayload(context: ApiLogContext, error: unknown) {
  return {
    timestamp: new Date().toISOString(),
    route: context.route,
    method: context.method,
    operation: context.operation,
    attempt: context.attempt,
    statusCode: context.statusCode,
    durationMs: context.durationMs,
    prismaCode: context.prismaCode ?? undefined,
    error: normalizeError(error),
  }
}

export function logApiRetry(context: ApiLogContext, error: unknown) {
  console.warn("[API Retry]", buildPayload(context, error))
}

export function logApiError(context: ApiLogContext, error: unknown) {
  console.error("[API Error]", buildPayload(context, error))
}
