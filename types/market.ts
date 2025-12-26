export interface MarketData {
  date: string;
  metric: number | string;
  range: string;
  change: number | string;
  prediction: string;
  remarks: string;
}

export interface MarketDataRaw {
  date?: string;
  Date?: string;
  dgMarketMetric?: number;
  metric?: number;
  'DG Market Metric'?: number;
  range?: string;
  Range?: string;
  niftyChange?: number;
  change?: number;
  'Nifty Change'?: number;
  dataPrediction?: string;
  prediction?: string;
  'Data Prediction'?: string;
  remarksOnExtremeValues?: string;
  remarks?: string;
  'Remarks On Extreme values'?: string;
}

export type TabType = 'overview' | 'predictions' | 'live';