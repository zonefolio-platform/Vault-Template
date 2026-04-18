'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PortfolioData } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroProps {
  data?: PortfolioData['hero'];
  available?: boolean;
}

// ─── Aurora background ────────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const sanitised = hex.trim().replace(/^#/, '');
  if (sanitised.length === 3) {
    const [r, g, b] = sanitised.split('').map((c) => parseInt(c + c, 16));
    return { r, g, b };
  }
  if (sanitised.length === 6) {
    const r = parseInt(sanitised.slice(0, 2), 16);
    const g = parseInt(sanitised.slice(2, 4), 16);
    const b = parseInt(sanitised.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

interface AuroraProps {
  isMobile: boolean;
  reducedMotion: boolean;
}

function Aurora({ isMobile, reducedMotion }: AuroraProps): React.ReactElement {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const accentValue = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim();

    const rgb = hexToRgb(accentValue) ?? { r: 58, g: 123, b: 255 };

    el.style.setProperty('--accent-r', String(rgb.r));
    el.style.setProperty('--accent-g', String(rgb.g));
    el.style.setProperty('--accent-b', String(rgb.b));
  }, []);

  const baseOpacity = isMobile ? 0.5 : 1;
  const opacity     = reducedMotion ? 0.5 : baseOpacity;

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      style={{
        position:  'absolute',
        inset:     0,
        zIndex:    0,
        opacity,
        animation: reducedMotion
          ? 'none'
          : 'aurora-shift 12s ease-in-out infinite alternate',
        // Background uses CSS custom properties set in useEffect above
        background: `
          radial-gradient(ellipse 70% 60% at 20% 50%,
            rgba(var(--accent-r, 58), var(--accent-g, 123), var(--accent-b, 255), 0.18) 0%,
            transparent 70%),
          radial-gradient(ellipse 50% 40% at 80% 30%,
            rgba(var(--accent-r, 58), var(--accent-g, 123), var(--accent-b, 255), 0.08) 0%,
            transparent 60%),
          radial-gradient(ellipse 40% 50% at 60% 80%,
            rgba(var(--accent-r, 58), var(--accent-g, 123), var(--accent-b, 255), 0.06) 0%,
            transparent 60%)
        `,
      }}
    />
  );
}

// ─── Grid overlay ─────────────────────────────────────────────────────────────

function GridOverlay(): React.ReactElement {
  return (
    <div
      aria-hidden="true"
      style={{
        position:           'absolute',
        inset:              0,
        zIndex:             0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize:     '48px 48px',
        maskImage:          'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
        WebkitMaskImage:    'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
      }}
    />
  );
}

// ─── Eyebrow row ──────────────────────────────────────────────────────────────

interface EyebrowProps {
  available: boolean;
  title?: string;
}

function Eyebrow({ available, title }: EyebrowProps): React.ReactElement | null {
  const text = available ? 'Available for work' : title;
  if (!text) return null;

  return (
    <div
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           '10px',
        marginBottom:  '24px',
      }}
    >
      {/* 32×1 accent line */}
      <span
        aria-hidden="true"
        style={{
          display:    'block',
          width:      '32px',
          height:     '1px',
          background: 'var(--accent)',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily:    'var(--vault-font-mono)',
          fontSize:      '10px',
          fontWeight:    500,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color:         'var(--accent)',
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── Display name with BlurText entrance ──────────────────────────────────────

interface DisplayNameProps {
  name?: string;
  isMobile: boolean;
  reducedMotion: boolean;
}

function DisplayName({ name, isMobile, reducedMotion }: DisplayNameProps): React.ReactElement {
  const hasMountedRef = useRef(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!hasMountedRef.current && !reducedMotion) {
      hasMountedRef.current = true;
      setShouldAnimate(true);
    }
  }, [reducedMotion]);

  const fontSize      = isMobile ? '52px' : 'clamp(72px, 8vw, 88px)';
  const letterSpacing = isMobile ? '-2px' : '-3px';

  const sharedStyle: React.CSSProperties = {
    fontFamily:    'var(--vault-font-display)',
    fontWeight:    700,
    fontSize,
    letterSpacing,
    lineHeight:    1,
    display:       'block',
  };

  const nameBlock = (
    <div>
      {/* Solid line */}
      <span style={{ ...sharedStyle, color: 'var(--vault-text-primary)' }}>
        {name ?? ''}
      </span>
      {/* Outline echo */}
      <span
        aria-hidden="true"
        style={{
          ...sharedStyle,
          color:              'transparent',
          WebkitTextStroke:   '1px rgba(240,242,248,0.25)',
        }}
      >
        {name ?? ''}
      </span>
    </div>
  );

  if (reducedMotion || !shouldAnimate) {
    return nameBlock;
  }

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
      animate={{ opacity: 1, filter: 'blur(0px)',  y: 0  }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {nameBlock}
    </motion.div>
  );
}

