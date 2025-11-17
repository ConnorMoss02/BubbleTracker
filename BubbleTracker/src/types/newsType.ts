export type FinnhubNewsItem = {
  datetime: number;
  headline: string;
  source: string;
  url: string;
  summary?: string;
  image?: string;
  category?: string;
};

export type CompanyNews = {
  items: FinnhubNewsItem[];
  symbol: string;
  error?: string;
};

