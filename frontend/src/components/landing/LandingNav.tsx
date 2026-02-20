'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

const NAV_LINKS = [
  { label: 'Features',  href: '#features'  },
  { label: 'Workflow',  href: '#workflow'  },
  { label: 'Pricing',   href: '#pricing'   },
] as const;

export function LandingNav(): JSX.Element {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const textBase   = scrolled ? 'text-neutral-600 hover:text-neutral-900' : 'text-white/70 hover:text-white';
  const logoColor  = scrolled ? 'text-neutral-900' : 'text-white';
  const headerBg   = scrolled
    ? 'bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm'
    : 'bg-transparent';

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${headerBg}`}>
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className={`text-base font-bold tracking-tight transition-colors ${logoColor}`}
          >
            ProjectFlow
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${textBase}`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href={ROUTES.LOGIN}
              className={`text-sm font-medium transition-colors ${textBase}`}
            >
              Sign in
            </Link>
            <Link
              href={ROUTES.REGISTER}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md active:scale-[0.97]"
            >
              Get started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`flex flex-col gap-1.5 p-2 md:hidden ${scrolled ? 'text-neutral-700' : 'text-white'}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-5 rounded bg-current transition-all ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 rounded bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 rounded bg-current transition-all ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-neutral-200 bg-white px-6 pb-6 pt-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
              >
                {item.label}
              </a>
            ))}
            <hr className="border-neutral-100" />
            <Link href={ROUTES.LOGIN}    className="text-sm font-medium text-neutral-600">Sign in</Link>
            <Link href={ROUTES.REGISTER} className="rounded-lg bg-primary-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-700">
              Get started free
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
