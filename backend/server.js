import express from "express";
import cors from "cors";
import { processCommand, getShoppingList } from "./commands.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/command", (req, res) => {
  const { command, lang } = req.body;
  const result = processCommand(command, lang);
  res.json(result);
});

// ✅ new route to get saved shopping list
app.get("/shopping-list", (req, res) => {
  res.json({ shoppingList: getShoppingList() });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
