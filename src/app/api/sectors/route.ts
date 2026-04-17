import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const sectors = await prisma.sector.findMany({
      orderBy: { name: "asc" }
    })
    return NextResponse.json(sectors)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar setores" }, { status: 500 })
  }
}
