import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const dataDir = path.join(__dirname, "..", "prisma", "data");

async function main() {
  const products = JSON.parse(fs.readFileSync(path.join(dataDir, "products.json"), "utf8")) as Array<{
    id: number;
    name: string;
    brand: string;
    category: string;
    image: string;
    description: string;
  }>;

  const dbCount = await prisma.product.count();
  console.log(`json=${products.length} db=${dbCount}`);
  if (!dbCount) {
    console.error("No products in this DATABASE_URL. Check .env on the VPS.");
    return;
  }

  let n = 0;
  for (const p of products) {
    const data = { description: p.description };

    let r = await prisma.product.updateMany({ where: { id: p.id }, data });
    if (!r.count) {
      r = await prisma.product.updateMany({ where: { image: p.image }, data });
    }
    if (!r.count) {
      r = await prisma.product.updateMany({ where: { name: p.name }, data });
    }
    n += r.count;
  }

  console.log(`updated ${n} product descriptions`);
  if (!n) {
    const sample = await prisma.product.findMany({ take: 2, select: { id: true, name: true, image: true } });
    console.log("sample db rows:", sample);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
