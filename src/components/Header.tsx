interface Props {
  nPoints: number;
  nAttrs: number;
}

export default function Header({ nPoints, nAttrs }: Props) {
  return (
    <header
      className="flex items-center justify-between px-10 py-7"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: '-0.5px',
            color: 'var(--text)',
          }}
        >
          County Health{' '}
          <span style={{ color: 'var(--accent)' }}>Analytics</span>
        </h1>
        <p style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 3 }}>
          Mini Project #2a — PCA · K-Means · Visual Analytics
        </p>
      </div>

      <div
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 11,
          color: 'var(--muted)',
          letterSpacing: '1px',
        }}
      >
        Dataset:{' '}
        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{nPoints}</span>
        {' '}counties ·{' '}
        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{nAttrs}</span>
        {' '}attributes
      </div>
    </header>
  );
}
