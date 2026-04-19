'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface NavProps {
  name:     string;
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
    () => sections.map((id) => ({ id, label: SECTION_LABELS[id] ?? id })),
    [sections]
  );

  const [activeSection, setActiveSection] = useState<string>('hero');
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const shouldReduceMotion                = useReducedMotion();

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Scroll → frosted glass + active section tracking
  useEffect(() => {
    const NAV_H = 66; // nav height + small buffer

    function handleScroll(): void {
      setScrolled(window.scrollY > 20);

      // At very bottom of page → force last section active
      if (
        sections.length > 0 &&
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10
      ) {
        setActiveSection(sections[sections.length - 1]);
        return;
      }

      // Walk reversed — first section whose top edge is at or above the nav bottom
      // getBoundingClientRect is viewport-relative, works on all section heights
      const allIds = ['hero', ...sections];
      for (const id of [...allIds].reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= NAV_H) {
          setActiveSection(id);
          return;
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  function scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  }

  const navBg         = scrolled ? 'rgba(8,10,15,0.88)' : 'rgba(8,10,15,0.6)';
  const navBackdrop   = 'blur(12px)';
  const navTransition = shouldReduceMotion
    ? undefined
    : 'background 0.3s ease';

  // Animated hamburger bar style
  const barBase: React.CSSProperties = {
    width:        '20px',
    height:       '2px',
    background:   'var(--vault-text-primary)',
    borderRadius: '2px',
    display:      'block',
  };

  return (
    <>
      {/* ── Main nav bar ── */}
      <nav
        aria-label="Primary navigation"
        style={{
          position:             'fixed',
          top:                  0,
          left:                 0,
          right:                0,
          zIndex:               100,
          height:               '56px',
          display:              'flex',
          alignItems:           'center',
          padding:              '0 24px 0 32px',
          background:           navBg,
          backdropFilter:       navBackdrop,
          WebkitBackdropFilter: navBackdrop,
          borderBottom:         '1px solid var(--vault-border)',
          transition:           navTransition,
        }}
      >
        {/* Left — display name (flex-1) */}
        <div style={{ flex: 1 }}>
          <button
            onClick={() => scrollTo('hero')}
            style={{
              fontFamily:     'var(--vault-font-display)',
              fontWeight:     700,
              fontSize:       '15px',
              letterSpacing:  '-0.3px',
              color:          'var(--vault-text-primary)',
              background:     'none',
              border:         'none',
              cursor:         'pointer',
              padding:        0,
              lineHeight:     1,
              transition:     'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.75'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            {name}
          </button>
        </div>

        {/* Center — section links, desktop only */}
        <div
          style={{
            display:    'none',
            alignItems: 'center',
            gap:        'clamp(20px, 3vw, 36px)',
          }}
          className="nav-links-desktop"
        >
          {navLinks.map(({ id, label }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  position:   'relative',
                  fontFamily: 'var(--vault-font-body)',
                  fontWeight: 500,
                  fontSize:   '14px',
                  color:      isActive ? 'var(--accent)' : 'rgba(240,242,248,0.7)',
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  padding:    '0 0 4px',
                  lineHeight: 1,
                  transition: 'color 0.2s ease',
                }}
              >
                {label}
                {isActive && !shouldReduceMotion && (
                  <motion.span
                    layoutId="nav-underline"
                    style={{
                      position:   'absolute',
                      bottom:     '-1px',
                      left:       0,
                      right:      0,
                      height:     '2px',
                      borderRadius: '2px',
                      background: 'var(--accent)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {isActive && shouldReduceMotion && (
                  <span
                    style={{
                      position:   'absolute',
                      bottom:     '-1px',
                      left:       0,
                      right:      0,
                      height:     '2px',
                      borderRadius: '2px',
                      background: 'var(--accent)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right — spacer (desktop) + hamburger (mobile) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            style={{
              display:        'flex',
              flexDirection:  'column',
              gap:            '5px',
              padding:        '8px',
              minWidth:       '44px',
              minHeight:      '44px',
              alignItems:     'center',
              justifyContent: 'center',
              background:     'none',
              border:         'none',
              cursor:         'pointer',
            }}
          >
            <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }}   style={barBase} />
            <motion.span animate={{ opacity: menuOpen ? 0 : 1 }}                          style={barBase} />
            <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} style={barBase} />
          </button>
        </div>
      </nav>

      {/* CSS: show desktop links, hide hamburger on md+ */}
      <style>{`
        @media (min-width: 768px) {
          .nav-links-desktop { display: flex !important; }
          .nav-hamburger     { display: none  !important; }
        }
      `}</style>

      {/* ── Mobile fullscreen overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            style={{
              position:             'fixed',
              inset:                0,
              zIndex:               99,
              display:              'flex',
              flexDirection:        'column',
              alignItems:           'center',
              justifyContent:       'center',
              gap:                  '36px',
              background:           'rgba(8,10,15,0.97)',
              backdropFilter:       'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              style={{
                position:   'absolute',
                top:        '20px',
                right:      '24px',
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                color:      'var(--vault-text-secondary)',
                fontSize:   '24px',
                lineHeight: 1,
                padding:    '4px',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--vault-text-primary)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--vault-text-secondary)'; }}
            >
              ×
            </button>

            {navLinks.map(({ id, label }, i) => {
              const isActive = activeSection === id;
              return (
                <motion.button
                  key={id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  onClick={() => scrollTo(id)}
                  style={{
                    fontFamily:     'var(--vault-font-display)',
                    fontWeight:     600,
                    fontSize:       '32px',
                    letterSpacing:  '-1px',
                    color:          isActive ? 'var(--accent)' : 'rgba(240,242,248,0.85)',
                    background:     'none',
                    border:         'none',
                    cursor:         'pointer',
                    transition:     'color 0.2s ease',
                    lineHeight:     1,
                    padding:        0,
                  }}
                >
                  {label}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
