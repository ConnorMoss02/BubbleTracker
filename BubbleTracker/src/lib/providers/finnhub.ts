import type { Quote, MarketSnapshot } from "../../types/marketType";

type FinnhubQuoteJSON = { c?: number; pc?: number; t?: number };

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY ?? "";

/**
 * Validates that the Finnhub API key is present and non-empty.
 * Returns a clear error message if the key is missing.
 */
function validateApiKey(): string | null {
  if (!FINNHUB_KEY || FINNHUB_KEY.trim() === "") {
    return "Finnhub API key missing. Please set VITE_FINNHUB_KEY in .env.local";
  }
  return null;
}

export async function fetchFromFinnhub(
  tickers: string[],
  opts?: { signal?: AbortSignal }
): Promise<MarketSnapshot> {
  // Check API key before making any requests
  const keyError = validateApiKey();
  if (keyError) {
    return {
      quotes: {},
      asOf: Date.now(),
      provider: "finnhub",
      error: keyError,
    };
  }

  const now = Date.now();
  const quotes: Record<string, Quote> = {};
  const batchSize = 10;

  for (let i = 0; i < tickers.length; i += batchSize) {
    const slice = tickers.slice(i, i + batchSize);
    const results = await Promise.all(
      slice.map(async (ticker) => {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_KEY}`;
        const resp = await fetch(url, { signal: opts?.signal });
        
        if (!resp.ok) {
          // Provide clearer error messages for common HTTP status codes
          if (resp.status === 401) {
            throw new Error(`Finnhub API key is invalid or expired. Please check VITE_FINNHUB_KEY in .env.local`);
          } else if (resp.status === 429) {
            throw new Error(`Rate limit exceeded. Please wait before retrying.`);
          } else {
            throw new Error(`HTTP ${resp.status} for ${ticker}: ${resp.statusText}`);
          }
        }

        const raw: FinnhubQuoteJSON = await resp.json();
        const { c: current = 0, pc: previousClose = 0, t: unix = 0 } = raw;

        const price = Number(current) || 0;
        const prevClose = Number(previousClose) || price;
        const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
        const timeStamp = unix > 0 ? unix * 1000 : now;

        const q: Quote = { ticker, price, prevClose, changePct, timeStamp };
        return [ticker, q] as const;
      })
    );

    for (const [ticker, q] of results) quotes[ticker] = q;
    // Add delay between batches to respect rate limits (250ms between batches)
    if (i + batchSize < tickers.length) await sleep(250);
  }

  return { quotes, asOf: Date.now(), provider: "finnhub" };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
