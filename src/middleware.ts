import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const protectedRoutes = ["/admin", "/doctor", "/patient", "/receptionist"]
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (authRoutes.some((route) => pathname.startsWith(route)) && isLoggedIn) {
    const role = (req.auth as any)?.user?.role
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.nextUrl.origin))
    if (role === "DOCTOR") return NextResponse.redirect(new URL("/doctor", req.nextUrl.origin))
    if (role === "RECEPTIONIST") return NextResponse.redirect(new URL("/receptionist", req.nextUrl.origin))
    return NextResponse.redirect(new URL("/patient", req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/doctor/:path*", "/patient/:path*", "/receptionist/:path*", "/login", "/register", "/forgot-password", "/reset-password"],
}
