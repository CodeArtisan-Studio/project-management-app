// ─── Feature data ─────────────────────────────────────────

interface Feature {
  title:       string;
  description: string;
  icon:        JSX.Element;
  accent:      string;
}

const features: Feature[] = [
  {
    title: 'Kanban boards',
    description:
      'Drag-and-drop task management with fully customisable status columns scoped per project. Ship work in the order that matters.',
    accent: 'bg-blue-50 text-blue-600',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M2 4a1 1 0 011-1h3a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h3a1 1 0 011 1v7a1 1 0 01-1 1H9a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    title: 'Role-based access',
    description:
      'Admin, Maintainer, and Member roles with granular permission scoping. Every API endpoint enforces your team hierarchy.',
    accent: 'bg-violet-50 text-violet-600',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Analytics & reports',
    description:
      'Completion rates, activity trends, tasks by project and assignee — filterable by date range and project scope.',
    accent: 'bg-emerald-50 text-emerald-600',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    title: 'Activity timeline',
    description:
      'Every create, update, delete, and status change is logged. Full workspace-wide audit trail with project and action filters.',
    accent: 'bg-amber-50 text-amber-600',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Custom task statuses',
    description:
      'Every project gets its own status board. Create, reorder, and remove columns. Your workflow, your rules.',
    accent: 'bg-sky-50 text-sky-600',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    title: 'Team management',
    description:
      'Invite members by email, assign tasks, track individual workloads. Project membership is controlled at the project level.',
    accent: 'bg-rose-50 text-rose-600',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
];

// ─── Feature card ─────────────────────────────────────────

function FeatureCard({ title, description, icon, accent }: Feature): JSX.Element {
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-md">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <div>
        <h3
          className="mb-2 text-sm font-semibold text-neutral-900"
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-neutral-500">{description}</p>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────

export function FeaturesSection(): JSX.Element {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-600">
            Features
          </span>
        </div>
        <div className="mb-16 text-center">
          <h2
            className="text-4xl text-neutral-900 sm:text-[2.75rem]"
            style={{ fontFamily: "var(--font-display, 'Georgia', serif)" }}
          >
            Everything your team needs
          </h2>
          <p className="mt-4 text-base text-neutral-500">
            Six essential pillars of modern project management, production-ready out of the box.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
