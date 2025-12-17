import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./src/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect checkout + orders
  const isProtected =
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/") ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/");

  if (!isProtected) return NextResponse.next();

  const session = await auth();
  const isLoggedIn = !!session?.user;

  if (!isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*"],
};
