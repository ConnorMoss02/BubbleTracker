import type { Quote, MarketSnapshot } from "../../types/marketType";

let phase = 0;

export function fetchFromMock(tickers: string[]): MarketSnapshot {
  phase += 0.25;
  const now = Date.now();
  const quotes: Record<string, Quote> = {};

  tickers.forEach((t, i) => {
    const prevClose = 100 + i * 0.5;
    const price = prevClose * (1 + (Math.sin(phase + i * 0.4) * 1.5) / 100);
    quotes[t] = {
      ticker: t,
      price,
      prevClose,
      changePct: ((price - prevClose) / prevClose) * 100,
      timeStamp: now,
    };
  });

  return { quotes, asOf: now, provider: "mock" };
}
