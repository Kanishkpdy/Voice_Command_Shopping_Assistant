import React from "react";

export default function SearchResults({ results }) {
  return (
    <section className="section">
      <h2>Search & Suggestions</h2>
      {results.length === 0 ? (
        <p className="empty">No results yet</p>
      ) : (
        <ul className="list">
          {results.map((r, i) => (
            <li key={i} className="list-item">
              {r.name ? `${r.name} - ₹${r.price}` : r}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
