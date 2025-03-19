export interface Ticker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface Assets {
  assets: Asset[];
  tickers: string[];
  totalAssetsValue: number;
}

export interface Asset {
  name: string;
  count: number;
  price: number;
  totalPrice: number;
  priceChange: number;
  walletPercent: number;
}

export interface delAsset {
  coinName: string;
  totalPrice: number;
}

export interface updAsset {
  coinName: string;
  price: number;
  priceChange: number;
}
