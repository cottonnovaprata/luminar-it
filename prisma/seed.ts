import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10)

  // Criar Usuário Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@luminar.it" },
    update: {},
    create: {
      email: "admin@luminar.it",
      name: "Admin Master",
      password: adminPassword,
      role: "ADMIN",
    },
  })

  // Criar Setores Iniciais
  const sectors = ["Tecnologia", "Financeiro", "RH", "Diretoria", "Estoque"]
  for (const sectorName of sectors) {
    await prisma.sector.upsert({
      where: { name: sectorName },
      update: {},
      create: { name: sectorName },
    })
  }

  // Colaboradores Adicionais
  const employees = [
    { name: "João Silva", email: "joao@luminar.it", role: "USER" },
    { name: "Maria Oliveira", email: "maria@luminar.it", role: "USER" },
    { name: "Carlos Souza", email: "carlos@luminar.it", role: "USER" },
  ]

  for (const emp of employees) {
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        name: emp.name,
        email: emp.email,
        password: adminPassword,
        role: emp.role as any,
      },
    })
  }

  console.log("Seed concluído com sucesso!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
