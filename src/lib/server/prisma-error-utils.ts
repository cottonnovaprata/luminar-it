import { Prisma } from "@prisma/client"

const TRANSIENT_DATABASE_ERROR_CODES = new Set(["P1001", "P1002", "P1017"])
const DATABASE_SCHEMA_ERROR_CODES = new Set(["P2021", "P2022"])

export function isTransientDatabaseError(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return true
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    TRANSIENT_DATABASE_ERROR_CODES.has(error.code)
  ) {
    return true
  }

  return false
}

export function getPrismaErrorCode(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code
  }

  return null
}

export function getDatabaseErrorMessage(error: unknown): string | null {
  if (isTransientDatabaseError(error)) {
    return "Banco de dados indisponivel. Tente novamente em instantes."
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    DATABASE_SCHEMA_ERROR_CODES.has(error.code)
  ) {
    return "Banco nao inicializado. Execute prisma db push e prisma db seed."
  }

  return null
}
