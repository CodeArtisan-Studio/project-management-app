// ─── CSS chart mock ───────────────────────────────────────

function AnalyticsMock(): JSX.Element {
  const bars   = [38, 55, 42, 78, 61, 85, 54, 70, 46, 88, 65, 72] as const;
  const legend = [
    { label: 'Done',        color: '#22c55e' },
    { label: 'In Progress', color: '#3b82f6' },
    { label: 'To Do',       color: '#a1a1aa' },
  ] as const;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 p-6"
      style={{ background: '#111827' }}
    >
      {/* Header row */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-white/30">
            Tasks by status · Last 30 days
          </p>
          <p className="mt-0.5 text-2xl font-bold text-white">247 tasks</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] text-white/50">+12% this week</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="mb-5 flex h-28 items-end gap-1.5">
        {bars.map((h, i) => {
          const isHighlight = i === 7;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: `${h}%`,
                  background: isHighlight
                    ? 'rgba(59,130,246,0.8)'
                    : 'rgba(59,130,246,0.2)',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="mb-5 flex justify-between">
        {['Jan 15', 'Jan 20', 'Jan 25', 'Jan 30', 'Feb 4', 'Feb 9'].map((d) => (
          <span key={d} className="text-[9px] text-white/25">{d}</span>
        ))}
      </div>

      {/* Divider */}
      <div className="mb-4 h-px bg-white/[0.07]" />

      {/* Mini donut + stats row */}
      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative h-14 w-14 shrink-0">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle cx="18" cy="18" r="13" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle cx="18" cy="18" r="13" fill="none" stroke="#22c55e" strokeWidth="5" strokeDasharray="50 82" strokeLinecap="round" />
            <circle cx="18" cy="18" r="13" fill="none" stroke="#3b82f6" strokeWidth="5" strokeDasharray="28 82" strokeDashoffset="-50" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white/80">62%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-1.5">
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[11px] text-white/50">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Rate */}
        <div className="ml-auto text-right">
          <p className="text-xl font-bold text-white">62%</p>
          <p className="text-[11px] text-white/35">completion rate</p>
        </div>
      </div>

      {/* Subtle inner glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)' }}
      />
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────

export function AnalyticsSection(): JSX.Element {
  return (
    <section
      className="py-24"
      style={{ background: '#080e1a' }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Copy */}
          <div>
            <span className="mb-5 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/50">
              Analytics
            </span>
            <h2
              className="mb-5 text-4xl leading-tight text-white sm:text-[2.75rem]"
              style={{ fontFamily: "var(--font-display, 'Georgia', serif)" }}
            >
              Data that helps you<br />
              <em className="not-italic" style={{
                background: 'linear-gradient(130deg, #93c5fd, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                make better decisions
              </em>
            </h2>
            <p className="mb-8 text-base leading-relaxed text-white/45">
              Filter by project and date range. Instantly see completion rates,
              activity trends, and team workload. No spreadsheets. No exports.
              Just insight.
            </p>

            <ul className="flex flex-col gap-4">
              {[
                'Completion rate ring gauge with live colour feedback',
                'Activity over time — daily or weekly granularity',
                'Tasks by project and assignee (horizontal bar charts)',
                'Filter by date range and project scope simultaneously',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-600/20">
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/60">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chart mock */}
          <AnalyticsMock />
        </div>
      </div>
    </section>
  );
}
