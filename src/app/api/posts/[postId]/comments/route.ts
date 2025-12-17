import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ postId: string }> } // ✅ params is a Promise in Next 16
) {
  const { postId } = await ctx.params; // ✅ unwrap it

  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const { content } = await req.json();
  const c = String(content ?? "").trim();
  if (!c) return new Response("Missing content", { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return new Response("User not found", { status: 404 });

  const comment = await prisma.comment.create({
    data: {
      content: c,
      author: { connect: { id: user.id } },
      post: { connect: { id: postId } }, // ✅ now it’s defined
    },
  });

  return Response.json(comment);
}
