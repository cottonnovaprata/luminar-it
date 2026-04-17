import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

function ipToInt(ip: string) {
  const parts = ip.split(".").map((part) => Number(part))
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return null
  }

  return (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0
}

function isIpInCidr(ip: string, cidr: string) {
  const [networkIp, prefixBitsRaw] = cidr.split("/")
  const prefixBits = Number(prefixBitsRaw)
  const ipInt = ipToInt(ip)
  const networkInt = ipToInt(networkIp)

  if (ipInt === null || networkInt === null || Number.isNaN(prefixBits) || prefixBits < 0 || prefixBits > 32) {
    return false
  }

  if (prefixBits === 0) {
    return true
  }

  const mask = (0xffffffff << (32 - prefixBits)) >>> 0
  return (ipInt & mask) === (networkInt & mask)
}

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  try {
    const [segments, assets] = await Promise.all([
      prisma.networkSegment.findMany({
        orderBy: [{ vlan: "asc" }],
      }),
      prisma.asset.findMany({
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          ipAddress: true,
        },
      }),
    ])

    const assetsWithIp = assets.filter((asset) => typeof asset.ipAddress === "string" && asset.ipAddress.length > 0)

    const segmentsWithUsage = segments.map((segment) => {
      const segmentAssets = assetsWithIp.filter((asset) => isIpInCidr(asset.ipAddress as string, segment.cidr))
      const usedIps = segmentAssets.length
      const maintenanceDevices = segmentAssets.filter((asset) => asset.status === "MANUTENCAO").length
      const usagePercent = segment.totalIps > 0 ? Math.min(100, Math.round((usedIps / segment.totalIps) * 100)) : 0
      const status =
        maintenanceDevices > 0 || usagePercent >= 80
          ? "DEGRADED"
          : segment.status.toUpperCase()

      return {
        id: segment.id,
        name: segment.name,
        gateway: segment.gateway,
        vlan: segment.vlan,
        cidr: segment.cidr,
        totalIps: segment.totalIps,
        usedIps,
        usagePercent,
        status,
      }
    })

    const degradedSegments = segmentsWithUsage.filter((segment) => segment.status !== "ONLINE").length
    const vpnActive = assetsWithIp.filter(
      (asset) =>
        (asset.type === "Notebook" || asset.type === "Smartphone") &&
        asset.status === "EM_USO"
    ).length
    const maintenanceDevices = assetsWithIp.filter((asset) => asset.status === "MANUTENCAO").length

    return NextResponse.json({
      summary: {
        gatewayCoreStatus: segmentsWithUsage.length > 0 ? "UP" : "DOWN",
        vpnActive,
        networkDevices: assetsWithIp.length,
        ipsProtection: maintenanceDevices > 2 ? "ATENCAO" : "ACTIVE",
        totalSegments: segmentsWithUsage.length,
        degradedSegments,
      },
      segments: segmentsWithUsage,
    })
  } catch (error) {
    console.error("Network Overview Error:", error)
    return NextResponse.json({ error: "Erro ao carregar rede" }, { status: 500 })
  }
}
