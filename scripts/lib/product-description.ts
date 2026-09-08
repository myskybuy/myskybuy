export type ProductFactsInput = {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  salePrice: number;
  image?: string | null;
};

const COLORS = [
  "mustard",
  "maroon",
  "navy",
  "sky blue",
  "seaweed",
  "moon-white",
  "chocolate",
  "denim",
  "blush",
  "olive",
  "beige",
  "black",
  "white",
  "yellow",
  "green",
  "blue",
  "brown",
  "tan",
  "red",
  "pink",
  "grey",
  "gray",
  "wine",
  "purple",
  "orange",
];

const TYPES: Array<{ keys: string[]; label: string; use: string }> = [
  { keys: ["cover"], label: "luggage cover", use: "protecting a trolley shell from belts and rain" },
  { keys: ["school bag", "schoolbag", "school"], label: "school backpack", use: "books, a lunch box and a thin laptop for class" },
  { keys: ["combo", "set of"], label: "combo set", use: "more than one piece as listed in the title" },
  { keys: ["trolley", "suitcase", "hard luggage", "cabin", "check in"], label: "trolley / hard luggage", use: "airport queues, overnight stays and packed clothes" },
  { keys: ["luggage"], label: "travel luggage", use: "airport queues, overnight stays and packed clothes" },
  { keys: ["duffle", "duffel", "overnighter"], label: "overnighter / duffle", use: "a weekend change of clothes and a toiletry pouch" },
  { keys: ["briefcase"], label: "briefcase", use: "files, a charger and a slim laptop for meetings" },
  { keys: ["messenger"], label: "laptop messenger", use: "a laptop, charger and documents on a shoulder strap" },
  { keys: ["tote"], label: "tote", use: "a water bottle, pouch and everyday office clutter" },
  { keys: ["hobo"], label: "hobo bag", use: "phone, wallet and a light daily kit with a slouchy shape" },
  { keys: ["satchel"], label: "satchel", use: "cards, a compact bottle and a structured city look" },
  { keys: ["baguette"], label: "baguette bag", use: "phone, cards and a small evening kit under the arm" },
  { keys: ["handbag", "shoulder"], label: "handbag", use: "everyday styling, a compact bottle and city errands" },
  { keys: ["sling", "crossbody", "cross-body"], label: "sling / crossbody", use: "phone, wallet and hands-free commute" },
  { keys: ["wallet", "bifold", "bi fold"], label: "wallet", use: "cards, cash and IDs without extra bulk" },
  { keys: ["laptop backpack", "laptop bag", "backpack"], label: "backpack", use: "a laptop, charger and daily commute load" },
  { keys: ["pack"], label: "pack / set", use: "the pieces named in the title" },
];

function hay(p: ProductFactsInput) {
  return `${p.name} ${p.brand} ${p.category} ${p.image || ""}`.toLowerCase();
}

function pickColor(text: string) {
  const t = text.toLowerCase();
  return COLORS.find((c) => t.includes(c)) || "";
}

function pickType(text: string) {
  const t = text.toLowerCase();
  return TYPES.find((x) => x.keys.some((k) => t.includes(k))) || {
    keys: [],
    label: "everyday bag",
    use: "daily essentials you actually carry",
  };
}

function litres(name: string) {
  const m = name.match(/(\d+)\s*(ltrs?|litres?|l\b)/i);
  return m ? `${m[1]}L` : "";
}

function sizeHint(name: string) {
  const inch = name.match(/(\d+)\s*-?\s*inch/i);
  if (inch) return `${inch[1]}-inch`;
  if (/cabin/i.test(name)) return "cabin size";
  if (/medium/i.test(name)) return "medium size";
  if (/large/i.test(name)) return "large size";
  if (/small/i.test(name)) return "small size";
  return "";
}

