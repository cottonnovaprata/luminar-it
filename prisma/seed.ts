import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import { encryptVaultSecret } from "../src/lib/vault-crypto"

const prisma = new PrismaClient()

async function seedUsers() {
  const adminPassword = await bcrypt.hash("admin123", 10)

  await prisma.user.upsert({
    where: { email: "admin@luminar.it" },
    update: {},
    create: {
      email: "admin@luminar.it",
      name: "Admin Master",
      password: adminPassword,
      role: Role.ADMIN,
    },
  })

  const employees: Array<{ name: string; email: string; role: Role }> = [
    { name: "Joao Silva", email: "joao@luminar.it", role: Role.USER },
    { name: "Maria Oliveira", email: "maria@luminar.it", role: Role.USER },
    { name: "Carlos Souza", email: "carlos@luminar.it", role: Role.USER },
  ]

  for (const employee of employees) {
    await prisma.user.upsert({
      where: { email: employee.email },
      update: {},
      create: {
        name: employee.name,
        email: employee.email,
        password: adminPassword,
        role: employee.role,
      },
    })
  }
}

async function seedSectors() {
  const sectors = ["Tecnologia", "Financeiro", "RH", "Diretoria", "Estoque"]
  for (const sectorName of sectors) {
    await prisma.sector.upsert({
      where: { name: sectorName },
      update: {},
      create: { name: sectorName },
    })
  }
}

async function seedNetworkSegments() {
  const segments = [
    { name: "VLAN 10 - Gerenciamento", vlan: "10", gateway: "10.0.10.1", cidr: "10.0.10.0/24", totalIps: 254, status: "ONLINE" },
    { name: "VLAN 20 - Producao", vlan: "20", gateway: "10.0.20.1", cidr: "10.0.20.0/24", totalIps: 254, status: "ONLINE" },
    { name: "VLAN 30 - WiFi Interno", vlan: "30", gateway: "10.0.30.1", cidr: "10.0.30.0/24", totalIps: 254, status: "ONLINE" },
    { name: "VLAN 40 - WiFi Visitantes", vlan: "40", gateway: "192.168.10.1", cidr: "192.168.10.0/24", totalIps: 254, status: "DEGRADED" },
    { name: "VLAN 50 - DMZ", vlan: "50", gateway: "172.16.0.1", cidr: "172.16.0.0/24", totalIps: 254, status: "ONLINE" },
  ]

  for (const segment of segments) {
    await prisma.networkSegment.upsert({
      where: { vlan: segment.vlan },
      update: {
        name: segment.name,
        gateway: segment.gateway,
        cidr: segment.cidr,
        totalIps: segment.totalIps,
        status: segment.status,
      },
      create: segment,
    })
  }
}

async function seedVault() {
  const firstAsset = await prisma.asset.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, tag: true },
  })

  const entries = [
    {
      title: "Admin Server DB",
      username: "root",
      password: "P@ssw0rd123!",
      type: "SERVER",
      daysSinceRotation: 15,
    },
    {
      title: "WiFi Visitantes",
      username: "guest_user",
      password: "Guest@2026!",
      type: "WIFI",
      daysSinceRotation: 110,
    },
    {
      title: "Painel AWS TI",
      username: "admin_cloud",
      password: "Cloud@Secure99",
      type: "CLOUD",
      daysSinceRotation: 45,
    },
    {
      title: "SSH Firewall",
      username: "forti_admin",
      password: "Forti#Access88",
      type: "NETWORK",
      daysSinceRotation: 130,
    },
  ]

  for (const item of entries) {
    const lastRotatedAt = new Date(Date.now() - item.daysSinceRotation * 24 * 60 * 60 * 1000)

    await prisma.vaultCredential.upsert({
      where: {
        title_username: {
          title: item.title,
          username: item.username,
        },
      },
      update: {
        type: item.type,
        passwordEncrypted: encryptVaultSecret(item.password),
        lastRotatedAt,
        assetId: firstAsset?.id ?? null,
      },
      create: {
        title: item.title,
        username: item.username,
        type: item.type,
        passwordEncrypted: encryptVaultSecret(item.password),
        lastRotatedAt,
        assetId: firstAsset?.id ?? null,
      },
    })
  }
}

async function main() {
  await seedUsers()
  await seedSectors()
  await seedNetworkSegments()
  await seedVault()
  console.log("Seed concluido com sucesso.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
