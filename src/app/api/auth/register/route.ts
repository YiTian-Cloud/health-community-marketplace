import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  const e = String(email ?? "").trim().toLowerCase();
  const p = String(password ?? "");
  const n = name ? String(name).trim() : null;

  if (!e || !p || p.length < 8) {
    return new Response("Invalid email or password (min 8 characters)", {
      status: 400,
    });
  }

  const existing = await prisma.user.findUnique({
    where: { email: e },
  });

  if (existing) {
    return new Response("Email already registered", { status: 409 });
  }

  const passwordHash = await bcrypt.hash(p, 10);

  await prisma.user.create({
    data: {
      email: e,
      name: n,
      passwordHash,
    },
  });

  return Response.json({ ok: true });
}
