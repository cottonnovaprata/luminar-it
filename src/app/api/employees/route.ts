import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: { assets: true }
        }
      },
      orderBy: { name: "asc" }
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar colaboradores" }, { status: 500 })
  }
}
