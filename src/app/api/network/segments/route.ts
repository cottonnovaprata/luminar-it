import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

function normalizeCidr(cidr: string) {
  return cidr.trim()
}

function isValidIpv4(ip: string) {
  const parts = ip.split(".")
  if (parts.length !== 4) return false

  return parts.every((part) => {
    const n = Number(part)
    return !Number.isNaN(n) && n >= 0 && n <= 255
  })
}

function isValidCidr(cidr: string) {
  const [ip, bitsRaw] = cidr.split("/")
  const bits = Number(bitsRaw)
  return isValidIpv4(ip) && Number.isInteger(bits) && bits >= 8 && bits <= 30
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as {
      name?: string
      gateway?: string
      vlan?: string
      cidr?: string
      totalIps?: number
      status?: string
      notes?: string
    }

    const name = typeof body.name === "string" ? body.name.trim() : ""
    const gateway = typeof body.gateway === "string" ? body.gateway.trim() : ""
    const vlan = typeof body.vlan === "string" ? body.vlan.trim() : ""
    const cidr = typeof body.cidr === "string" ? normalizeCidr(body.cidr) : ""
    const totalIps = Number.isInteger(body.totalIps) && (body.totalIps as number) > 0 ? (body.totalIps as number) : 254
    const status = typeof body.status === "string" && body.status.trim() ? body.status.trim().toUpperCase() : "ONLINE"
    const notes = typeof body.notes === "string" && body.notes.trim().length > 0 ? body.notes.trim() : null

    if (!name || !gateway || !vlan || !cidr) {
      return NextResponse.json({ error: "Campos obrigatorios: name, gateway, vlan, cidr" }, { status: 400 })
    }

    if (!isValidIpv4(gateway)) {
      return NextResponse.json({ error: "Gateway invalido" }, { status: 400 })
    }

    if (!isValidCidr(cidr)) {
      return NextResponse.json({ error: "CIDR invalido. Exemplo: 10.0.10.0/24" }, { status: 400 })
    }

    const created = await prisma.networkSegment.create({
      data: {
        name,
        gateway,
        vlan,
        cidr,
        totalIps,
        status,
        notes,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error: unknown) {
    console.error("Create Network Segment Error:", error)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "VLAN ou CIDR ja cadastrado" }, { status: 409 })
    }
    return NextResponse.json({ error: "Erro ao criar segmento de rede" }, { status: 500 })
  }
}
