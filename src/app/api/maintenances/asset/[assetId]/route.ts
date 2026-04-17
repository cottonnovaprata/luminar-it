import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 })
  }

  try {
    const { assetId } = await params

    const history = await prisma.maintenance.findMany({
      where: { assetId },
      orderBy: {
        startDate: "desc",
      },
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error("Error fetching asset maintenance history:", error)
    return NextResponse.json({ error: "Failed to fetch maintenance history" }, { status: 500 })
  }
}
