export const CLUSTER_COLORS = [
  '#00d4ff', '#ff6b6b', '#ffd93d', '#6bcb77', '#c77dff',
  '#ff9f43', '#48dbfb', '#ff6fd8', '#a8edea', '#f7971e',
];

export function clusterColor(i: number): string {
  return CLUSTER_COLORS[i % CLUSTER_COLORS.length];
}

export const MARGINS = {
  scree:   { top: 20, right: 20, bottom: 50, left: 58 },
  kmeans:  { top: 20, right: 20, bottom: 50, left: 68 },
  biplot:  { top: 20, right: 20, bottom: 52, left: 58 },
  splom:   { top: 0,  right: 0,  bottom: 0,  left: 0  },
};
