'use client';

import { useMemo } from 'react';
import { PortfolioData } from '@/types';
import { isFilled } from '@/lib/is-filled';
import Nav from './Nav';
import Hero from './Hero';
import Work from './Work';
import About from './About';
import Stack from './Stack';
import Contact from './Contact';
import Footer from './Footer';
import SplashCursorLoader from './SplashCursorLoader';

interface VaultShellProps {
  data: PortfolioData;
}

export default function VaultShell({ data }: VaultShellProps): React.ReactElement {
  const hero = data.hero;
  const showHero = isFilled(hero?.name) || isFilled(hero?.title);

  const rawProjects   = data.projects?.projects ?? [];
  const validProjects = rawProjects.filter((p) => isFilled(p.name));
  const showWork      = validProjects.length > 0;

  const about       = data.about;
  const validSkills = (about?.skills ?? []).filter((s) => isFilled(s));
  const validExp    = (about?.experience ?? []).filter((e) => isFilled(e.position));
  const validEdu    = (about?.education  ?? []).filter((e) => isFilled(e.degree));
  const showAbout   = isFilled(about?.bio) || validSkills.length > 0 || validExp.length > 0 || validEdu.length > 0;

  const showStack   = validSkills.length > 0;

  const contact     = data.contact;
  const showContact =
    isFilled(contact?.email)    ||
    isFilled(contact?.phone)    ||
    isFilled(contact?.whatsapp) ||
    isFilled(contact?.location);

  const visibleSections = useMemo(
    () =>
      ([
        showWork    && 'work',
        showAbout   && 'about',
        showStack   && 'stack',
        showContact && 'contact',
      ] as (string | false)[]).filter((s): s is string => Boolean(s)),
    [showWork, showAbout, showStack, showContact]
  );

  const available     = data.meta?.plan !== 'UNAVAILABLE';
  const showBranding  = data.meta?.plan !== 'PRO' && data.meta?.showBranding !== false;

  return (
    <>
      <Nav name={hero?.name ?? ''} sections={visibleSections} />
      <SplashCursorLoader />

      <main>
        {showHero    && <Hero    data={hero}          available={available} />}
        {showWork    && <Work    data={data.projects} />}
        {showAbout   && <About   data={about}         />}
        {showStack   && <Stack   skills={validSkills} />}
        {showContact && <Contact data={contact}       />}
      </main>

      <Footer />

      {/* ZoneFolio badge — shown for FREE / one-time plans */}
      {showBranding && (
        <a
          href="https://zonefolio.app"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Made with ZoneFolio"
          style={{
            position:      'fixed',
            bottom:        '24px',
            right:         '24px',
            zIndex:        50,
            display:       'flex',
            alignItems:    'center',
            gap:           '12px',
            padding:       '10px 16px',
            borderRadius:  '100px',
            background:    'var(--vault-surface)',
            border:        '1px solid var(--vault-border-mid)',
            boxShadow:     '0 4px 24px rgba(0,0,0,0.5)',
            textDecoration: 'none',
            transition:    'opacity 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.opacity = '0.8';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 32px var(--accent-glow)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.5)';
          }}
        >
          {/* Zf icon tile */}
          <span
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          '28px',
              height:         '28px',
              borderRadius:   '8px',
              background:     'var(--accent)',
              fontFamily:     'var(--vault-font-display)',
              fontWeight:     700,
              fontSize:       '12px',
              color:          '#ffffff',
              letterSpacing:  '-0.5px',
              flexShrink:     0,
            }}
          >
            Zf
          </span>
          {/* Label */}
          <span
            style={{
              fontFamily:  'var(--vault-font-body)',
              fontWeight:  500,
              fontSize:    '13px',
              color:       'var(--vault-text-primary)',
              whiteSpace:  'nowrap',
            }}
          >
            Made with ZoneFolio
          </span>
        </a>
      )}
    </>
  );
}
