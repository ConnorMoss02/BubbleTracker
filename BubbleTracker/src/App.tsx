import "./App.css";
// (optional) you can remove this if you’re not using it anymore
// import MarketDemo from "./assets/lib/MarketDemo"; 

import { AIBubbleDashboard } from "./components/AIBubbleDashboard";

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <AIBubbleDashboard />
    </div>
  );
}