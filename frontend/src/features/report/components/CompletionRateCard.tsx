'use client';

import { Skeleton } from '@/components/ui/Skeleton';

// ─── SVG ring constants ───────────────────────────────────
const CX = 60;
const CY = 60;
const R  = 48;
const STROKE_W = 9;
const CIRCUMFERENCE = 2 * Math.PI * R; // ≈ 301.6

interface CompletionRateCardProps {
  totalTasks:     number;
  completedTasks: number;
  completionRate: number; // 0–100
  isLoading?:     boolean;
  isError?:       boolean;
}

export function CompletionRateCard({
  totalTasks,
  completedTasks,
  completionRate,
  isLoading,
  isError,
}: CompletionRateCardProps): JSX.Element {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <Skeleton className="h-[120px] w-[120px] rounded-full" />
        <Skeleton className="h-4 w-36" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md bg-red-50">
        <p className="text-sm text-red-500">Failed to load completion rate.</p>
      </div>
    );
  }

  const rate         = Math.max(0, Math.min(100, completionRate));
  const dashFill     = (rate / 100) * CIRCUMFERENCE;
  const dashGap      = CIRCUMFERENCE - dashFill;
  // Rotate -90° so the fill starts from the top of the ring
  const dashOffset   = CIRCUMFERENCE * 0.25;

  // Color shift: grey → amber → green based on rate
  const ringColor =
    rate >= 70 ? '#22c55e' :
    rate >= 40 ? '#f59e0b' :
    '#3b82f6';

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* Ring gauge */}
      <div className="relative">
        <svg
          width={CX * 2}
          height={CY * 2}
          viewBox={`0 0 ${CX * 2} ${CY * 2}`}
          aria-label={`Completion rate: ${rate.toFixed(1)}%`}
        >
          {/* Track */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="#f4f4f5"
            strokeWidth={STROKE_W}
          />
          {/* Progress arc */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE_W}
            strokeLinecap="round"
            strokeDasharray={`${dashFill} ${dashGap}`}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dasharray 0.7s ease, stroke 0.4s ease' }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-neutral-900">
            {rate.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-1.5 text-sm text-neutral-500">
        <span className="font-semibold text-neutral-900">{completedTasks}</span>
        <span>/</span>
        <span className="font-semibold text-neutral-900">{totalTasks}</span>
        <span>tasks completed</span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[160px]">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${rate}%`, backgroundColor: ringColor }}
          />
        </div>
      </div>
    </div>
  );
}
