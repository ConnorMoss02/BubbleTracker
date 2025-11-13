import type { MarketSnapshot, Quote } from "../types/marketType";
export type { MarketSnapshot, Quote } from "../types/marketType";

import { fetchFromFinnhub } from "./providers/finnhub.ts";
import { fetchFromMock } from "./providers/mock.ts";

export const TICKERS: string[] = [
  "MSFT","NVDA","ORCL","AMD","COIN","HOOD","RIOT","MARA","MSTR",
  "ARM","CRUS","RDDT","CCJ","XOM","NEM","GOLD","AMLP"
];

// --- provider selection ---
const PROVIDERS = ["finnhub", "mock"] as const;
export type Provider = typeof PROVIDERS[number];

const PROVIDER = (import.meta.env.VITE_MARKET_PROVIDER ?? "finnhub") as Provider;
console.log("PROVIDER =", import.meta.env.VITE_MARKET_PROVIDER);

/**
 * Single entry point: fetch a normalized snapshot for the given tickers.
 * Default to TICKERS; switch provider by env.
 */
export async function fetchSnapshot(
  tickers: string[] = TICKERS,
  opts?: { signal?: AbortSignal }
): Promise<MarketSnapshot> {
  try {
    switch (PROVIDER) {
      case "mock":
        return fetchFromMock(tickers);
      case "finnhub":
      default:
        return await fetchFromFinnhub(tickers, opts);
    }
  } catch (err: any) {
    // Uniform error shape so UI never crashes
    return {
      quotes: {},
      asOf: Date.now(),
      provider: PROVIDER,
      error: String(err?.message ?? err),
    };
  }
}
