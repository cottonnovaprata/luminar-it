import type { JWTPayload } from "jose"

const SESSION_ROLES = ["ADMIN", "USER", "TECHNICIAN"] as const

type SessionRole = (typeof SESSION_ROLES)[number]

export type SessionPayload = JWTPayload & {
  userId: string
  email: string
  role: SessionRole
  name: string
}

function isSessionRole(value: unknown): value is SessionRole {
  return typeof value === "string" && SESSION_ROLES.includes(value as SessionRole)
}

export function toSessionPayload(payload: JWTPayload): SessionPayload | null {
  const userId = payload.userId
  const email = payload.email
  const role = payload.role
  const name = payload.name

  if (
    typeof userId !== "string" ||
    typeof email !== "string" ||
    typeof name !== "string" ||
    !isSessionRole(role)
  ) {
    return null
  }

  return {
    ...payload,
    userId,
    email,
    role,
    name,
  }
}

function resolveJwtSecretText() {
  const configured = process.env.JWT_SECRET?.trim()
  if (configured) {
    return configured
  }

  if (process.env.NODE_ENV !== "production") {
    return "novapratalabs-dev-jwt-secret"
  }

  throw new Error("JWT_SECRET nao configurado em ambiente de producao")
}

export function getJwtSecretKey() {
  return new TextEncoder().encode(resolveJwtSecretText())
}
