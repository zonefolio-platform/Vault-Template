'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiInstagram, FiYoutube, FiFacebook } from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';
import { SiBehance, SiDribbble, SiPinterest, SiTiktok, SiVimeo, SiMedium } from 'react-icons/si';
import { PortfolioData, SocialLink } from '@/types';
import { isFilled } from '@/lib/is-filled';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroProps {
  data?: PortfolioData['hero'];
  available?: boolean;
}

// ─── Platform icon map ────────────────────────────────────────────────────────

type IconComponent = React.ComponentType<{ size?: number }>;

const PLATFORM_ICONS: Record<string, IconComponent> = {
  github:    FiGithub,
  linkedin:  FiLinkedin,
  twitter:   FaXTwitter,
  instagram: FiInstagram,
  behance:   SiBehance,
  dribbble:  SiDribbble,
  youtube:   FiYoutube,
  pinterest: SiPinterest,
  facebook:  FiFacebook,
  tiktok:    SiTiktok,
  vimeo:     SiVimeo,
  medium:    SiMedium,
};

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
        animation: reducedMotion ? 'none' : 'aurora-shift 12s ease-in-out infinite alternate',
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
        position:        'absolute',
        inset:           0,
        zIndex:          0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize:   '48px 48px',
        maskImage:        'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
        WebkitMaskImage:  'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
      }}
    />
  );
}

// ─── Profile image card ────────────────────────────────────────────────────────

interface ProfileImageCardProps {
  image: string;
  name: string;
}

function ProfileImageCard({ image, name }: ProfileImageCardProps): React.ReactElement {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:        '100%',
        maxWidth:     '320px',
        aspectRatio:  '1 / 1',
        border:       `1px solid ${hovered ? 'var(--accent-border)' : 'var(--vault-border)'}`,
        borderRadius: '16px',
        overflow:     'hidden',
        position:     'relative',
        boxShadow:    hovered ? '0 0 40px var(--highlight-glow)' : 'none',
        transition:   'border-color 0.3s ease, box-shadow 0.3s ease',
        background:   'var(--vault-surface)',
        flexShrink:   0,
      }}
    >
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 768px) 100vw, 320px"
        style={{ objectFit: 'cover' }}
        priority
      />
      {/* Subtle bottom gradient overlay */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          inset:         0,
          background:    'linear-gradient(to top, rgba(8,10,15,0.5) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ─── Social links ──────────────────────────────────────────────────────────────

interface SocialLinksProps {
  links?: SocialLink[];
}

function SocialLinks({ links }: SocialLinksProps): React.ReactElement | null {
  const validLinks = (links ?? []).filter(
    (l) => isFilled(l.url) && isFilled(l.platform)
  );
  if (validLinks.length === 0) return null;

  return (
    <nav
      aria-label="Social links"
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '20px',
        marginTop:    '8px',
        marginBottom: '32px',
      }}
    >
      {validLinks.map((link, i) => {
        const key  = (link.platform ?? '').toLowerCase();
        const Icon = PLATFORM_ICONS[key];
        if (!Icon) return null;

        return (
          <a
            key={link.platform ?? i}
            href={link.url!}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.platform}
            style={{ color: 'var(--vault-text-secondary)', transition: 'color 0.2s ease, transform 0.2s ease', display: 'flex' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--vault-text-secondary)';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
            }}
          >
            <Icon size={20} />
          </a>
        );
      })}
    </nav>
  );
}

// ─── Display name with BlurText entrance ──────────────────────────────────────

interface DisplayNameProps {
  name?: string;
  isMobile: boolean;
  reducedMotion: boolean;
}

function DisplayName({ name, isMobile, reducedMotion }: DisplayNameProps): React.ReactElement {
  const hasMountedRef   = useRef(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!hasMountedRef.current && !reducedMotion) {
      hasMountedRef.current = true;
      setShouldAnimate(true);
    }
  }, [reducedMotion]);

  const fontSize      = isMobile ? '48px' : 'clamp(64px, 7vw, 80px)';
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
      <span style={{ ...sharedStyle, color: 'var(--vault-text-primary)' }}>
        {name ?? ''}
      </span>
      <span
        aria-hidden="true"
        style={{
          ...sharedStyle,
          marginTop:          '10px',
          color:              'transparent',
          WebkitTextStroke:   '1px rgba(240,242,248,0.2)',
        }}
      >
        {name ?? ''}
      </span>
    </div>
  );

  if (reducedMotion || !shouldAnimate) return nameBlock;

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
    marginTop:    '28px',
    marginBottom: '32px',
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
  const [primaryHover, setPrimaryHover] = useState(false);
  const [ghostHover,   setGhostHover]   = useState(false);

  const scrollTo = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const baseBtn: React.CSSProperties = {
    fontFamily:   'var(--vault-font-body)',
    fontWeight:   500,
    fontSize:     '14px',
    padding:      '12px 28px',
    borderRadius: '6px',
    cursor:       'pointer',
    lineHeight:   1,
    transition:   'letter-spacing 0.2s ease',
    border:       'none',
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

export default function Hero({ data }: HeroProps): React.ReactElement {
  const name        = data?.name;
  const title       = data?.title;
  const image       = data?.image;
  const socialLinks = data?.socialLinks;

  const reducedMotion = useReducedMotion() ?? false;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkMobile(): void { setIsMobile(window.innerWidth < 768); }
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const roles = title?.includes(' & ')
    ? title.split(' & ').map((r) => r.trim())
    : [title ?? ''];

  const hasImage = isFilled(image);

  return (
    <>
      <style>{`
        @keyframes aurora-shift {
          0%   { opacity: 0.7; transform: scale(1);    }
          100% { opacity: 1;   transform: scale(1.04); }
        }

        #hero-content {
          display: grid;
          grid-template-columns: ${hasImage ? '1fr 1fr' : '1fr'};
          align-items: center;
          gap: 64px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .hero-right {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-label {
          font-family:    var(--vault-font-mono);
          font-size:      10px;
          font-weight:    500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color:          var(--accent);
          margin-bottom:  32px;
          display:        block;
        }

        @media (max-width: 768px) {
          #hero {
            padding: 80px 24px 80px !important;
            align-items: center !important;
          }
          #hero-content {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .hero-right {
            order: -1;
          }
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
          alignItems: 'center',
          padding:    isMobile ? '80px 24px' : '80px 48px',
        }}
      >
        <Aurora isMobile={isMobile} reducedMotion={reducedMotion} />
        <GridOverlay />

        <div id="hero-content" style={{ position: 'relative', zIndex: 1 }}>
          {/* Left: text content */}
          <div className="hero-left">
            <span className="hero-label">// creative portfolio</span>

            <DisplayName
              name={name}
              isMobile={isMobile}
              reducedMotion={reducedMotion}
            />

            <RotatingSubtitle roles={roles} reducedMotion={reducedMotion} />

            <SocialLinks links={socialLinks} />

            <CtaRow />
          </div>

          {/* Right: profile image */}
          {hasImage && (
            <div className="hero-right">
              <ProfileImageCard image={image!} name={name ?? ''} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
