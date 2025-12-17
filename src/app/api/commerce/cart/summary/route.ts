import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const CART_COOKIE = "cartId";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cookieCartId = cookieStore.get(CART_COOKIE)?.value;

    const session = await auth();
    const email = session?.user?.email;

    if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ itemCount: 0 });

      const cart = await prisma.cart.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (!cart) return NextResponse.json({ itemCount: 0 });

      const agg = await prisma.cartItem.aggregate({
        where: { cartId: cart.id },
        _sum: { quantity: true },
      });

      return NextResponse.json({ itemCount: agg._sum.quantity ?? 0 });
    }

    if (!cookieCartId) return NextResponse.json({ itemCount: 0 });

    const agg = await prisma.cartItem.aggregate({
      where: { cartId: cookieCartId },
      _sum: { quantity: true },
    });

    return NextResponse.json({ itemCount: agg._sum.quantity ?? 0 });
  } catch (e) {
    console.error("❌ cart summary failed:", e);
    return NextResponse.json({ itemCount: 0 });
  }
}
