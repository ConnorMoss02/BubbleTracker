import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMarket } from "../assets/lib/StockProvider";
import { fetchCompanyNews } from "../lib/news";
import type { CompanyNews } from "../types/newsType";
import { ArrowLeft, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";

export function TickerPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<CompanyNews | null>(null);
  const [newsLoading, setNewsLoading] = useState(true);

  // Use provider-managed snapshot instead of creating a fresh polling hook per page
  const { snapshot, loading, error, ensurePrices } = useMarket();

  // Ensure we have the quote for this symbol (fetch if missing)
  useEffect(() => {
    if (!symbol) return;
    ensurePrices([symbol]);
  }, [symbol, ensurePrices]);

  // Fetch news when symbol changes
  useEffect(() => {
    if (!symbol) return;

    setNewsLoading(true);
    fetchCompanyNews(symbol, 7)
      .then((data) => {
        setNews(data);
        setNewsLoading(false);
      })
      .catch((err) => {
        setNews({
          items: [],
          symbol,
          error: `Failed to load news: ${err?.message ?? String(err)}`,
        });
        setNewsLoading(false);
      });
  }, [symbol]);

  if (!symbol) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto p-6">
          <p className="text-slate-400">Invalid ticker symbol</p>
          <Link to="/" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">
            ← Back to overview
          </Link>
        </div>
      </div>
    );
  }

  const quote = snapshot?.quotes[symbol];
  const price = quote?.price ?? null;
  const changePct = quote?.changePct ?? 0;
  const isUp = changePct > 0;
  const isDown = changePct < 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to overview</span>
          </button>
          <h1 className="text-4xl font-bold mb-2">{symbol}</h1>
          <p className="text-slate-400">
            Company profile and recent market news for {symbol}
          </p>
        </div>

        {/* Quote Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-6">
          {loading && !quote ? (
            <div className="text-slate-400">Loading quote data...</div>
          ) : error ? (
            <div className="text-rose-400">{error}</div>
          ) : quote ? (
            <div>
              <div className="flex items-baseline gap-4 mb-4">
                <div className="text-3xl font-bold">
                  {price ? `$${price.toFixed(2)}` : "—"}
                </div>
                <div
                  className={`flex items-center gap-1 text-lg font-semibold ${
                    isUp
                      ? "text-emerald-400"
                      : isDown
                      ? "text-rose-400"
                      : "text-slate-400"
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : isDown ? (
                    <TrendingDown className="w-5 h-5" />
                  ) : null}
                  <span>
                    {changePct === 0
                      ? "0.00%"
                      : `${isUp ? "+" : ""}${changePct.toFixed(2)}%`}
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-400">
                Previous close: ${quote.prevClose.toFixed(2)}
              </div>
              {snapshot?.asOf && (
                <div className="text-xs text-slate-500 mt-2">
                  Updated {new Date(snapshot.asOf).toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-400">No quote data available</div>
          )}
        </div>

        {/* News Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Recent News</h2>

          {newsLoading ? (
            <div className="text-slate-400">Loading news...</div>
          ) : news?.error ? (
            <div className="text-rose-400 bg-rose-900/20 border border-rose-800 rounded-lg p-4">
              {news.error}
            </div>
          ) : news && news.items.length > 0 ? (
            <div className="space-y-4">
              {news.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-semibold block mb-2"
                      >
                        {item.headline}
                        <ExternalLink className="w-3 h-3 inline-block ml-1" />
                      </a>
                      {item.summary && (
                        <p className="text-slate-300 text-sm mb-2 line-clamp-2">
                          {item.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>
                          {new Date(item.datetime * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400">
              No recent news available for {symbol}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}