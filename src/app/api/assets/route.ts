import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const assets = await prisma.asset.findMany({
      include: {
        sector: true,
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(assets)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar ativos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { 
      tag, name, type, brand, model, serialNumber, 
      patrimony, ipAddress, hostname, operatingSystem, 
      status, criticality, notes, sectorId 
    } = body

    const asset = await prisma.asset.create({
      data: {
        tag,
        name,
        type,
        brand,
        model,
        serialNumber,
        patrimony,
        ipAddress,
        hostname,
        operatingSystem,
        status,
        criticality,
        notes,
        sectorId
      }
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error: any) {
    console.error("Create Asset Error:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Patrimônio ou Tag já cadastrada" }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro ao criar ativo" }, { status: 500 })
  }
}
