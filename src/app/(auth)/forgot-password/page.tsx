import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar senha</CardTitle>
          <CardDescription>
            Este fluxo ainda nao esta configurado neste ambiente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Para recuperar o acesso, entre em contato com o suporte de TI e solicite
            a redefinicao da senha.
          </p>
          <p>Usuario padrao para testes: admin@luminar.it</p>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/login">Voltar ao login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <a href="mailto:suporte@luminar.it">Falar com suporte</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}