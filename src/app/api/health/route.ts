import { prisma } from "@/lib/db";

export async function GET() {
  const now = await prisma.$queryRaw`SELECT NOW()`;
  return Response.json({ ok: true, now });
}
