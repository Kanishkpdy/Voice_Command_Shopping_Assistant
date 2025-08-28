import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { languages } from "./languages/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsPath = path.join(__dirname, "data", "products.json");
const listPath = path.join(__dirname, "data", "shoppingList.json");

const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

// ✅ Load saved list if exists
let shoppingList = [];
if (fs.existsSync(listPath)) {
  try {
    shoppingList = JSON.parse(fs.readFileSync(listPath, "utf-8"));
  } catch {
    shoppingList = [];
  }
}

const saveList = () => {
  fs.writeFileSync(listPath, JSON.stringify(shoppingList, null, 2));
};

// --- Helpers ---
const clean = (s) => (s || "").toLowerCase().trim();

function canonicalName(name) {
  const n = clean(name);
  if (!n) return "";
  for (const p of products) {
    for (const alias of p.names) {
      if (clean(alias) === n) return p.names[0].toLowerCase();
    }
  }
  for (const p of products) {
    for (const alias of p.names) {
      if (clean(alias).includes(n) || n.includes(clean(alias))) {
        return p.names[0].toLowerCase();
      }
    }
  }
  return n;
}

function getProductByCanonical(canon) {
  return products.find((p) => p.names[0].toLowerCase() === canon);
}

function categorize(canon) {
  const p = getProductByCanonical(canon);
  return p ? p.category : "Other";
}

function extractItemAfterRemovingKeywords(command, words) {
  const pattern = new RegExp(
    words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
    "gi"
  );
  return clean(command.replace(pattern, " "))
    .replace(/\s+/g, " ")
    .trim();
}

// --- Main Processor ---
export function processCommand(command, lang = "en") {
  const cfg = languages[lang] || languages.en;
  const lower = clean(command);

  // --- ADD ---
  if (cfg.keywords.add.some((k) => lower.includes(k))) {
    let qty = 1;
  const m = lower.match(/(\d+)/);
  if (m) qty = parseInt(m[1]);

  let itemRaw = extractItemAfterRemovingKeywords(lower, [
    ...cfg.keywords.add,
    "to my list",
  ]);

  // 🔥 Remove any numbers from the item name
  itemRaw = itemRaw.replace(/\d+/g, "").trim();

  const canon = canonicalName(itemRaw);

    if (!canon)
      return { message: "Please specify an item to add.", shoppingList, results: [], suggestions: [] };

    const existing = shoppingList.find((i) => i.name === canon);
    if (existing) existing.quantity += qty;
    else
      shoppingList.push({
        name: canon,
        quantity: qty,
        category: categorize(canon),
      });

    saveList(); // ✅ persist
    return { message: `Added ${qty} ${canon}`, shoppingList, results: [], suggestions: [] };
  }

  // --- REMOVE ---
  if (cfg.keywords.remove.some((k) => lower.includes(k))) {
    const itemRaw = extractItemAfterRemovingKeywords(lower, cfg.keywords.remove);
    const canon = canonicalName(itemRaw);
    if (!canon) return { message: "Please specify what to remove.", shoppingList, results: [], suggestions: [] };

    const before = shoppingList.length;
    shoppingList = shoppingList.filter((i) => i.name !== canon);
    const removed = before !== shoppingList.length;

    saveList(); // ✅ persist
    return {
      message: removed ? `Removed ${canon}` : `${canon} not found`,
      shoppingList,
      results: [],
      suggestions: [],
    };
  }

  // --- SEARCH ---
  if (cfg.keywords.search.some((k) => lower.includes(k))) {
    let query = extractItemAfterRemovingKeywords(lower, cfg.keywords.search);
    let maxPrice = null;

    if (cfg.regex?.priceUnder) {
      const underMatch = lower.match(cfg.regex.priceUnder);
      if (underMatch) maxPrice = parseInt(underMatch[1]);
    }

    let results = products.filter((p) =>
      p.names.some((n) => clean(n).includes(query))
    );
    if (maxPrice !== null) results = results.filter((p) => p.price <= maxPrice);

    return { message: `Found ${results.length} items`, results, shoppingList, suggestions: [] };
  }

  // --- Default ---
  return { message: `Command not understood: "${command}"`, shoppingList, results: [], suggestions: [] };
}

// --- Exports ---
export function getShoppingList() {
  return shoppingList;
}

export function getProducts() {
  return products;
}
