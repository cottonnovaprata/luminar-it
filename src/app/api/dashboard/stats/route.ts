import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const [totalAssets, totalUsers, maintenanceCount, pendingActions, assetsByStatus] = await Promise.all([
      prisma.asset.count(),
      prisma.user.count(),
      prisma.asset.count({ where: { status: "MANUTENCAO" } }),
      prisma.maintenance.count({
        where: {
          status: {
            in: ["PENDENTE", "EM_PROGRESSO"],
          },
        },
      }),
      prisma.asset.groupBy({
        by: ["status"],
        _count: { _all: true }
      })
    ])

    const recentAssets = await prisma.asset.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { sector: true }
    })

    return NextResponse.json({
      totalAssets,
      totalUsers,
      maintenanceCount,
      alertsCount: pendingActions,
      assetsByStatus,
      recentAssets
    })
  } catch (error) {
    console.error("Dashboard Stats Error:", error)
    return NextResponse.json({ error: "Erro ao carregar estatísticas" }, { status: 500 })
  }
}
