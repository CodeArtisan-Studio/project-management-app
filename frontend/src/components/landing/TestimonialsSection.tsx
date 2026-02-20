interface Testimonial {
  quote:   string;
  name:    string;
  role:    string;
  company: string;
  initials: string;
  avatarBg: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'We migrated four teams from three different tools onto ProjectFlow. The role-based access alone saved us two hours of admin work every week.',
    name:     'Sarah Chen',
    role:     'Engineering Manager',
    company:  'Axiom Labs',
    initials: 'SC',
    avatarBg: 'bg-blue-600',
  },
  {
    quote:
      "The analytics reports finally gave us visibility into where tasks were getting stuck. We cut our average cycle time by 35% in the first month.",
    name:     'Marcus Reyes',
    role:     'Head of Product',
    company:  'Volta Systems',
    initials: 'MR',
    avatarBg: 'bg-violet-600',
  },
  {
    quote:
      'Custom Kanban columns that actually match our QA workflow — that was the dealbreaker. Everything else is a bonus.',
    name:     'Priya Nair',
    role:     'Lead Developer',
    company:  'Brightforge',
    initials: 'PN',
    avatarBg: 'bg-emerald-600',
  },
];

function StarRating(): JSX.Element {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <svg key={i} viewBox="0 0 12 12" fill="#f59e0b" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M6 .587l1.409 2.854 3.15.458-2.279 2.22.538 3.135L6 7.604l-2.818 1.65.538-3.135L1.441 3.9l3.15-.458L6 .587z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ quote, name, role, company, initials, avatarBg }: Testimonial): JSX.Element {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <StarRating />
      <p className="flex-1 text-sm leading-relaxed text-neutral-600">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 border-t border-neutral-100 pt-5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarBg}`}>
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">{name}</p>
          <p className="text-xs text-neutral-400">
            {role} · {company}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection(): JSX.Element {
  return (
    <section className="bg-neutral-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-600">
            Testimonials
          </span>
        </div>
        <div className="mb-16 text-center">
          <h2
            className="text-4xl text-neutral-900 sm:text-[2.75rem]"
            style={{ fontFamily: "var(--font-display, 'Georgia', serif)" }}
          >
            Trusted by shipping teams
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
