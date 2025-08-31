import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { Mic } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");
  const [message, setMessage] = useState("");
  const [shoppingList, setShoppingList] = useState([]);
  const [products, setProducts] = useState([]);
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [lang, setLang] = useState("en");
  const [speechLang, setSpeechLang] = useState("en-US");
  const recogRef = useRef(null);

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadShoppingList();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    }
  }

  async function loadShoppingList() {
    try {
      const res = await fetch(`${API_BASE}/shopping-list`);
      const data = await res.json();
      setShoppingList(data.shoppingList || []);
      fetchSuggestions(data.shoppingList || []);
    } catch {
      setShoppingList([]);
      setSuggestions([]);
    }
  }

  async function fetchSuggestions(list) {
    try {
      const res = await fetch(`${API_BASE}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shoppingList: list, lang }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch {
      setSuggestions([]);
    }
  }

  // Initialize SpeechRecognition
  function initRecognition() {
    if (recogRef.current) return recogRef.current;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("SpeechRecognition not supported in this browser.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = speechLang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => console.error("SpeechRecognition error:", e);

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += result + " ";
        else interimTranscript += result + " ";
      }

      setInterim(interimTranscript.trim());

      if (finalTranscript.trim()) {
        setFinalText(finalTranscript.trim());
        handleFinalCommand(finalTranscript.trim());
        setInterim("");
      }
    };

    recogRef.current = recognition;
    return recognition;
  }

  function toggleListen() {
    const recognition = initRecognition();
    if (!recognition) return;

    if (listening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }

  async function handleFinalCommand(text) {
    setMessage("Processing...");
    try {
      const res = await fetch(`${API_BASE}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: text, lang }),
      });
      const data = await res.json();
      setShoppingList(data.shoppingList || []);
      setResults(data.results || []);
      setSuggestions(data.suggestions || []);
      setMessage(data.message || "Done");
      // clear only after response
      setFinalText("");
    } catch {
      setMessage("Server error");
    }
  }

  async function updateQuantity(name, newQty) {
    try {
      const res = await fetch(`${API_BASE}/shopping-list/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity: newQty }),
      });
      const data = await res.json();
      setShoppingList(data.shoppingList || []);
      fetchSuggestions(data.shoppingList || []);
    } catch {
      console.error("Failed to update item");
    }
  }

  function handleLangChange(e) {
    const newSpeechLang = e.target.value;
    setSpeechLang(newSpeechLang);
    const map = { "en-US": "en", "hi-IN": "hi", "es-ES": "es", "fr-FR": "fr" };
    setLang(map[newSpeechLang] || "en");

    if (recogRef.current) {
      recogRef.current.stop();
      recogRef.current = null;
    }
  }

  function renderProductCard(p, i) {
    const name = Array.isArray(p.names) ? p.names[0] : p.name || p.names;
    return (
      <div key={i} className="prod-card">
        <div className="prod-name">{name}</div>
        <div className="prod-meta">
          {p.category || "Other"} • ₹{p.price || "-"}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="top">
        <h1>Voice Shopping</h1>
        <p className="sub">Say commands like "Add 2 milk" or "Remove bread"</p>
      </header>
      <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #555; max-width: 700px; margin: 20px auto; padding: 15px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
    <p><strong>Disclaimer:</strong> 
    The backend runs on a free-tier server and may take up to 50 seconds to start. Use at your own risk; developers are not liable for any issues.</p>
  </div>

  
      <div className="language-select">
        <label htmlFor="lang">Language: </label>
        <select id="lang" value={speechLang} onChange={handleLangChange}>
          <option value="en-US">English</option>
          <option value="hi-IN">Hindi</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
        </select>
      </div>

      <div className="mic-area">
        <button
          className={`mic-btn ${listening ? "listening" : ""}`}
          onClick={toggleListen}
        >
          {listening ? <span>● Listening...</span> : <Mic />}
        </button>
        <div className="transcript">
          <div className="final">{finalText}</div>
          <div className="interim">{interim}</div>
        </div>
        <div className="status">{message}</div>
      </div>

      <div className="suggestions">
        {suggestions.map((s, idx) => (
          <div key={idx} className="suggestion-chip">
            {typeof s === "string" ? s : s.name}
          </div>
        ))}
      </div>

      <section className="panels">
        <div className="panel">
          <h3>Your list</h3>
          <ul>
            {shoppingList.map((it, idx) => (
              <li key={idx} className="shopping-item">
                <div>
                  {it.quantity ? `${it.quantity} × ` : ""}
                  {it.name}
                  {it.category && (
                    <span
                      style={{
                        fontSize: "0.8em",
                        color: "#888",
                        marginLeft: "10px",
                      }}
                    >
                      ({it.category})
                    </span>
                  )}
                  {it.price !== null && it.price !== undefined && (
                    <span style={{ marginLeft: "10px", color: "#444" }}>
                      = ₹{(it.price * it.quantity).toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="controls">
                  <button onClick={() => updateQuantity(it.name, it.quantity + 1)}>+</button>
                  <button onClick={() => updateQuantity(it.name, it.quantity - 1)}>-</button>
                </div>
              </li>
            ))}
          </ul>
          <div
            style={{
              marginTop: "10px",
              padding: "8px",
              borderTop: "1px solid #ddd",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            Grand Total: ₹
            {shoppingList
              .reduce(
                (sum, it) =>
                  sum + (it.price && it.quantity ? it.price * it.quantity : 0),
                0
              )
              .toFixed(2)}
          </div>
        </div>

        <div className="panel">
          <h4>Search results</h4>
          <ul>
            {results.length > 0 ? (
              results.map((r, i) => (
                <li key={i}>
                  {r.name} <span
                      style={{
                        fontSize: "0.8em",
                        color: "#888"
                      }}
                    >
                      ({r.category})
                    </span> - ₹{r.price}
                </li>
              ))
            ) : (
              <p style={{ fontStyle: "italic", color: "#888" }}>
                Tap the mic and say "search ..."
              </p>
            )}
          </ul>
        </div>
      </section>

      <section className="inventory">
        <h3>Inventory</h3>
        <div className="grid">{products.map(renderProductCard)}</div>
      </section>

      <footer className="foot">By Kanishk Pandey</footer>
    </div>
  );
}
