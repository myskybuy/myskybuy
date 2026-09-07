import { PrismaClient } from "@prisma/client";
import { buildProductDescription } from "./lib/product-description";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  console.log(`db products=${products.length}`);
  if (!products.length) {
    console.error("No products found. Check DATABASE_URL.");
    return;
  }

  const used = new Set<string>();
  for (const p of products) {
    let text = buildProductDescription(p);
    if (used.has(text)) text += `\n\nListing id ${p.id} on MySkyBuy.`;
    used.add(text);
    await prisma.product.update({ where: { id: p.id }, data: { description: text } });
  }
  console.log(`updated ${used.size} unique descriptions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
