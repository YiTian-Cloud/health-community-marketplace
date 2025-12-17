import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "./src/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Only protect these routes
  const protectedPaths = ["/checkout", "/orders"];

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) return NextResponse.next();

  const session = await auth();
  if (!session?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ✅ CRITICAL: matcher must NOT be "/:path*" or "/(.*)"
export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*"],
};
