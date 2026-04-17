import ExcelJS from "exceljs"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import prisma from "@/lib/prisma"

export const REPORT_TEMPLATES = [
  "ASSET_INVENTORY",
  "ASSET_DEPRECIATION",
  "LICENSE_COMPLIANCE",
  "MAINTENANCE_HISTORY",
  "VAULT_AUDIT",
] as const

export const REPORT_FORMATS = ["PDF", "XLSX", "CSV", "JSON"] as const
export const REPORT_PERIODS = ["THIS_MONTH", "LAST_7_DAYS", "LAST_30_DAYS", "LAST_90_DAYS", "CUSTOM"] as const

export type ReportTemplate = (typeof REPORT_TEMPLATES)[number]
export type ReportFormat = (typeof REPORT_FORMATS)[number]
export type ReportPeriod = (typeof REPORT_PERIODS)[number]

type DateRange = {
  from: Date
  to: Date
  label: string
}

type ReportDataset = {
  title: string
  subtitle: string
  generatedAt: Date
  range: DateRange
  columns: string[]
  rows: Array<Record<string, string | number | null>>
  summary: Array<{ label: string; value: string | number }>
}

export type BuildReportInput = {
  template: ReportTemplate
  format: ReportFormat
  period: ReportPeriod
  fromDate?: string
  toDate?: string
}

export type BuiltReport = {
  filename: string
  mimeType: string
  content: Buffer
  dataset: ReportDataset
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value)
}

function calculateDateRange(period: ReportPeriod, fromDate?: string, toDate?: string): DateRange {
  const now = new Date()
  const end = new Date(now)
  const start = new Date(now)

  if (period === "THIS_MONTH") {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    return {
      from: start,
      to: end,
      label: `Mes atual (${formatDate(start)} - ${formatDate(end)})`,
    }
  }

  if (period === "LAST_7_DAYS") {
    start.setDate(now.getDate() - 7)
    start.setHours(0, 0, 0, 0)
    return {
      from: start,
      to: end,
      label: `Ultimos 7 dias (${formatDate(start)} - ${formatDate(end)})`,
    }
  }

  if (period === "LAST_30_DAYS") {
    start.setDate(now.getDate() - 30)
    start.setHours(0, 0, 0, 0)
    return {
      from: start,
      to: end,
      label: `Ultimos 30 dias (${formatDate(start)} - ${formatDate(end)})`,
    }
  }

  if (period === "LAST_90_DAYS") {
    start.setDate(now.getDate() - 90)
    start.setHours(0, 0, 0, 0)
    return {
      from: start,
      to: end,
      label: `Ultimos 90 dias (${formatDate(start)} - ${formatDate(end)})`,
    }
  }

  const customFrom = fromDate ? new Date(fromDate) : new Date(now.getFullYear(), now.getMonth(), 1)
  const customTo = toDate ? new Date(toDate) : end
  if (Number.isNaN(customFrom.getTime()) || Number.isNaN(customTo.getTime())) {
    throw new Error("Periodo custom invalido")
  }
  customFrom.setHours(0, 0, 0, 0)
  customTo.setHours(23, 59, 59, 999)

  return {
    from: customFrom,
    to: customTo,
    label: `Periodo customizado (${formatDate(customFrom)} - ${formatDate(customTo)})`,
  }
}

function templateMeta(template: ReportTemplate) {
  switch (template) {
    case "ASSET_INVENTORY":
      return { title: "Inventario Geral de Ativos", slug: "inventario_ativos" }
    case "ASSET_DEPRECIATION":
      return { title: "Depreciacao de Equipamentos", slug: "depreciacao_equipamentos" }
    case "LICENSE_COMPLIANCE":
      return { title: "Relatorio de Licenciamento", slug: "licenciamento" }
    case "MAINTENANCE_HISTORY":
      return { title: "Historico de Manutencoes", slug: "historico_manutencoes" }
    case "VAULT_AUDIT":
      return { title: "Log de Acesso ao Cofre", slug: "auditoria_cofre" }
    default:
      return { title: "Relatorio", slug: "relatorio" }
  }
}

async function datasetAssetInventory(range: DateRange): Promise<ReportDataset> {
  const assets = await prisma.asset.findMany({
    where: {
      createdAt: {
        lte: range.to,
      },
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      sector: { select: { name: true } },
      user: { select: { name: true } },
    },
  })

  return {
    title: "Inventario Geral de Ativos",
    subtitle: "Snapshot consolidado do parque de ativos",
    generatedAt: new Date(),
    range,
    columns: ["Tag", "Nome", "Tipo", "Status", "Setor", "Responsavel", "Criticidade", "Criado em"],
    rows: assets.map((asset) => ({
      Tag: asset.tag,
      Nome: asset.name,
      Tipo: asset.type,
      Status: asset.status,
      Setor: asset.sector?.name || "Sem setor",
      Responsavel: asset.user?.name || "Sem responsavel",
      Criticidade: asset.criticality,
      "Criado em": formatDate(asset.createdAt),
    })),
    summary: [
      { label: "Total de ativos", value: assets.length },
      { label: "Ativos em manutencao", value: assets.filter((asset) => asset.status === "MANUTENCAO").length },
    ],
  }
}

