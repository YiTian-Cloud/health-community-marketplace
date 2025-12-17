import { prisma } from "@/lib/db";
import { auth } from "@/auth";


export async function GET() {
  const [latest, featured, hot] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        author: { select: { name: true, image: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { name: true, image: true } } },
        },
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        author: { select: { name: true, image: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { name: true, image: true } } },
        },
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.findMany({
      orderBy: [{ comments: { _count: "desc" } }, { createdAt: "desc" }],
      take: 5,
      include: {
        author: { select: { name: true, image: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { name: true, image: true } } },
        },
        _count: { select: { comments: true } },
      },
    }),
  ]);

  return Response.json({ latest, featured, hot });
}


export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const { title, content } = await req.json();
  const t = String(title ?? "").trim();
  const c = String(content ?? "").trim();
  if (!t || !c) return new Response("Missing title/content", { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return new Response("User not found", { status: 404 });

  const post = await prisma.post.create({
    data: { title: t, content: c, authorId: user.id },
  });

  return Response.json(post);
}
