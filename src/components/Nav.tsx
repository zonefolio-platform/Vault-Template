'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface NavProps {
  name: string;
  sections: string[];
}

const SECTION_LABELS: Record<string, string> = {
  work:    'Work',
  about:   'About',
  stack:   'Stack',
  contact: 'Contact',
};

export default function Nav({ name, sections }: NavProps): React.ReactElement {
  const navLinks   = useMemo(
    () => sections.map((id) => ({ label: SECTION_LABELS[id] ?? id, href: `#${id}` })),
    [sections]
  );
  const sectionIds = useMemo(() => ['hero', ...sections], [sections]);
  const [scrolled, setScrolled]           = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const observerRef                       = useRef<IntersectionObserver | null>(null);
  const shouldReduceMotion                = useReducedMotion();

  // Scroll listener — transparent → frosted glass at scrollY > 20
  useEffect(() => {
    function handleScroll(): void {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver — track which section is in viewport
  useEffect(() => {
    const sectionElements: Element[] = [];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the entry with greatest intersection ratio that is intersecting
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!best || entry.intersectionRatio > best.intersectionRatio) {
              best = entry;
            }
          }
        }
        if (best) {
          setActiveSection((best.target as HTMLElement).id);
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        observerRef.current.observe(el);
        sectionElements.push(el);
      }
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sectionIds]);

  const navBackground = scrolled
    ? 'rgba(8,10,15,0.85)'
    : 'transparent';

  const navBackdropFilter = scrolled ? 'blur(12px)' : 'none';

  const transition = shouldReduceMotion
    ? undefined
    : 'background 0.3s ease, backdrop-filter 0.3s ease';

  return (
    <nav
      style={{
        position:          'fixed',
        top:               0,
        left:              0,
        right:             0,
        zIndex:            100,
        height:            '56px',
        padding:           '0 48px',
        display:           'flex',
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'space-between',
        background:        navBackground,
        backdropFilter:    navBackdropFilter,
        WebkitBackdropFilter: navBackdropFilter,
        borderBottom:      '1px solid var(--vault-border)',
        transition,
      }}
      aria-label="Primary navigation"
    >
      {/* Left — display name */}
      <a
        href="#hero"
        style={{
          fontFamily:     'var(--vault-font-display)',
          fontWeight:     500,
          fontSize:       '14px',
          color:          'var(--vault-text-primary)',
          textDecoration: 'none',
          letterSpacing:  '-0.2px',
          lineHeight:     1,
        }}
        aria-label="Back to top"
      >
        {name}
      </a>

      {/* Right — section links */}
      <ul
        role="list"
        style={{
          display:    'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap:        'clamp(16px, 3vw, 32px)',
          listStyle:  'none',
          margin:     0,
          padding:    0,
        }}
      >
        {navLinks.map(({ label, href }) => {
          const sectionId = href.replace('#', '');
          const isActive  = activeSection === sectionId;

          return (
            <li key={href}>
              <a
                href={href}
                aria-current={isActive ? 'true' : undefined}
                style={{
                  fontFamily:     'var(--vault-font-body)',
                  fontWeight:     400,
                  fontSize:       '14px',
                  color:          isActive
                    ? 'var(--vault-text-primary)'
                    : 'var(--vault-text-secondary)',
                  textDecoration: 'none',
                  paddingBottom:  '3px',
                  borderBottom:   isActive
                    ? '1px solid var(--accent)'
                    : '1px solid transparent',
                  transition:     shouldReduceMotion
                    ? undefined
                    : 'color 0.2s ease, border-color 0.2s ease',
                  lineHeight:     1,
                }}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
