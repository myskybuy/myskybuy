import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const dataDir = path.join(__dirname, "..", "prisma", "data");

async function main() {
  const products = JSON.parse(fs.readFileSync(path.join(dataDir, "products.json"), "utf8")) as Array<{
    name: string;
    brand: string;
    category: string;
    image: string;
    description: string;
  }>;

  let n = 0;
  for (const p of products) {
    const byImage = await prisma.product.updateMany({
      where: { image: p.image },
      data: { description: p.description },
    });
    if (byImage.count) {
      n += byImage.count;
      continue;
    }
    const r = await prisma.product.updateMany({
      where: { name: p.name, brand: p.brand, category: p.category },
      data: { description: p.description },
    });
    n += r.count;
  }
  console.log(`updated ${n} product descriptions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
