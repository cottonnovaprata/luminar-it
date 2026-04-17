import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { Prisma, Role } from "@prisma/client"
import { signJWT } from "@/lib/auth"
import prisma from "@/lib/prisma"

function getDatabaseErrorMessage(error: unknown): string | null {
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return "Banco de dados indisponivel. Tente novamente em instantes."
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (["P1001", "P1002", "P1017"].includes(error.code)) {
      return "Nao foi possivel conectar ao banco de dados."
    }

    if (["P2021", "P2022"].includes(error.code)) {
      return "Banco nao inicializado. Execute prisma db push e prisma db seed."
    }
  }

  return null
}

export async function POST(request: Request) {
  try {
    let body: { email?: unknown; password?: unknown }

    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Payload invalido" }, { status: 400 })
    }

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha sao obrigatorios" },
        { status: 400 }
      )
    }

    let user: {
      id: string
      email: string
      role: Role
      name: string
      password: string | null
    } | null = null

    try {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          password: true,
        },
      })
    } catch (error) {
      const dbMessage = getDatabaseErrorMessage(error)

      if (dbMessage) {
        return NextResponse.json({ error: dbMessage }, { status: 503 })
      }

      throw error
    }

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Credenciais invalidas" },
        { status: 401 }
      )
    }

    let passwordMatch = false

    try {
      passwordMatch = await bcrypt.compare(password, user.password)
    } catch {
      passwordMatch = false
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Credenciais invalidas" },
        { status: 401 }
      )
    }

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    const response = NextResponse.json(
      { success: true, user: { name: user.name, role: user.role } },
      { status: 200 }
    )

    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login Error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}