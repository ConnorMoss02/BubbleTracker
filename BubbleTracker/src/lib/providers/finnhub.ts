import type { Quote, MarketSnapshot } from "../../types/marketType";

type FinnhubQuoteJSON = { c?: number; pc?: number; t?: number };

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY ?? "";

export async function fetchFromFinnhub(
  tickers: string[],
  opts?: { signal?: AbortSignal }
): Promise<MarketSnapshot> {
  const now = Date.now();
  const quotes: Record<string, Quote> = {};
  const batchSize = 10;

  for (let i = 0; i < tickers.length; i += batchSize) {
    const slice = tickers.slice(i, i + batchSize);
    const results = await Promise.all(
      slice.map(async (ticker) => {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_KEY}`;
        const resp = await fetch(url, { signal: opts?.signal });
        if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${ticker}: ${resp.statusText}`);

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
    if (i + batchSize < tickers.length) await sleep(250);
  }

  return { quotes, asOf: Date.now(), provider: "finnhub" };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
