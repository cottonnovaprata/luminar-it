"use client"

import React from "react"
import { Download, Printer, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AssetQRCodeProps {
  assetId: string
  assetName: string
  assetTag: string
}

export function AssetQRCode({ assetId, assetName, assetTag }: AssetQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>("")
  const [copied, setCopied] = React.useState(false)
  const qrRef = React.useRef<HTMLDivElement>(null)

  const assetDetailUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/assets/${assetId}?quick=info`

  React.useEffect(() => {
    // Gerar QR Code usando API externa (QR Server)
    const generateQRCode = async () => {
      try {
        const encodedUrl = encodeURIComponent(assetDetailUrl)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`
        setQrCodeUrl(qrUrl)
      } catch (error) {
        console.error("Error generating QR code:", error)
      }
    }

    generateQRCode()
  }, [assetDetailUrl])

  const handleDownload = async () => {
    if (!qrCodeUrl) return

    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `qr-code-${assetTag}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading QR code:", error)
    }
  }

  const handlePrint = () => {
    if (!qrRef.current) return

    const printWindow = window.open("", "", "height=500,width=500")
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta QR - ${assetName}</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: white;
            }
            .label {
              text-align: center;
              page-break-after: always;
            }
            .label-content {
              padding: 20px;
              border: 2px dashed #ccc;
              width: 300px;
            }
            .label-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
              word-break: break-word;
            }
            .label-tag {
              font-size: 14px;
              color: #666;
              margin-bottom: 15px;
            }
            .label-qr {
              margin: 15px 0;
            }
            .label-qr img {
              max-width: 250px;
              height: auto;
            }
            .label-text {
              font-size: 12px;
              color: #999;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="label-content">
              <div class="label-title">${assetName}</div>
              <div class="label-tag">Patrimônio: ${assetTag}</div>
              <div class="label-qr">
                <img src="${qrCodeUrl}" alt="QR Code" />
              </div>
              <div class="label-text">Escaneie o código acima para ver os detalhes</div>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(assetDetailUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="p-6 rounded-xl border"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            QR Code do Ativo
          </h3>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Escaneie para acessar os detalhes deste equipamento
          </p>
        </div>

        {/* QR Code */}
        <div
          ref={qrRef}
          className="p-4 rounded-lg"
          style={{
            background: "var(--bg-secondary)",
            border: "2px solid var(--border-primary)",
          }}
        >
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-64 h-64"
              style={{
                imageRendering: "crisp-edges",
              }}
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center" style={{ color: "var(--text-tertiary)" }}>
              Gerando QR Code...
            </div>
          )}
        </div>

        {/* URL Info */}
        <div
          className="w-full p-4 rounded-lg text-center break-all text-xs"
          style={{
            background: "var(--bg-muted)",
            color: "var(--text-secondary)",
          }}
        >
          {assetDetailUrl}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            onClick={handleDownload}
            disabled={!qrCodeUrl}
            variant="outline"
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar QR Code
          </Button>

          <Button
            onClick={handlePrint}
            disabled={!qrCodeUrl}
            variant="outline"
            className="flex-1"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Etiqueta
          </Button>

          <Button
            onClick={handleCopyUrl}
            variant="outline"
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar URL
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
