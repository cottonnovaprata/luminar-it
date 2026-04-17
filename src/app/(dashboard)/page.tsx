import { 
  Box, 
  Users, 
  Wrench, 
  Key, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight,
  MoreHorizontal,
  Calendar
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import prisma from "@/lib/prisma"

export default async function DashboardPage() {
  const [assetCount, maintenanceCount, userCount, recentAssets] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: { status: "MANUTENCAO" } }),
    prisma.user.count(),
    prisma.asset.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } }
      }
    })
  ])

  const stats = [
    {
      title: "Total de Ativos",
      value: assetCount.toLocaleString(),
      description: "Equipamentos cadastrados",
      icon: Box,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Em Manutenção",
      value: maintenanceCount.toLocaleString(),
      description: "Ativos com chamados ativos",
      icon: Wrench,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Colaboradores",
      value: userCount.toLocaleString(),
      description: "Usuários no sistema",
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Credenciais",
      value: "412",
      description: "Protegidas no cofre",
      icon: Key,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
  ]
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo ao centro de controle da infraestrutura Luminar IT.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Calendar className="mr-2 h-4 w-4" />
            Últimos 30 dias
          </Button>
          <Button size="sm" className="bg-primary shadow-lg shadow-primary/20">
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Gráfico Placeholder */}
        <Card className="md:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Saúde da Infraestrutura</CardTitle>
                <CardDescription>Uso e disponibilidade nos últimos 6 meses.</CardDescription>
              </div>
              <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +12%
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] flex items-end justify-between gap-2 pt-10 px-6">
             {/* Simple mock bars */}
             {[40, 60, 45, 90, 75, 85, 65, 95, 80, 70, 85, 100].map((height, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className="w-full bg-primary/10 rounded-t-sm group-hover:bg-primary/30 transition-all duration-300 relative" 
                    style={{ height: `${height}%` }}
                  >
                    {height > 80 && <div className="absolute top-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase">{["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"][i % 6]}</span>
               </div>
             ))}
          </CardContent>
        </Card>

        {/* Alertas Críticos */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Ações Prioritárias</CardTitle>
            <CardDescription>Itens que requerem sua atenção imediata.</CardDescription>
          </Header>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <div className="mt-1 bg-red-500/10 p-1.5 rounded-full">
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">Garantia Expirando</p>
                <p className="text-xs text-muted-foreground">3 Servidores Dell PowerEdge expiram em 5 dias.</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7"><ArrowUpRight className="w-3.5 h-3.5" /></Button>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <div className="mt-1 bg-amber-500/10 p-1.5 rounded-full">
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Licenças Pendentes</p>
                <p className="text-xs text-muted-foreground">15 Colaboradores sem licença de Adobe Creative Cloud.</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7"><ArrowUpRight className="w-3.5 h-3.5" /></Button>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full text-xs h-9">Ver todos os alertas</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Recente */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-5">
          <div>
            <CardTitle>Últimas Movimentações</CardTitle>
            <CardDescription>Ativos processados recentemente no sistema.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">Ver Tudo</Button>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Ativo</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Tipo</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Responsável</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Data</th>
                  <th className="h-10 px-2 align-middle font-medium text-muted-foreground text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {recentAssets.map((asset: any) => (
                  <tr key={asset.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-2 align-middle font-semibold">{asset.name}</td>
                    <td className="p-2 align-middle text-muted-foreground">{asset.type}</td>
                    <td className="p-2 align-middle">{asset.user?.name || "Sem Responsável"}</td>
                    <td className="p-2 align-middle">
                      <Badge variant={asset.status === "EM_USO" ? "success" : asset.status === "DISPONIVEL" ? "secondary" : "warning"}>
                        {asset.status}
                      </Badge>
                    </td>
                    <td className="p-2 align-middle text-xs text-muted-foreground">
                      {new Date(asset.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-2 align-middle text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
