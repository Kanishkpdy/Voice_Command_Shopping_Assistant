import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Fuse from "fuse.js";
import { languages } from "./languages/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsPath = path.join(__dirname, "data", "products.json");
const listPath = path.join(__dirname, "data", "shoppinglist.json");

// --------- load data & shopping list ----------
const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

let shoppingList = [];
if (fs.existsSync(listPath)) {
  try {
    shoppingList = JSON.parse(fs.readFileSync(listPath, "utf-8"));
  } catch {
    shoppingList = [];
  }
}
function saveList() {
  fs.writeFileSync(listPath, JSON.stringify(shoppingList, null, 2));
}

// --------- utilities ----------
function normalizeName(str = "") {
  if (str === null || str === undefined) return "";
  let s = String(str).toLowerCase().trim();
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, ""); // invisible
  return s.replace(/\s+/g, " ").trim();
}

// --------- product canonicalization ----------
const synonymMap = {}; // alias -> canonical
const productIndex = [];

for (const p of products) {
  const aliases = Array.isArray(p.names) && p.names.length ? p.names : (p.name ? [p.name] : []);
  if (aliases.length === 0) continue;
  const canonicalRaw = aliases[0];
  const canonicalNorm = normalizeName(canonicalRaw);
  const normalizedAliases = aliases.map(a => normalizeName(a)).filter(Boolean);
  normalizedAliases.forEach(a => {
    if (a) synonymMap[a] = canonicalNorm;
  });
  productIndex.push({ canonical: canonicalNorm, allNames: normalizedAliases, category: p.category || "Other" });
}

const fuse = new Fuse(productIndex, { keys: ["allNames"], threshold: 0.34, ignoreLocation: true });

function resolveCanonical(rawProductText) {
  const candidate = normalizeName(rawProductText);
  if (!candidate) return "";

  if (synonymMap[candidate]) return synonymMap[candidate];

  // check substrings
  for (const alias in synonymMap) {
    if (candidate.includes(alias)) return synonymMap[alias];
  }

  // fuzzy
  const res = fuse.search(candidate);
  if (res && res.length) return res[0].item.canonical;

  // fallback: return input itself
  return candidate;
}

function findCategoryByCanonical(canonical) {
  const p = productIndex.find(pp => pp.canonical === canonical);
  return p ? p.category : "Other";
}
function findInListByCanonical(canonical) {
  const key = normalizeName(canonical);
  return shoppingList.find(i => normalizeName(i.name) === key);
}

// ---------- operations ----------
function addItem(rawProductText, qty = 1, messages = {}) {
  const canonical = resolveCanonical(rawProductText);
  if (!canonical) {
    const msg = (messages?.notFound || "{item} not found").replace("{item}", rawProductText);
    return { message: msg, shoppingList, suggestions: [] };
  }

  const category = findCategoryByCanonical(canonical);

  // Get price from product, default 0 if not present
  const prod = products.find(p => p.names[0] === canonical);
  const price = prod?.price || 0;

  const existing = findInListByCanonical(canonical);
  if (existing) {
    existing.quantity += qty;
    existing.price = price; // update price if needed
  } else {
    shoppingList.push({ name: canonical, quantity: qty, category, price });
  }

  saveList();

  const item = findInListByCanonical(canonical);
  const msg = (messages?.added || "{quantity} × {item} added")
    .replace("{quantity}", item.quantity)
    .replace("{item}", item.name);

  return { message: msg, shoppingList, suggestions: [] };
}


function removeItem(rawProductText, qty = 1, messages = {}) {
  const canonical = resolveCanonical(rawProductText);
  if (!canonical) {
    const msg = (messages?.notFound || "{item} not found").replace("{item}", rawProductText);
    return { message: msg, shoppingList, suggestions: [] };
  }
  const existing = findInListByCanonical(canonical);
  if (!existing) {
    const msg = (messages?.notFound || "{item} not found").replace("{item}", canonical);
    return { message: msg, shoppingList, suggestions: [] };
  }
  existing.quantity -= qty;
  if (existing.quantity <= 0)
    shoppingList = shoppingList.filter(i => normalizeName(i.name) !== normalizeName(canonical));
  saveList();
  const msg = (messages?.removed || "{item} removed").replace("{item}", canonical);
  return { message: msg, shoppingList, suggestions: [] };
}

// ---------- main ----------
export function processCommand(input, lang = "en") {
  const raw = String(input || "").trim();
  if (!raw) return { message: "Say 'Add milk' or 'Remove bread'", shoppingList, suggestions: [] };

  // detect basic intent (very simplified for clarity)
  const low = raw.toLowerCase();
  let intent = "add";
  if (low.includes("remove") || low.includes("delete")) intent = "remove";

  // very simple qty detect
  const qtyMatch = raw.match(/\d+/);
  const quantity = qtyMatch ? parseInt(qtyMatch[0], 10) : 1;

  // product text (remove intent word)
  const productText = raw.replace(/add|remove|delete/gi, "").trim();

  switch (intent) {
    case "remove":
      return removeItem(productText, quantity, {});
    case "add":
    default:
      return addItem(productText, quantity, {});
  }
}

export function getShoppingList() {
  return shoppingList;
}
export function getProducts() {
  return products;
}
