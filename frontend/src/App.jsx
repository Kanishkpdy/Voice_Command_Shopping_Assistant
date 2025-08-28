import React, { useState, useEffect } from "react";
import "./App.css";

import Header from "./pages/Header.jsx";
import VoiceInput from "./pages/VoiceInput.jsx";
import ShoppingList from "./pages/ShoppingList.jsx";
import SearchResults from "./pages/SearchResults.jsx";

export default function App() {
  const [language, setLanguage] = useState("en");
  const [status, setStatus] = useState("Idle");
  const [shoppingList, setShoppingList] = useState([]);
  const [results, setResults] = useState([]);
  const [transcript, setTranscript] = useState("");

  // 🔥 Load saved shopping list on page refresh
  useEffect(() => {
    fetch("http://localhost:5000/shopping-list")
      .then((res) => res.json())
      .then((data) => {
        if (data?.shoppingList) {
          setShoppingList(data.shoppingList);
        }
      })
      .catch((err) => console.error("Failed to fetch list:", err));
  }, []);

  return (
    <div className="app-container">
      <Header language={language} setLanguage={setLanguage} />

      <main className="app-main">
        <div className="voice-box">
          <p className="transcript">
            {transcript || "Tap the mic and start speaking..."}
          </p>
          <VoiceInput
            language={language}
            setStatus={setStatus}
            setShoppingList={setShoppingList}
            setResults={setResults}
            transcript={transcript}
            setTranscript={setTranscript}
          />
        </div>

        <p className="status-line">Status: {status}</p>

        <ShoppingList shoppingList={shoppingList} />
        <SearchResults results={results} />
      </main>
    </div>
  );
}

