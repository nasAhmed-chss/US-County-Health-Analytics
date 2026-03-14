import { readFile } from 'fs/promises';
import path from 'path';
import { AnalyticsData } from '@/lib/types';
import Dashboard from '@/components/Dashboard';

// Runs server-side at build time or on each request
async function getData(): Promise<AnalyticsData> {
  const filePath = path.join(process.cwd(), 'public', 'data', 'pca_data.json');
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw) as AnalyticsData;
}

export default async function Page() {
  const data = await getData();
  return <Dashboard data={data} />;
}
