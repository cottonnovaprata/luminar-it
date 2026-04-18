type JsonRequestOptions = {
  init?: RequestInit
  retries?: number
  retryDelayMs?: number
  cacheKey?: string
  cacheTtlMs?: number
  skipCache?: boolean
  fallbackErrorMessage?: string
}

type CacheEntry = {
  expiresAt: number
  data: unknown
}

const responseCache = new Map<string, CacheEntry>()
const inflightRequests = new Map<string, Promise<unknown>>()

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getUrlFromInput(input: RequestInfo | URL) {
  if (typeof input === "string") return input
  if (input instanceof URL) return input.toString()
  return input.url
}

function getMethodFromInput(input: RequestInfo | URL, init?: RequestInit) {
  if (init?.method) return init.method.toUpperCase()
  if (typeof Request !== "undefined" && input instanceof Request) {
    return input.method.toUpperCase()
  }
  return "GET"
}

function isAbortError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true
  }

  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  )
}

function parseErrorMessage(raw: string, fallback: string) {
  const trimmed = raw.trim()
  if (!trimmed) return fallback

  try {
    const parsed = JSON.parse(trimmed) as { error?: unknown; message?: unknown }
    if (typeof parsed.error === "string" && parsed.error.trim()) {
      return parsed.error
    }
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message
    }
  } catch {
    // Keep raw text fallback when body is not JSON.
  }

  return trimmed
}

async function requestJson<T>(
  input: RequestInfo | URL,
  {
    init,
    retries = 1,
    retryDelayMs = 250,
    fallbackErrorMessage = "Falha ao carregar dados",
  }: JsonRequestOptions
) {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(input, init)

      if (!response.ok) {
        const body = await response.text().catch(() => "")
        throw new Error(parseErrorMessage(body, fallbackErrorMessage))
      }

      return (await response.json()) as T
    } catch (error) {
      if (isAbortError(error)) {
        throw error
      }

      lastError =
        error instanceof Error ? error : new Error(fallbackErrorMessage)

      if (attempt >= retries) {
        throw lastError
      }

      await sleep(retryDelayMs * (attempt + 1))
    }
  }

  throw lastError ?? new Error(fallbackErrorMessage)
}

export async function fetchJsonWithRetry<T>(
  input: RequestInfo | URL,
  options: JsonRequestOptions = {}
) {
  const method = getMethodFromInput(input, options.init)
  const url = getUrlFromInput(input)
  const requestKey = options.cacheKey ?? `${method}:${url}`
  const canUseCache = method === "GET"

  if (canUseCache && !options.skipCache) {
    const cached = responseCache.get(requestKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T
    }
  }

  if (canUseCache) {
    const pending = inflightRequests.get(requestKey)
    if (pending) {
      return pending as Promise<T>
    }
  }

  const requestPromise = requestJson<T>(input, options)

  if (canUseCache) {
    inflightRequests.set(requestKey, requestPromise as Promise<unknown>)
  }

  try {
    const data = await requestPromise
    if (canUseCache && (options.cacheTtlMs ?? 0) > 0) {
      responseCache.set(requestKey, {
        data,
        expiresAt: Date.now() + (options.cacheTtlMs ?? 0),
      })
    }
    return data
  } finally {
    if (canUseCache) {
      inflightRequests.delete(requestKey)
    }
  }
}

export function clearJsonCache(cacheKey?: string) {
  if (cacheKey) {
    responseCache.delete(cacheKey)
    inflightRequests.delete(cacheKey)
    return
  }

  responseCache.clear()
  inflightRequests.clear()
}
