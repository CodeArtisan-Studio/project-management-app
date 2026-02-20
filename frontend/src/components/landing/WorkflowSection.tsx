const steps = [
  {
    number: '01',
    title: 'Create your project',
    description:
      'Set up a project in seconds. Add a name, description, and status. Your project gets its own Kanban board and activity log instantly.',
    accent: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    number: '02',
    title: 'Invite your team',
    description:
      'Add members by email and assign roles. Admins manage everything; Maintainers own their projects; Members see what they need to.',
    accent: 'bg-violet-50 text-violet-600 border-violet-100',
  },
  {
    number: '03',
    title: 'Build your board',
    description:
      'Create custom task statuses that match your real workflow. Add tasks, assign owners, set priorities, and start moving cards.',
    accent: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    number: '04',
    title: 'Track & ship',
    description:
      'Watch the dashboard update in real time. Use the Reports page to review velocity, spot bottlenecks, and celebrate completions.',
    accent: 'bg-amber-50 text-amber-600 border-amber-100',
  },
] as const;

export function WorkflowSection(): JSX.Element {
  return (
    <section id="workflow" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-600">
            How it works
          </span>
        </div>
        <div className="mb-16 text-center">
          <h2
            className="text-4xl text-neutral-900 sm:text-[2.75rem]"
            style={{ fontFamily: "var(--font-display, 'Georgia', serif)" }}
          >
            Up and running in minutes
          </h2>
          <p className="mt-4 text-base text-neutral-500">
            Four steps from sign-up to your first shipped task.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Connector line (desktop) */}
          <div
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-10 hidden h-px lg:block"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, #e4e4e7 10%, #e4e4e7 90%, transparent 100%)',
            }}
          />

          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col gap-4">
              {/* Number badge */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white ${step.accent} relative z-10 shadow-sm`}>
                <span className="text-sm font-bold">{step.number}</span>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-neutral-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
