"use client"

import React from "react"
import Link from "next/link"
import {
  Box,
  Users,
  Wrench,
  AlertCircle,
  ArrowUpRight,
  Calendar,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AssetStatusItem = {
  status: string
  _count: {
    _all: number
  }
}

type RecentAsset = {
  id: string
  tag: string
  name: string
  type: string
  createdAt: string
  sector: {
    name: string
  } | null
}

type DashboardStats = {
  totalAssets: number
  totalUsers: number
  maintenanceCount: number
  assetsByStatus: AssetStatusItem[]
  recentAssets: RecentAsset[]
}

export default function DashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats")
        if (!res.ok) {
          throw new Error("Falha ao carregar dashboard")
        }
        const data = (await res.json()) as DashboardStats
        setStats(data)
      } catch (err) {
        console.error("Error fetching stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  const statCards = [
    {
      title: "Total de Ativos",
      value: stats?.totalAssets || 0,
      description: "Equipamentos cadastrados",
      icon: Box,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: "/assets",
    },
    {
      title: "Em Manutencao",
      value: stats?.maintenanceCount || 0,
      description: "Chamados tecnicos ativos",
      icon: Wrench,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      href: "/maintenances",
    },
    {
      title: "Colaboradores",
      value: stats?.totalUsers || 0,
      description: "Usuarios com acesso",
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      href: "/employees",
    },
    {
      title: "Alertas",
      value: "12",
      description: "Acoes sugeridas",
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
      href: "/reports",
    },
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Dashboard
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-tertiary)" }}>
            Visao geral de seus ativos e operacoes
          </p>
        </div>
        <Button variant="outline" size="sm" className="w-fit">
          <Calendar className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">{new Date().toLocaleDateString("pt-BR")}</span>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href} className="block">
            <Card className="group cursor-pointer hover:border-blue-200 hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex-1">
                  <CardTitle className="text-xs sm:text-sm font-semibold" style={{ color: "var(--text-tertiary)" }}>
                    {stat.title}
                  </CardTitle>
                  <div
                    className="text-4xl sm:text-5xl font-bold mt-4"
                    style={{ letterSpacing: "-0.03em", color: "var(--text-primary)" }}
                  >
                    {stat.value}
                  </div>
                </div>
                <div className={cn("p-3 rounded-xl flex-shrink-0", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex items-center justify-between gap-2">
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {stat.description}
                </p>
                <ArrowUpRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Ativos Recentes
            </CardTitle>
            <CardDescription style={{ color: "var(--text-tertiary)" }}>
              Ultimos equipamentos adicionados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentAssets?.length ? (
                stats.recentAssets.map((asset) => (
                  <Link
                    key={asset.id}
                    href={`/assets/${asset.id}`}
                    className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-blue-50"
                    style={{ background: "var(--bg-muted)", border: "1px solid var(--border-primary)" }}
                  >
                    <div
                      className="px-3 py-1.5 rounded-md font-semibold text-xs flex-shrink-0"
                      style={{ background: "rgba(37, 99, 235, 0.15)", color: "#3b82f6" }}
                    >
                      {asset.tag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {asset.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {asset.type} • {asset.sector?.name || "Sem setor"}
                      </p>
                    </div>
                    <div className="text-xs whitespace-nowrap flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                      {new Date(asset.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-center py-8" style={{ color: "var(--text-tertiary)" }}>
                  Nenhum ativo recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Status dos Ativos
            </CardTitle>
            <CardDescription style={{ color: "var(--text-tertiary)" }}>
              Distribuicao atual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {stats?.assetsByStatus?.length ? (
              stats.assetsByStatus.map((item) => (
                <div key={item.status} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                      {item.status}
                    </span>
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-md"
                      style={{ color: "#3b82f6", background: "rgba(37, 99, 235, 0.1)" }}
                    >
                      {item._count._all}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "var(--border-primary)" }}>
                    <div
                      className="h-full transition-all duration-700 rounded-full"
                      style={{
                        width: `${(item._count._all / Math.max(stats.totalAssets || 1, 1)) * 100}%`,
                        background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                        boxShadow: "0 0 12px rgba(59, 130, 246, 0.3)",
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-center py-8" style={{ color: "var(--text-tertiary)" }}>
                Sem dados
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
