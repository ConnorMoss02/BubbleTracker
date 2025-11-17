import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useMarketData } from "../assets/lib/useMarketData";
import { fetchCompanyNews } from "../lib/news";
import { TICKERS } from "../lib/market";
import type { FinnhubNewsItem } from "../types/newsType";

export function TickerPage() {
  const params = useParams<{ symbol?: string }>();
  const symbol = (params.symbol ?? "").toUpperCase();
  const isValidSymbol = TICKERS.includes(symbol);

  const { snapshot, loading, error } = useMarketData({
    intervalMs: 15000,
    tickers: isValidSymbol ? [symbol] : [],
    windowSize: 1,
  });

  const quote = isValidSymbol ? snapshot?.quotes?.[symbol] : undefined;
  const priceValue = typeof quote?.price === "number" ? quote.price : null;
  const changeValue = typeof quote?.changePct === "number" ? quote.changePct : null;

  const [news, setNews] = useState<FinnhubNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      if (!isValidSymbol) {
        setNews([]);
        setNewsLoading(false);
        setNewsError(null);
        return;
      }
      setNewsLoading(true);
      setNewsError(null);
      try {
        const items = await fetchCompanyNews(symbol);
        if (!cancelled) {
          setNews(items);
        }
      } catch (err: any) {
        if (!cancelled) {
          setNews([]);
          setNewsError(err?.message ?? "Failed to load news");
        }
      } finally {
        if (!cancelled) setNewsLoading(false);
      }
    }

    loadNews();
    return () => {
      cancelled = true;
    };
  }, [symbol, isValidSymbol]);

  const layout = (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_60%)]" />
      <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-gradient-to-b from-emerald-500/10 via-transparent to-cyan-500/10 blur-3xl" />
      <main className="relative max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm text-slate-300 hover:text-white transition">
            Back to dashboard
          </Link>
          <p className="text-xs text-slate-400">
            Provider: <span className="text-slate-200">{snapshot?.provider ?? "—"}</span>
          </p>
        </div>

        {isValidSymbol ? (
          <div className="space-y-8">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 space-y-5 shadow-[0_25px_80px_rgba(15,23,42,0.55)]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Company view</p>
                <h1 className="text-4xl font-semibold text-white mt-2">{symbol}</h1>
                <p className="text-sm text-slate-400">
                  Company profile and recent news for {symbol}. Quotes refresh automatically while this page is open.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Last price</p>
                  <p className="text-3xl font-semibold mt-1">
                    {priceValue !== null ? `$${priceValue.toFixed(2)}` : loading ? "…" : "—"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {snapshot?.asOf ? `Updated ${new Date(snapshot.asOf).toLocaleTimeString()}` : "Waiting for data"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Day change</p>
                  <p
                    className={`text-3xl font-semibold mt-1 ${
                      changeValue !== null && changeValue > 0
                        ? "text-emerald-400"
                        : changeValue !== null && changeValue < 0
                        ? "text-rose-400"
                        : "text-slate-100"
                    }`}
                  >
                    {changeValue !== null
                      ? `${changeValue > 0 ? "+" : ""}${changeValue.toFixed(2)}%`
                      : loading
                      ? "…"
                      : "0.00%"}
                  </p>
                  {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 space-y-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-white">Recent news</h2>
                <p className="text-sm text-slate-400">Latest headlines from Finnhub for {symbol}.</p>
              </div>
              {newsLoading && <p className="text-sm text-slate-400">Loading news…</p>}
              {newsError && <p className="text-sm text-rose-400">{newsError}</p>}
              {!newsLoading && !newsError && news.length === 0 && (
                <p className="text-sm text-slate-400">No recent news found for this ticker.</p>
              )}
              <ul className="space-y-4">
                {news.map((item) => (
                  <li key={`${item.datetime}-${item.headline}`} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base font-medium text-sky-300 hover:text-sky-200"
                    >
                      {item.headline}
                    </a>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.source} · {new Date(item.datetime * 1000).toLocaleDateString()}
                    </p>
                    {item.summary && (
                      <p className="text-sm text-slate-300 mt-2">{item.summary}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 space-y-3 text-center">
            <h1 className="text-3xl font-semibold">Ticker not found</h1>
            <p className="text-slate-400 text-sm">The symbol "{symbol}" is not part of the AI Bubble Tracker list.</p>
            <div>
              <Link to="/" className="text-sky-300 hover:text-sky-200">
                Return to dashboard
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );

  return layout;
}
