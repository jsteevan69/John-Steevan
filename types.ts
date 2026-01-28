
export interface EconomicIndicator {
  label: string;
  value: string;
  change?: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface EconomicStats {
  usdRate: string;
  inflation: string;
  sdfr: string;
  slfr: string;
  inflationTrend: 'up' | 'down' | 'neutral';
}

export interface AuctionNotice {
  date: string;
  type: 'Treasury Bill' | 'Treasury Bond' | 'Other';
  amount: string;
  closingDate: string;
  description: string;
  link: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  text: string;
  sources: GroundingSource[];
  stats?: EconomicStats;
}

export interface YieldDataPoint {
  date: string;
  "91-Day": number;
  "182-Day": number;
  "364-Day": number;
}
