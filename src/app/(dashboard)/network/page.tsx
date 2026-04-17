"use client"

import React from "react"
import { 
  Network, 
  Activity, 
  Settings2, 
  Globe, 
  Server, 
  Info,
  MoreHorizontal,
  Search,
  Zap,
  ShieldCheck
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const networks = [
  { id: "1", name: "VLAN 10 - Gerenciamento", gateway: "10.0.10.1", vlan: "10", usage: "45%", status: "Online" },
  { id: "2", name: "VLAN 20 - Produção", gateway: "10.0.20.1", vlan: "20", usage: "82%", status: "Online" },
  { id: "3", name: "VLAN 30 - Wi-Fi Interno", gateway: "10.0.30.1", vlan: "30", usage: "20%", status: "Online" },
  { id: "4", name: "VLAN 40 - Wi-Fi Visitantes", gateway: "192.168.10.1", vlan: "40", usage: "12%", status: "Degradado" },
  { id: "5", name: "DMZ - Servidores Web", gateway: "172.16.0.1", vlan: "50", usage: "60%", status: "Online" },
]

export default function NetworkPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rede e Infraestrutura</h1>
          <p className="text-muted-foreground">Monitoramento de conectividade, VLANs e endereçamento IP.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              Scan de IPs
           </Button>
           <Button className="bg-primary">
            <Plus className="mr-2 h-4 w-4" />
            Nova VLAN
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Gateway Core</p>
              <p className="text-2xl font-bold text-emerald-600">UP</p>
            </div>
            <Activity className="h-8 w-8 text-emerald-500 opacity-50" />
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">VPN Ativas</p>
              <p className="text-2xl font-bold text-blue-600">12</p>
            </div>
            <Globe className="h-8 w-8 text-blue-500 opacity-50" />
          </CardContent>
        </Card>
        <Card className="bg-indigo-500/5 border-indigo-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Dispositivos Rede</p>
              <p className="text-2xl font-bold text-indigo-600">45</p>
            </div>
            <Server className="h-8 w-8 text-indigo-500 opacity-50" />
          </CardContent>
        </Card>
        <Card className="bg-sky-500/5 border-sky-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Proteção IPS</p>
              <p className="text-2xl font-bold text-sky-600">Active</p>
            </div>
            <ShieldCheck className="h-8 w-8 text-sky-500 opacity-50" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Inventário de Redes</CardTitle>
              <CardDescription>Visualização detalhada das sub-redes corporativas.</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input placeholder="Filtrar VLANs..." className="pl-10 h-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="h-12 px-4 text-left font-medium text-muted-foreground">Nome da Rede</th>
                <th className="h-12 px-4 text-left font-medium text-muted-foreground">Gateway</th>
                <th className="h-12 px-4 text-left font-medium text-muted-foreground text-center">VLAN ID</th>
                <th className="h-12 px-4 text-left font-medium text-muted-foreground">Uso de IPs</th>
                <th className="h-12 px-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {networks.map((net) => (
                <tr key={net.id} className="border-b transition-colors hover:bg-muted/50 group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Network className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{net.name}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle font-mono text-xs">{net.gateway}</td>
                  <td className="p-4 text-center">
                    <Badge variant="secondary" className="font-bold">{net.vlan}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 w-32">
                       <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${parseInt(net.usage) > 80 ? 'bg-amber-500' : 'bg-primary'}`} 
                            style={{ width: net.usage }}
                          />
                       </div>
                       <span className="text-[10px] font-medium">{net.usage}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={net.status === "Online" ? "success" : "warning"}>
                      {net.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

function Plus({ className, ...props }: any) {
  return <Network className={className} {...props} />
}
