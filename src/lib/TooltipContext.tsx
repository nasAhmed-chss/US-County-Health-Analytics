'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface TooltipState {
  html: string;
  x: number;
  y: number;
  visible: boolean;
}

interface TooltipContextValue {
  show: (html: string, x: number, y: number) => void;
  hide: () => void;
  state: TooltipState;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TooltipState>({ html: '', x: 0, y: 0, visible: false });

  const show = useCallback((html: string, x: number, y: number) => {
    setState({ html, x, y, visible: true });
  }, []);

  const hide = useCallback(() => {
    setState(s => ({ ...s, visible: false }));
  }, []);

  return (
    <TooltipContext.Provider value={{ show, hide, state }}>
      {children}
      <Tooltip />
    </TooltipContext.Provider>
  );
}

function Tooltip() {
  const ctx = useContext(TooltipContext)!;
  const { html, x, y, visible } = ctx.state;
  return (
    <div
      style={{
        position: 'fixed',
        left: x + 14,
        top: y - 10,
        opacity: visible ? 1 : 0,
        pointerEvents: 'none',
        transition: 'opacity 0.12s',
        zIndex: 9999,
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 11,
        fontFamily: "'Space Mono', monospace",
        color: 'var(--text)',
        maxWidth: 220,
        lineHeight: 1.6,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error('useTooltip must be used inside TooltipProvider');
  return ctx;
}
