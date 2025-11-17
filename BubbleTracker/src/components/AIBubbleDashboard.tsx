import React, { useEffect, useState } from "react";
import { useMarketData } from "../assets/lib/useMarketData";
import type { Quote } from "../types/marketType";
import { TICKERS } from "../lib/market";
import { TrendingUp, TrendingDown, Activity, X } from "lucide-react";

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
  const { snapshot, loading, error } = useMarketData({
    intervalMs: 15000,
    tickers: TICKERS,
  });

  const quotes = snapshot?.quotes ?? {};
  const heat = computeHeat(quotes);

  const [bubbleSize, setBubbleSize] = useState<number>(220);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  // Smooth bubble animation based on heat
  useEffect(() => {
    const base = 220;
    const delta = heat * 10;
    const target = clamp(base + delta, 160, 280);

    let current = bubbleSize;
    const id = window.setInterval(() => {
      const diff = target - current;
      if (Math.abs(diff) < 0.5) {
        current = target;
        setBubbleSize(target);
        window.clearInterval(id);
        return;
      }
      current += diff * 0.18;
      setBubbleSize(current);
    }, 40);

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heat]);

  const asOf = snapshot?.asOf ?? 0;
  const provider = snapshot?.provider ?? "—";

  const allQuotes = Object.values(quotes);
  const up = allQuotes.filter((q) => q.changePct > 0).length;
  const down = allQuotes.filter((q) => q.changePct < 0).length;

  const sorted = [...allQuotes].sort((a, b) => b.changePct - a.changePct);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const activeTicker = selectedTicker ?? best?.ticker ?? null;
  const activeQuote = activeTicker ? quotes[activeTicker] : null;

  const heatLabel = getHeatLabel(heat);
  const heatNorm = (heat + 5) / 10; // -5..+5 → 0..1
  const heatPercent = clamp(heatNorm, 0, 1) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-10">
        {/* Top bar */}
        <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              AI Bubble Tracker
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              A single view of the AI trade: GPUs, hyperscalers, and platforms,
              driven by live market data.
            </p>
          </div>
          <div className="text-xs text-slate-400 text-left md:text-right">
            <div>
              {loading
                ? "Loading..."
                : asOf
                ? `Updated ${new Date(asOf).toLocaleTimeString()}`
                : "Waiting for data"}
            </div>
            <div>Provider: {provider}</div>
            {error && (
              <div className="text-[11px] text-rose-400 mt-1">{error}</div>
            )}
          </div>
        </header>

        {/* Hero: bubble + summary */}
        <section className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Bubble as hero (no box) */}
          <div className="relative flex items-center justify-center flex-1 min-w-[260px]">
            <div className="absolute -inset-24 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.35),_transparent_60%)] pointer-events-none" />
            <svg
              width={bubbleSize}
              height={bubbleSize}
              viewBox="0 0 200 200"
              className="transition-all duration-300 ease-out relative"
              style={{
                filter:
                  "drop-shadow(0 0 40px rgba(34,211,238,0.7)) drop-shadow(0 0 70px rgba(129,140,248,0.5))",
              }}
            >
              <circle
                cx="100"
                cy="100"
                r="95"
                fill="url(#bubbleGradient)"
                opacity="0.25"
              />
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="url(#bubbleGradient)"
                stroke="url(#bubbleStroke)"
                strokeWidth="2"
                opacity="0.95"
              />
              <ellipse
                cx="72"
                cy="72"
                rx="30"
                ry="34"
                fill="white"
                opacity="0.32"
              />
              <ellipse
                cx="72"
                cy="72"
                rx="16"
                ry="20"
                fill="white"
                opacity="0.6"
              />
              <circle
                cx="100"
                cy="100"
                r="86"
                fill="none"
                stroke="url(#rainbow)"
                strokeWidth="3"
                opacity="0.9"
              />
              <defs>
                <radialGradient id="bubbleGradient">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
                  <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.75" />
                </radialGradient>
                <linearGradient
                  id="bubbleStroke"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient
                  id="rainbow"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="25%" stopColor="#facc15" />
                  <stop offset="50%" stopColor="#22c55e" />
                  <stop offset="75%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Summary + heat */}
          <div className="flex-1 max-w-md space-y-5">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Bubble heat
              </div>
              <div className="flex items-baseline gap-3 mt-2">
                {heat > 0 ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-2xl font-semibold text-emerald-400">
                      +{heat.toFixed(2)}%
                    </span>
                  </>
                ) : heat < 0 ? (
                  <>
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                    <span className="text-2xl font-semibold text-rose-400">
                      {heat.toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5 text-slate-300" />
                    <span className="text-2xl font-semibold text-slate-300">
                      0.00%
                    </span>
                  </>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-300">
                {heatLabel} — average intraday move across {TICKERS.length} AI
                names.
              </p>
            </div>

            {/* Heat bar + stats */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Cold</span>
                  <span>Hot</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 via-emerald-400 to-rose-500 transition-all duration-300"
                    style={{ width: `${heatPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm text-slate-200">
                <div>
                  <div className="text-xs text-slate-400">Names</div>
                  <div className="text-lg font-semibold">
                    {allQuotes.length || TICKERS.length}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Up today</div>
                  <div className="text-lg font-semibold text-emerald-400">
                    {up}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Down today</div>
                  <div className="text-lg font-semibold text-rose-400">
                    {down}
                  </div>
                </div>
              </div>

              <div className="flex gap-6 text-xs text-slate-300">
                <div className="flex-1">
                  <div className="text-slate-400 mb-0.5">Strongest</div>
                  {best ? (
                    <>
                      <div className="font-semibold">{best.ticker}</div>
                      <div className="text-emerald-400">
                        +{best.changePct.toFixed(2)}%
                      </div>
                    </>
                  ) : (
                    <div>-</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-slate-400 mb-0.5">Weakest</div>
                  {worst ? (
                    <>
                      <div className="font-semibold">{worst.ticker}</div>
                      <div className="text-rose-400">
                        {worst.changePct.toFixed(2)}%
                      </div>
                    </>
                  ) : (
                    <div>-</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ticker grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">
              Underlying names
            </h2>
            <span className="text-[11px] text-slate-500">
              {loading ? "Streaming live data" : "Live"}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {TICKERS.map((ticker) => {
              const q = quotes[ticker];
              const price = q?.price ?? null;
              const change = q?.changePct ?? 0;
              const isUp = change > 0;

              const isSelected = ticker === activeTicker;

              return (
                <button
                  key={ticker}
                  type="button"
                  onClick={() => setSelectedTicker(ticker)}
                  className={[
                    "group relative rounded-xl px-3 py-2.5 text-left text-xs transition-all",
                    "bg-slate-900/70 border border-slate-800 hover:border-slate-500 hover:bg-slate-900",
                    "hover:-translate-y-[2px] hover:shadow-lg hover:shadow-slate-900/70",
                    isSelected && "border-cyan-400 shadow-cyan-400/40 shadow-md",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-100">
                      {ticker}
                    </span>
                    <span
                      className={[
                        "font-medium",
                        change > 0
                          ? "text-emerald-400"
                          : change < 0
                          ? "text-rose-400"
                          : "text-slate-400",
                      ].join(" ")}
                    >
                      {change === 0
                        ? "0.00%"
                        : `${isUp ? "+" : ""}${change.toFixed(2)}%`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {price ? `$${price.toFixed(2)}` : "—"}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>For research and entertainment only. Not investment advice.</span>
          <span>Built on live market data.</span>
        </footer>
      </main>

      {/* Simple full-screen "profile" overlay for a ticker */}
      {activeQuote && selectedTicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-800 px-5 py-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Company profile
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-semibold">
                    {activeQuote.ticker}
                  </span>
                  <span className="text-sm text-slate-400">
                    ${activeQuote.price.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicker(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm mb-4">
              <div>
                <div className="text-xs text-slate-400">Today</div>
                <div
                  className={
                    activeQuote.changePct > 0
                      ? "text-emerald-400 font-semibold"
                      : activeQuote.changePct < 0
                      ? "text-rose-400 font-semibold"
                      : "text-slate-200 font-semibold"
                  }
                >
                  {activeQuote.changePct > 0 ? "+" : ""}
                  {activeQuote.changePct.toFixed(2)}%
                </div>
              </div>
              <div className="text-xs text-slate-500">
                This overlay is where you can plug in a news feed, company stats
                or your own AI commentary for {activeQuote.ticker}.
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-300">
              <p className="mb-1 font-medium">Next step for you:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>
                  Add a news API call for this ticker (e.g. in a{" "}
                  <code>useEffect</code> here).
                </li>
                <li>
                  Render a simple list of headlines and links inside this
                  panel.
                </li>
                <li>
                  If you want routing later, this same content can move into a{" "}
                  <code>/ticker/:symbol</code> page.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
