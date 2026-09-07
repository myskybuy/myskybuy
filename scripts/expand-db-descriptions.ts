import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COLORS = [
  "Black",
  "Olive",
  "Blue",
  "Beige",
  "Green",
  "Tan",
  "Blush",
  "Red",
  "Brown",
  "Wine",
  "Grey",
  "Pink",
  "White",
  "Yellow",
  "Moon-White",
  "Chocolate",
  "Denim",
];

function pickColor(name: string) {
  return COLORS.find((c) => name.toLowerCase().includes(c.toLowerCase())) || "";
}

type P = { id: number; name: string; brand: string; category: string; price: number; salePrice: number };

const OPENERS: Record<string, (p: P, color: string) => string> = {
  "Bags & Everyday Carry": (p, color) =>
    `Meet ${p.name} by ${p.brand} — a compact everyday companion for keys, cards, cables and the small kit you actually use between home and work${color ? `, finished in ${color}` : ""}.`,
  "Travel & Luggage": (p, color) =>
    `${p.name} from ${p.brand} is built for movement: airport queues, overnight stays and packing that has to stay organised${color ? `. This ${color} piece` : ". It"} sits in MySkyBuy’s travel catalogue for Indian routes, not just photoshoots.`,
  "Handbags & Totes": (p, color) =>
    `${p.name} is a ${p.brand} carry piece for city days — office bags, evening plans and the extra space a structured bag actually needs${color ? `, shown here in ${color}` : ""}.`,
  Backpacks: (p, color) =>
    `The ${p.name} by ${p.brand} is a backpack cut for commute, campus and laptop days${color ? ` in ${color}` : ""}. Straps, pockets and daily load are the point — not a one-line catalogue blurb.`,
  "Slings & Crossbody": (p, color) =>
    `${p.name} keeps both hands free. ${p.brand} designed this sling/crossbody for phone, wallet and a slim daily kit${color ? `, in ${color}` : ""}.`,
  "Laptop & Work Bags": (p, color) =>
    `${p.name} is ${p.brand}’s work-bag take: laptop sleeve space, a cleaner silhouette for meetings, and enough room for charger and documents${color ? ` — ${color} colourway` : ""}.`,
  "Wallets & Purses": (p, color) =>
    `${p.name} by ${p.brand} is a compact wallet/purse for cards, cash and IDs without bulk${color ? `, in ${color} leather-look finish` : ""}.`,
};

const AUDIENCE = [
  (p: P) =>
    `Choose ${p.name} if you want one bag that survives weekday errands without looking like gym gear. Listed at ₹${Number(p.salePrice).toLocaleString("en-IN")} on MySkyBuy (MRP ₹${Number(p.price).toLocaleString("en-IN")}).`,
  (p: P) =>
    `Best for people who pack a laptop or a full day kit and still want a clean profile. Current MySkyBuy price: ₹${Number(p.salePrice).toLocaleString("en-IN")}.`,
  (p: P) =>
    `If you rotate between office, metro and weekend plans, ${p.name} is sized for that mix. You are paying ₹${Number(p.salePrice).toLocaleString("en-IN")} versus ₹${Number(p.price).toLocaleString("en-IN")} list.`,
  (p: P) =>
    `Gifting or replacing a worn bag? ${p.brand}’s ${p.name} is a straightforward upgrade with transparent INR pricing on this listing.`,
  (p: P) =>
    `Students, first-job commuters and short-trip travellers pick this silhouette because it does not force a huge trolley for a 24-hour outing.`,
];

