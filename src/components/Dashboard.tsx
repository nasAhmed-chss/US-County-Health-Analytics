'use client';
import { useState } from 'react';
import { AnalyticsData } from '@/lib/types';
import { TooltipProvider } from '@/lib/TooltipContext';
import Header from '@/components/Header';
import ScreePlot from '@/components/ScreePlot';
import KMeansPlot from '@/components/KMeansPlot';
import Biplot from '@/components/Biplot';
import AttributeTable from '@/components/AttributeTable';
import ScatterplotMatrix from '@/components/ScatterplotMatrix';

interface Props {
  data: AnalyticsData;
}

export default function Dashboard({ data }: Props) {
  const [di, setDi] = useState(data.di);
  const [k, setK] = useState(data.best_k);

  return (
    <TooltipProvider>
      <div className="min-h-screen">
        <Header nPoints={data.points.length} nAttrs={data.n_components} />

        <main className="px-10 py-8 flex flex-col gap-6">
          {/* Row 1 — Scree + K-Means */}
          <div className="grid grid-cols-2 gap-6">
            <ScreePlot data={data} di={di} onDiChange={setDi} />
            <KMeansPlot data={data} k={k} onKChange={setK} />
          </div>

          {/* Row 2 — Biplot + Attribute Table */}
          <div className="grid grid-cols-2 gap-6">
            <Biplot data={data} k={k} />
            <AttributeTable data={data} k={k} di={di}/>
          </div>

          {/* Row 3 — Scatterplot Matrix */}
          <ScatterplotMatrix data={data} k={k} />
        </main>
      </div>
    </TooltipProvider>
  );
}
