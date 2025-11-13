import { useEffect, useRef, useState } from "react";
import type { MarketSnapshot } from "../../lib/market";  
import { fetchSnapshot, TICKERS } from "../../lib/market";

type Opts = { intervalMs?: number; tickers?: string[] };

export function useMarketData({ intervalMs = 15000, tickers = TICKERS }: Opts = {}) {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function load() {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const data = await fetchSnapshot(tickers, { signal: ac.signal });
      setSnapshot((prev) => {
        // only update if values actually changed (reduces renders)
        const moved = JSON.stringify(prev?.quotes ?? {}) !== JSON.stringify(data.quotes);
        return moved ? data : prev;
      });
      setError(data.error ?? null);
      setLoading(false);
    } catch (e: any) {
      setError(String(e?.message ?? e));
      setLoading(false);
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
