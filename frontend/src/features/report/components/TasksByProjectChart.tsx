'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ProjectTaskBreakdown } from '@/features/report/types/report.types';

const tooltipStyle = {
  borderRadius: '8px',
  border: '1px solid #e4e4e7',
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  fontSize: '12px',
};

/** Truncate long project names for the Y-axis tick. */
function truncate(str: string, max = 22): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

interface TasksByProjectChartProps {
  data: ProjectTaskBreakdown[];
}

export function TasksByProjectChart({ data }: TasksByProjectChartProps): JSX.Element {
  if (data.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-1">
        <p className="text-sm text-neutral-400">No project data for this period</p>
      </div>
    );
  }

  // Sort descending by total, cap at 10 items
  const chartData = [...data]
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((d) => ({
      name:  truncate(d.projectName),
      total: d.total,
    }));

  const chartHeight = Math.max(200, chartData.length * 44 + 20);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 0, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#f4f4f5" />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#a1a1aa' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: '#52525b' }}
          axisLine={false}
          tickLine={false}
          width={130}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number | undefined) => [value ?? 0, 'Tasks']}
          cursor={{ fill: '#f4f4f5' }}
        />
        <Bar
          dataKey="total"
          fill="#3b82f6"
          radius={[0, 4, 4, 0]}
          maxBarSize={28}
          animationDuration={600}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
