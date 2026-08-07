import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { defaultLocale, locales } from "@/i18n/config";

const ADMIN_COOKIE = "portfolio_admin_session";

function adminSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ?? "dev-only-change-me-portfolio-admin";
  return new TextEncoder().encode(secret);
}

async function readAdminSession(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, adminSecret());
    return {
      username: String(payload.username ?? ""),
      mustChangePassword: Boolean(payload.mustChangePassword),
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const session = await readAdminSession(request);
    const isLogin = pathname === "/admin/login";
    const isChange = pathname === "/admin/change-password";

    if (!session && !isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    if (session && isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = session.mustChangePassword
        ? "/admin/change-password"
        : "/admin";
      return NextResponse.redirect(url);
    }

    if (session?.mustChangePassword && !isChange && !isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/change-password";
      return NextResponse.redirect(url);
    }

    if (session && !session.mustChangePassword && isChange) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (!hasLocale) {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
