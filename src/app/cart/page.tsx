import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { CartItemRow } from "@/components/CartItemRow";
import { CheckoutButton } from "@/components/CheckoutButton";
import { CartActions } from "@/components/CartActions";



const CART_COOKIE = "cartId";

function fmtPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function CartPage() {
  const cookieStore = await cookies();
  const cookieCartId = cookieStore.get(CART_COOKIE)?.value;

  const session = await auth();
  const email = session?.user?.email;

  let cartId: string | null = null;

  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const userCart = await prisma.cart.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
      cartId = userCart.id;

      // keep cookie synced
  
    }
  } else {
    cartId = cookieCartId ?? null;
  }

  const cart = cartId
    ? await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: { include: { product: true } } },
      })
    : null;

  const items = cart?.items ?? [];
  const totalCents = items.reduce(
    (sum, it) => sum + it.quantity * it.product.priceCents,
    0
  );

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cart</h1>
        <Link className="text-sm underline opacity-80" href="/marketplace">
          Continue shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded border p-6 text-sm opacity-80">
          Your cart is empty.
        </div>
      ) : (
        <div className="space-y-3">
{items.map((it) => (
  <CartItemRow
    key={it.id}
    productId={it.productId}
    name={it.product.name}
    imageUrl={it.product.imageUrl}
    unitPriceCents={it.product.priceCents}
    quantity={it.quantity}
  />
))}


          <div className="rounded border p-4 flex items-center justify-between">
            <div className="font-medium">Total</div>
            <div className="font-semibold">{fmtPrice(totalCents)}</div>
          </div>

          <div className="flex items-center gap-2">


          <CartActions />
</div>

        </div>
      )}
    </div>
  );
}
