"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

/* -------------------- Types -------------------- */

type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl?: string | null;
  pdfUrl?: string | null;
};

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: { name: string | null; image: string | null };
  comments: {
    id: string;
    content: string;
    createdAt: string;
    author: { name: string | null; image: string | null };
  }[];
};

type PostsResponse = {
  latest: Post[];
  featured: Post[];
  hot: Post[];
};

/* -------------------- Helpers -------------------- */

function fmtPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

/* -------------------- Editor’s Choice -------------------- */

function EditorsChoice() {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products/featured")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="rounded border p-4 space-y-3 bg-slate-50">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Editor’s Choice</h2>
        <a className="text-sm underline" href="/marketplace">
          View marketplace
        </a>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((p) => (
          <div key={p.id} className="rounded border p-3 space-y-2 bg-white">
            <div className="font-medium">{p.name}</div>

            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-40 object-cover rounded border"
              />
            )}

            <div className="text-sm opacity-80 line-clamp-2">{p.description}</div>
            <div className="font-semibold">{fmtPrice(p.priceCents)}</div>

            {p.pdfUrl && (
              <a
                href={p.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline"
              >
                View product PDF
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------- Small Post Lists -------------------- */

function MiniPostList({
  title,
  subtitle,
  posts,
}: {
  title: string;
  subtitle?: string;
  posts: Post[];
}) {
  if (posts.length === 0) return null;

  return (
    <div className="rounded border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{title}</div>
        {subtitle ? <div className="text-xs opacity-70">{subtitle}</div> : null}
      </div>

      <div className="space-y-2">
        {posts.map((p) => (
          <div key={p.id} className="rounded border p-3">
            <div className="font-medium line-clamp-1">{p.title}</div>
            <div className="text-sm opacity-80 line-clamp-2">{p.content}</div>
            <div className="text-xs opacity-60 pt-1">
              {p.author?.name ?? "Anonymous"} • {new Date(p.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------- Page -------------------- */

export default function CommunityPage() {
  const { data: session, status } = useSession();

  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [hotPosts, setHotPosts] = useState<Post[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/posts", { cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    const data = (await res.json()) as PostsResponse;

    setPosts(data.latest ?? []);
    setFeaturedPosts(data.featured ?? []);
    setHotPosts(data.hot ?? []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function createPost() {
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error(await res.text());
      setTitle("");
      setContent("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function addComment(postId: string, comment: string) {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comment }),
    });
    if (!res.ok) throw new Error(await res.text());
    await load();
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Community</h1>
          <a className="text-sm underline opacity-80" href="/marketplace">
            Marketplace
          </a>
        </div>

        {status === "authenticated" ? (
          <div className="flex items-center gap-3">
            <span className="text-sm opacity-80">{session.user?.email}</span>
            <button className="px-3 py-1 rounded border" onClick={() => signOut()}>
              Sign out
            </button>
          </div>
        ) : (
          <button className="px-3 py-1 rounded border" onClick={() => signIn()}>
            Sign in
          </button>
        )}
      </div>

      {/* Posts-only sections */}
      <MiniPostList title="Editor recommended posts" subtitle="hand-picked" posts={featuredPosts} />
      <MiniPostList title="Hot posts" subtitle="most discussed" posts={hotPosts} />

      {/* Product section */}
      <EditorsChoice />

      {/* New Post */}
      {status === "authenticated" && (
        <div className="rounded border p-4 space-y-3">
          <div className="font-medium">New post</div>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Write something helpful…"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            className="px-3 py-2 rounded border"
            disabled={loading || !title.trim() || !content.trim()}
            onClick={createPost}
          >
            {loading ? "Posting…" : "Post"}
          </button>
        </div>
      )}

      {/* Full feed */}
      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            canComment={status === "authenticated"}
            onComment={addComment}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------- Post Card -------------------- */

function PostCard({
  post,
  canComment,
  onComment,
}: {
  post: Post;
  canComment: boolean;
  onComment: (postId: string, comment: string) => Promise<void>;
}) {
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <div className="rounded border p-4 space-y-3">
      <div>
        <div className="text-lg font-semibold">{post.title}</div>
        <div className="text-sm opacity-70">
          by {post.author?.name ?? "Anonymous"} • {new Date(post.createdAt).toLocaleString()}
        </div>
      </div>

      <div className="whitespace-pre-wrap">{post.content}</div>

      <div className="pt-2 border-t space-y-2">
        <div className="font-medium">Comments</div>

        {post.comments.map((c) => (
          <div key={c.id} className="text-sm">
            <span className="font-medium">{c.author?.name ?? "Anonymous"}:</span>{" "}
            {c.content}
          </div>
        ))}

        {canComment && (
          <div className="flex gap-2 pt-2">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="Add a comment…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              className="px-3 py-2 rounded border"
              disabled={sending || !comment.trim()}
              onClick={async () => {
                setSending(true);
                try {
                  await onComment(post.id, comment);
                  setComment("");
                } finally {
                  setSending(false);
                }
              }}
            >
              {sending ? "…" : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
