"use client"

import React from "react"

interface AssetStatusChartProps {
  data: Array<{
    status: string
    _count: {
      _all: number
    }
  }>
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "DISPONIVEL":
      return "bg-cyan-500"
    case "EM_USO":
      return "bg-blue-500"
    case "MANUTENCAO":
    case "EM_MANUTENCAO":
      return "bg-amber-500"
    case "DESCARTADO":
      return "bg-slate-500"
    default:
      return "bg-slate-400"
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "DISPONIVEL":
      return "Disponivel"
    case "EM_USO":
      return "Em Uso"
    case "MANUTENCAO":
    case "EM_MANUTENCAO":
      return "Manutencao"
    case "DESCARTADO":
      return "Descartado"
    default:
      return status
  }
}

function AssetStatusChartBase({ data }: AssetStatusChartProps) {
  const total = React.useMemo(
    () => data.reduce((sum, item) => sum + item._count._all, 0) || 1,
    [data]
  )

  return (
    <div className="space-y-5">
      {data.map((item) => {
        const percentage = (item._count._all / total) * 100

        return (
          <div key={item.status} className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                {getStatusLabel(item.status)}
              </span>
              <span
                className="rounded-md px-3 py-1.5 text-xs font-bold"
                style={{
                  color: "var(--status-info)",
                  background: "var(--status-info-bg)",
                }}
              >
                {item._count._all}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--border-primary)]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getStatusColor(item.status)} shadow-sm`}
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const AssetStatusChart = React.memo(AssetStatusChartBase)
AssetStatusChart.displayName = "AssetStatusChart"
