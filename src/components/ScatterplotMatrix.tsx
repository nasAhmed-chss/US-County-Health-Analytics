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

export default function ScatterplotMatrix({ data, k }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { show, hide } = useTooltip();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const attrs = data.top4_attrs;
    const pts = data.points;
    const n = attrs.length; // 4

    const containerW = containerRef.current.clientWidth;
    const cellSize = Math.max(140, Math.floor((containerW - 40) / n));
    const outerPad = 90;
    const W = n * cellSize + outerPad * 2;
    const H = n * cellSize + outerPad * 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', W).attr('height', H);

    // Build scales per attribute
    const scales: Record<string, d3.ScaleLinear<number, number>> = {};
    attrs.forEach(attr => {
      const ext = d3.extent(pts, d => d[attr] as number) as [number, number];
      const pad = (ext[1] - ext[0]) * 0.06;
      scales[attr] = d3.scaleLinear()
        .domain([ext[0] - pad, ext[1] + pad])
        .range([6, cellSize - 6]);
    });

    const innerPad = 3; // gap between cells

    // Row labels (left)
    attrs.forEach((attr, row) => {
      const short = attr.length > 22 ? attr.slice(0, 20) + '…' : attr;
      svg.append('text')
        .attr('x', outerPad - 4)
        .attr('y', outerPad + row * cellSize + cellSize / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'var(--muted)')
        .attr('font-size', 9)
        .attr('font-family', 'Space Mono, monospace')
        .text(short);
    });

    // Column labels (top)
    attrs.forEach((attr, col) => {
      const short = attr.length > 22 ? attr.slice(0, 20) + '…' : attr;
      svg.append('text')
        .attr('x', outerPad + col * cellSize + cellSize / 2)
        .attr('y', outerPad - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--muted)')
        .attr('font-size', 9)
        .attr('font-family', 'Space Mono, monospace')
        .text(short);
    });

    // Cells
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const tx = outerPad + col * cellSize;
        const ty = outerPad + row * cellSize;
        const xAttr = attrs[col];
        const yAttr = attrs[row];

        const cell = svg.append('g').attr('transform', `translate(${tx},${ty})`);

        // Background
        cell.append('rect')
          .attr('x', innerPad).attr('y', innerPad)
          .attr('width', cellSize - innerPad * 2)
          .attr('height', cellSize - innerPad * 2)
          .attr('rx', 4)
          .attr('fill', row === col ? '#151d2e' : '#0f1522')
          .attr('stroke', '#2a3550')
          .attr('stroke-width', 0.5);

        if (row === col) {
          // Diagonal: attribute name + mini histogram
          const histData = pts.map(d => d[xAttr] as number).filter(v => v != null);
          const histBins = d3.bin().thresholds(10)(histData);
          const hx = d3.scaleLinear()
            .domain([d3.min(histData)!, d3.max(histData)!])
            .range([innerPad + 4, cellSize - innerPad - 4]);
          const hy = d3.scaleLinear()
            .domain([0, d3.max(histBins, b => b.length)!])
            .range([cellSize - innerPad - 4, cellSize * 0.52]);

          cell.selectAll('.hbar')
            .data(histBins)
            .enter()
            .append('rect')
            .attr('x', d => hx(d.x0!))
            .attr('y', d => hy(d.length))
            .attr('width', d => Math.max(0, hx(d.x1!) - hx(d.x0!) - 1))
            .attr('height', d => (cellSize - innerPad - 4) - hy(d.length))
            .attr('fill', 'rgba(0,212,255,0.2)')
            .attr('stroke', 'rgba(0,212,255,0.4)')
            .attr('stroke-width', 0.5);

          // Label
          const lines = wrapLabel(xAttr, 16);
          lines.forEach((line, li) => {
            cell.append('text')
              .attr('x', cellSize / 2)
              .attr('y', cellSize * 0.3 + li * 13)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', '#00d4ff')
              .attr('font-size', 10)
              .attr('font-family', 'Syne, sans-serif')
              .attr('font-weight', 600)
              .text(line);
          });

        } else {
          // Off-diagonal: scatter
          const xS = scales[xAttr];
          const yS = d3.scaleLinear()
            .domain(scales[yAttr].domain())
            .range([cellSize - innerPad - 4, innerPad + 4]);

          cell.selectAll('.sp')
            .data(pts)
            .enter()
            .append('circle')
            .attr('cx', d => xS(d[xAttr] as number))
            .attr('cy', d => yS(d[yAttr] as number))
            .attr('r', 2.5)
            .attr('fill', d => clusterColor(d[`cluster_${k}`] as number))
            .attr('opacity', 0.65)
            .attr('stroke', 'none')
            .style('cursor', 'pointer')
            .on('mousemove', (event, d) => {
              show(
                `<strong style="color:var(--accent)">${d.county}, ${d.state}</strong>
                 ${xAttr}: ${(d[xAttr] as number).toFixed(1)}<br>
                 ${yAttr}: ${(d[yAttr] as number).toFixed(1)}<br>
                 Cluster: ${d[`cluster_${k}`]}`,
                event.clientX, event.clientY
              );
            })
            .on('mouseleave', hide);
        }
      }
    }
  }, [data, k, show, hide]);

  return (
    <Panel title="Scatterplot Matrix — Top 4 Attributes" tag="Task 2" noPad>
      <div ref={containerRef} className="w-full overflow-x-auto">
        <svg ref={svgRef} />
      </div>
    </Panel>
  );
}

function wrapLabel(text: string, maxLen: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    if ((cur + ' ' + word).trim().length > maxLen && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = (cur + ' ' + word).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
