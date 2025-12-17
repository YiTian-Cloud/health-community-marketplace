import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

function fmtPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function safeJson(val: unknown) {
  if (!val) return null;
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded border p-6 text-sm">
          Please sign in to view order details.
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return notFound();

  // 🔒 Security: only allow user to view their own order
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) return notFound();

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Order #{order.id.slice(-6)}
        </h1>
        <Link className="text-sm underline opacity-80" href="/orders">
          Back to orders
        </Link>
      </div>

      <div className="rounded border p-4 space-y-1">
        <div className="text-sm opacity-70">
          Placed: {new Date(order.createdAt).toLocaleString()}
        </div>
        <div className="text-sm opacity-70">
          Status: <span className="font-medium">{order.status}</span>
        </div>
        <div className="text-sm opacity-70">
          Stripe session:{" "}
          <span className="font-mono text-xs">{order.stripeSessionId ?? "—"}</span>
        </div>
        <div className="font-semibold">
          Total: {fmtPrice(order.totalCents)}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Items</h2>

        {order.items.map((it) => (
          <div key={it.id} className="rounded border p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{it.product.name}</div>
              <div className="text-sm opacity-70">
                {fmtPrice(it.unitPriceCents)} × {it.quantity}
              </div>
            </div>
            <div className="font-semibold">
              {fmtPrice(it.unitPriceCents * it.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4">
          <div className="font-semibold mb-2">Shipping</div>
          <pre className="text-xs whitespace-pre-wrap opacity-80">
            {safeJson(order.shippingJson) ?? "—"}
          </pre>
        </div>

        <div className="rounded border p-4">
          <div className="font-semibold mb-2">Billing</div>
          <pre className="text-xs whitespace-pre-wrap opacity-80">
            {safeJson(order.billingJson) ?? "—"}
          </pre>
        </div>
      </div>

      <div className="flex gap-4">
        <Link className="text-sm underline opacity-80" href="/marketplace">
          Continue shopping
        </Link>
        <Link className="text-sm underline opacity-80" href="/cart">
          View cart
        </Link>
      </div>
    </div>
  );
}
