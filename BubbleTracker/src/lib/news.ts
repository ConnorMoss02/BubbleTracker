import type { CompanyNews, FinnhubNewsItem } from "../types/newsType";

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY ?? "";

/**
 * Fetches company news from Finnhub for a given ticker symbol.
 * Returns news from the last 7 days by default.
 * 
 * @param symbol - Stock ticker symbol (e.g., "AAPL", "NVDA")
 * @param daysBack - Number of days to look back (default: 7)
 * @returns Promise with company news items
 */
export async function fetchCompanyNews(
  symbol: string,
  daysBack: number = 7
): Promise<CompanyNews> {
  // Validate API key
  if (!FINNHUB_KEY || FINNHUB_KEY.trim() === "") {
    return {
      items: [],
      symbol,
      error: "Finnhub API key missing. Please set VITE_FINNHUB_KEY in .env.local",
    };
  }

  try {
    // Calculate date range (last N days)
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - daysBack);

    // Format dates as YYYY-MM-DD
    const fromStr = from.toISOString().split("T")[0];
    const toStr = to.toISOString().split("T")[0];

    const url = `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${fromStr}&to=${toStr}&token=${FINNHUB_KEY}`;

    const resp = await fetch(url);

    if (!resp.ok) {
      if (resp.status === 401) {
        return {
          items: [],
          symbol,
          error: "Finnhub API key is invalid or expired. Please check VITE_FINNHUB_KEY in .env.local",
        };
      } else if (resp.status === 429) {
        return {
          items: [],
          symbol,
          error: "Rate limit exceeded. Please wait before retrying.",
        };
      } else {
        return {
          items: [],
          symbol,
          error: `Failed to fetch news: HTTP ${resp.status} ${resp.statusText}`,
        };
      }
    }

    const raw: FinnhubNewsItem[] = await resp.json();

    // Filter out items without headlines and sort by date (newest first)
    const items = raw
      .filter((item) => item.headline && item.headline.trim() !== "")
      .sort((a, b) => b.datetime - a.datetime)
      .slice(0, 20); // Limit to 20 most recent items

    return {
      items,
      symbol,
    };
  } catch (err: any) {
    return {
      items: [],
      symbol,
      error: `Error fetching news: ${err?.message ?? String(err)}`,
    };
  }
}

