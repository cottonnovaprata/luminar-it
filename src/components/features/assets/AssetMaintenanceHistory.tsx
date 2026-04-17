"use client"

import * as React from "react"
import { CheckCircle2, Clock, AlertCircle, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AssetMaintenanceHistoryProps {
  assetId: string
}

export function AssetMaintenanceHistory({ assetId }: AssetMaintenanceHistoryProps) {
  const [history, setHistory] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/maintenances/asset/${assetId}`)
        const data = await res.json()
        if (Array.isArray(data)) setHistory(data)
      } catch (error) {
        console.error("Error fetching history:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [assetId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Nenhum histórico de manutenção encontrado para este ativo.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((mnt) => (
        <div key={mnt.id} className="relative pl-8 pb-4 last:pb-0 border-l border-muted ml-3">
          <div className={`absolute -left-3 top-0 p-1.5 rounded-full border-2 border-background shadow-sm ${
            mnt.status === 'CONCLUIDO' ? 'bg-emerald-500 text-white' : 
            mnt.status === 'CANCELADO' ? 'bg-muted text-muted-foreground' : 
            'bg-amber-500 text-white'
          }`}>
            {mnt.status === 'CONCLUIDO' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">{mnt.problem}</p>
              <Badge variant="outline" className="text-[10px] h-4">
                {mnt.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{mnt.description || "Sem descrição adicional."}</p>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
               <span>Técnico: {mnt.technician}</span>
               <span>Início: {new Date(mnt.startDate).toLocaleDateString()}</span>
               {mnt.endDate && <span>Fim: {new Date(mnt.endDate).toLocaleDateString()}</span>}
               {mnt.cost > 0 && <span className="text-emerald-600 font-bold">Custo: R$ {mnt.cost.toFixed(2)}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
