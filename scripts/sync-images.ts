import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const dataDir = path.join(__dirname, "..", "prisma", "data");

async function main() {
  const categories = JSON.parse(fs.readFileSync(path.join(dataDir, "categories.json"), "utf8")) as Array<{
    name: string;
    image: string;
  }>;
  const products = JSON.parse(fs.readFileSync(path.join(dataDir, "products.json"), "utf8")) as Array<{
    name: string;
    brand: string;
    category: string;
    image: string;
  }>;

  for (const c of categories) {
    const r = await prisma.category.updateMany({ where: { name: c.name }, data: { image: c.image } });
    console.log("category", c.name, r.count);
  }

  for (const p of products) {
    await prisma.product.updateMany({
      where: { name: p.name, brand: p.brand, category: p.category },
      data: { image: p.image },
    });
  }
  console.log(`synced ${products.length} product image paths`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
