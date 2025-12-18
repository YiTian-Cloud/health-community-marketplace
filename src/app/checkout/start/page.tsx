import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function getBaseUrl() {
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://health-community-marketplace.vercel.app";
}

async function getCookieHeader() {
  // Next versions differ: cookies() may be sync or async depending on runtime/build
  const store: any = cookies();
  const resolved = typeof store?.then === "function" ? await store : store;

  const all = resolved.getAll?.() ?? [];
  return all.map((c: any) => `${c.name}=${c.value}`).join("; ");
}

export default async function CheckoutStartPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/checkout/start")}`);
  }

  const baseUrl = getBaseUrl();
  const cookieHeader = await getCookieHeader();

  const res = await fetch(`${baseUrl}/api/commerce/checkout`, {
    method: "POST",
    cache: "no-store",
    headers: {
      cookie: cookieHeader, // ✅ this is the key
      "content-type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const text = await res.text();

  if (!res.ok) {
    redirect(
      `/cart?error=${encodeURIComponent(
        `checkout_${res.status}`
      )}&detail=${encodeURIComponent(text.slice(0, 200))}`
    );
  }

  let j: any = {};
  try {
    j = JSON.parse(text);
  } catch {}

  if (!j?.url) {
    redirect(`/cart?error=${encodeURIComponent("missing_checkout_url")}`);
  }

  redirect(j.url);
}
