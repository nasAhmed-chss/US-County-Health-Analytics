import { ReactNode } from 'react';

interface PanelProps {
  title: string;
  tag?: string;
  infoStrip?: ReactNode;
  hint?: string;
  children: ReactNode;
  className?: string;
  noPad?: boolean;
}

export default function Panel({ title, tag, infoStrip, hint, children, className = '', noPad }: PanelProps) {
  return (
    <div
      className={`flex flex-col rounded-xl overflow-hidden ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '0.3px' }}>
          {title}
        </span>
        {tag && (
          <span style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase' }}>
            {tag}
          </span>
        )}
      </div>

      {infoStrip && (
        <div
          className="flex flex-wrap gap-4 px-5 py-3"
          style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)', fontSize: 11 }}
        >
          {infoStrip}
        </div>
      )}

      <div className={`flex-1 ${noPad ? '' : 'p-4'}`}>
        {children}
      </div>

      {hint && (
        <div
          className="text-center py-2"
          style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', borderTop: '1px solid var(--border)' }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
