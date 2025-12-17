"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

function fmtPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

type Props = {
  productId: string;
  name: string;
  imageUrl?: string | null;
  unitPriceCents: number;
  quantity: number;
};

export function CartItemRow({
  productId,
  name,
  imageUrl,
  unitPriceCents,
  quantity,
}: Props) {
  const router = useRouter();
  const [qty, setQty] = useState<number>(quantity);
  const [loading, setLoading] = useState(false);

  async function updateQuantity(nextQty: number) {
    setLoading(true);
    try {
      const res = await fetch("/api/commerce/cart/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: nextQty }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error ?? "Update failed");

      window.dispatchEvent(new Event("cart:changed"));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function removeItem() {
    setLoading(true);
    try {
      const res = await fetch("/api/commerce/cart/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error ?? "Remove failed");

      window.dispatchEvent(new Event("cart:changed"));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded border p-4 flex gap-3">
      <div className="relative h-20 w-20 overflow-hidden rounded border bg-black/5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="flex-1">
        <div className="font-medium">{name}</div>
        <div className="text-sm opacity-70">
          {fmtPrice(unitPriceCents)}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <label className="text-sm opacity-80">Qty</label>
          <input
            className="w-20 border rounded px-2 py-1"
            type="number"
            min={1}
            max={99}
            value={qty}
            disabled={loading}
            onChange={(e) => {
              const v = Number(e.target.value || 1);
              setQty(Math.max(1, Math.min(99, v)));
            }}
            onBlur={() => updateQuantity(qty)}
          />

          <button
            className="ml-auto text-sm underline opacity-80 disabled:opacity-60"
            disabled={loading}
            onClick={removeItem}
          >
            Remove
          </button>
        </div>
      </div>

      <div className="font-semibold">
        {fmtPrice(unitPriceCents * qty)}
      </div>
    </div>
  );
}
