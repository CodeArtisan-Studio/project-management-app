import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features',  href: '#features'  },
    { label: 'Workflow',  href: '#workflow'   },
    { label: 'Pricing',   href: '#pricing'    },
    { label: 'Dashboard', href: ROUTES.DASHBOARD },
    { label: 'Reports',   href: ROUTES.REPORTS },
  ],
  Account: [
    { label: 'Sign in',     href: ROUTES.LOGIN    },
    { label: 'Get started', href: ROUTES.REGISTER },
    { label: 'Profile',     href: ROUTES.PROFILE  },
  ],
  Company: [
    { label: 'About',   href: '#' },
    { label: 'Blog',    href: '#' },
    { label: 'Careers', href: '#' },
  ],
  Legal: [
    { label: 'Privacy policy',    href: '#' },
    { label: 'Terms of service',  href: '#' },
    { label: 'Cookie policy',     href: '#' },
  ],
} as const;

export function LandingFooter(): JSX.Element {
  return (
    <footer style={{ background: '#080e1a' }}>
      {/* Top divider glow */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.3) 50%, transparent 100%)',
        }}
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href={ROUTES.HOME}
              className="text-base font-bold text-white"
            >
              ProjectFlow
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-white/35">
              Production-grade project management for teams who ship.
            </p>
          </div>

          {/* Link columns */}
          {(Object.entries(FOOTER_LINKS) as [string, readonly { label: string; href: string }[]][]).map(
            ([group, links]) => (
              <div key={group}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/30">
                  {group}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/45 transition-colors hover:text-white/80"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} ProjectFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-white/20">Built with Next.js 15 + TypeScript</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
