'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AnalyticsData } from '@/lib/types';
import { useTooltip } from '@/lib/TooltipContext';
import Panel from './Panel';

interface Props {
  data: AnalyticsData;
  k: number;
  onKChange: (k: number) => void;
}

export default function KMeansPlot({ data, k, onKChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { show, hide } = useTooltip();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const W = containerRef.current.clientWidth;
    const H = 230;
    const m = { top: 20, right: 20, bottom: 52, left: 68 };
    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', W).attr('height', H);

    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

    const mse = data.mse;
    const ks = mse.map((_, i) => String(i + 1));

    const x = d3.scaleBand().domain(ks).range([0, w]).padding(0.25);
    const y = d3.scaleLinear().domain([0, d3.max(mse)! * 1.06]).range([h, 0]);

    // Grid
    g.append('g')
      .attr('class', 'grid-line')
      .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat('' as any))
      .select('.domain').remove();

    // Bars
    g.selectAll('.bar')
      .data(mse)
      .enter()
      .append('rect')
      .attr('x', (_, i) => x(String(i + 1))!)
      .attr('y', d => y(d))
      .attr('width', x.bandwidth())
      .attr('height', d => h - y(d))
      .attr('rx', 3)
      .attr('fill', (_, i) => (i + 1 === k ? '#ffd93d' : '#1c2538'))
      .attr('stroke', (_, i) => (i + 1 === k ? '#c9a800' : '#2a3550'))
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        onKChange(mse.indexOf(d) + 1);
      })
      .on('mousemove', (event, d) => {
        const i = mse.indexOf(d);
        show(
          `<strong style="color:var(--accent3)">k = ${i + 1}</strong>
           Inertia: ${Math.round(d).toLocaleString()}`,
          event.clientX, event.clientY
        );
      })
      .on('mouseleave', hide);

    // Connecting line over bar tops
    const line = d3.line<number>()
      .x((_, i) => x(String(i + 1))! + x.bandwidth() / 2)
      .y(d => y(d))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(mse)
      .attr('fill', 'none')
      .attr('stroke', '#2a3550')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    // Highlight dot on selected k
    g.append('circle')
      .attr('cx', x(String(k))! + x.bandwidth() / 2)
      .attr('cy', y(mse[k - 1]))
      .attr('r', 5)
      .attr('fill', '#ffd93d')
      .attr('stroke', '#0a0e1a')
      .attr('stroke-width', 2);

    // X axis
    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickFormat(d => `k=${d}`))
      .selectAll('text')
      .style('fill', 'var(--muted)')
      .style('font-size', '9px');

    // Y axis
    g.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${((d as number) / 1000).toFixed(0)}k`))
      .selectAll('text')
      .style('fill', 'var(--muted)');

    // Labels
    g.append('text')
      .attr('x', w / 2).attr('y', h + 44)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--muted)')
      .attr('font-size', 10)
      .text('Number of Clusters (k)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -h / 2).attr('y', -56)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--muted)')
      .attr('font-size', 10)
      .text('Inertia (×10³)');

  }, [data, k, onKChange, show, hide]);

  const infoStrip = (
    <>
      <span style={{ color: 'var(--muted)' }}>
        Selected k: <strong style={{ color: 'var(--text)' }}>{k}</strong>
      </span>
      <span style={{ color: 'var(--muted)' }}>
        Inertia:{' '}
        <strong style={{ color: '#ffd93d' }}>
          {Math.round(data.mse[k - 1]).toLocaleString()}
        </strong>
      </span>
    </>
  );

  return (
    <Panel
      title="K-Means Elbow — Inertia vs k"
      tag="Task 3"
      infoStrip={infoStrip}
      hint="↑ Click a bar to set number of clusters k"
      noPad
    >
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full" />
      </div>
    </Panel>
  );
}
