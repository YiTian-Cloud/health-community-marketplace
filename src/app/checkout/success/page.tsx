import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = await searchParams;
  const sessionId = sp.session_id;

  const session = await auth();
  const email = session?.user?.email;

  let orderId: string | null = null;

  // If we have a stripe session id, map it to our Order
  if (sessionId && email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const order = await prisma.order.findFirst({
        where: {
          userId: user.id,
          stripeSessionId: sessionId,
        },
        select: { id: true },
      });
      orderId = order?.id ?? null;
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Payment successful ✅</h1>
      <p className="opacity-80">Your order is being processed.</p>

      <div className="flex gap-4">
        {orderId ? (
          <Link className="underline" href={`/orders/${orderId}`}>
            View this order
          </Link>
        ) : (
          <Link className="underline" href="/orders">
            View orders
          </Link>
        )}

        <Link className="underline" href="/marketplace">
          Continue shopping
        </Link>
      </div>

      {!sessionId ? (
        <div className="text-xs opacity-60">
          (No session_id found in URL — that’s okay, you can still view orders.)
        </div>
      ) : null}
    </div>
  );
}
