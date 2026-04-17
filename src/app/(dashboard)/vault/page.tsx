"use client"

import React from "react"
import { 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  Copy, 
  Search, 
  Key, 
  MoreVertical,
  AlertTriangle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const credentials = [
  { id: "1", title: "Admin Server DB", username: "root", lastUsed: "Há 2 horas", asset: "SRV-PROD-01", type: "Server" },
  { id: "2", title: "Wi-Fi Visitantes", username: "guest_user", lastUsed: "Ontem, 14:00", asset: "AP-RECEP-01", type: "WiFi" },
  { id: "3", title: "Painel AWS TI", username: "admin_cloud", lastUsed: "14 Abr, 10:00", asset: "Cloud", type: "Cloud" },
  { id: "4", title: "SSH Firewall", username: "forti_admin", lastUsed: "12 Apr, 09:15", asset: "FW-CORE-01", type: "Network" },
]

export default function VaultPage() {
  const [revealed, setRevealed] = React.useState<string[]>([])

  const toggleReveal = (id: string) => {
    if (revealed.includes(id)) {
      setRevealed(revealed.filter(i => i !== id))
    } else {
      setRevealed([...revealed, id])
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cofre de Credenciais</h1>
          <p className="text-muted-foreground">Armazenamento seguro de senhas e chaves de acesso com auditoria.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="h-10 px-3 border-amber-500/50 text-amber-500 bg-amber-500/5">
              <AlertTriangle className="mr-2 h-4 w-4" />
              12 senhas não alteradas há +3 meses
           </Badge>
           <Button className="bg-primary">
            <Lock className="mr-2 h-4 w-4" />
            Nova Credencial
          </Button>
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center gap-4">
           <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-6 w-6 text-primary" />
           </div>
           <div>
              <p className="font-semibold text-primary">Segurança Ativa</p>
              <p className="text-sm text-primary/80">Todas as visualizações são registradas no log de auditoria imutável.</p>
           </div>
        </CardContent>
      </Card>

      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar credencial por nome, usuário ou ativo..." className="pl-10 h-11" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {credentials.map((cred) => (
          <Card key={cred.id} className="overflow-hidden group hover:border-primary/50 transition-all">
            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{cred.title}</CardTitle>
                  <CardDescription className="text-xs">{cred.asset}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                 <p className="text-[10px] uppercase font-bold text-muted-foreground">Usuário</p>
                 <div className="flex items-center justify-between bg-muted/30 p-2 rounded border border-transparent hover:border-muted font-mono text-sm">
                    <span>{cred.username}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6"><Copy className="h-3 w-3" /></Button>
                 </div>
              </div>
              <div className="space-y-1.5">
                 <p className="text-[10px] uppercase font-bold text-muted-foreground">Senha</p>
                 <div className="flex items-center justify-between bg-zinc-950 text-zinc-100 p-2 rounded font-mono text-sm">
                    <span>{revealed.includes(cred.id) ? "P@ssw0rd123!" : "••••••••••••••"}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 hover:bg-zinc-800"
                      onClick={() => toggleReveal(cred.id)}
                    >
                      {revealed.includes(cred.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                 </div>
              </div>
            </CardContent>
            <div className="px-6 py-3 bg-muted/30 border-t flex items-center justify-between">
               <span className="text-[10px] text-muted-foreground">Último uso: {cred.lastUsed}</span>
               <Badge variant="secondary" className="text-[10px] uppercase">{cred.type}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
