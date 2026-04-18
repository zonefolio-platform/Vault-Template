'use client';

import { useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StackProps {
  skills: string[];
}

interface ParticleData {
  id: number;
  top: string;
  left: string;
  duration: number;
  delay: number;
}

// ─── Seeded pseudo-random (avoids hydration mismatch) ────────────────────────

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ─── Particle dot ─────────────────────────────────────────────────────────────

interface ParticleProps {
  particle: ParticleData;
}

function Particle({ particle }: ParticleProps): React.ReactElement {
  return (
    <div
      aria-hidden="true"
      style={{
        position:     'absolute',
        top:          particle.top,
        left:         particle.left,
        width:        '2px',
        height:       '2px',
        borderRadius: '50%',
        background:   'var(--accent)',
        opacity:      0.3,
        animation:    `particle-float ${particle.duration}s ease-in-out ${particle.delay}s infinite alternate`,
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel(): React.ReactElement {
  return (
    <p
      style={{
        fontFamily:    'var(--vault-font-mono)',
        fontSize:      '10px',
        fontWeight:    500,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color:         'var(--accent)',
        paddingLeft:   '10px',
        borderLeft:    '1px solid var(--accent)',
        marginBottom:  '48px',
      }}
    >
      Stack
    </p>
  );
}

// ─── Skill item ───────────────────────────────────────────────────────────────

interface SkillItemProps {
  skill: string;
}

function SkillItem({ skill }: SkillItemProps): React.ReactElement {
  return (
    <span
      style={{
        fontFamily:    'var(--vault-font-mono)',
        fontSize:      '15px',
        color:         'var(--accent)',
        letterSpacing: '0.5px',
        opacity:       1,
        transition:    'opacity 0.2s ease',
        cursor:        'default',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLSpanElement).style.opacity = '0.7';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLSpanElement).style.opacity = '1';
      }}
    >
      {skill}
    </span>
  );
}

// ─── Stack section ────────────────────────────────────────────────────────────

export default function Stack({ skills }: StackProps): React.ReactElement {
  const reducedMotion = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const allParticles = useMemo<ParticleData[]>(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id:       i,
      top:      `${Math.floor(seededRandom(i * 3)     * 100)}%`,
      left:     `${Math.floor(seededRandom(i * 3 + 1) * 100)}%`,
      duration: 3 + seededRandom(i * 3 + 2) * 5,
      delay:    seededRandom(i * 7)          * 5,
    }));
  }, []);

  // Particles are decorative — render only after mount to avoid SSR/CSR mismatch
  const particles = mounted && !reducedMotion ? allParticles : [];

  return (
    <>
      <style>{`
        @keyframes particle-float {
          from { transform: translateY(0); }
          to   { transform: translateY(-20px); }
        }

        #stack {
          padding: 96px 48px;
        }

        .stack-particle--mobile-hidden {
          display: block;
        }

        @media (max-width: 767px) {
          #stack {
            padding: 72px 24px !important;
          }
          .stack-particle--mobile-hidden {
            display: none;
          }
        }
      `}</style>

      <section
        id="stack"
        aria-label="Tech stack"
        style={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Particle background */}
        {particles.map((p, i) => (
          <div
            key={p.id}
            className={i >= 30 ? 'stack-particle--mobile-hidden' : undefined}
          >
            <Particle particle={p} />
          </div>
        ))}

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <SectionLabel />

          {skills.length > 0 ? (
            <div
              style={{
                display:        'flex',
                flexWrap:       'wrap',
                justifyContent: 'center',
                gap:            '24px',
              }}
            >
              {skills.map((skill, i) => (
                <SkillItem key={`${skill}-${i}`} skill={skill} />
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: 'var(--vault-font-mono)',
                fontSize:   '13px',
                color:      'var(--vault-text-muted)',
                textAlign:  'center',
              }}
            >
              No skills listed yet.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
