"use client";

import { useState } from "react";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      const res = await fetch("/api/commerce/checkout", { method: "POST" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error ?? "Checkout failed");
      window.location.href = j.url;
    } catch (e: any) {
      alert(e?.message ?? "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className="ml-auto px-4 py-2 rounded border font-medium disabled:opacity-60"
      disabled={loading}
      onClick={go}
    >
      {loading ? "Redirecting…" : "Checkout"}
    </button>
  );
}
