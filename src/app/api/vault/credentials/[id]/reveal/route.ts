import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { decryptVaultSecret } from "@/lib/vault-crypto"

type RevealMode = "VIEW" | "COPY"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const payload = (await request.json().catch(() => ({}))) as { mode?: string }
    const mode: RevealMode = payload.mode === "COPY" ? "COPY" : "VIEW"

    const credential = await prisma.vaultCredential.findUnique({
      where: { id },
      select: {
        id: true,
        passwordEncrypted: true,
      },
    })

    if (!credential) {
      return NextResponse.json({ error: "Credencial nao encontrada" }, { status: 404 })
    }

    const decryptedPassword = decryptVaultSecret(credential.passwordEncrypted)
    const userId = typeof session.userId === "string" ? session.userId : null

    await prisma.$transaction([
      prisma.vaultCredential.update({
        where: { id: credential.id },
        data: {
          lastUsedAt: new Date(),
        },
      }),
      prisma.vaultAccessLog.create({
        data: {
          credentialId: credential.id,
          userId,
          action: mode,
        },
      }),
    ])

    return NextResponse.json({ password: decryptedPassword })
  } catch (error) {
    console.error("Vault Reveal Error:", error)
    return NextResponse.json({ error: "Erro ao revelar senha" }, { status: 500 })
  }
}
