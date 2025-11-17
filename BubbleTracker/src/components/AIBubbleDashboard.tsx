import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useMarketData } from "../assets/lib/useMarketData";
import { TICKERS } from "../lib/market";
import type { Quote } from "../types/marketType";

type IconProps = React.SVGProps<SVGSVGElement>;

const TrendingUpIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M3 17l6-6 4 4 8-8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 5h8v8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrendingDownIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M3 7l6 6 4-4 8 8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 11v8h-8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ActivityIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M3 12h4l2.5-6 5 12 2.5-6H21" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function computeHeat(quotes: Record<string, Quote>): number {
  const values = Object.values(quotes);
  if (!values.length) return 0;
  const avg = values.reduce((sum, q) => sum + q.changePct, 0) / values.length;
  return clamp(avg, -5, 5);
}

function getHeatLabel(heat: number): string {
  if (heat >= 3) return "Very hot";
  if (heat >= 1) return "Heating up";
  if (heat <= -2) return "Risk-off";
  if (heat < 0) return "Cooling";
  return "Balanced";
}

export function AIBubbleDashboard() {
  const navigate = useNavigate();
  const { snapshot, loading, error } = useMarketData({
    intervalMs: 15000,
    tickers: TICKERS,
  });

  const quotes = snapshot?.quotes ?? {};
  const heat = computeHeat(quotes);
  const [bubbleSize, setBubbleSize] = useState(260);
  const [highlightedTicker, setHighlightedTicker] = useState<string | null>(null);

  useEffect(() => {
    const base = 260;
    const delta = heat * 12;
    const target = clamp(base + delta, 180, 320);

    let current = bubbleSize;
    const id = window.setInterval(() => {
      const diff = target - current;
      if (Math.abs(diff) < 0.5) {
        current = target;
        setBubbleSize(target);
        window.clearInterval(id);
        return;
      }
      current += diff * 0.15;
      setBubbleSize(current);
    }, 40);

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heat]);

  const asOf = snapshot?.asOf;
  const provider = snapshot?.provider ?? "—";

  const allQuotes = Object.values(quotes);
  const up = allQuotes.filter((q) => q.changePct > 0).length;
  const down = allQuotes.filter((q) => q.changePct < 0).length;
  const sorted = allQuotes.length ? [...allQuotes].sort((a, b) => b.changePct - a.changePct) : [];
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const heatLabel = getHeatLabel(heat);
  const heatPercent = clamp((heat + 5) / 10, 0, 1) * 100;
  const totalNames = TICKERS.length;

  const handleTickerClick = (ticker: string) => {
    setHighlightedTicker(ticker);
    navigate(`/ticker/${ticker}`);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_60%)]" />
      <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-gradient-to-b from-cyan-500/10 via-transparent to-indigo-600/10 blur-3xl" />

      <main className="relative max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Market monitor</p>
            <h1 className="text-4xl font-semibold text-white tracking-tight">AI Bubble Tracker</h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              A modern pulse of GPUs, hyperscalers, and AI platforms with live quotes, breadth, and extremes all on one page.
            </p>
          </div>
          <div className="text-sm text-slate-400 space-y-1">
            <p>
              {loading
                ? "Syncing latest quotes..."
                : asOf
                ? `Updated ${new Date(asOf).toLocaleTimeString()}`
                : "Waiting for data"}
            </p>
            <p>
              Provider: <span className="text-slate-100">{provider}</span>
            </p>
            {error && <p className="text-xs text-rose-400">{error}</p>}
          </div>
        </header>

        <section className="flex flex-col items-center gap-10 lg:flex-row lg:items-stretch">
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-[-140px] bg-[radial-gradient(circle,_rgba(14,165,233,0.2),_transparent_70%)] blur-3xl" />
              <svg
                width={bubbleSize}
                height={bubbleSize}
                viewBox="0 0 200 200"
                className="transition-all duration-300 ease-out drop-shadow-[0_25px_70px_rgba(8,145,178,0.35)]"
              >
                <circle cx="100" cy="100" r="95" fill="url(#bubbleGradient)" opacity="0.25" />
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="url(#bubbleGradient)"
                  stroke="url(#bubbleStroke)"
                  strokeWidth="2"
                  opacity="0.95"
                />
                <ellipse cx="72" cy="72" rx="30" ry="34" fill="white" opacity="0.32" />
                <ellipse cx="72" cy="72" rx="16" ry="20" fill="white" opacity="0.6" />
                <circle cx="100" cy="100" r="86" fill="none" stroke="url(#rainbow)" strokeWidth="3" opacity="0.9" />
                <defs>
                  <radialGradient id="bubbleGradient">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
                    <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.75" />
                  </radialGradient>
                  <linearGradient id="bubbleStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                  <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="25%" stopColor="#facc15" />
                    <stop offset="50%" stopColor="#22c55e" />
                    <stop offset="75%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center pointer-events-none">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-200">Heat</p>
                <p className={`text-4xl font-semibold ${heat > 0 ? "text-emerald-300" : heat < 0 ? "text-rose-300" : "text-slate-100"}`}>
                  {heat > 0 ? "+" : ""}
                  {heat.toFixed(2)}%
                </p>
                <p className="text-sm text-slate-200/70">{heatLabel}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-6 space-y-6 shadow-[0_25px_80px_rgba(15,23,42,0.65)]">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Market temperature</p>
                <div className="flex items-baseline gap-3">
                  {heat > 0 ? (
                    <TrendingUpIcon className="w-5 h-5 text-emerald-400" />
                  ) : heat < 0 ? (
                    <TrendingDownIcon className="w-5 h-5 text-rose-400" />
                  ) : (
                    <ActivityIcon className="w-5 h-5 text-slate-300" />
                  )}
                  <p className="text-2xl font-semibold">
                    {heat > 0 ? "+" : ""}
                    {heat.toFixed(2)}%
                  </p>
                </div>
                <p className="text-sm text-slate-400">
                  {heatLabel} · Average intraday move across {totalNames} AI names.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Cold</span>
                  <span>Hot</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 via-emerald-400 to-rose-500 transition-all duration-300"
                    style={{ width: `${heatPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm text-slate-200">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Names</p>
                  <p className="text-2xl font-semibold">{allQuotes.length || totalNames}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Up today</p>
                  <p className="text-2xl font-semibold text-emerald-400">{up}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Down today</p>
                  <p className="text-2xl font-semibold text-rose-400">{down}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Strongest</p>
                  {best ? (
                    <div className="mt-1">
                      <p className="text-lg font-semibold">{best.ticker}</p>
                      <p className="text-emerald-400 text-sm">+{best.changePct.toFixed(2)}%</p>
                    </div>
                  ) : (
                    <p className="text-slate-500 mt-1">Waiting for data</p>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Weakest</p>
                  {worst ? (
                    <div className="mt-1">
                      <p className="text-lg font-semibold">{worst.ticker}</p>
                      <p className="text-rose-400 text-sm">{worst.changePct.toFixed(2)}%</p>
                    </div>
                  ) : (
                    <p className="text-slate-500 mt-1">Waiting for data</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 space-y-5 shadow-[0_25px_80px_rgba(15,23,42,0.55)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">AI watchlist</h2>
              <p className="text-sm text-slate-400">Click any ticker to open its company view with price and news.</p>
            </div>
            <div className="text-sm text-slate-400">
              {loading ? "Streaming quotes…" : "Live"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {TICKERS.map((ticker) => {
              const q = quotes[ticker];
              const change = typeof q?.changePct === "number" ? q.changePct : 0;
              const price = typeof q?.price === "number" ? q.price : null;
              const isSelected = highlightedTicker === ticker;
              const changeLabel = change === 0 ? "0.00%" : `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;

              return (
                <button
                  key={ticker}
                  type="button"
                  onMouseEnter={() => setHighlightedTicker(ticker)}
                  onMouseLeave={() => setHighlightedTicker(null)}
                  onClick={() => handleTickerClick(ticker)}
                  className={[
                    "rounded-2xl border px-3 py-3 text-left text-sm transition-all",
                    "bg-slate-900/50 hover:bg-slate-900/80 hover:-translate-y-0.5",
                    "shadow-[0_10px_25px_rgba(15,23,42,0.35)]",
                    isSelected ? "border-cyan-400 shadow-cyan-400/40" : "border-slate-800",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold tracking-wide">{ticker}</span>
                    <span
                      className={
                        change > 0
                          ? "text-emerald-400"
                          : change < 0
                          ? "text-rose-400"
                          : "text-slate-400"
                      }
                    >
                      {changeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{price !== null ? `$${price.toFixed(2)}` : "—"}</p>
                </button>
              );
            })}
          </div>
        </section>

        <footer className="text-xs text-slate-500 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span>For research and entertainment only. Not investment advice.</span>
          <span>Built on live market data.</span>
        </footer>
      </main>
    </div>
  );
}