const FEATURES: Record<string, (p: P) => string> = {
  "Bags & Everyday Carry": (p) =>
    `Expect a grab-and-go layout: a main pocket for daily clutter, a safer inner slot for cards, and a shape that sits in a larger bag or on its own. ${p.name} is not luggage — it is the small layer you carry every day.`,
  "Travel & Luggage": (p) =>
    `Look for packing volume, a grab handle and a shell or fabric that can take conveyor belts. ${p.name} is meant to roll or pack beside you on Indian domestic hops; confirm cabin vs check-in size on the product title before you fly.`,
  "Handbags & Totes": (p) =>
    `The tote/handbag opening is cut for a water bottle, a slim laptop or a makeup pouch depending on size. ${p.name} should stand on a café table without collapsing; wipe the exterior after monsoon days.`,
  Backpacks: (p) =>
    `Padded straps, a rear or top laptop sleeve and zippers you can actually reach with a jacket on — that is the daily test for ${p.name}. Do not overload past what the back panel can hold on a 40-minute commute.`,
  "Slings & Crossbody": (p) =>
    `Wear ${p.name} across the chest in crowds. The front pocket is for phone/UPI cards; keep passports in a zipped inner if you travel. Adjust the strap once and leave it — that is how slings stay comfortable.`,
  "Laptop & Work Bags": (p) =>
    `${p.name} should swallow a 13–15" class laptop plus a charger brick. Use the front organiser for pens and a mouse; keep the main compartment from becoming a junk drawer or the structure will sag.`,
  "Wallets & Purses": (p) =>
    `Card slots, a cash compartment and a silhouette that fits a back pocket or a small sling — ${p.name} is the last thing you throw in, not a bag. Avoid stuffing receipts until the bifold will not close.`,
};

const CARE = [
  (p: P) =>
    `Wipe ${p.name} with a dry cloth after dusty travel. Keep it away from standing water overnight. MySkyBuy confirms supplier stock at fulfilment — colour and hardware can vary slightly from studio photos.`,
  (p: P) =>
    `Store ${p.name} stuffed with paper so the shape holds. Leather-look pieces prefer a cool cupboard, not a car dashboard. Dispatch terms follow our shipping policy once the warehouse confirms this SKU.`,
  (p: P) =>
    `Zip ${p.name} fully before you wash nearby fabrics. Hardware scratches if you toss keys loose in the same pocket. Capacity and warranty claims stay with the brand; we list what the storefront currently publishes.`,
  (p: P) =>
    `Rain cover or a poly bag in monsoon is cheap insurance for ${p.name}. Do not machine-wash. If you return it, keep tags and dust bag so the 7-day window still applies.`,
  (p: P) =>
    `Check zipper pulls on ${p.name} when it arrives — that is the first wear point. We photograph the live listing; if the brand updates the colourway, we will match what we ship or contact you.`,
];

function describe(p: P, index: number) {
  const color = pickColor(p.name);
  const cat = p.category || "Bags & Everyday Carry";
  const open = (OPENERS[cat] || OPENERS["Bags & Everyday Carry"])(p, color);
  const who = AUDIENCE[index % AUDIENCE.length](p);
  const feat = (FEATURES[cat] || FEATURES["Bags & Everyday Carry"])(p);
  const extra = color
    ? ` This listing is the ${color} option for ${p.name} — other colours are separate products.`
    : ` This exact listing is SKU #${p.id} in ${cat}; similar names nearby are different sizes or combos.`;
  const combo = /combo|set of|pack/i.test(p.name)
    ? ` ${p.name} is a set — check how many pieces are included in the title.`
    : ` Sold as a single piece unless the title says otherwise.`;
  const care = CARE[index % CARE.length](p);
  return `${open} ${who}\n\n${feat}${extra}${combo}\n\n${care}`;
}

async function main() {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  console.log(`db products=${products.length}`);
  if (!products.length) {
    console.error("No products found. Check DATABASE_URL.");
    return;
  }

  const used = new Set<string>();
  let n = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    let text = describe(p, i);
    if (used.has(text)) text += ` Product id ${p.id} on MySkyBuy.`;
    used.add(text);
    await prisma.product.update({ where: { id: p.id }, data: { description: text } });
    n++;
  }
  console.log(`updated ${n} unique descriptions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
