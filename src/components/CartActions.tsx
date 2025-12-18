"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CartActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function checkout() {
    router.push("/checkout/start");
  }
  
  async function clearCart() {
    setLoading(true);
    try {
      const res = await fetch("/api/commerce/cart/clear", { method: "POST" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error ?? "Clear cart failed");
      window.dispatchEvent(new Event("cart:changed"));
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Clear cart failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        className="px-3 py-2 rounded border disabled:opacity-60"
        disabled={loading}
        onClick={clearCart}
      >
        Clear cart
      </button>

      <button
        className="ml-auto px-4 py-2 rounded border font-medium disabled:opacity-60"
        disabled={loading}
        onClick={checkout}
      >
        {loading ? "Redirecting…" : "Checkout"}
      </button>
    </div>
  );
}
