import { NextResponse } from "next/server"
import { buildReportFile, isValidFormat, isValidPeriod, isValidTemplate } from "@/lib/reports"
import { verifyReportDownloadToken } from "@/lib/report-delivery"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token obrigatorio" }, { status: 400 })
    }

    const payload = await verifyReportDownloadToken(token)
    const template = String(payload.template || "")
    const format = String(payload.format || "")
    const period = String(payload.period || "")

    if (!isValidTemplate(template) || !isValidFormat(format) || !isValidPeriod(period)) {
      return NextResponse.json({ error: "Token invalido para download" }, { status: 400 })
    }

    const report = await buildReportFile({
      template,
      format,
      period,
      fromDate: payload.fromDate ? String(payload.fromDate) : undefined,
      toDate: payload.toDate ? String(payload.toDate) : undefined,
    })

    return new NextResponse(new Uint8Array(report.content), {
      status: 200,
      headers: {
        "Content-Type": report.mimeType,
        "Content-Disposition": `attachment; filename=\"${report.filename}\"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Reports Download Error:", error)
    return NextResponse.json({ error: "Link invalido ou expirado" }, { status: 401 })
  }
}
