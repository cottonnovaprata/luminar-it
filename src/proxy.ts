import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret")

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("session")?.value

  if (request.nextUrl.pathname === "/login") {
    if (token) {
      try {
        await jwtVerify(token, secret)
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } catch {
        // Token invalido, segue para login.
      }
    }
  }

  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/assets") ||
    request.nextUrl.pathname.startsWith("/employees") ||
    request.nextUrl.pathname.startsWith("/vault") ||
    request.nextUrl.pathname.startsWith("/network") ||
    request.nextUrl.pathname.startsWith("/maintenances") ||
    request.nextUrl.pathname.startsWith("/reports") ||
    request.nextUrl.pathname.startsWith("/settings")
  ) {
    if (!token) {
      const loginUrl = new URL("/login", request.url)
      const originalPath = request.nextUrl.pathname + request.nextUrl.search
      loginUrl.searchParams.set("redirect", originalPath)
      return NextResponse.redirect(loginUrl)
    }

    try {
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch {
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
    "/settings/:path*",
    "/login",
  ],
}
