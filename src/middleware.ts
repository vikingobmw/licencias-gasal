import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "gasal-admin-session-token"
  });
  const { pathname } = req.nextUrl;

  // Permitir la API de activación, NextAuth y el login
  if (pathname.includes("/api/activate") || pathname.includes("/api/auth") || pathname === "/login") {
    return NextResponse.next();
  }

  // Redirigir al login si no hay token
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
