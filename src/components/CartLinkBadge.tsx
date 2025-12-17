"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function CartLinkBadge() {
  const [count, setCount] = useState<number>(0);

  async function refresh() {
    try {
      const r = await fetch("/api/commerce/cart/summary", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      setCount(Number(j?.itemCount ?? 0));
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    refresh();

    const onChanged = () => refresh();
    window.addEventListener("cart:changed", onChanged);

    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("cart:changed", onChanged);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <Link href="/cart" className="hover:underline font-medium">
      Cart{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
