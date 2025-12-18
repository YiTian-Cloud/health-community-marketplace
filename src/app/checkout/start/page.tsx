import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function CheckoutStartPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/checkout/start")}`);
  }

  // Call your existing checkout endpoint from the server
  const base =
    process.env.AUTH_URL ||
    process.env.VERCEL_URL?.startsWith("http")
      ? process.env.VERCEL_URL
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "";

  const res = await fetch(`${base}/api/commerce/checkout`, { method: "POST" });
  if (!res.ok) {
    redirect(`/cart?error=${encodeURIComponent("checkout_failed")}`);
  }
  const j = await res.json();
  redirect(j.url);
}
