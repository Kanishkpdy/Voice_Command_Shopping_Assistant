import React from "react";

export default function Header({ language, setLanguage }) {
  return (
    <header className="app-header">
      <h1 className="logo">🛒 Voice Shopping</h1>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="lang-select"
      >
        <option value="en">English</option>
        <option value="hi">Hindi</option>
      </select>
    </header>
  );
}
