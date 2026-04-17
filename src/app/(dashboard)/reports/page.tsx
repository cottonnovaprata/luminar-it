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
  Filter
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const reportTemplates = [
  { id: "1", title: "Inventário Geral de Ativos", desc: "Listagem completa com valores e status.", type: "PDF / XLSX" },
  { id: "2", title: "Depreciação de Equipamentos", desc: "Cálculo de valor contábil x tempo de uso.", type: "XLSX" },
  { id: "3", title: "Relatório de Licenciamento", desc: "Conformidade de softwares instalados.", type: "PDF" },
  { id: "4", title: "Histórico de Manutenções", desc: "Custos e tempo de reparo no período.", type: "PDF / XLSX" },
  { id: "5", title: "Log de Acesso ao Cofre", desc: "Auditoria completa de visualização de senhas.", type: "PDF" },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios e BI</h1>
          <p className="text-muted-foreground">Analise dados da sua infraestrutura e gere documentos de auditoria.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Período
           </Button>
           <Button className="bg-primary">
            <Download className="mr-2 h-4 w-4" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         <Card className="hover:bg-muted/50 transition-all cursor-pointer border-dashed">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
               <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <BarChart3 className="h-6 w-6" />
               </div>
               <p className="font-semibold text-sm">Custo Mensal</p>
               <p className="text-xl font-bold">$12.4k</p>
            </CardContent>
         </Card>
         <Card className="hover:bg-muted/50 transition-all cursor-pointer border-dashed">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
               <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500">
                  <PieChart className="h-6 w-6" />
               </div>
               <p className="font-semibold text-sm">Disponibilidade</p>
               <p className="text-xl font-bold">99.8%</p>
            </CardContent>
         </Card>
         <Card className="hover:bg-muted/50 transition-all cursor-pointer border-dashed">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
               <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                  <Activity className="h-6 w-6" />
               </div>
               <p className="font-semibold text-sm">Novos Ativos</p>
               <p className="text-xl font-bold">+24</p>
            </CardContent>
         </Card>
         <Card className="hover:bg-muted/50 transition-all cursor-pointer border-dashed">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-2">
               <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
                  <FileText className="h-6 w-6" />
               </div>
               <p className="font-semibold text-sm">Ações Pendentes</p>
               <p className="text-xl font-bold">12</p>
            </CardContent>
         </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
               <div>
                  <CardTitle>Modelos de Relatórios</CardTitle>
                  <CardDescription>Formatos prontos para exportação rápida.</CardDescription>
               </div>
               <Button variant="ghost" size="icon"><Filter className="h-4 w-4" /></Button>
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
                           <Badge variant="secondary" className="text-[10px] sm:flex hidden">{tpl.type}</Badge>
                           <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowUpRight className="h-4 w-4" /></Button>
                        </div>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
               <CardTitle className="text-primary">Programar Envio</CardTitle>
               <CardDescription className="text-primary/70">Receba relatórios automáticos no seu e-mail.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <p className="text-xs font-semibold text-primary/80">Frequência</p>
                  <Button variant="outline" className="w-full justify-between bg-white/50 border-primary/20 text-primary">
                     Semanal (Segunda-feira)
                     <ArrowUpRight className="h-4 w-4 opacity-30" />
                  </Button>
               </div>
               <div className="space-y-2">
                  <p className="text-xs font-semibold text-primary/80">Destinatário</p>
                  <Button variant="outline" className="w-full justify-between bg-white/50 border-primary/20 text-primary text-sm font-normal">
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
