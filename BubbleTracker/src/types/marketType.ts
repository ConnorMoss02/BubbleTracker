
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
