import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Sans } from 'next/font/google';
import { LandingNav }          from '@/components/landing/LandingNav';
import { HeroSection }         from '@/components/landing/HeroSection';
import { FeaturesSection }     from '@/components/landing/FeaturesSection';
import { AnalyticsSection }    from '@/components/landing/AnalyticsSection';
import { WorkflowSection }     from '@/components/landing/WorkflowSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection }      from '@/components/landing/PricingSection';
import { LandingFooter }       from '@/components/landing/LandingFooter';

// ─── Marketing-only fonts ─────────────────────────────────
// DM Serif Display for editorial headings; DM Sans for clean marketing body text.
// Both are scoped via CSS variables to the marketing page subtree only.

const serifFont = DM_Serif_Display({
  subsets:  ['latin'],
  weight:   '400',
  variable: '--font-display',
  display:  'swap',
});

const sansFont = DM_Sans({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700'],
  variable: '--font-sans-landing',
  display:  'swap',
});

// ─── Metadata ─────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'ProjectFlow — Modern Project Management',
  description:
    'Kanban boards, analytics, team management, and activity feeds. Everything your team needs to ship on time.',
};

// ─── Page ─────────────────────────────────────────────────

export default function LandingPage(): JSX.Element {
  return (
    <>
      {/* CSS keyframe animations — scoped to .landing-reveal elements */}
      <style>{`
        @keyframes landingFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .landing-reveal {
          opacity: 0;
          animation: landingFadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        html { scroll-behavior: smooth; }
      `}</style>

      {/*
        CSS variable scope: apply both font variables to the root wrapper.
        Components use var(--font-display) for serifs and
        var(--font-sans-landing) for marketing-body text.
      */}
      <div
        className={`${serifFont.variable} ${sansFont.variable}`}
        style={{ fontFamily: "var(--font-sans-landing, 'Inter', system-ui, sans-serif)" }}
      >
        <LandingNav />
        <main>
          <HeroSection />
          <FeaturesSection />
          <AnalyticsSection />
          <WorkflowSection />
          <TestimonialsSection />
          <PricingSection />
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
