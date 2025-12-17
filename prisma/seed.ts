import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing. Check your .env at project root.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Remove existing PQQ product(s) so seed is repeatable
  await prisma.product.deleteMany({
    where: { name: "PQQ Supplement" },
  });

  await prisma.product.create({
    data: {
      name: "PQQ Supplement",
      description: "Supports mitochondrial health and energy.",
      priceCents: 2999,
      active: true,
      featured: true,
      imageUrl: "/products/pqq.jpg",
      imageUrl2: "/products/pqq-single.jpg",
    },
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
