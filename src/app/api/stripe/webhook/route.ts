import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig) return new NextResponse("Missing signature", { status: 400 });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ webhook signature verify failed:", err?.message);
    return new NextResponse("Bad signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const evtSession = event.data.object as Stripe.Checkout.Session;

      // ✅ Retrieve FULL session + expand payment intent + latest charge
      const full = await stripe.checkout.sessions.retrieve(evtSession.id, {
        expand: ["payment_intent", "payment_intent.latest_charge"],
      });

      const orderIdFromMeta = full.metadata?.orderId;
      const cartId = full.metadata?.cartId;

      const pi = full.payment_intent as Stripe.PaymentIntent | null;
      const latestCharge = (pi?.latest_charge as Stripe.Charge | null) ?? null;

      // Shipping: prefer session.shipping_details, fallback to payment_intent.shipping
      const shipping =
        full.shipping_details ??
        (pi?.shipping ?? null);

      // Billing: prefer charge.billing_details, fallback to session.customer_details
      const billing =
        latestCharge?.billing_details ??
        (full.customer_details ?? null);

      // ✅ Update order: prefer metadata orderId; fallback to stripeSessionId match
      if (orderIdFromMeta) {
        await prisma.order.update({
          where: { id: orderIdFromMeta },
          data: {
            status: "paid",
            shippingJson: shipping,
            billingJson: billing,
          },
        });
      } else {
        await prisma.order.updateMany({
          where: { stripeSessionId: full.id },
          data: {
            status: "paid",
            shippingJson: shipping,
            billingJson: billing,
          },
        });
      }

      // ✅ Clear cart after successful payment
      if (cartId) {
        await prisma.cartItem.deleteMany({ where: { cartId } });
      }

      console.log("✅ webhook saved addresses", {
        sessionId: full.id,
        orderId: orderIdFromMeta ?? "(fallback by stripeSessionId)",
        hasShipping: !!shipping,
        hasBilling: !!billing,
      });
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error("❌ webhook handler failed:", e);
    return new NextResponse("Webhook error", { status: 500 });
  }
}
