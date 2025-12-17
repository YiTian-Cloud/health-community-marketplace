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

  // Update the specific product(s) by name
  const result = await prisma.product.updateMany({
    where: { name: "PQQ Energy Drink – Case (12)" },
    data: {
      imageUrl: "/products/pqq.jpg",
      imageUrl2: "/products/pqq-single.jpg",
    },
  });

  console.log(`✅ Updated ${result.count} product(s).`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("Fix script failed:", e);
  process.exit(1);
});
