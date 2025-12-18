"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginClient() {
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/community";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    await signIn("credentials", {
      email,
      password,
      callbackUrl,
    });
  }

  return (
    <div className="mx-auto mt-20 max-w-md space-y-4 rounded border p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>

      <button
        type="button"
        className="w-full rounded border px-3 py-2"
        onClick={() => signIn("github", { callbackUrl })}
      >
        Continue with GitHub
      </button>

      <div className="text-center text-sm opacity-70">or</div>

      <form onSubmit={onEmailLogin} className="space-y-3">
        <input
          className="w-full rounded border px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded border px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full rounded border px-3 py-2" type="submit">
          Sign in with email
        </button>
      </form>

      <div className="text-sm">
        No account?{" "}
        <a href="/register" className="underline">
          Create one
        </a>
      </div>
    </div>
  );
}
