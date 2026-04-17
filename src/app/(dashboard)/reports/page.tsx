"use client"

import React from "react"
import {
  BarChart3,
  FileText,
  Download,
  ArrowUpRight,
  PieChart,
  Activity,
  Calendar,
  Filter,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ReportsStats = {
  monthlyCost: number
  availability: number
  newAssetsThisMonth: number
  pendingActions: number
  totalAssets: number
  assetsInMaintenance: number
  periodStart: string
}

const reportTemplates = [
  { id: "1", title: "Inventario Geral de Ativos", desc: "Listagem completa com valores e status.", type: "PDF / XLSX" },
  { id: "2", title: "Depreciacao de Equipamentos", desc: "Calculo de valor contabil x tempo de uso.", type: "XLSX" },
  { id: "3", title: "Relatorio de Licenciamento", desc: "Conformidade de softwares instalados.", type: "PDF" },
  { id: "4", title: "Historico de Manutencoes", desc: "Custos e tempo de reparo no periodo.", type: "PDF / XLSX" },
  { id: "5", title: "Log de Acesso ao Cofre", desc: "Auditoria completa de visualizacao de senhas.", type: "PDF" },
]

function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

export default function ReportsPage() {
  const [stats, setStats] = React.useState<ReportsStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadStats() {
      try {
        setError(null)
        const res = await fetch("/api/reports/stats")
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(data.error || "Falha ao carregar indicadores")
        }

        const data = (await res.json()) as ReportsStats
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado")
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const periodLabel = stats
    ? new Date(stats.periodStart).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatorios e BI</h1>
          <p className="text-muted-foreground">
            Analise dados reais da infraestrutura e gere documentos de auditoria.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            {periodLabel}
          </Button>
          <Button className="bg-primary">
            <Download className="mr-2 h-4 w-4" />
            Gerar Relatorio
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:bg-muted/50 transition-all cursor-pointer border-dashed">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <p className="font-semibold text-sm">Custo Mensal</p>
            <p className="text-xl font-bold">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrencyBRL(stats?.monthlyCost ?? 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:bg-muted/50 transition-all cursor-pointer border-dashed">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500">
              <PieChart className="h-6 w-6" />
            </div>
            <p className="font-semibold text-sm">Disponibilidade</p>
            <p className="text-xl font-bold">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${(stats?.availability ?? 0).toFixed(1)}%`}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:bg-muted/50 transition-all cursor-pointer border-dashed">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
              <Activity className="h-6 w-6" />
            </div>
            <p className="font-semibold text-sm">Novos Ativos (Mes)</p>
            <p className="text-xl font-bold">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `+${stats?.newAssetsThisMonth ?? 0}`}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:bg-muted/50 transition-all cursor-pointer border-dashed">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
              <FileText className="h-6 w-6" />
            </div>
            <p className="font-semibold text-sm">Acoes Pendentes</p>
            <p className="text-xl font-bold">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.pendingActions ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Modelos de Relatorios</CardTitle>
              <CardDescription>Formatos prontos para exportacao rapida.</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {reportTemplates.map((tpl) => (
                <div key={tpl.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded group-hover:bg-primary/10 group-hover:text-primary transition-colors text-muted-foreground">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{tpl.title}</p>
                      <p className="text-xs text-muted-foreground">{tpl.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-[10px] sm:flex hidden">
                      {tpl.type}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Programar Envio</CardTitle>
            <CardDescription className="text-primary/70">
              Receba relatorios automaticos no seu e-mail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80">Frequencia</p>
              <Button variant="outline" className="w-full justify-between bg-white/50 border-primary/20 text-primary">
                Semanal (Segunda-feira)
                <ArrowUpRight className="h-4 w-4 opacity-30" />
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80">Destinatario</p>
              <Button
                variant="outline"
                className="w-full justify-between bg-white/50 border-primary/20 text-primary text-sm font-normal"
              >
                ti-manager@empresa.com
              </Button>
            </div>
            <Button className="w-full shadow-md">Ativar Agendamento</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
