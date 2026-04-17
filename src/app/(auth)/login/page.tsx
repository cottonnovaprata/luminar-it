"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Monitor, ShieldCheck, Zap, Loader2 } from "lucide-react"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/dashboard"

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    email: "",
    password: ""
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" }
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Ocorreu um erro no login")
      }

      // Login bem sucedido - redirecionar para URL original se tiver, senão para dashboard
      router.push(redirectUrl)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Lado Esquerdo - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-950 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xl font-bold tracking-tight">
          <div className="bg-primary p-2 rounded-lg">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          NovaPrata Labs
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Construa o futuro da sua infraestrutura.
          </h1>
          <p className="text-zinc-400 text-lg mb-8">
            Governança, segurança e controle total sobre seus ativos em uma única plataforma premium.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Cofre de senhas com auditoria real-time</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Automação de processos de TI</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-zinc-500">
          © {new Date().getFullYear()} NovaPrata Labs. Managed Infrastructure.
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex flex-col justify-center p-8 md:p-12 lg:p-24 bg-background">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h2>
            <p className="text-muted-foreground text-sm">
              Insira suas credenciais para acessar o painel administrativo.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                E-mail corporativo
              </label>
              <Input
                id="email"
                placeholder="nome@empresa.com.br"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11 bg-muted/30 border-muted focus:bg-background"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="password">
                  Senha
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11 bg-muted/30 border-muted focus:bg-background"
                disabled={loading}
              />
            </div>
            <Button 
              className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" 
              type="submit"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar no Sistema"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-11 bg-muted/20 border-muted" type="button" disabled={loading}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="microsoft" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path fill="currentColor" d="M0 32h214.6v214.6H0V32zm233.4 0H448v214.6H233.4V32zM0 265.4h214.6V480H0V265.4zm233.4 0H448V480H233.4V265.4z"></path>
            </svg>
            Microsoft Azure SSO
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-4">
            Precisa de ajuda?{" "}
            <Link href="mailto:suporte@novapratalabs.com" className="underline hover:text-primary">
              Entre em contato com o suporte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginContent />
    </React.Suspense>
  )
}
