import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, normalizeAdminNextPath, verifyAdminSessionToken } from "./lib/admin-auth";

const ADMIN_LOGIN_PATH = "/admin/login";
const ADMIN_HOME_PATH = "/admin/products";

function isAdminPage(pathname) {
  return pathname.startsWith("/admin");
}

function isAdminApi(pathname) {
  return pathname.startsWith("/api/admin");
}

function isAuthApiPath(pathname) {
  return pathname.startsWith("/api/admin/auth/");
}

async function resolveSession(request) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";
  if (!token) {
    return null;
  }

  return verifyAdminSessionToken(token);
}

function redirectToLogin(request) {
  const nextPath = normalizeAdminNextPath(`${request.nextUrl.pathname}${request.nextUrl.search}`);
  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  loginUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const session = await resolveSession(request);

  if (isAdminApi(pathname)) {
    if (isAuthApiPath(pathname)) {
      return NextResponse.next();
    }

    if (!session) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.next();
  }

  if (!isAdminPage(pathname)) {
    return NextResponse.next();
  }

  if (pathname === ADMIN_LOGIN_PATH) {
    if (session) {
      return NextResponse.redirect(new URL(ADMIN_HOME_PATH, request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
