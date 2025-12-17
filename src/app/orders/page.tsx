import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

function fmtPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function OrdersPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded border p-6 text-sm">
          Please sign in to view your orders.
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded border p-6 text-sm">
          User not found.
        </div>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded border p-6 text-sm opacity-80">
          You haven’t placed any orders yet.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
  <Link
    key={o.id}
    href={`/orders/${o.id}`}
    className="block rounded border p-4 space-y-1 hover:bg-black/5"
  >
    <div className="flex items-center justify-between">
      <div className="font-medium underline">
        Order #{o.id.slice(-6)}
      </div>
      <div className="text-sm opacity-70">
        {new Date(o.createdAt).toLocaleString()}
      </div>
    </div>

    <div className="text-sm opacity-70">
      Status: <span className="font-medium">{o.status}</span>
    </div>

    <div className="font-semibold">{fmtPrice(o.totalCents)}</div>
  </Link>
))}

        </div>
      )}

      <div>
        <Link href="/marketplace" className="text-sm underline opacity-80">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
