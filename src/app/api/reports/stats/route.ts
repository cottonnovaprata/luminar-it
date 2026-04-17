import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  try {
    const now = new Date()
    const monthStart = getMonthStart(now)

    const [
      totalAssets,
      assetsInMaintenance,
      newAssetsThisMonth,
      pendingActions,
      monthlyCostAggregate,
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({
        where: {
          status: "MANUTENCAO",
        },
      }),
      prisma.asset.count({
        where: {
          createdAt: {
            gte: monthStart,
          },
        },
      }),
      prisma.maintenance.count({
        where: {
          status: {
            in: ["PENDENTE", "EM_PROGRESSO"],
          },
        },
      }),
      prisma.maintenance.aggregate({
        _sum: {
          cost: true,
        },
        where: {
          startDate: {
            gte: monthStart,
          },
          cost: {
            not: null,
          },
        },
      }),
    ])

    const availability =
      totalAssets === 0
        ? 100
        : ((totalAssets - assetsInMaintenance) / totalAssets) * 100

    return NextResponse.json({
      monthlyCost: monthlyCostAggregate._sum.cost ?? 0,
      availability,
      newAssetsThisMonth,
      pendingActions,
      totalAssets,
      assetsInMaintenance,
      periodStart: monthStart.toISOString(),
    })
  } catch (error) {
    console.error("Reports Stats Error:", error)
    return NextResponse.json(
      { error: "Erro ao carregar indicadores de relatorios" },
      { status: 500 }
    )
  }
}