function estimateAssetValueByType(type: string) {
  const table: Record<string, number> = {
    Notebook: 6000,
    Smartphone: 2800,
    Servidor: 18000,
    Monitor: 1500,
  }

  return table[type] || 4000
}

async function datasetAssetDepreciation(range: DateRange): Promise<ReportDataset> {
  const assets = await prisma.asset.findMany({
    orderBy: [{ createdAt: "asc" }],
    include: {
      sector: { select: { name: true } },
    },
  })

  const rows = assets.map((asset) => {
    const createdAt = asset.createdAt
    const monthsInUse =
      Math.max(
        0,
        (range.to.getFullYear() - createdAt.getFullYear()) * 12 + (range.to.getMonth() - createdAt.getMonth())
      ) || 0

    const baseValue = estimateAssetValueByType(asset.type)
    const depreciationPercent = Math.min(80, monthsInUse * 2)
    const currentValue = Math.round(baseValue * (1 - depreciationPercent / 100))

    return {
      Tag: asset.tag,
      Nome: asset.name,
      Tipo: asset.type,
      Setor: asset.sector?.name || "Sem setor",
      "Valor base (R$)": baseValue,
      "Meses de uso": monthsInUse,
      "Depreciacao (%)": depreciationPercent,
      "Valor estimado atual (R$)": currentValue,
    }
  })

  const totalBase = rows.reduce((acc, row) => acc + (Number(row["Valor base (R$)"]) || 0), 0)
  const totalCurrent = rows.reduce((acc, row) => acc + (Number(row["Valor estimado atual (R$)"]) || 0), 0)

  return {
    title: "Depreciacao de Equipamentos",
    subtitle: "Estimativa patrimonial por tempo de uso",
    generatedAt: new Date(),
    range,
    columns: [
      "Tag",
      "Nome",
      "Tipo",
      "Setor",
      "Valor base (R$)",
      "Meses de uso",
      "Depreciacao (%)",
      "Valor estimado atual (R$)",
    ],
    rows,
    summary: [
      { label: "Ativos avaliados", value: rows.length },
      { label: "Valor base total", value: formatCurrency(totalBase) },
      { label: "Valor atual estimado", value: formatCurrency(totalCurrent) },
    ],
  }
}

async function datasetLicenseCompliance(range: DateRange): Promise<ReportDataset> {
  const assets = await prisma.asset.findMany({
    where: {
      createdAt: {
        lte: range.to,
      },
    },
    orderBy: [{ updatedAt: "desc" }],
    include: {
      user: { select: { name: true } },
    },
  })

  const rows = assets.map((asset) => {
    const hasSoftwareProfile = !!asset.operatingSystem
    const compliance = hasSoftwareProfile ? "OK" : "PENDENTE"
    return {
      Tag: asset.tag,
      Nome: asset.name,
      "Sistema operacional": asset.operatingSystem || "Nao informado",
      Responsavel: asset.user?.name || "Sem responsavel",
      Status: asset.status,
      "Conformidade licenca": compliance,
    }
  })

  const compliant = rows.filter((row) => row["Conformidade licenca"] === "OK").length
  const pending = rows.length - compliant

  return {
    title: "Relatorio de Licenciamento",
    subtitle: "Conformidade com inventario de software",
    generatedAt: new Date(),
    range,
    columns: ["Tag", "Nome", "Sistema operacional", "Responsavel", "Status", "Conformidade licenca"],
    rows,
    summary: [
      { label: "Ativos avaliados", value: rows.length },
      { label: "Conformes", value: compliant },
      { label: "Pendentes", value: pending },
    ],
  }
}

