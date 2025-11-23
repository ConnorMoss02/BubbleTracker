import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMarket } from "../assets/lib/StockProvider";
import type { Quote } from "../types/marketType";
import { TICKERS } from "../lib/market";
import { TrendingUp, TrendingDown, Activity, ArrowUpRight } from "lucide-react";

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

function getHeatLabel(heat: number): string {
  if (heat >= 3) return "Very hot";
  if (heat >= 1) return "Heating up";
  if (heat >= -1) return "Balanced";
  if (heat >= -3) return "Cooling";
  return "Risk-off";
}

export function AIBubbleDashboard() {
  const navigate = useNavigate();
  const { snapshot, loading, error } = useMarket();

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

  const heatLabel = getHeatLabel(heat);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Bubble Tracker
          </h1>
          <p className="text-slate-400 text-lg">
            One bubble. The AI complex. Live.
          </p>
          {asOf > 0 && (
            <p className="text-slate-500 text-sm mt-2">
              Last updated {new Date(asOf).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Hero Section: Bubble + Heat Stats */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Bubble Hero */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
            <div className="relative z-10 flex flex-col items-center">
              <svg
                width={bubbleSize}
                height={bubbleSize}
                viewBox="0 0 200 200"
                className="transition-all duration-500 ease-out"
                style={{
                  filter:
                    "drop-shadow(0 0 40px rgba(6, 182, 212, 0.6)) drop-shadow(0 0 60px rgba(168, 85, 247, 0.5))",
                }}
              >
                {/* Outer glow */}
                <circle
                  cx="100"
                  cy="100"
                  r="95"
                  fill="url(#bubbleGradient)"
                  opacity="0.4"
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
                  opacity="0.4"
                />
                <ellipse
                  cx="75"
                  cy="70"
                  rx="15"
                  ry="20"
                  fill="white"
                  opacity="0.6"
                />
                {/* Rainbow ring */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="url(#rainbow)"
                  strokeWidth="3"
                  opacity="0.7"
                  className="animate-pulse"
                />

                <defs>
                  <radialGradient id="bubbleGradient">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#a855f7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6" />
                  </radialGradient>
                  <linearGradient id="bubbleStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff0080" />
                    <stop offset="25%" stopColor="#ff8c00" />
                    <stop offset="50%" stopColor="#40e0d0" />
                    <stop offset="75%" stopColor="#9370db" />
                    <stop offset="100%" stopColor="#ff0080" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="mt-6 text-center">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                  Bubble Heat
                </div>
                <div className="text-2xl font-bold mb-1">{heatLabel}</div>
                <div className="text-lg flex items-center justify-center gap-2">
                  {heat > 0 ? (
                    <>
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400">
                        +{heat.toFixed(2)}%
                      </span>
                    </>
                  ) : heat < 0 ? (
                    <>
                      <TrendingDown className="w-5 h-5 text-rose-400" />
                      <span className="text-rose-400">
                        {heat.toFixed(2)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-400">Flat</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Avg across {TICKERS.length} AI names
                </div>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-4">
            {/* Market Snapshot */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Market Snapshot</h2>
                <span className="text-xs text-slate-400">
                  {loading
                    ? "Loading…"
                    : error
                    ? "Degraded"
                    : provider}
                </span>
              </div>
              {error && (
                <div className="mb-4 text-sm text-rose-400 bg-rose-900/20 border border-rose-800 rounded-lg p-3">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Symbols</div>
                  <div className="text-2xl font-bold">
                    {allQuotes.length || TICKERS.length}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Up / Down</div>
                  <div className="text-2xl font-bold">
                    <span className="text-emerald-400">{up}</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span className="text-rose-400">{down}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Total</div>
                  <div className="text-2xl font-bold text-slate-300">
                    {TICKERS.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Extremes */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Extremes Today</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-lg p-4">
                  <div className="text-xs text-slate-400 mb-2">Strongest</div>
                  {best ? (
                    <>
                      <div className="text-xl font-bold mb-1">{best.ticker}</div>
                      <div className="text-emerald-400 font-semibold">
                        +{best.changePct.toFixed(2)}%
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        ${best.price.toFixed(2)}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500">—</div>
                  )}
                </div>
                <div className="bg-rose-900/20 border border-rose-800/50 rounded-lg p-4">
                  <div className="text-xs text-slate-400 mb-2">Weakest</div>
                  {worst ? (
                    <>
                      <div className="text-xl font-bold mb-1">{worst.ticker}</div>
                      <div className="text-rose-400 font-semibold">
                        {worst.changePct.toFixed(2)}%
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        ${worst.price.toFixed(2)}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500">—</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker Grid */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Underlying Names</h2>
            <span className="text-sm text-slate-400">
              {loading ? "Refreshing…" : "Live prices"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {TICKERS.map((ticker) => {
              const q = quotes[ticker];
              const price = q?.price ?? null;
              const change = q?.changePct ?? 0;
              const isUp = change > 0;
              const isDown = change < 0;

              return (
                <button
                  key={ticker}
                  onClick={() => navigate(`/ticker/${ticker}`)}
                  className="group bg-slate-700/30 border border-slate-600 rounded-xl p-4 hover:bg-slate-700/50 hover:border-cyan-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-5[...]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-200">
                      {ticker}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div className="text-xs text-slate-400 mb-1">
                    {price ? `$${price.toFixed(2)}` : "—"}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      isUp
                        ? "text-emerald-400"
                        : isDown
                        ? "text-rose-400"
                        : "text-slate-500"
                    }`}
                  >
                    {change === 0
                      ? "0.00%"
                      : `${isUp ? "+" : ""}${change.toFixed(2)}%`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          <p>For entertainment / research only. Not investment advice.</p>
        </div>
      </div>
    </div>
  );
}