import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const CART_COOKIE = "cartId";

async function getOrCreateCartId() {
  const cookieStore = await cookies(); // ✅ MUST await in your Next version
  const cookieCartId = cookieStore.get(CART_COOKIE)?.value;

  const session = await auth();
  const email = session?.user?.email;

  // Logged-in: use user cart (and merge guest cart if present)
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    const userCart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    // Merge guest cart into user cart
    if (cookieCartId && cookieCartId !== userCart.id) {
      const guestItems = await prisma.cartItem.findMany({
        where: { cartId: cookieCartId },
      });

      for (const it of guestItems) {
        await prisma.cartItem.upsert({
          where: {
            cartId_productId: { cartId: userCart.id, productId: it.productId },
          },
          update: { quantity: { increment: it.quantity } },
          create: {
            cartId: userCart.id,
            productId: it.productId,
            quantity: it.quantity,
          },
        });
      }

      await prisma.cart.delete({ where: { id: cookieCartId } }).catch(() => {});
    }

    // keep cookie synced
    cookieStore.set(CART_COOKIE, userCart.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return userCart.id;
  }

  // Guest: use existing cookie cart or create one
  if (cookieCartId) return cookieCartId;

  const cart = await prisma.cart.create({ data: {} });
  cookieStore.set(CART_COOKIE, cart.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return cart.id;
}

export async function POST(req: Request) {
  try {
    const { productId, quantity } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const qty = Math.max(1, Math.min(99, Number(quantity || 1)));
    const cartId = await getOrCreateCartId();

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      update: { quantity: { increment: qty } },
      create: { cartId, productId, quantity: qty },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("❌ cart/items POST failed:", e);
    return NextResponse.json(
      { error: e?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}


// add these exports under your existing POST

export async function PATCH(req: Request) {
  try {
    const { productId, quantity } = await req.json();
    if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

    const qty = Math.max(1, Math.min(99, Number(quantity || 1)));
    const cartId = await getOrCreateCartId();

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      update: { quantity: qty },
      create: { cartId, productId, quantity: qty },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("❌ cart/items PATCH failed:", e);
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

    const cartId = await getOrCreateCartId();

    await prisma.cartItem.delete({
      where: { cartId_productId: { cartId, productId } },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("❌ cart/items DELETE failed:", e);
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
