'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AnalyticsData } from '@/lib/types';
import { useTooltip } from '@/lib/TooltipContext';
import Panel from './Panel';

interface Props {
  data: AnalyticsData;
  di: number;
  onDiChange: (di: number) => void;
}

export default function ScreePlot({ data, di, onDiChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { show, hide } = useTooltip();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const W = containerRef.current.clientWidth;
    const H = 230;
    const m = { top: 20, right: 20, bottom: 52, left: 58 };
    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', W).attr('height', H);

    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

    const eigs = data.eigenvalues;
    const n = eigs.length;

    const x = d3.scaleBand()
      .domain(d3.range(1, n + 1).map(String))
      .range([0, w])
      .padding(0.25);

    const y = d3.scaleLinear()
      .domain([0, d3.max(eigs)! * 1.12])
      .range([h, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid-line')
      .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat('' as any))
      .select('.domain').remove();

    // Bars
    g.selectAll('.bar')
      .data(eigs)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (_, i) => x(String(i + 1))!)
      .attr('y', d => y(d))
      .attr('width', x.bandwidth())
      .attr('height', d => h - y(d))
      .attr('rx', 3)
      .attr('fill', (_, i) => (i < di ? '#00d4ff' : '#1c2538'))
      .attr('stroke', (_, i) => (i < di ? '#00a3bf' : '#2a3550'))
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        const i = eigs.indexOf(d);
        onDiChange(i + 1);
      })
      .on('mousemove', (event, d) => {
        const i = eigs.indexOf(d);
        show(
          `<strong style="color:var(--accent)">PC${i + 1}</strong>
           Eigenvalue: ${d.toFixed(3)}<br>
           Variance: ${(data.explained_var_ratio[i] * 100).toFixed(1)}%<br>
           Cumulative: ${(data.cumulative_var[i] * 100).toFixed(1)}%`,
          event.clientX, event.clientY
        );
      })
      .on('mouseleave', hide);

    // Cumulative variance line (secondary axis concept)
    const yPct = d3.scaleLinear().domain([0, 1]).range([h, 0]);
    const cumLine = d3.line<number>()
      .x((_, i) => x(String(i + 1))! + x.bandwidth() / 2)
      .y(d => yPct(d))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data.cumulative_var)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,107,107,0.5)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,3')
      .attr('d', cumLine);

    // 85% threshold line
    g.append('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', yPct(0.85)).attr('y2', yPct(0.85))
      .attr('stroke', 'rgba(255,217,61,0.3)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '6,4');

    g.append('text')
      .attr('x', w - 4).attr('y', yPct(0.85) - 4)
      .attr('text-anchor', 'end')
      .attr('fill', 'rgba(255,217,61,0.5)')
      .attr('font-size', 9)
      .text('85% var');

    // X axis
    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickFormat(d => `PC${d}`))
      .selectAll('text')
      .style('fill', 'var(--muted)')
      .style('font-size', '9px');

    // Y axis
    g.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('fill', 'var(--muted)');

    // Axis labels
    g.append('text')
      .attr('x', w / 2).attr('y', h + 44)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--muted)')
      .attr('font-size', 10)
      .text('Principal Component');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -h / 2).attr('y', -44)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--muted)')
      .attr('font-size', 10)
      .text('Eigenvalue');

  }, [data, di, onDiChange, show, hide]);

  const infoStrip = (
    <>
      <span style={{ color: 'var(--muted)' }}>
        Selected d<sub>i</sub>:{' '}
        <strong style={{ color: 'var(--text)' }}>{di}</strong>
      </span>
      <span style={{ color: 'var(--muted)' }}>
        Cumulative Var:{' '}
        <strong style={{ color: 'var(--accent)' }}>
          {(data.cumulative_var[di - 1] * 100).toFixed(1)}%
        </strong>
      </span>
      <span style={{ color: 'var(--muted)', fontSize: 10, opacity: 0.7 }}>
        — — red line = cumulative variance
      </span>
    </>
  );

  return (
    <Panel
      title="PCA Scree Plot — Eigenvalues"
      tag="Task 1"
      infoStrip={infoStrip}
      hint="↑ Click a bar to set intrinsic dimensionality (dᵢ)"
      noPad
    >
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full" />
      </div>
    </Panel>
  );
}
