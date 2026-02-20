interface PricingTier {
  name:       string;
  price:      string;
  period:     string;
  description: string;
  features:   string[];
  cta:        string;
  highlighted: boolean;
}

const tiers: PricingTier[] = [
  {
    name:        'Free',
    price:       '$0',
    period:      'forever',
    description: 'For individuals and small teams getting started.',
    features: [
      'Up to 3 projects',
      '5 team members',
      'Kanban board',
      'Basic activity log',
      'Community support',
    ],
    cta:         'Get started free',
    highlighted: false,
  },
  {
    name:        'Pro',
    price:       '$19',
    period:      'per seat / month',
    description: 'For growing teams that need analytics and unlimited scale.',
    features: [
      'Unlimited projects',
      'Unlimited members',
      'Advanced analytics & reports',
      'Custom task statuses',
      'Date range & project filters',
      'Priority support',
    ],
    cta:         'Start Pro trial',
    highlighted: true,
  },
  {
    name:        'Enterprise',
    price:       'Custom',
    period:      'contact us',
    description: 'For large organisations with compliance and SLA requirements.',
    features: [
      'Everything in Pro',
      'SSO / SAML integration',
      'Dedicated SLA',
      'Custom data retention',
      'Audit logs export',
      'Dedicated account manager',
    ],
    cta:         'Contact sales',
    highlighted: false,
  },
];

function CheckIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="h-4 w-4 shrink-0 text-primary-600" aria-hidden="true">
      <path d="M2.5 7.5l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PricingCard(tier: PricingTier): JSX.Element {
  if (tier.highlighted) {
    return (
      <div className="relative flex flex-col rounded-2xl bg-primary-600 p-8 shadow-xl shadow-primary-600/20">
        {/* Popular badge */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-white px-4 py-1 text-xs font-bold text-primary-700 shadow-sm">
            Most popular
          </span>
        </div>

        <div className="mb-6">
          <p className="mb-1 text-sm font-semibold text-white/70">{tier.name}</p>
          <div className="flex items-end gap-1">
            <span
              className="text-4xl font-bold text-white"
              style={{ fontFamily: "var(--font-display, 'Georgia', serif)" }}
            >
              {tier.price}
            </span>
            <span className="mb-1 text-sm text-white/50">/{tier.period}</span>
          </div>
          <p className="mt-2 text-sm text-white/60">{tier.description}</p>
        </div>

        <ul className="mb-8 flex flex-col gap-3">
          {tier.features.map((f) => (
            <li key={f} className="flex items-center gap-3">
              <svg viewBox="0 0 14 14" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
                <path d="M2.5 7.5l3 3 6-6" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-white/80">{f}</span>
            </li>
          ))}
        </ul>

        <button className="mt-auto rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary-700 shadow-sm transition-all hover:bg-neutral-50 active:scale-[0.97]">
          {tier.cta}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <p className="mb-1 text-sm font-semibold text-neutral-500">{tier.name}</p>
        <div className="flex items-end gap-1">
          <span
            className="text-4xl font-bold text-neutral-900"
            style={{ fontFamily: "var(--font-display, 'Georgia', serif)" }}
          >
            {tier.price}
          </span>
          <span className="mb-1 text-sm text-neutral-400">/{tier.period}</span>
        </div>
        <p className="mt-2 text-sm text-neutral-500">{tier.description}</p>
      </div>

      <ul className="mb-8 flex flex-col gap-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-center gap-3">
            <CheckIcon />
            <span className="text-sm text-neutral-600">{f}</span>
          </li>
        ))}
      </ul>

      <button className="mt-auto rounded-xl border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.97]">
        {tier.cta}
      </button>
    </div>
  );
}

export function PricingSection(): JSX.Element {
  return (
    <section id="pricing" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-600">
            Pricing
          </span>
        </div>
        <div className="mb-16 text-center">
          <h2
            className="text-4xl text-neutral-900 sm:text-[2.75rem]"
            style={{ fontFamily: "var(--font-display, 'Georgia', serif)" }}
          >
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-base text-neutral-500">
            Start free. Upgrade when your team grows.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <PricingCard key={tier.name} {...tier} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-neutral-400">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
