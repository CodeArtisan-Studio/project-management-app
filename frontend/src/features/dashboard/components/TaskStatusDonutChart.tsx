'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TaskStatusCount } from '@/features/report/types/report.types';

// ─── Color map ────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  TODO:        '#a1a1aa',
  IN_PROGRESS: '#3b82f6',
  CODE_REVIEW: '#f59e0b',
  DONE:        '#22c55e',
};

const FALLBACK_COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16'];

function getColor(name: string, index: number): string {
  return STATUS_COLORS[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

const tooltipStyle = {
  borderRadius: '8px',
  border: '1px solid #e4e4e7',
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  fontSize: '12px',
};

function formatLabel(name: string): string {
  return name
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

// ─── Component ────────────────────────────────────────────

interface TaskStatusDonutChartProps {
  data:  TaskStatusCount[];
  total: number;
}

export function TaskStatusDonutChart({ data, total }: TaskStatusDonutChartProps): JSX.Element {
  if (total === 0 || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <svg className="h-8 w-8 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm text-neutral-400">No task data</p>
      </div>
    );
  }

  // Merge entries that share the same display name (counts are summed).
  // This prevents duplicate legend rows when the API returns multiple
  // statuses that format to the same label.
  const merged = new Map<string, { name: string; value: number; color: string }>();
  data.forEach((d, i) => {
    const label = formatLabel(d.statusName);
    const existing = merged.get(label);
    if (existing) {
      existing.value += d.count;
    } else {
      merged.set(label, { name: label, value: d.count, color: getColor(d.statusName, i) });
    }
  });
  const chartData = Array.from(merged.values());

  return (
    <div className="flex flex-col">
      {/* Chart — Legend removed from inside recharts to prevent SVG clipping */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={210}>
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
              animationBegin={0}
              animationDuration={700}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined, name: string | undefined) => [`${value ?? 0} tasks`, name ?? '']}
              contentStyle={tooltipStyle}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label — positioned relative to the chart div, not the SVG */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-neutral-900">{total}</span>
          <span className="text-[11px] text-neutral-400">tasks</span>
        </div>
      </div>

      {/* Custom HTML legend — sits outside the SVG, never clipped */}
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 px-2 pb-1">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[11px] text-neutral-500">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
