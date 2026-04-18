type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function readOptionalString(value: unknown) {
  if (typeof value !== "string") return null
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function parseDate(value: unknown, label: string): ParseResult<Date> {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { ok: false, error: `${label} obrigatoria` }
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, error: `${label} invalida` }
  }

  return { ok: true, data: parsed }
}

export type AssetInput = {
  tag: string
  name: string
  type: string
  brand: string
  model: string
  serialNumber: string | null
  patrimony: string | null
  ipAddress: string | null
  hostname: string | null
  operatingSystem: string | null
  status: string
  criticality: string
  notes: string | null
  sectorId: string | null
}

const ASSET_REQUIRED_FIELDS = ["tag", "name", "type", "brand", "model", "status", "criticality"] as const

export function parseAssetInput(body: unknown): ParseResult<AssetInput> {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Payload invalido" }
  }

  const source = body as Record<string, unknown>

  const parsed: AssetInput = {
    tag: readString(source.tag),
    name: readString(source.name),
    type: readString(source.type),
    brand: readString(source.brand),
    model: readString(source.model),
    serialNumber: readOptionalString(source.serialNumber),
    patrimony: readOptionalString(source.patrimony),
    ipAddress: readOptionalString(source.ipAddress),
    hostname: readOptionalString(source.hostname),
    operatingSystem: readOptionalString(source.operatingSystem),
    status: readString(source.status),
    criticality: readString(source.criticality),
    notes: readOptionalString(source.notes),
    sectorId: readOptionalString(source.sectorId),
  }

  const missing = ASSET_REQUIRED_FIELDS.filter((field) => parsed[field].length === 0)
  if (missing.length > 0) {
    return { ok: false, error: `Campos obrigatorios ausentes: ${missing.join(", ")}` }
  }

  return { ok: true, data: parsed }
}

const MAINTENANCE_STATUS = ["PENDENTE", "EM_PROGRESSO", "CONCLUIDO", "CANCELADO"] as const
export type MaintenanceStatusInput = (typeof MAINTENANCE_STATUS)[number]

function isValidMaintenanceStatus(status: string): status is MaintenanceStatusInput {
  return (MAINTENANCE_STATUS as readonly string[]).includes(status)
}

export type MaintenanceInput = {
  assetId: string | null
  problem: string
  description: string | null
  status: MaintenanceStatusInput
  technician: string
  cost: number | null
  startDate: Date
  endDate: Date | null
}

export function parseMaintenanceInput(
  body: unknown,
  options: { requireAssetId: boolean }
): ParseResult<MaintenanceInput> {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Payload invalido" }
  }

  const source = body as Record<string, unknown>
  const assetId = readOptionalString(source.assetId)
  const problem = readString(source.problem)
  const status = readString(source.status).toUpperCase()
  const technician = readString(source.technician)
  const description = readOptionalString(source.description)

  if (options.requireAssetId && !assetId) {
    return { ok: false, error: "assetId obrigatorio" }
  }

  if (!problem) {
    return { ok: false, error: "problem obrigatorio" }
  }

  if (!technician) {
    return { ok: false, error: "technician obrigatorio" }
  }

  if (!isValidMaintenanceStatus(status)) {
    return { ok: false, error: "status invalido" }
  }

  const startDateResult = parseDate(source.startDate, "startDate")
  if (!startDateResult.ok) {
    return startDateResult
  }

  let endDate: Date | null = null
  if (typeof source.endDate === "string" && source.endDate.trim().length > 0) {
    const endDateResult = parseDate(source.endDate, "endDate")
    if (!endDateResult.ok) {
      return endDateResult
    }
    endDate = endDateResult.data
  }

  let cost: number | null = null
  if (typeof source.cost === "number" && Number.isFinite(source.cost)) {
    cost = source.cost
  } else if (typeof source.cost === "string" && source.cost.trim().length > 0) {
    const parsedCost = Number(source.cost)
    if (!Number.isFinite(parsedCost)) {
      return { ok: false, error: "cost invalido" }
    }
    cost = parsedCost
  }

  return {
    ok: true,
    data: {
      assetId,
      problem,
      description,
      status,
      technician,
      cost,
      startDate: startDateResult.data,
      endDate,
    },
  }
}

const LOGIN_EMAIL_MAX_LENGTH = 254
const LOGIN_PASSWORD_MAX_LENGTH = 256

export type LoginInput = {
  email: string
  password: string
}

