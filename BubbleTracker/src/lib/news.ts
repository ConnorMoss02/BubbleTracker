import type { FinnhubNewsItem } from "../types/newsType";

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY ?? "";

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export async function fetchCompanyNews(symbol: string): Promise<FinnhubNewsItem[]> {
  if (!symbol) return [];
  if (!FINNHUB_KEY) {
    throw new Error("Missing Finnhub API key for news fetch");
  }

  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 7);

  const params = new URLSearchParams({
    symbol,
    from: formatDate(from),
    to: formatDate(today),
    token: FINNHUB_KEY,
  });

  const response = await fetch(`https://finnhub.io/api/v1/company-news?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Unable to load news: ${response.statusText}`);
  }

  const data = (await response.json()) as FinnhubNewsItem[];
  return data
    .filter((item) => item.headline && item.url)
    .sort((a, b) => b.datetime - a.datetime)
    .slice(0, 10);
}
