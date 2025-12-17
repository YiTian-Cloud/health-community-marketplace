import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { AddToCart } from "@/components/AddToCart";


function fmtPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function MarketplacePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    take: 100,
  });

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Marketplace</h1>
        <Link className="text-sm underline opacity-80" href="/community">
          Community
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="rounded border overflow-hidden">
            <div className="relative w-full aspect-[4/3] bg-black/5">
              <Image
                src={p.imageUrl ?? "/products/placeholder.png"}
                alt={p.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={p.featured}
              />
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium">{p.name}</div>
                {p.featured && (
                  <span className="text-xs rounded border px-2 py-0.5">
                    Editor’s Choice
                  </span>
                )}
              </div>

              <div className="text-sm opacity-80 line-clamp-2">
                {p.description}
              </div>

              <div className="font-semibold">{fmtPrice(p.priceCents)}</div>
              <div className="flex items-center gap-3 pt-2">
  <AddToCart productId={p.id} />

  {p.pdfUrl && (
    <a
      className="px-3 py-2 rounded border text-sm"
      href={p.pdfUrl}
      target="_blank"
      rel="noreferrer"
    >
      PDF
    </a>
  )}
</div>


              {p.imageUrl2 && (
                <div className="pt-2 text-xs opacity-70">
                  (Has alternate image)
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
