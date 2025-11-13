import React from "react";
import { useMarketData } from "./useMarketData";

export default function MarketDemo() {
  const { snapshot, loading, error } = useMarketData({ intervalMs: 5000 }); // 5s for testing
  const quotes = snapshot?.quotes ?? {};
  const asOf = snapshot?.asOf ?? 0;
  const provider = snapshot?.provider ?? "—";

  return (
    <div style={{ padding: 16, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Live Market Snapshot</h1>
      <div style={{ color: "#555", fontSize: 12, marginBottom: 12 }}>
        {loading ? "Loading…" :
         error ? `Error: ${error}` :
         `Updated: ${new Date(asOf).toLocaleTimeString()} • Source: ${provider}`}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 8 }}>
        {Object.values(quotes).map((q) => (
          <div key={q.ticker} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600 }}>{q.ticker}</div>
            <div style={{ fontSize: 12 }}>Price: {q.price.toFixed(2)}</div>
            <div style={{ fontSize: 12, color: q.changePct >= 0 ? "#047857" : "#b91c1c" }}>
              {q.changePct >= 0 ? "+" : ""}{q.changePct.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
