"use client"

import React from "react"
import { useParams } from "next/navigation"
import { Copy, Check, Download, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function QRTestPage() {
  const params = useParams()
  const assetId = params.id as string
  const [copied, setCopied] = React.useState(false)

  // URL que o QR Code vai apontar
  const qrTargetUrl = `http://192.168.1.101:3000/assets/${assetId}?quick=info`
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrTargetUrl)}`

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrTargetUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(qrApiUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `qr-code-test-${assetId}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading QR code:", error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Teste de QR Code
        </h1>
        <p style={{ color: "var(--text-tertiary)" }}>
          Escaneie o QR Code abaixo com seu celular na mesma rede WiFi
        </p>
      </div>

      <Card className="p-8">
        <div className="flex flex-col items-center gap-6">
          {/* QR Code Grande */}
          <div className="p-4 rounded-lg bg-white">
            <img
              src={qrApiUrl}
              alt="QR Code"
              className="w-80 h-80"
              style={{
                imageRendering: "crisp-edges",
              }}
            />
          </div>

          {/* Instruções */}
          <div className="text-center space-y-4 w-full">
            <div
              className="p-4 rounded-lg"
              style={{
                background: "var(--bg-muted)",
                color: "var(--text-secondary)",
              }}
            >
              <p className="font-semibold mb-2">📱 Instruções:</p>
              <ol className="text-sm space-y-2 text-left">
                <li>✅ 1. Abra a câmera do seu celular</li>
                <li>✅ 2. Aponte para o QR Code acima</li>
                <li>✅ 3. Toque no link que aparecer</li>
                <li>✅ 4. Você será redirecionado para a página do ativo</li>
              </ol>
            </div>

            {/* URL Info */}
            <div
              className="p-4 rounded-lg text-center break-all text-xs font-mono"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <p className="mb-2 font-semibold">URL do QR Code:</p>
              <p>{qrTargetUrl}</p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button onClick={handleCopyUrl} variant="outline" className="flex-1">
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

              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Baixar QR Code
              </Button>
            </div>

            {/* Info de Rede */}
            <div
              className="p-4 rounded-lg text-sm"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-tertiary)",
              }}
            >
              <p className="font-semibold mb-2 flex items-center justify-center gap-2">
                <Monitor className="h-4 w-4" />
                Sua Rede
              </p>
              <p>IP: <span className="font-mono font-bold text-blue-500">192.168.1.101:3000</span></p>
              <p className="text-xs mt-2">
                Certifique-se de que seu celular está na mesma rede WiFi
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Teste Direto */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          🧪 Teste Direto (sem escanear)
        </h2>
        <p className="mb-4" style={{ color: "var(--text-tertiary)" }}>
          Clique no link abaixo para testar a navegação:
        </p>
        <Button asChild className="w-full">
          <a href={qrTargetUrl}>
            Abrir URL do QR Code
          </a>
        </Button>
      </Card>

      {/* Fluxo de Login */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          🔐 Fluxo de Segurança
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
              style={{ background: "var(--status-info)" }}
            >
              1
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Acesso à URL
              </p>
              <p style={{ color: "var(--text-tertiary)" }}>
                {qrTargetUrl}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
              style={{ background: "var(--status-info)" }}
            >
              2
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Verificação de Autenticação
              </p>
              <p style={{ color: "var(--text-tertiary)" }}>
                Sistema verifica se você está autenticado
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
              style={{ background: "var(--status-info)" }}
            >
              3
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Se não autenticado
              </p>
              <p style={{ color: "var(--text-tertiary)" }}>
                Redireciona para /login com redirect automático
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
              style={{ background: "var(--status-success)" }}
            >
              4
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Página de Detalhe Carregada
              </p>
              <p style={{ color: "var(--text-tertiary)" }}>
                Mostra informações completas do ativo com QR Code
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
