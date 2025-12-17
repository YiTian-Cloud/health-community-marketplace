import dotenv from "dotenv";

// Load env like Next.js does (local first, then fallback)
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function main() {
  // IMPORTANT: import after env is loaded
  const { prisma } = await import("../src/lib/db");

  const updated = await prisma.product.updateMany({
    where: { name: { contains: "PQQ", mode: "insensitive" } },
    data: {
      priceCents: 199,
      imageUrl: "/products/pqq-single.jpg",
    },
  });

  console.log("updated:", updated);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
