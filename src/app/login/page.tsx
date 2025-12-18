import { Suspense } from "react";
import LoginClient from "./login-client";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-20 max-w-md p-6">Loading…</div>}>
      <LoginClient />
    </Suspense>
  );
}
