import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL missing in .env");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const result = await prisma.product.updateMany({
    where: {
      name: {
        contains: "BP",
        mode: "insensitive",
      },
    },
    data: {
      active: false,
      featured: false, // removes from Editor’s Choice
    },
  });

  console.log(`✅ Soft-removed ${result.count} BP Monitor product(s)`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("❌ Remove failed:", e);
  process.exit(1);
});
