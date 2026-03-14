'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AnalyticsData } from '@/lib/types';
import { clusterColor } from '@/lib/constants';
import { useTooltip } from '@/lib/TooltipContext';
import Panel from './Panel';

interface Props {
  data: AnalyticsData;
  k: number;
}

export default function Biplot({ data, k }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { show, hide } = useTooltip();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const W = containerRef.current.clientWidth;
    const H = 420;
    const m = { top: 20, right: 20, bottom: 52, left: 58 };
    const w = W - m.left - m.right;
    const h = H - m.top - m.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', W).attr('height', H);

    // Arrow marker def
    const defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'biplot-arrow')
      .attr('viewBox', '0 -4 8 8')
      .attr('refX', 6).attr('refY', 0)
      .attr('markerWidth', 4).attr('markerHeight', 4)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', 'rgba(255,217,61,0.55)');

    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

    const pts = data.points;
    const xExt = d3.extent(pts, p => p.pc1) as [number, number];
    const yExt = d3.extent(pts, p => p.pc2) as [number, number];
    const xPad = (xExt[1] - xExt[0]) * 0.1;
    const yPad = (yExt[1] - yExt[0]) * 0.1;

    const x = d3.scaleLinear().domain([xExt[0] - xPad, xExt[1] + xPad]).range([0, w]);
    const y = d3.scaleLinear().domain([yExt[0] - yPad, yExt[1] + yPad]).range([h, 0]);

    // Grid
    g.append('g').attr('class', 'grid-line')
      .call(d3.axisLeft(y).ticks(6).tickSize(-w).tickFormat('' as any))
      .select('.domain').remove();
    g.append('g').attr('class', 'grid-line')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickSize(-h).tickFormat('' as any))
      .select('.domain').remove();

    // Zero lines
    g.append('line')
      .attr('x1', x(0)).attr('x2', x(0))
      .attr('y1', 0).attr('y2', h)
      .attr('stroke', '#2a3550').attr('stroke-width', 1);
    g.append('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', y(0)).attr('y2', y(0))
      .attr('stroke', '#2a3550').attr('stroke-width', 1);

    // Data points
    g.selectAll('.pt')
      .data(pts)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.pc1 as number))
      .attr('cy', d => y(d.pc2 as number))
      .attr('r', 4)
      .attr('fill', d => clusterColor(d[`cluster_${k}`] as number))
      .attr('opacity', 0.72)
      .attr('stroke', '#0a0e1a')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mousemove', (event, d) => {
        show(
          `<strong style="color:var(--accent)">${d.county}, ${d.state}</strong>
           PC1: ${(d.pc1 as number).toFixed(2)}<br>
           PC2: ${(d.pc2 as number).toFixed(2)}<br>
           Cluster: ${d[`cluster_${k}`]}`,
          event.clientX, event.clientY
        );
      })
      .on('mouseleave', hide);

    // Loading arrows
    const arrowScale = Math.min(w, h) * 0.36;
    const cx = w / 2;
    const cy = h / 2;

  const topSet = new Set(data.top4_attrs);

  data.loading_vectors
    .filter(lv => topSet.has(lv.attr))
    .forEach(lv => {
      const ex = lv.pc1 * arrowScale;
      const ey = lv.pc2 * arrowScale;

      g.append('line')
        .attr('x1', cx).attr('y1', cy)
        .attr('x2', cx + ex).attr('y2', cy - ey)
        .attr('stroke', 'rgba(255,217,61,0.35)')
        .attr('stroke-width', 1)
        .attr('marker-end', 'url(#biplot-arrow)');

      const lx = cx + ex * 1.14;
      const ly = cy - ey * 1.14;
      const label = lv.attr.length > 20 ? lv.attr.slice(0, 18) + '…' : lv.attr;

      g.append('text')
        .attr('x', lx).attr('y', ly)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'rgba(255,217,61,0.65)')
        .attr('font-size', 8)
        .style('cursor', 'default')
        .text(label)
        .on('mousemove', (event) => {
          show(
            `<strong style="color:#ffd93d">${lv.attr}</strong>
             PC1 loading: ${lv.pc1.toFixed(3)}<br>
             PC2 loading: ${lv.pc2.toFixed(3)}`,
            event.clientX, event.clientY
          );
        })
        .on('mouseleave', hide);
    });

    // Axes
    g.append('g').attr('class', 'axis')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll('text').style('fill', 'var(--muted)');

    g.append('g').attr('class', 'axis')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text').style('fill', 'var(--muted)');

    g.append('text')
      .attr('x', w / 2).attr('y', h + 44)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--muted)')
      .attr('font-size', 10)
      .text(`PC1 (${(data.explained_var_ratio[0] * 100).toFixed(1)}% variance)`);

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -h / 2).attr('y', -44)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--muted)')
      .attr('font-size', 10)
      .text(`PC2 (${(data.explained_var_ratio[1] * 100).toFixed(1)}% variance)`);

  }, [data, k, show, hide]);

  return (
    <Panel title="PCA Biplot — PC1 vs PC2" tag="Task 1" noPad>
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full" />
      </div>
    </Panel>
  );
}
