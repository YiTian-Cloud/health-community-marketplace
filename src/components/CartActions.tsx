"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CartActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/commerce/checkout", { method: "POST" });
      const j = await res.json().catch(() => ({}));
  
      // ✅ If not signed in, redirect to /login (with callback back to cart)
      if (res.status === 401 || res.status === 403) {
        const cb = encodeURIComponent("/cart");
        router.push(`/login?callbackUrl=${cb}`);
        return;
      }
  
      if (!res.ok) throw new Error(j?.error ?? "Checkout failed");
  
      // ✅ If backend returns a Stripe URL, go there
      if (j?.url) {
        window.location.href = j.url;
        return;
      }
  
      throw new Error("Checkout did not return a redirect URL");
    } catch (e: any) {
      alert(e?.message ?? "Checkout failed");
    } finally {
      setLoading(false);
    }
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