async function datasetMaintenanceHistory(range: DateRange): Promise<ReportDataset> {
  const maintenances = await prisma.maintenance.findMany({
    where: {
      startDate: {
        gte: range.from,
        lte: range.to,
      },
    },
    orderBy: [{ startDate: "desc" }],
    include: {
      asset: {
        select: {
          tag: true,
          name: true,
          status: true,
        },
      },
    },
  })

  const totalCost = maintenances.reduce((acc, maintenance) => acc + (maintenance.cost || 0), 0)

  return {
    title: "Historico de Manutencoes",
    subtitle: "Registro de custos e tempos de reparo",
    generatedAt: new Date(),
    range,
    columns: [
      "Ativo",
      "Tag",
      "Problema",
      "Tecnico",
      "Status",
      "Inicio",
      "Fim",
      "Custo (R$)",
    ],
    rows: maintenances.map((maintenance) => ({
      Ativo: maintenance.asset.name,
      Tag: maintenance.asset.tag,
      Problema: maintenance.problem,
      Tecnico: maintenance.technician,
      Status: maintenance.status,
      Inicio: formatDate(maintenance.startDate),
      Fim: maintenance.endDate ? formatDate(maintenance.endDate) : "-",
      "Custo (R$)": maintenance.cost ?? 0,
    })),
    summary: [
      { label: "Intervencoes no periodo", value: maintenances.length },
      { label: "Custo total", value: formatCurrency(totalCost) },
      { label: "Concluidas", value: maintenances.filter((maintenance) => maintenance.status === "CONCLUIDO").length },
    ],
  }
}

