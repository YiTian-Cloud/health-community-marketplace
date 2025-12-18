// middleware.ts (project root)
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./src/auth.config";

const { auth } = NextAuth(authConfig);

// Public pages (prefix-based)
const PUBLIC_PREFIXES = [
  "/", // exact only
  "/about",
  "/cart",
  "/login",
  "/register",
  "/checkout/success",
  "/checkout/cancel",
  "/community",
  "/marketplace",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((p) =>
    p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(p + "/")
  );
}

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // ✅ allow public pages
  if (isPublicPath(pathname)) return NextResponse.next();

  // ✅ protect everything else
  if (!req.auth) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

// ✅ CRITICAL: do NOT run middleware on /api at all
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
