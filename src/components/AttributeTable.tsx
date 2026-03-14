'use client';
import { useMemo } from 'react';
import { AnalyticsData } from '@/lib/types';
import { clusterColor, CLUSTER_COLORS } from '@/lib/constants';
import Panel from './Panel';

interface Props {
  data: AnalyticsData;
  k: number;
  di: number;
}

function computeTop4(data: AnalyticsData, di: number) {
  const { loading_vectors } = data;
  const clampedDi = Math.min(di, data.eigenvalues.length);


  const nAttrs = loading_vectors.length;

  const scores = loading_vectors.map((_, attrIdx) => {
    let sum = 0;
    for (let comp = 0; comp < clampedDi; comp++) {
      const loading = data.components[comp][attrIdx];
      sum += loading * loading;
    }
    return sum;
  });

  // Rank by score descending, take top 4
  const ranked = scores
    .map((score, attrIdx) => ({ attr: loading_vectors[attrIdx].attr, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return ranked;
}

export default function AttributeTable({ data, k, di }: Props) {
  const top4 = useMemo(() => computeTop4(data, di), [data, di]);

  return (
    <Panel title="Top 4 Attributes by PCA Loading" tag="Task 2" noPad>
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['#', 'Attribute', 'Σ Loading²'].map(h => (
              <th
                key={h}
                className="text-left px-4 py-3"
                style={{ fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 400 }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {top4.map(({ attr, score }, i) => (
            <tr key={attr} style={{ borderBottom: '1px solid #1a2238' }}>
              <td className="px-4 py-3">
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    background: CLUSTER_COLORS[i],
                    color: '#0a0e1a',
                    fontWeight: 700,
                    fontSize: 10,
                  }}
                >
                  {i + 1}
                </span>
              </td>
              <td className="px-4 py-3" style={{ fontSize: 12, color: 'var(--text)' }}>
                {attr}
              </td>
              <td
                className="px-4 py-3"
                style={{
                  fontSize: 12,
                  color: 'var(--accent)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {score.toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Cluster legend */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>
          Cluster Legend (k = {k})
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: k }, (_, i) => (
            <div key={i} className="flex items-center gap-1.5" style={{ fontSize: 11, color: 'var(--muted)' }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: clusterColor(i),
                  flexShrink: 0,
                  display: 'inline-block',
                }}
              />
              Cluster {i}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}