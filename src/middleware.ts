import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret")

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value

  // Se estiver acessando login e tiver token, manda pro dashboard
  if (request.nextUrl.pathname === "/login") {
    if (token) {
      try {
        await jwtVerify(token, secret)
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } catch (err) {
        // Token inválido, segue pro login
      }
    }
  }

  // Rotas privadas
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/assets") ||
    request.nextUrl.pathname.startsWith("/employees") ||
    request.nextUrl.pathname.startsWith("/vault") ||
    request.nextUrl.pathname.startsWith("/network") ||
    request.nextUrl.pathname.startsWith("/maintenances") ||
    request.nextUrl.pathname.startsWith("/reports")
  ) {
    if (!token) {
      // Armazenar URL de origem para redirecionar após login
      const loginUrl = new URL("/login", request.url)
      const originalPath = request.nextUrl.pathname + request.nextUrl.search
      loginUrl.searchParams.set("redirect", originalPath)
      return NextResponse.redirect(loginUrl)
    }

    try {
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch (err) {
      // Token inválido
      const loginUrl = new URL("/login", request.url)
      const originalPath = request.nextUrl.pathname + request.nextUrl.search
      loginUrl.searchParams.set("redirect", originalPath)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/assets/:path*", 
    "/employees/:path*", 
    "/vault/:path*", 
    "/network/:path*", 
    "/maintenances/:path*", 
    "/reports/:path*",
    "/login"
  ],
}