function material(text: string) {
  const t = text.toLowerCase();
  if (t.includes("jute")) return "jute";
  if (t.includes("faux leather") || t.includes("vegan leather")) return "vegan / faux leather";
  if (t.includes("leather")) return "leather";
  if (t.includes("hard luggage") || t.includes("hard shell") || t.includes("polycarbonate")) return "hard shell";
  if (t.includes("denim")) return "denim";
  if (t.includes("water resistant") || t.includes("rain cover")) return "water-resistant fabric";
  return "";
}

function audience(text: string) {
  const t = text.toLowerCase();
  if (t.includes("school") || t.includes("college") || t.includes("boys & girls")) return "school and college carry";
  if (t.includes("office") || t.includes("laptop") || t.includes("business")) return "office and laptop days";
  if (t.includes("women") || t.includes("ladies") || t.includes("womens")) return "everyday women's styling";
  if (t.includes("mens") || t.includes("men's")) return "everyday men's carry";
  if (t.includes("unisex")) return "unisex daily use";
  if (t.includes("travel") || t.includes("trolley") || t.includes("cabin")) return "travel days";
  return "daily Indian commute and errands";
}

function imageHints(image?: string | null) {
  if (!image) return { color: "", brand: "" };
  const file = decodeURIComponent(image.split("?")[0].split("/").pop() || "").replace(/[-_]/g, " ");
  return { color: pickColor(file), brand: /skybags/i.test(file) ? "Skybags" : /mokobara/i.test(file) ? "Mokobara" : "" };
}

function inr(n: number) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function rotate<T>(id: number, items: T[]): T {
  return items[Math.abs(id) % items.length];
}

export function buildProductDescription(p: ProductFactsInput) {
  const blob = hay(p);
  const img = imageHints(p.image);
  const color = pickColor(p.name) || img.color;
  const kind = pickType(`${p.name} ${p.category}`);
  const vol = litres(p.name);
  const size = sizeHint(p.name);
  const mat = material(blob);
  const who = audience(blob);
  const brand = p.brand && p.brand !== "undefined" ? p.brand : img.brand || "MySkyBuy";
  const bits = [color && `${color} colour`, vol && `${vol} capacity`, size, mat].filter(Boolean).join(", ");

  const p1 = rotate(p.id, [
    `${p.name} is a ${kind.label} from ${brand}${bits ? ` (${bits})` : ""}. The listing photo matches this title — not a generic category shot — so what you see is the piece you add to cart.`,
    `This listing is ${p.name} by ${brand}: a ${kind.label}${bits ? ` in ${bits}` : ""}. Built around the title and product image, not a one-line category blurb.`,
    `${brand}’s ${p.name} shows as a ${kind.label} in the photos${color ? `, with a ${color} finish` : ""}${vol ? ` and about ${vol} of pack space` : ""}.`,
  ]);

  const p2 = rotate(p.id + 3, [
    `Use it for ${who}: it should hold ${kind.use}. Current MySkyBuy price ${inr(p.salePrice)}${p.price > p.salePrice ? ` (MRP ${inr(p.price)})` : ""}.`,
    `Pick this if you need ${kind.use} for ${who}. You pay ${inr(p.salePrice)} on this page${p.price > p.salePrice ? `, marked down from ${inr(p.price)}` : ""}.`,
    `Made for ${who}. Pack ${kind.use}. Listed at ${inr(p.salePrice)} — compare the title (size/colour) with the image before you checkout.`,
  ]);

  const combo = /combo|set of|pack/i.test(p.name)
    ? ` Title says combo/set — count the pieces in the photo and name, not a single bag.`
    : ` Sold as this single listing unless the title names a set.`;

  const p3 = rotate(p.id + 7, [
    `Wipe ${p.name} dry after dusty travel; skip the washing machine. Stock, colour and hardware are confirmed at fulfilment.${combo}`,
    `Keep ${p.name} away from standing water overnight. Returns need tags within 7 days.${combo}`,
    `Check zippers when ${p.name} arrives — first wear point. MySkyBuy ships this exact title/image pair as shown.${combo}`,
  ]);

  return `${p1}\n\n${p2}\n\n${p3}`;
}
