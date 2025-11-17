import React, { useEffect, useState } from "react";
import { useMarketData } from "../assets/lib/useMarketData";
import type { Quote } from "../types/marketType";
import { TICKERS } from "../lib/market";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function computeHeat(quotes: Record<string, Quote>): number {
  const values = Object.values(quotes);
  if (!values.length) return 0;
  const avg = values.reduce((sum, q) => sum + q.changePct, 0) / values.length;
  // keep between -5% and +5% for visuals
  return clamp(avg, -5, 5);
}

export function AIBubbleDashboard() {
  const { snapshot, loading, error } = useMarketData({
    intervalMs: 15000, // 15s polling
    tickers: TICKERS,
  });

  const quotes = snapshot?.quotes ?? {};
  const heat = computeHeat(quotes);

  const [bubbleSize, setBubbleSize] = useState<number>(180);

  // Animate bubble based on heat
  useEffect(() => {
    const base = 180; // px
    const delta = heat * 8; // each 1% adds/removes ~8px
    const target = clamp(base + delta, 130, 260);

    let current = bubbleSize;
    const interval = window.setInterval(() => {
      const diff = target - current;
      if (Math.abs(diff) < 0.5) {
        current = target;
        setBubbleSize(target);
        window.clearInterval(interval);
        return;
      }
      current += diff * 0.2; // ease 20% toward target
      setBubbleSize(current);
    }, 50);

    return () => window.clearInterval(interval);
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

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b-4 border-slate-900">
          <h1
            className="text-4xl md:text-5xl font-bold mb-2 text-slate-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            AI Bubble Tracker
          </h1>
          <p
            className="text-base md:text-lg text-slate-600 italic"
            style={{ fontFamily: "Georgia, serif" }}
          >
            One bubble. The AI complex. Live.
          </p>
        </div>

        {/* Top row: bubble + stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Bubble */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-sm border-2 border-cyan-500/30 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent" />

            <svg
              width={bubbleSize}
              height={bubbleSize}
              viewBox="0 0 200 200"
              className="transition-all duration-300 ease-out"
              style={{
                filter:
                  "drop-shadow(0 0 30px rgba(6, 182, 212, 0.5)) drop-shadow(0 0 50px rgba(168, 85, 247, 0.4))",
              }}
            >
              {/* Outer glow */}
              <circle
                cx="100"
                cy="100"
                r="95"
                fill="url(#bubbleGradient)"
                opacity="0.3"
                className="animate-pulse"
              />
              {/* Main bubble */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="url(#bubbleGradient)"
                stroke="url(#bubbleStroke)"
                strokeWidth="2"
                opacity="0.9"
              />
              {/* Highlights */}
              <ellipse
                cx="75"
                cy="70"
                rx="30"
                ry="35"
                fill="white"
                opacity="0.35"
              />
              <ellipse
                cx="75"
                cy="70"
                rx="15"
                ry="20"
                fill="white"
                opacity="0.55"
              />

              {/* Rainbow ring */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="url(#rainbow)"
                strokeWidth="3"
                opacity="0.6"
                className="animate-pulse"
              />

              <defs>
                <radialGradient id="bubbleGradient">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
                </radialGradient>

                <linearGradient
                  id="bubbleStroke"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>

                <linearGradient
                  id="rainbow"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ff0080" />
                  <stop offset="25%" stopColor="#ff8c00" />
                  <stop offset="50%" stopColor="#40e0d0" />
                  <stop offset="75%" stopColor="#9370db" />
                  <stop offset="100%" stopColor="#ff0080" />
                </linearGradient>
              </defs>
            </svg>

            <div className="mt-4 text-center relative z-10">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                AI Bubble Heat
              </div>
              <div className="text-lg font-semibold flex items-center justify-center gap-2">
                {heat > 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500">
                      +{heat.toFixed(2)}%
                    </span>
                  </>
                ) : heat < 0 ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                    <span className="text-rose-500">
                      {heat.toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-500">Flat</span>
                  </>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Avg intraday move across {TICKERS.length} AI names
              </div>
            </div>
          </div>

          {/* Stats panel */}
          <div className="space-y-4">
            <div className="bg-white shadow-sm rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  Market Snapshot
                </span>
                <span className="text-xs text-slate-400">
                  {loading
                    ? "Loading…"
                    : error
                    ? "Degraded"
                    : asOf
                    ? `Updated ${new Date(asOf).toLocaleTimeString()}`
                    : "—"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500">Symbols</div>
                  <div className="text-lg font-semibold">
                    {allQuotes.length || TICKERS.length}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Up / Down</div>
                  <div className="text-lg font-semibold">
                    <span className="text-emerald-600">{up}</span>
                    <span className="text-slate-400"> / </span>
                    <span className="text-rose-600">{down}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Provider</div>
                  <div className="text-sm font-medium text-slate-700">
                    {provider}
                  </div>
                </div>
              </div>
              {error && (
                <div className="mt-3 text-xs text-rose-500">
                  {error} (falling back to last good snapshot)
                </div>
              )}
            </div>

            <div className="bg-white shadow-sm rounded-xl p-4 border border-slate-200">
              <div className="text-sm font-semibold text-slate-700 mb-3">
                Extremes Today
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    Strongest
                  </div>
                  {best ? (
                    <div>
                      <div className="font-semibold">{best.ticker}</div>
                      <div className="text-xs text-emerald-600">
                        +{best.changePct.toFixed(2)}%
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">—</div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">
                    Weakest
                  </div>
                  {worst ? (
                    <div>
                      <div className="font-semibold">{worst.ticker}</div>
                      <div className="text-xs text-rose-600">
                        {worst.changePct.toFixed(2)}%
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">—</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker grid */}
        <div className="bg-white shadow-sm rounded-2xl border border-slate-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm md:text-base font-semibold text-slate-800">
              Underlying AI Complex
            </h2>
            <span className="text-xs text-slate-400">
              {loading ? "Live… (refreshing)" : "Live prices"}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {TICKERS.map((ticker) => {
              const q = quotes[ticker];
              const price = q?.price ?? null;
              const change = q?.changePct ?? 0;
              const isUp = change > 0;

              return (
                <div
                  key={ticker}
                  className="border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50/60"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-800">
                      {ticker}
                    </span>
                    <span
                      className={`text-[11px] font-medium ${
                        change > 0
                          ? "text-emerald-600"
                          : change < 0
                          ? "text-rose-600"
                          : "text-slate-500"
                      }`}
                    >
                      {change === 0
                        ? "0.00%"
                        : `${isUp ? "+" : ""}${change.toFixed(2)}%`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {price ? `$${price.toFixed(2)}` : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-xs">
          <p>
            For entertainment / research only. Not investment advice.
          </p>
          <p className="mt-1">🎅 Santa tracker, but for AI hype 🫧</p>
        </div>
      </div>
    </div>
  );
}
