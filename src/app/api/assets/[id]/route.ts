import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        sector: {
          select: {
            id: true,
            name: true,
          }
        },
      }
    })

    if (!asset) {
      return NextResponse.json({ error: "Ativo não encontrado" }, { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error("Erro ao buscar ativo:", error)
    return NextResponse.json({ error: "Erro ao buscar ativo" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = await params

    const asset = await prisma.asset.update({
      where: { id },
      data: body
    })

    return NextResponse.json(asset)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar ativo" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.asset.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir ativo" }, { status: 500 })
  }
}
