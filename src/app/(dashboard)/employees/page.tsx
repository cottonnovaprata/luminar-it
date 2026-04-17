"use client"

import React from "react"
import { 
  Search, 
  Mail, 
  MoreHorizontal, 
  UserPlus,
  LayoutGrid,
  List,
  Loader2,
  RefreshCcw
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")

  const fetchEmployees = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/employees")
      const data = await res.json()
      if (Array.isArray(data)) setEmployees(data)
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const filtered = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colaboradores</h1>
          <p className="text-muted-foreground">Gerencie o inventário de ativos por pessoa e departamento.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEmployees} disabled={loading}>
            <RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Sincronizar
          </Button>
          <Button className="bg-primary shadow-lg shadow-primary/20">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Colaborador
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome ou e-mail..." 
            className="pl-10 h-11" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center border rounded-lg p-1 bg-muted/50">
          <Button variant="ghost" size="icon" className="h-9 w-9 bg-background shadow-sm"><List className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><LayoutGrid className="h-4 w-4" /></Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground">Colaborador</th>
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground">Cargo / Role</th>
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground text-center">Ativos</th>
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-right font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Nenhum colaborador encontrado.
                    </td>
                  </tr>
                ) : filtered.map((person) => (
                  <tr key={person.id} className="border-b transition-colors hover:bg-muted/50 group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {person.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold leading-none">{person.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {person.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="secondary" className="font-normal">{person.role}</Badge>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 font-bold">
                        {person._count?.assets || 0}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="success">Ativo</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
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

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}
