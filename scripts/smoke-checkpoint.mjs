import { spawn, spawnSync } from "node:child_process"
import path from "node:path"

const BASE_URL = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000"
const SMOKE_EMAIL = process.env.SMOKE_EMAIL ?? "admin@luminar.it"
const SMOKE_PASSWORD = process.env.SMOKE_PASSWORD ?? "admin123"
const START_TIMEOUT_MS = Number(process.env.SMOKE_START_TIMEOUT_MS ?? 45000)
const REQUEST_TIMEOUT_MS = Number(process.env.SMOKE_REQUEST_TIMEOUT_MS ?? 10000)
const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next")

let startedServer = false
let serverProcess = null

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function runCommandOrFail(args) {
  const result = spawnSync(process.execPath, [nextBin, ...args], { stdio: "inherit" })
  if (result.status !== 0) {
    throw new Error(`Comando falhou: next ${args.join(" ")}`)
  }
}

async function fetchWithTimeout(url, init = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

async function isServerAvailable() {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/login`, { method: "GET" }, 3000)
    return response.ok
  } catch {
    return false
  }
}

async function ensureServer() {
  if (await isServerAvailable()) {
    console.log(`[smoke] Usando servidor existente em ${BASE_URL}`)
    return
  }

  console.log(`[smoke] Nenhum servidor detectado em ${BASE_URL}. Iniciando next start local...`)

  serverProcess = spawn(
    process.execPath,
    [nextBin, "start", "--hostname", "127.0.0.1", "--port", "3000"],
    {
      stdio: "pipe",
      env: process.env,
    }
  )
  startedServer = true

  serverProcess.stdout?.on("data", (chunk) => {
    process.stdout.write(`[server] ${chunk}`)
  })
  serverProcess.stderr?.on("data", (chunk) => {
    process.stderr.write(`[server] ${chunk}`)
  })

  const deadline = Date.now() + START_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Servidor encerrou antes do smoke test (exit ${serverProcess.exitCode}).`)
    }
    if (await isServerAvailable()) {
      console.log("[smoke] Servidor local pronto.")
      return
    }
    await sleep(1000)
  }

  throw new Error("Timeout aguardando servidor local subir.")
}

function ensureStatus(response, expectedStatus, pathLabel) {
  if (response.status !== expectedStatus) {
    throw new Error(`${pathLabel} retornou ${response.status} (esperado ${expectedStatus}).`)
  }
}

function extractCookie(headerValue) {
  if (!headerValue) return null
  const [cookie] = headerValue.split(";")
  return cookie?.trim() || null
}

async function runSmoke() {
  console.log("[smoke] 1/5 Build de producao")
  runCommandOrFail(["build"])

  console.log("[smoke] 2/5 Garantindo servidor na porta 3000")
  await ensureServer()

  console.log("[smoke] 3/5 Verificando /login")
  const loginPage = await fetchWithTimeout(`${BASE_URL}/login`)
  ensureStatus(loginPage, 200, "/login")
  const loginHtml = await loginPage.text()
  if (!/Entrar|Login|email|senha/i.test(loginHtml)) {
    throw new Error("/login respondeu 200, mas sem marcadores esperados de tela de login.")
  }

  console.log("[smoke] 4/5 Login via /api/auth/login")
  const loginResponse = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: SMOKE_EMAIL, password: SMOKE_PASSWORD }),
  })
  ensureStatus(loginResponse, 200, "/api/auth/login")

  const loginJson = await loginResponse.json().catch(() => null)
  if (!loginJson?.success) {
    throw new Error("Login API nao retornou success=true.")
  }

  const cookie = extractCookie(loginResponse.headers.get("set-cookie"))
  if (!cookie) {
    throw new Error("Cookie de sessao nao encontrado apos login.")
  }

  console.log("[smoke] 5/5 Verificando /dashboard e /reports logado")
  const authHeaders = { cookie }

  const dashboardResponse = await fetchWithTimeout(`${BASE_URL}/dashboard`, { headers: authHeaders })
  ensureStatus(dashboardResponse, 200, "/dashboard")
  const dashboardHtml = await dashboardResponse.text()
  if (!/Dashboard|Ativos|NovaPrata/i.test(dashboardHtml)) {
    throw new Error("/dashboard respondeu 200, mas sem conteudo esperado.")
  }

  const reportsResponse = await fetchWithTimeout(`${BASE_URL}/reports`, { headers: authHeaders })
  ensureStatus(reportsResponse, 200, "/reports")
  const reportsHtml = await reportsResponse.text()
  if (!/Relatorios|Reports|BI/i.test(reportsHtml)) {
    throw new Error("/reports respondeu 200, mas sem conteudo esperado.")
  }

  console.log("[smoke] OK: build + login + dashboard + reports validados.")
}

function stopLocalServerIfNeeded() {
  if (!startedServer || !serverProcess || serverProcess.exitCode !== null) {
    return
  }

  console.log("[smoke] Encerrando servidor iniciado pelo smoke test...")
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(serverProcess.pid), "/t", "/f"], { stdio: "ignore" })
  } else {
    serverProcess.kill("SIGTERM")
  }
}

async function main() {
  try {
    await runSmoke()
  } finally {
    stopLocalServerIfNeeded()
  }
}

main().catch((error) => {
  console.error(`[smoke] FALHA: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
