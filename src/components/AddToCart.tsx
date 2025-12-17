"use client";

import { useState } from "react";

export function AddToCart({ productId }: { productId: string }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  async function add() {
    setLoading(true);
    try {
      const res = await fetch("/api/commerce/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error ?? "Failed to add to cart");
        return;
      }

      // quick feedback
      alert("Added to cart ✅");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <input
        className="w-16 rounded border px-2 py-2"
        type="number"
        min={1}
        max={99}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value || 1))))}
      />
      <button
        onClick={add}
        disabled={loading}
        className="px-3 py-2 rounded border w-full disabled:opacity-60"
      >
        {loading ? "Adding..." : "Add to cart"}
      </button>
    </div>
  );
}
