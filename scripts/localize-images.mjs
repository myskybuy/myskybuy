import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const productsPath = path.join(root, "prisma", "data", "products.json");
const categoriesPath = path.join(root, "prisma", "data", "categories.json");
const productsDir = path.join(root, "public", "images", "products");
const categoriesDir = path.join(root, "public", "images", "categories");
const aboutDir = path.join(root, "public", "images", "about");

fs.mkdirSync(productsDir, { recursive: true });
fs.mkdirSync(categoriesDir, { recursive: true });
fs.mkdirSync(aboutDir, { recursive: true });

const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));
const categories = JSON.parse(fs.readFileSync(categoriesPath, "utf8"));
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function mapLimit(items, limit, worker) {
  const out = [];
  let i = 0;
  async function next() {
    const idx = i++;
    if (idx >= items.length) return;
    out[idx] = await worker(items[idx], idx);
    return next();
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  return out;
}

await mapLimit(products, 6, async (p) => {
  const dest = path.join(productsDir, `${p.id}.jpg`);
  if (p.image && p.image.startsWith("http")) {
    try {
      await download(p.image, dest);
      p.image = `/images/products/${p.id}.jpg`;
      console.log("ok", p.id, p.name);
    } catch (err) {
      console.warn("fail", p.id, p.name, err.message);
      p.image = "/images/placeholder.svg";
    }
  } else if (!p.image) {
    p.image = "/images/placeholder.svg";
  }
});

for (const c of categories) {
  const first = products.find((p) => p.category === c.name && p.image.startsWith("/images/products/"));
  if (!first) {
    c.image = "/images/placeholder.svg";
    continue;
  }
  const destName = `${slug(c.name)}.jpg`;
  fs.copyFileSync(path.join(root, "public", first.image), path.join(categoriesDir, destName));
  c.image = `/images/categories/${destName}`;
}

const hero = products.find((p) => p.category === "Handbags & Totes" && p.image.startsWith("/images/products/"));
const who = products.find((p) => p.category === "Backpacks" && p.image.startsWith("/images/products/"));
if (hero) fs.copyFileSync(path.join(root, "public", hero.image), path.join(aboutDir, "hero.jpg"));
if (who) fs.copyFileSync(path.join(root, "public", who.image), path.join(aboutDir, "who.jpg"));

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2) + "\n");
fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2) + "\n");
console.log("updated seed JSON");