export function parseLoginInput(body: unknown): ParseResult<LoginInput> {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Payload invalido" }
  }

  const source = body as Record<string, unknown>
  const email = readString(source.email).toLowerCase()
  const password = typeof source.password === "string" ? source.password : ""

  if (!email || !password) {
    return { ok: false, error: "Email e senha sao obrigatorios" }
  }

  if (email.length > LOGIN_EMAIL_MAX_LENGTH) {
    return { ok: false, error: "Email invalido" }
  }

  if (password.length > LOGIN_PASSWORD_MAX_LENGTH) {
    return { ok: false, error: "Senha invalida" }
  }

  return {
    ok: true,
    data: {
      email,
      password,
    },
  }
}

const REPORT_DELIVERY_CHANNELS = ["DOWNLOAD", "EMAIL", "WHATSAPP"] as const
const REPORT_TEMPLATE_KEYS = [
  "ASSET_INVENTORY",
  "ASSET_DEPRECIATION",
  "LICENSE_COMPLIANCE",
  "MAINTENANCE_HISTORY",
  "VAULT_AUDIT",
] as const
const REPORT_FORMAT_KEYS = ["PDF", "XLSX", "CSV", "JSON"] as const
const REPORT_PERIOD_KEYS = [
  "THIS_MONTH",
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "LAST_90_DAYS",
  "CUSTOM",
] as const

type DeliveryChannel = (typeof REPORT_DELIVERY_CHANNELS)[number]
type ReportTemplateKey = (typeof REPORT_TEMPLATE_KEYS)[number]
type ReportFormatKey = (typeof REPORT_FORMAT_KEYS)[number]
type ReportPeriodKey = (typeof REPORT_PERIOD_KEYS)[number]

export type ReportExportInput = {
  template: ReportTemplateKey
  format: ReportFormatKey
  period: ReportPeriodKey
  delivery: DeliveryChannel
  recipient: string | null
  fromDate?: string
  toDate?: string
}

function isMember<T extends readonly string[]>(value: string, table: T): value is T[number] {
  return table.includes(value as T[number])
}

function isValidIsoDate(value: string) {
  const parsed = new Date(value)
  return Number.isFinite(parsed.getTime())
}

function isSafeDateRange(fromDate?: string, toDate?: string) {
  if (!fromDate || !toDate) return true
  const from = new Date(fromDate)
  const to = new Date(toDate)
  return from.getTime() <= to.getTime()
}

export function parseReportExportInput(body: unknown): ParseResult<ReportExportInput> {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Payload invalido" }
  }

  const source = body as Record<string, unknown>
  const template = readString(source.template)
  const format = readString(source.format).toUpperCase()
  const period = readString(source.period).toUpperCase()
  const deliveryRaw = readString(source.delivery).toUpperCase()
  const delivery = (deliveryRaw || "DOWNLOAD") as DeliveryChannel
  const recipient = readOptionalString(source.recipient)
  const fromDate = readOptionalString(source.fromDate) ?? undefined
  const toDate = readOptionalString(source.toDate) ?? undefined

  if (!isMember(template, REPORT_TEMPLATE_KEYS)) {
    return { ok: false, error: "Template invalido" }
  }

  if (!isMember(format, REPORT_FORMAT_KEYS)) {
    return { ok: false, error: "Formato invalido" }
  }

  if (!isMember(period, REPORT_PERIOD_KEYS)) {
    return { ok: false, error: "Periodo invalido" }
  }

  if (!isMember(delivery, REPORT_DELIVERY_CHANNELS)) {
    return { ok: false, error: "Canal de entrega invalido" }
  }

  if (period === "CUSTOM") {
    if (!fromDate || !toDate) {
      return { ok: false, error: "Informe a data inicial e final para periodo customizado." }
    }
    if (!isValidIsoDate(fromDate) || !isValidIsoDate(toDate)) {
      return { ok: false, error: "Periodo custom invalido" }
    }
    if (!isSafeDateRange(fromDate, toDate)) {
      return { ok: false, error: "Periodo custom invalido" }
    }
  }

  if ((delivery === "EMAIL" || delivery === "WHATSAPP") && !recipient) {
    return {
      ok: false,
      error:
        delivery === "EMAIL"
          ? "Informe o e-mail de destino"
          : "Informe o numero de WhatsApp",
    }
  }

  return {
    ok: true,
    data: {
      template,
      format,
      period,
      delivery,
      recipient,
      fromDate,
      toDate,
    },
  }
}
