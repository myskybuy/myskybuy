import fs from "fs";
import path from "path";
import { buildProductDescription } from "./lib/product-description";

const file = path.join(__dirname, "..", "prisma", "data", "products.json");
const products = JSON.parse(fs.readFileSync(file, "utf8")) as Array<{
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  salePrice: number;
  image: string;
  stock: number;
  description: string;
}>;

const used = new Set<string>();
for (const p of products) {
  let text = buildProductDescription(p);
  if (used.has(text)) text += `\n\nListing id ${p.id} on MySkyBuy.`;
  used.add(text);
  p.description = text;
}

fs.writeFileSync(file, JSON.stringify(products, null, 2) + "\n");
console.log(`wrote ${products.length} unique JSON descriptions (${used.size} distinct)`);
