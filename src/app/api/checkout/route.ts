import { prisma } from "@/lib/db";
import { auth } from "@/auth"; // wherever your NextAuth export is
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
 // if TS complains, remove apiVersion line
});

type CartItem = {
  productId: string;
  quantity: number;
  imageUrl?: string;
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const cart: CartItem[] = body?.cart ?? [];
  if (!Array.isArray(cart) || cart.length === 0)
    return new Response("Cart empty", { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return new Response("User not found", { status: 404 });

  const products = await prisma.product.findMany({
    where: { id: { in: cart.map((c) => c.productId) }, active: true },
  });
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));

  const proto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("x-forwarded-host");
  
  const origin =
    proto && host
      ? `${proto}://${host}`
      : req.headers.get("origin") ?? "";
  
  if (!origin) {
    return new Response("Unable to determine request origin", { status: 500 });
  }
  

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.map((c) => {
    const p = byId[c.productId];
    if (!p) throw new Error(`Invalid product: ${c.productId}`);
    return {
      quantity: c.quantity,
      price_data: {
        currency: "usd",
        unit_amount: p.priceCents,
        product_data: {
          name: p.name,
          description: p.description,
          images: c.imageUrl ? [new URL(c.imageUrl, origin).toString()] : [],
        },
      },
    };
  });

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "created",
      items: {
        create: cart.map((c) => {
          const p = byId[c.productId]!;
          return {
            productId: p.id,
            quantity: c.quantity,
            unitPriceCents: p.priceCents,
          };
        }),
      },
    },
    include: { items: true },
  });

  const origin = req.headers.get("origin")!;
  const success_url = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancel_url = `${origin}/cart`;
  

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: success_url ,
    cancel_url: cancel_url,
    metadata: { orderId: order.id },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: checkout.id },
  });

  return Response.json({ url: checkout.url });
}
