import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
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
