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
import type { ActivityDataPoint } from '@/features/report/types/report.types';

const tooltipStyle = {
  borderRadius: '8px',
  border: '1px solid #e4e4e7',
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  fontSize: '12px',
};

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Build the last `days` calendar dates (UTC) as YYYY-MM-DD strings. */
function buildDayBuckets(days: number): string[] {
  const result: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

interface DailyActivityBarChartProps {
  /** Full 30-day activity array from the API (filtered to last 7 here). */
  data: ActivityDataPoint[];
}

export function DailyActivityBarChart({ data }: DailyActivityBarChartProps): JSX.Element {
  const countByDate = new Map(data.map((d) => [d.date, d.count]));
  const buckets = buildDayBuckets(7);

  const chartData = buckets.map((dateStr) => {
    const date = new Date(dateStr + 'T00:00:00Z');
    return {
      day:   WEEKDAY[date.getUTCDay()],
      count: countByDate.get(dateStr) ?? 0,
    };
  });

  const isEmpty = chartData.every((d) => d.count === 0);

  if (isEmpty) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center gap-1">
        <p className="text-sm text-neutral-400">No activity in the last 7 days</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: '#a1a1aa' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#a1a1aa' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={28}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number | undefined) => [value ?? 0, 'Events']}
          cursor={{ fill: '#f4f4f5' }}
        />
        <Bar
          dataKey="count"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
          animationDuration={600}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