async function datasetVaultAudit(range: DateRange): Promise<ReportDataset> {
  const logs = await prisma.vaultAccessLog.findMany({
    where: {
      createdAt: {
        gte: range.from,
        lte: range.to,
      },
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      credential: {
        select: {
          title: true,
          username: true,
          type: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  const viewCount = logs.filter((log) => log.action === "VIEW").length
  const copyCount = logs.filter((log) => log.action === "COPY").length

  return {
    title: "Log de Acesso ao Cofre",
    subtitle: "Auditoria completa de uso de credenciais",
    generatedAt: new Date(),
    range,
    columns: ["Data/Hora", "Acao", "Credencial", "Usuario credencial", "Responsavel", "Email", "Tipo"],
    rows: logs.map((log) => ({
      "Data/Hora": formatDateTime(log.createdAt),
      Acao: log.action,
      Credencial: log.credential.title,
      "Usuario credencial": log.credential.username,
      Responsavel: log.user?.name || "Sistema",
      Email: log.user?.email || "-",
      Tipo: log.credential.type,
    })),
    summary: [
      { label: "Eventos no periodo", value: logs.length },
      { label: "Visualizacoes", value: viewCount },
      { label: "Copias", value: copyCount },
    ],
  }
}

async function buildDataset(input: BuildReportInput): Promise<ReportDataset> {
  const range = calculateDateRange(input.period, input.fromDate, input.toDate)

  switch (input.template) {
    case "ASSET_INVENTORY":
      return datasetAssetInventory(range)
    case "ASSET_DEPRECIATION":
      return datasetAssetDepreciation(range)
    case "LICENSE_COMPLIANCE":
      return datasetLicenseCompliance(range)
    case "MAINTENANCE_HISTORY":
      return datasetMaintenanceHistory(range)
    case "VAULT_AUDIT":
      return datasetVaultAudit(range)
    default:
      throw new Error("Template invalido")
  }
}

function escapeCsv(value: string | number | null) {
  if (value === null) return ""
  const text = String(value)
  if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
    return `"${text.replace(/"/g, "\"\"")}"`
  }
  return text
}

function renderCsv(dataset: ReportDataset) {
  const header = dataset.columns.join(",")
  const lines = dataset.rows.map((row) => dataset.columns.map((column) => escapeCsv(row[column] ?? "")).join(","))
  return Buffer.from([header, ...lines].join("\n"), "utf8")
}

function renderJson(dataset: ReportDataset) {
  return Buffer.from(
    JSON.stringify(
      {
        title: dataset.title,
        subtitle: dataset.subtitle,
        generatedAt: dataset.generatedAt.toISOString(),
        period: dataset.range.label,
        summary: dataset.summary,
        rows: dataset.rows,
      },
      null,
      2
    ),
    "utf8"
  )
}

async function renderXlsx(dataset: ReportDataset) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Relatorio")

  sheet.addRow([dataset.title])
  sheet.addRow([dataset.subtitle])
  sheet.addRow([`Periodo: ${dataset.range.label}`])
  sheet.addRow([`Gerado em: ${formatDateTime(dataset.generatedAt)}`])
  sheet.addRow([])
  sheet.addRow(dataset.columns)

  for (const row of dataset.rows) {
    sheet.addRow(dataset.columns.map((column) => row[column] ?? ""))
  }

  sheet.columns.forEach((column) => {
    column.width = 22
  })

  sheet.getRow(1).font = { bold: true, size: 14 }
  sheet.getRow(6).font = { bold: true }

  sheet.addRow([])
  sheet.addRow(["Resumo"])
  sheet.getRow(sheet.rowCount).font = { bold: true }
  dataset.summary.forEach((item) => {
    sheet.addRow([item.label, item.value])
  })

  const rawBuffer = await workbook.xlsx.writeBuffer()
  if (Buffer.isBuffer(rawBuffer)) {
    return rawBuffer
  }
  return Buffer.from(rawBuffer as ArrayBuffer)
}

async function renderPdf(dataset: ReportDataset) {
  const doc = await PDFDocument.create()
  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const pageSize: [number, number] = [595.28, 841.89]
  const margin = 40
  const contentWidth = pageSize[0] - margin * 2
  let page = doc.addPage(pageSize)
  let y = page.getHeight() - margin

  function wrapText(text: string, fontSize: number, font = regular) {
    const words = text.split(" ")
    const lines: string[] = []
    let line = ""

    for (const word of words) {
      const attempt = line ? `${line} ${word}` : word
      const width = font.widthOfTextAtSize(attempt, fontSize)
      if (width <= contentWidth || !line) {
        line = attempt
      } else {
        lines.push(line)
        line = word
      }
    }

    if (line) lines.push(line)
    return lines
  }

  function ensureSpace(fontSize: number, lines = 1) {
    const required = (fontSize + 4) * lines
    if (y - required < margin) {
      page = doc.addPage(pageSize)
      y = page.getHeight() - margin
    }
  }

  function drawText(text: string, options?: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> }) {
    const size = options?.size ?? 10
    const font = options?.bold ? bold : regular
    const color = options?.color ?? rgb(0, 0, 0)
    const lines = wrapText(text, size, font)

    ensureSpace(size, lines.length)
    for (const line of lines) {
      page.drawText(line, {
        x: margin,
        y,
        size,
        font,
        color,
      })
      y -= size + 4
    }
  }

  drawText(dataset.title, { size: 16, bold: true })
  drawText(dataset.subtitle, { size: 10, color: rgb(0.35, 0.35, 0.35) })
  drawText(`Periodo: ${dataset.range.label}`, { size: 10, color: rgb(0.35, 0.35, 0.35) })
  drawText(`Gerado em: ${formatDateTime(dataset.generatedAt)}`, { size: 10, color: rgb(0.35, 0.35, 0.35) })
  y -= 8

  drawText("Resumo", { size: 11, bold: true })
  for (const item of dataset.summary) {
    drawText(`- ${item.label}: ${item.value}`, { size: 10 })
  }
  y -= 8

  drawText("Dados", { size: 11, bold: true })
  drawText(dataset.columns.join(" | "), { size: 9, bold: true })

  for (const row of dataset.rows.slice(0, 250)) {
    const line = dataset.columns.map((column) => String(row[column] ?? "")).join(" | ")
    drawText(line, { size: 9 })
  }

  if (dataset.rows.length > 250) {
    drawText(`... ${dataset.rows.length - 250} linhas adicionais omitidas no PDF.`, {
      size: 9,
      color: rgb(0.4, 0.4, 0.4),
    })
  }

  const bytes = await doc.save()
  return Buffer.from(bytes)
}

function mimeByFormat(format: ReportFormat) {
  if (format === "PDF") return "application/pdf"
  if (format === "XLSX") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  if (format === "CSV") return "text/csv; charset=utf-8"
  return "application/json; charset=utf-8"
}

function extensionByFormat(format: ReportFormat) {
  if (format === "PDF") return "pdf"
  if (format === "XLSX") return "xlsx"
  if (format === "CSV") return "csv"
  return "json"
}

export async function buildReportFile(input: BuildReportInput): Promise<BuiltReport> {
  const dataset = await buildDataset(input)
  let content: Buffer

  if (input.format === "PDF") {
    content = await renderPdf(dataset)
  } else if (input.format === "XLSX") {
    content = await renderXlsx(dataset)
  } else if (input.format === "CSV") {
    content = renderCsv(dataset)
  } else {
    content = renderJson(dataset)
  }

  const meta = templateMeta(input.template)
  const dateStamp = new Date().toISOString().slice(0, 10)
  const extension = extensionByFormat(input.format)

  return {
    filename: `${meta.slug}_${dateStamp}.${extension}`,
    mimeType: mimeByFormat(input.format),
    content,
    dataset,
  }
}

export function isValidTemplate(template: string): template is ReportTemplate {
  return (REPORT_TEMPLATES as readonly string[]).includes(template)
}

export function isValidFormat(format: string): format is ReportFormat {
  return (REPORT_FORMATS as readonly string[]).includes(format)
}

export function isValidPeriod(period: string): period is ReportPeriod {
  return (REPORT_PERIODS as readonly string[]).includes(period)
}