// ─── Rotating subtitle ────────────────────────────────────────────────────────

interface RotatingSubtitleProps {
  roles: string[];
  reducedMotion: boolean;
}

function RotatingSubtitle({ roles, reducedMotion }: RotatingSubtitleProps): React.ReactElement | null {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion || roles.length <= 1) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 2500);

    return () => clearInterval(id);
  }, [reducedMotion, roles.length]);

  if (roles.length === 1 && !roles[0]) return null;

  const baseStyle: React.CSSProperties = {
    fontFamily:   'var(--vault-font-body)',
    fontWeight:   300,
    fontSize:     '18px',
    color:        'var(--vault-text-secondary)',
    marginBottom: '40px',
    display:      'block',
    minHeight:    '28px',
  };

  if (reducedMotion) {
    return <span style={baseStyle}>{roles[0]}</span>;
  }

  return (
    <span style={{ ...baseStyle, position: 'relative', display: 'block', overflow: 'hidden' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={roles[index]}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0  }}
          exit={{    opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ display: 'block' }}
        >
          {roles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── CTA row ──────────────────────────────────────────────────────────────────

function CtaRow(): React.ReactElement {
  const [primaryHover, setPrimaryHover]   = useState(false);
  const [ghostHover,   setGhostHover]     = useState(false);

  const scrollTo = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const baseBtn: React.CSSProperties = {
    fontFamily:    'var(--vault-font-body)',
    fontWeight:    500,
    fontSize:      '14px',
    padding:       '12px 28px',
    borderRadius:  '6px',
    cursor:        'pointer',
    lineHeight:    1,
    transition:    'letter-spacing 0.2s ease',
    border:        'none',
  };

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <button
        type="button"
        onClick={() => scrollTo('work')}
        onMouseEnter={() => setPrimaryHover(true)}
        onMouseLeave={() => setPrimaryHover(false)}
        style={{
          ...baseBtn,
          background:    'var(--accent)',
          color:         '#ffffff',
          letterSpacing: primaryHover ? '0.5px' : '0px',
        }}
        aria-label="View my work"
      >
        View work →
      </button>

      <button
        type="button"
        onClick={() => scrollTo('contact')}
        onMouseEnter={() => setGhostHover(true)}
        onMouseLeave={() => setGhostHover(false)}
        style={{
          ...baseBtn,
          background:    'transparent',
          color:         'var(--accent)',
          border:        '1px solid var(--accent-border)',
          letterSpacing: ghostHover ? '0.5px' : '0px',
        }}
        aria-label="Get in touch"
      >
        Get in touch
      </button>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero({ data, available = false }: HeroProps): React.ReactElement {
  const name  = data?.name;
  const title = data?.title;
  const reducedMotion = useReducedMotion() ?? false;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkMobile(): void {
      setIsMobile(window.innerWidth < 768);
    }
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Split title on " & " to get rotating roles; fallback to single item
  const roles = title?.includes(' & ')
    ? title.split(' & ').map((r) => r.trim())
    : [title ?? ''];

  return (
    <>
      {/* Aurora keyframe — injected once into document head via style tag */}
      <style>{`
        @keyframes aurora-shift {
          0%   { opacity: 0.7; transform: scale(1);    }
          100% { opacity: 1;   transform: scale(1.04); }
        }
      `}</style>

      <section
        id="hero"
        aria-label="Hero"
        style={{
          position:   'relative',
          overflow:   'hidden',
          minHeight:  '100vh',
          display:    'flex',
          alignItems: 'flex-end',
          padding:    isMobile ? '0 24px 72px' : '0 48px 96px',
        }}
      >
        {/* Background layers */}
        <Aurora isMobile={isMobile} reducedMotion={reducedMotion} />
        <GridOverlay />

        {/* Foreground content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Eyebrow available={available} title={title} />

          <DisplayName
            name={name}
            isMobile={isMobile}
            reducedMotion={reducedMotion}
          />

          <RotatingSubtitle roles={roles} reducedMotion={reducedMotion} />

          <CtaRow />
        </div>
      </section>
    </>
  );
}
