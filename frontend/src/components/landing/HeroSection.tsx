import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

// ─── CSS-only dashboard mockup ────────────────────────────

function DashboardMockup(): JSX.Element {
  const statAccents = [
    'rgba(59,130,246,0.25)',
    'rgba(34,197,94,0.25)',
    'rgba(245,158,11,0.25)',
    'rgba(139,92,246,0.25)',
  ] as const;

  const barHeights = [42, 68, 35, 88, 52, 74, 46, 61] as const;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
      {/* Browser chrome */}
      <div
        className="flex items-center gap-4 border-b border-white/[0.07] px-4 py-3"
        style={{ background: '#0d1526' }}
      >
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto rounded-md bg-white/[0.06] px-10 py-1 text-[11px] text-white/25">
          app.projectflow.io/dashboard
        </div>
        <div className="w-16" />
      </div>

      {/* App shell */}
      <div className="flex" style={{ height: '300px', background: '#0f1829' }}>
        {/* Sidebar */}
        <div
          className="flex w-14 flex-col items-center gap-3 border-r border-white/[0.06] py-5"
          style={{ background: '#0a1120' }}
        >
          <div className="mb-1 h-7 w-7 rounded-lg bg-primary-600" />
          {[true, false, false, false, false].map((active, i) => (
            <div
              key={i}
              className="h-5 w-5 rounded"
              style={{ background: active ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)' }}
            />
          ))}
        </div>

        {/* Main */}
        <div className="flex flex-1 flex-col gap-4 p-5">
          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-3">
            {statAccents.map((accent, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/[0.06] p-3"
                style={{ background: accent }}
              >
                <div className="mb-2 h-1.5 w-10 rounded bg-white/20" />
                <div className="h-4 w-8 rounded bg-white/30" />
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid flex-1 grid-cols-3 gap-3">
            {/* Bar chart */}
            <div
              className="col-span-2 flex flex-col gap-3 rounded-xl border border-white/[0.06] p-4"
              style={{ background: 'rgba(255,255,255,0.025)' }}
            >
              <div className="h-1.5 w-24 rounded bg-white/15" />
              <div className="flex flex-1 items-end gap-1.5">
                {barHeights.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all"
                    style={{
                      height: `${h}%`,
                      background: i === 3 ? 'rgba(59,130,246,0.75)' : 'rgba(59,130,246,0.22)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Donut */}
            <div
              className="flex flex-col items-center justify-center gap-3 rounded-xl border border-white/[0.06] p-4"
              style={{ background: 'rgba(255,255,255,0.025)' }}
            >
              <div className="relative h-16 w-16">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="13" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
                  <circle
                    cx="18" cy="18" r="13" fill="none"
                    stroke="#3b82f6" strokeWidth="4"
                    strokeDasharray="57 82" strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-semibold text-white/75">72%</span>
                </div>
              </div>
              <div className="h-1.5 w-14 rounded bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero section ─────────────────────────────────────────

export function HeroSection(): JSX.Element {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-28 text-center"
      style={{ background: '#080e1a' }}
    >
      {/* Top blue radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(37,99,235,0.28) 0%, transparent 65%)',
        }}
      />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Badge */}
      <div className="landing-reveal relative mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
        <span className="text-xs font-medium tracking-wide text-white/60">
          Production-grade project management
        </span>
      </div>

      {/* Headline */}
      <h1
        className="landing-reveal relative mb-6 max-w-4xl text-5xl leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-[5.25rem]"
        style={{
          fontFamily: "var(--font-display, 'Georgia', serif)",
          animationDelay: '0.1s',
        }}
      >
        Manage projects with{' '}
        <em
          className="not-italic"
          style={{
            background: 'linear-gradient(130deg, #93c5fd 0%, #3b82f6 50%, #1d4ed8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          surgical precision
        </em>
      </h1>

      {/* Sub-headline */}
      <p
        className="landing-reveal relative mb-10 max-w-xl text-base leading-relaxed text-white/45 sm:text-lg"
        style={{ animationDelay: '0.2s' }}
      >
        Kanban boards, team management, activity feeds, and advanced analytics —
        everything your team needs to ship on time, every time.
      </p>

      {/* CTAs */}
      <div
        className="landing-reveal relative flex flex-col items-center gap-4 sm:flex-row"
        style={{ animationDelay: '0.3s' }}
      >
        <Link
          href={ROUTES.REGISTER}
          className="group inline-flex items-center gap-2 rounded-xl bg-primary-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-500 hover:shadow-xl hover:shadow-primary-600/40 active:scale-[0.97]"
        >
          Get started free
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            viewBox="0 0 16 16" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>
        <Link
          href={ROUTES.LOGIN}
          className="text-sm font-medium text-white/50 transition-colors hover:text-white/90"
        >
          Sign in to your account
        </Link>
      </div>

      {/* Dashboard mockup */}
      <div
        className="landing-reveal relative mx-auto mt-20 w-full max-w-4xl"
        style={{ animationDelay: '0.45s' }}
      >
        {/* Glow beneath mockup */}
        <div
          className="pointer-events-none absolute -bottom-10 left-1/2 h-32 w-3/4 -translate-x-1/2 rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.2) 0%, transparent 70%)',
            filter: 'blur(24px)',
          }}
        />
        <DashboardMockup />
      </div>
    </section>
  );
}
