import { SignJWT, jwtVerify } from "jose"
import type { BuildReportInput } from "@/lib/reports"

type DownloadTokenPayload = BuildReportInput & {
  delivery: "WHATSAPP_LINK" | "EMAIL_LINK"
}

function resolveReportTokenSecret() {
  const explicit = process.env.REPORTS_TOKEN_SECRET || process.env.JWT_SECRET
  if (explicit) {
    return new TextEncoder().encode(explicit)
  }

  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode("luminar-local-report-secret")
  }

  throw new Error("REPORTS_TOKEN_SECRET ou JWT_SECRET nao configurado")
}

function resolvePublicBaseUrl() {
  const explicit = process.env.REPORTS_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL
  if (explicit) {
    return explicit.replace(/\/$/, "")
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "")
  }

  throw new Error("REPORTS_PUBLIC_BASE_URL nao configurada para links externos")
}

export async function createReportDownloadToken(payload: DownloadTokenPayload) {
  const reportTokenSecret = resolveReportTokenSecret()
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(reportTokenSecret)
}

export async function verifyReportDownloadToken(token: string) {
  const reportTokenSecret = resolveReportTokenSecret()
  const { payload } = await jwtVerify(token, reportTokenSecret)
  return payload as unknown as DownloadTokenPayload
}

export async function sendReportByEmail(params: {
  to: string
  subject: string
  html: string
  filename: string
  contentBase64: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("RESEND_API_KEY nao configurada")
  }

  const from = process.env.REPORTS_FROM_EMAIL || "Luminar IT <reports@luminar.it>"

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      attachments: [
        {
          filename: params.filename,
          content: params.contentBase64,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Falha no envio por e-mail: ${errorText}`)
  }
}

export async function sendReportByWhatsApp(params: {
  to: string
  templateName: string
  formatLabel: string
  periodLabel: string
  downloadToken: string
}) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    throw new Error("WHATSAPP_ACCESS_TOKEN ou WHATSAPP_PHONE_NUMBER_ID nao configurado")
  }

  const downloadUrl = `${resolvePublicBaseUrl()}/api/reports/download?token=${encodeURIComponent(params.downloadToken)}`
  const bodyText = [
    "Relatorio Luminar IT pronto.",
    `Modelo: ${params.templateName}`,
    `Formato: ${params.formatLabel}`,
    `Periodo: ${params.periodLabel}`,
    `Download: ${downloadUrl}`,
    "Validade do link: 24h",
  ].join("\n")

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: params.to,
      type: "text",
      text: {
        body: bodyText,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Falha no envio por WhatsApp: ${errorText}`)
  }

  return { downloadUrl }
}

export function safeRecipientForWhatsApp(raw: string) {
  const cleaned = raw.replace(/\D/g, "")
  if (cleaned.length < 10 || cleaned.length > 15) {
    throw new Error("Numero de WhatsApp invalido. Use DDI + DDD + numero.")
  }
  return cleaned
}

export function safeRecipientForEmail(raw: string) {
  const email = raw.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
  if (!emailRegex.test(email)) {
    throw new Error("E-mail invalido")
  }
  return email
}
