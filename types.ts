export interface Phone {
  id: number;
  brand: string;
  model: string;
  height_mm: number;
  width_mm: number;
  release_year: number;
}

export interface Glass {
  id: number;
  sku: string;
  height_mm: number;
  width_mm: number;
  notes: string;
}

export interface MatchResult {
  glass: Glass;
  fitScore: number; // Lower is better (difference in mm)
  widthDiff: number;
  heightDiff: number;
}

export enum ViewState {
  MATCHER = 'MATCHER',
  INVENTORY = 'INVENTORY',
  IMPORT = 'IMPORT'
}
