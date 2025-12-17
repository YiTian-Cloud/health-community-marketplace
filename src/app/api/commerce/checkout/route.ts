import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { auth } from "@/auth";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
});

const CART_COOKIE = "cartId";

export async function POST() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const cookieStore = await cookies();
    const cookieCartId = cookieStore.get(CART_COOKIE)?.value;

    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Please sign in to checkout." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Use user cart (preferred), fallback to cookie cart
    const userCart = await prisma.cart.findUnique({ where: { userId: user.id } });
    const cartId = userCart?.id ?? cookieCartId ?? null;
    if (!cartId) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const totalCents = cart.items.reduce(
      (sum, it) => sum + it.quantity * it.product.priceCents,
      0
    );

    // 1) Create Order + OrderItems snapshot BEFORE redirect to Stripe
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: "pending_payment",
        totalCents,
        currency: "usd",
        items: {
          create: cart.items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            unitPriceCents: it.product.priceCents,
          })),
        },
      },
      include: { items: true },
    });

    // 2) Stripe Checkout session collects shipping + billing
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: cart.items.map((it) => ({
        quantity: it.quantity,
        price_data: {
          currency: "usd",
          unit_amount: it.product.priceCents,
          product_data: {
            name: it.product.name,
            description: it.product.description,
            images: it.product.imageUrl ? [`${appUrl}${it.product.imageUrl}`] : undefined,
          },
        },
      })),

      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      billing_address_collection: "required",

      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,

      customer_email: email,

      metadata: {
        orderId: order.id,
        cartId,
        userId: user.id,
      },
    });

    // 3) Save Stripe session id on the Order
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkout.id },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (e: any) {
    console.error("❌ checkout failed:", e);
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
