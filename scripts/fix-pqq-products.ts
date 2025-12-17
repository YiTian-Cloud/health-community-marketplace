import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function main() {
  const { prisma } = await import("../src/lib/db");

  // Case product
  const caseResult = await prisma.product.updateMany({
    where: { name: "PQQ Supplement" },
    data: {
      name: "PQQ Energy Drink – Case (12)",
      priceCents: 3999,
      imageUrl: "/products/pqq.png",
      active: true,
    },
  });

  // Single product
  const singleResult = await prisma.product.updateMany({
    where: { name: "PQQ Health Energy Drink" },
    data: {
      name: "PQQ Energy Drink – Single Can",
      priceCents: 199,
      imageUrl: "/products/pqq-single.jpg",
      active: true,
    },
  });

  console.log("✅ Updated products");
  console.log("Case updated:", caseResult.count);
  console.log("Single updated:", singleResult.count);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
