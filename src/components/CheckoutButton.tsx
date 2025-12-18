"use client";

import { useState } from "react";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);

  async function goCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });

      // ✅ If not signed in, send user to login and come back to cart
      if (res.status === 401) {
        const callbackUrl = encodeURIComponent("/cart");
        window.location.href = `/login?callbackUrl=${callbackUrl}`;
        return;
      }

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error ?? "Checkout failed");
        return;
      }

      const data = (await res.json()) as { url?: string };
      if (!data.url) {
        alert("Missing Stripe redirect URL");
        return;
      }

      window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className="ml-auto px-4 py-2 rounded border font-medium disabled:opacity-60"
      disabled={loading}
      onClick={goCheckout}
      title="Proceed to checkout"
    >
      {loading ? "Redirecting…" : "Checkout"}
    </button>
  );
}
