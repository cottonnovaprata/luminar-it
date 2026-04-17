import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuracoes</h1>
        <p className="text-sm text-muted-foreground">
          Ajustes gerais da plataforma e preferencias de uso.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Painel de configuracoes</CardTitle>
          <CardDescription>
            Esta pagina foi criada para evitar link quebrado no menu lateral.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Os controles detalhados de configuracao podem ser adicionados aqui conforme a evolucao do produto.
        </CardContent>
      </Card>
    </div>
  )
}
