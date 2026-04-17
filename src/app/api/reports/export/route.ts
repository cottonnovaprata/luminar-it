import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import {
  buildReportFile,
  isValidFormat,
  isValidPeriod,
  isValidTemplate,
  type BuildReportInput,
  type ReportTemplate,
  type ReportFormat,
} from "@/lib/reports"
import {
  createReportDownloadToken,
  safeRecipientForEmail,
  safeRecipientForWhatsApp,
  sendReportByEmail,
  sendReportByWhatsApp,
} from "@/lib/report-delivery"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type DeliveryChannel = "DOWNLOAD" | "EMAIL" | "WHATSAPP"

function templateLabel(template: ReportTemplate) {
  const labels: Record<ReportTemplate, string> = {
    ASSET_INVENTORY: "Inventario Geral de Ativos",
    ASSET_DEPRECIATION: "Depreciacao de Equipamentos",
    LICENSE_COMPLIANCE: "Relatorio de Licenciamento",
    MAINTENANCE_HISTORY: "Historico de Manutencoes",
    VAULT_AUDIT: "Log de Acesso ao Cofre",
  }
  return labels[template]
}

function formatLabel(format: ReportFormat) {
  return format
}

function periodLabel(period: BuildReportInput["period"]) {
  const labels: Record<BuildReportInput["period"], string> = {
    THIS_MONTH: "Mes atual",
    LAST_7_DAYS: "Ultimos 7 dias",
    LAST_30_DAYS: "Ultimos 30 dias",
    LAST_90_DAYS: "Ultimos 90 dias",
    CUSTOM: "Periodo customizado",
  }
  return labels[period]
}

function inferErrorStatus(error: unknown) {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    if (msg.includes("nao configurad")) return 501
    if (msg.includes("invalido")) return 400
  }
  return 500
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as {
      template?: string
      format?: string
      period?: string
      fromDate?: string
      toDate?: string
      delivery?: string
      recipient?: string
    }

    if (!body.template || !isValidTemplate(body.template)) {
      return NextResponse.json({ error: "Template invalido" }, { status: 400 })
    }

    if (!body.format || !isValidFormat(body.format)) {
      return NextResponse.json({ error: "Formato invalido" }, { status: 400 })
    }

    if (!body.period || !isValidPeriod(body.period)) {
      return NextResponse.json({ error: "Periodo invalido" }, { status: 400 })
    }

    const delivery = (body.delivery || "DOWNLOAD") as DeliveryChannel
    if (!["DOWNLOAD", "EMAIL", "WHATSAPP"].includes(delivery)) {
      return NextResponse.json({ error: "Canal de entrega invalido" }, { status: 400 })
    }

    const reportInput: BuildReportInput = {
      template: body.template,
      format: body.format,
      period: body.period,
      fromDate: body.fromDate,
      toDate: body.toDate,
    }

    if (delivery === "DOWNLOAD") {
      const report = await buildReportFile(reportInput)
      return new NextResponse(new Uint8Array(report.content), {
        status: 200,
        headers: {
          "Content-Type": report.mimeType,
          "Content-Disposition": `attachment; filename=\"${report.filename}\"`,
          "Cache-Control": "no-store",
        },
      })
    }

    if (delivery === "EMAIL") {
      if (!body.recipient) {
        return NextResponse.json({ error: "Informe o e-mail de destino" }, { status: 400 })
      }

      const to = safeRecipientForEmail(body.recipient)
      const report = await buildReportFile(reportInput)
      await sendReportByEmail({
        to,
        subject: `Luminar IT - ${templateLabel(reportInput.template)} (${formatLabel(reportInput.format)})`,
        html: `
          <h2>Relatorio Luminar IT</h2>
          <p>Segue em anexo o relatorio solicitado.</p>
          <ul>
            <li><strong>Modelo:</strong> ${templateLabel(reportInput.template)}</li>
            <li><strong>Formato:</strong> ${formatLabel(reportInput.format)}</li>
            <li><strong>Periodo:</strong> ${periodLabel(reportInput.period)}</li>
          </ul>
        `,
        filename: report.filename,
        contentBase64: report.content.toString("base64"),
      })

      return NextResponse.json({
        success: true,
        message: `Relatorio enviado para ${to} com sucesso.`,
      })
    }

    if (!body.recipient) {
      return NextResponse.json({ error: "Informe o numero de WhatsApp" }, { status: 400 })
    }

    const to = safeRecipientForWhatsApp(body.recipient)
    const token = await createReportDownloadToken({
      ...reportInput,
      delivery: "WHATSAPP_LINK",
    })
    const whatsappResult = await sendReportByWhatsApp({
      to,
      templateName: templateLabel(reportInput.template),
      formatLabel: formatLabel(reportInput.format),
      periodLabel: periodLabel(reportInput.period),
      downloadToken: token,
    })

    return NextResponse.json({
      success: true,
      message: `Link do relatorio enviado via WhatsApp para ${to}.`,
      downloadUrl: whatsappResult.downloadUrl,
    })
  } catch (error) {
    console.error("Reports Export Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao exportar relatorio" },
      { status: inferErrorStatus(error) }
    )
  }
}
