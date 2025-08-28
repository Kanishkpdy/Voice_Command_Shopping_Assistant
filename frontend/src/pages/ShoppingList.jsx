import React from "react";

export default function ShoppingList({ shoppingList }) {
  return (
    <section className="section">
      <h2>Your Shopping List</h2>
      {shoppingList.length === 0 ? (
        <p className="empty">No items yet</p>
      ) : (
        <ul className="list">
          {shoppingList.map((item, i) => (
            <li key={i} className="list-item">
              {item.name} (x{item.quantity}) [{item.category}]
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
