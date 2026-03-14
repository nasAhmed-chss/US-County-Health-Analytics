export interface LoadingVector {
  attr: string;
  pc1: number;
  pc2: number;
}

export interface DataPoint {
  county: string;
  state: string;
  pc1: number;
  pc2: number;
  [key: string]: string | number; // top4 attrs + cluster_k fields
}

export interface AnalyticsData {
  eigenvalues: number[];
  explained_var_ratio: number[];
  cumulative_var: number[];
  di: number;
  best_k: number;
  mse: number[];
  loading_vectors: LoadingVector[];
  top4_attrs: string[];
  top4_scores: number[];
  points: DataPoint[];
  n_components: number;
  components: number[][];
}

export interface AnalyticsState {
  di: number;
  k: number;
}
