import { PrismaClient } from "@prisma/client"

const DATABASE_URL_CANDIDATES = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "NEON_DATABASE_URL",
] as const

function resolveDatasourceUrl() {
  for (const key of DATABASE_URL_CANDIDATES) {
    const value = process.env[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
  }

  return undefined
}

const prismaClientSingleton = () => {
  const datasourceUrl = resolveDatasourceUrl()

  if (datasourceUrl) {
    return new PrismaClient({ datasourceUrl })
  }

  if (process.env.NODE_ENV === "production") {
    console.error(
      `Prisma datasource URL not found. Checked: ${DATABASE_URL_CANDIDATES.join(", ")}`
    )
  }

  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
