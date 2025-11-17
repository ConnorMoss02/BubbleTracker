import { useEffect, useRef, useState } from "react";
import type { MarketSnapshot, Quote } from "../../lib/market";  
import { fetchSnapshot, TICKERS } from "../../lib/market";

type Opts = { intervalMs?: number; tickers?: string[], windowSize?: number };

export function useMarketData({ intervalMs = 5000, tickers = TICKERS, windowSize = 5, }: Opts = {}) {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const ringRef = useRef<number>(0);

  const merge = (prev: MarketSnapshot | null, next: MarketSnapshot): MarketSnapshot => {
    if (!prev) return next;
    const mergedQuotes: Record<string, Quote> = { ...prev.quotes, ...next.quotes };
    return { quotes: mergedQuotes, asOf: next.asOf, provider: next.provider, error: next.error };

  };

  async function load() {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const start = ringRef.current;
    const end = Math.min(start + windowSize, tickers.length);
    const slice = tickers.slice(start, end);
    const nextIndex = end >= tickers.length ? 0 : end;

    try {
      const data = await fetchSnapshot(slice, { signal: ac.signal });
      setSnapshot(prev => merge(prev, data));
      setError(data.error ?? null);
      setLoading(false);
      ringRef.current = nextIndex; // advance only on success
    } catch (e: any) {
      setError(String(e?.message ?? e));
      setLoading(false);
      // no backoff here; interval keeps ticking
    }
  }

  useEffect(() => {
    setLoading(true);
    load();
    timerRef.current = window.setInterval(load, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, tickers.join(",")]);

  return { snapshot, loading, error };
}
