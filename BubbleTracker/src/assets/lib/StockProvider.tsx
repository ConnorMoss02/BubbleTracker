import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { MarketSnapshot, Quote } from "../../types/marketType";
import { fetchSnapshot, TICKERS } from "../../lib/market";
import { useMarketData } from "./useMarketData";

type StockContextShape = {
  snapshot: MarketSnapshot | null;
  loading: boolean;
  error: string | null;
  ensurePrices: (symbols: string[]) => Promise<void>;
  getQuote: (symbol: string) => Quote | null;
};

const CACHE_KEY = "stock_cache_v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 1 day

const StockContext = createContext<StockContextShape | null>(null);

function mergeSnapshots(prev: MarketSnapshot | null, next: MarketSnapshot): MarketSnapshot {
  if (!prev) return next;
  const mergedQuotes: Record<string, Quote> = { ...prev.quotes, ...next.quotes };
  return { quotes: mergedQuotes, asOf: next.asOf, provider: next.provider, error: next.error };
}

function loadCachedSnapshot(): MarketSnapshot | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MarketSnapshot;
    // purge if older than TTL
    if (Date.now() - (parsed.asOf ?? 0) > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistSnapshot(s: MarketSnapshot | null) {
  try {
    if (!s) {
      sessionStorage.removeItem(CACHE_KEY);
    } else {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(s));
    }
  } catch {
    // ignore storage errors
  }
}

/**
 * StockProvider centralizes market polling and caching.
 * Internally it uses the existing useMarketData (which already batches)
 * to poll the canonical TICKERS set, merges results and persists to sessionStorage.
 *
 * It also exposes ensurePrices() that can be used by pages to fetch any missing
 * tickers (e.g. detail page) without re-creating polling hooks on every mount.
 */
export function StockProvider({ children }: { children: React.ReactNode }) {
  // Use the existing hook for background polling of the main TICKERS list.
  const { snapshot: liveSnapshot, loading: liveLoading, error: liveError } = useMarketData({
    intervalMs: 30000,
    tickers: TICKERS,
  });

  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(() => loadCachedSnapshot());
  const loading = liveLoading && snapshot == null;
  const error = liveError ?? snapshot?.error ?? null;

  // Merge live polling updates into our central snapshot and persist
  useEffect(() => {
    if (!liveSnapshot) return;
    setSnapshot((prev) => {
      const merged = mergeSnapshots(prev, liveSnapshot);
      persistSnapshot(merged);
      return merged;
    });
  }, [liveSnapshot]);

  // ensurePrices: explicitly fetch any symbol(s) requested and merge into cache
  const ensurePrices = async (symbols: string[]) => {
    if (!symbols || symbols.length === 0) return;
    try {
      const res = await fetchSnapshot(symbols);
      if (!res) return;
      setSnapshot((prev) => {
        const merged = mergeSnapshots(prev, res);
        persistSnapshot(merged);
        return merged;
      });
    } catch {
      // ignore fetch errors; UI can still show cached values or loading state
    }
  };

  const getQuote = (symbol: string) => {
    if (!snapshot) return null;
    return snapshot.quotes[symbol] ?? null;
  };

  const ctx = useMemo(
    () => ({ snapshot, loading, error, ensurePrices, getQuote }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snapshot, loading, error]
  );

  return <StockContext.Provider value={ctx}>{children}</StockContext.Provider>;
}

export function useMarket() {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useMarket must be used inside StockProvider");
  return ctx;
}