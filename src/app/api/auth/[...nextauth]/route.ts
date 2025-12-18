import { handlers } from "@/auth";

export const runtime = "nodejs"; // ✅ force Node runtime (not edge)

export const { GET, POST } = handlers;
