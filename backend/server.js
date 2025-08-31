import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { processCommand, getShoppingList, getProducts } from "./commands.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const PRODUCTS = getProducts();

function saveShoppingList(list) {
  const file = path.join(__dirname, "data", "shoppinglist.json");
  fs.writeFileSync(file, JSON.stringify(list, null, 2));
}

function normalizeName(name = "") {
  return name.trim().toLowerCase();
}

// Local fallback suggestions
function pickLocalSuggestions(shoppingList = []) {
  const existing = new Set((shoppingList || []).map(i => normalizeName(i.name)));
  const picks = [];
  for (const p of PRODUCTS) {
    const n = Array.isArray(p.names) ? p.names[0] : p.name || p.names;
    if (!existing.has(normalizeName(n))) {
      picks.push(n);
    }
    if (picks.length >= 6) break;
  }
  return { suggestions: picks };
}

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) throw new Error("No Gemini key");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    data.candidates?.[0]?.content?.[0]?.text ||
    JSON.stringify(data)
  );
}

function tryParseJSONLenient(s) {
  if (!s || typeof s !== "string") throw new Error("No text");
  try { return JSON.parse(s); } catch {}
  const m = s.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("No JSON block");
  return JSON.parse(m[0]);
}

// Generate suggestions
async function getSuggestions(shoppingList = [], contextResults = []) {
  if (!GEMINI_API_KEY) return pickLocalSuggestions(shoppingList);

  const listText = JSON.stringify(shoppingList || []);
  const ctx = contextResults?.length ? `Search results: ${JSON.stringify(contextResults.slice(0, 6))}` : "";

  const prompt = `You are a helpful shopping assistant.
Given this shopping list: ${listText}. ${ctx}
Suggest up to 6 items the user is likely to need next.
Return only valid JSON in the form: { "suggestions": ["item1","item2","item3", ...] }.
Avoid items already in the list.`;

  try {
    const out = await callGemini(prompt);
    const parsed = tryParseJSONLenient(out);
    if (parsed && Array.isArray(parsed.suggestions)) {
      return { suggestions: parsed.suggestions.map(s => typeof s === "string" ? s : s.name || "").filter(Boolean) };
    }
    return pickLocalSuggestions(shoppingList);
  } catch (err) {
    console.warn("Gemini suggestions failed:", String(err).slice(0, 200));
    return pickLocalSuggestions(shoppingList);
  }
}

/* --- Routes --- */
app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/products", (req, res) => res.json({ products: getProducts() }));
app.get("/shopping-list", (req, res) => res.json({ shoppingList: getShoppingList() }));

// Main command endpoint
app.post("/command", async (req, res) => {
  try {
    const { command, lang } = req.body || {};
    const result = processCommand(command || "", lang || "en");

    // Always reload the canonical saved list
    const shoppingList = getShoppingList();

    // Get suggestions separately
    const s = await getSuggestions(shoppingList, result.results || []);
    result.suggestions = s.suggestions || [];
    result.shoppingList = shoppingList;

    res.json(result);
  } catch (err) {
    console.error("command error:", err);
    res.status(500).json({ error: "Command failed", details: String(err) });
  }
});

// Suggestions endpoint
app.post("/suggest", async (req, res) => {
  try {
    const { shoppingList } = req.body || {};
    const s = await getSuggestions(shoppingList || [], []);
    res.json(s);
  } catch (err) {
    console.error("suggest error:", err);
    res.status(500).json({ error: "Suggest failed", details: String(err) });
  }
});

// Update / remove item endpoint
app.post("/shopping-list/update", (req, res) => {
  const { name, quantity } = req.body;
  let shoppingList = getShoppingList();
  const normName = normalizeName(name);

  const idx = shoppingList.findIndex(i => normalizeName(i.name) === normName);
  if (idx >= 0) {
    if (quantity <= 0) shoppingList.splice(idx, 1);
    else shoppingList[idx].quantity = quantity;

    saveShoppingList(shoppingList);
    return res.json({ shoppingList });
  }

  res.json({ shoppingList, message: `Item "${name}" not found` });
});

/* --- Start server --- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
