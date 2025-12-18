// src/auth.config.ts
import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

console.log("LOCAL AUTH_URL", process.env.AUTH_URL);
console.log("LOCAL GITHUB_ID set?", !!process.env.GITHUB_ID);
console.log("LOCAL GITHUB_SECRET set?", !!process.env.GITHUB_SECRET);
console.log("LOCAL AUTH_SECRET set?", !!process.env.AUTH_SECRET);

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
};
