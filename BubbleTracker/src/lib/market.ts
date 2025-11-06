

export type Quote = { 
    ticker: string;
    price: number;
    prevClose: number;
    changePct: number;
    timeStamp: number;
};

export type MarketSnapshot = {
    quotes: Record<string, Quote>;
    asOf: number;
    provider: string;
    error?: string;
};

export const TICKERS: string[] = [
  "MSFT","NVDA","ORCL","AMD","COIN","HOOD","RIOT","MARA","MSTR",
  "ARM","CRUS","RDDT","CCJ","XOM","NEM","GOLD","AMLP"
];

const PROVIDER = import.meta.env.VITE_MARKET_PROVIDER ?? "finnhub"; 
const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY ?? "";

export async function fetchSnapshot(tickerds: string[]) : Promise<MarketSnapshot> {
    if (PROVIDER === "mock") return mockSnapshot(tickers);
    return fetchFromFinnhub(tickers);


}