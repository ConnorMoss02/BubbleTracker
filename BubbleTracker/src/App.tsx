import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AIBubbleDashboard } from "./components/AIBubbleDashboard";
import { TickerPage } from "./components/TickerPage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AIBubbleDashboard />} />
        <Route path="/ticker/:symbol" element={<TickerPage />} />
      </Routes>
    </BrowserRouter>
  );
}