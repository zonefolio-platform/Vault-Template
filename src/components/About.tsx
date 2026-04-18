'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { WorkExperience, Education } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AboutProps {
  bio: string;
  experience: WorkExperience[];
  education: Education[];
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
      About
    </p>
  );
}

// ─── Subheading ───────────────────────────────────────────────────────────────

interface SubheadingProps {
  children: string;
  style?: React.CSSProperties;
}

function Subheading({ children, style }: SubheadingProps): React.ReactElement {
  return (
    <h3
      style={{
        fontFamily:    'var(--vault-font-display)',
        fontWeight:    600,
        fontSize:      '20px',
        color:         'var(--vault-text-primary)',
        marginBottom:  '20px',
        ...style,
      }}
    >
      {children}
    </h3>
  );
}

// ─── Experience item ──────────────────────────────────────────────────────────

interface ExperienceItemProps {
  item: WorkExperience;
  isLast: boolean;
}

function ExperienceItem({ item, isLast }: ExperienceItemProps): React.ReactElement {
  return (
    <div
      style={{
        marginBottom: '24px',
        borderBottom:  isLast ? 'none' : '1px solid var(--vault-border)',
        paddingBottom: isLast ? '0' : '24px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--vault-font-body)',
          fontWeight: 500,
          fontSize:   '15px',
          color:      'var(--vault-text-primary)',
          margin:     0,
        }}
      >
        {item.position}
      </p>
      <p
        style={{
          fontFamily: 'var(--vault-font-mono)',
          fontSize:   '12px',
          color:      'var(--accent)',
          margin:     '4px 0 8px',
        }}
      >
        {item.company} · {item.duration}
      </p>
      <p
        style={{
          fontFamily:  'var(--vault-font-body)',
          fontWeight:  300,
          fontSize:    '14px',
          color:       'var(--vault-text-secondary)',
          lineHeight:  1.65,
          margin:      0,
        }}
      >
        {item.description}
      </p>
    </div>
  );
}

// ─── Education item ───────────────────────────────────────────────────────────

interface EducationItemProps {
  item: Education;
}

function EducationItem({ item }: EducationItemProps): React.ReactElement {
  return (
    <div style={{ marginBottom: '20px' }}>
      <p
        style={{
          fontFamily: 'var(--vault-font-body)',
          fontWeight: 500,
          fontSize:   '15px',
          color:      'var(--vault-text-primary)',
          margin:     0,
        }}
      >
        {item.degree}
      </p>
      <p
        style={{
          fontFamily: 'var(--vault-font-mono)',
          fontSize:   '12px',
          color:      'var(--accent)',
          margin:     '4px 0 8px',
        }}
      >
        {item.university} · {item.from}–{item.to}
      </p>
      <p
        style={{
          fontFamily: 'var(--vault-font-mono)',
          fontSize:   '11px',
          color:      'var(--vault-text-secondary)',
          margin:     0,
        }}
      >
        GPA {item.GPA}
      </p>
    </div>
  );
}

// ─── Stat block ───────────────────────────────────────────────────────────────

interface StatBlockProps {
  value: number;
  label: string;
}

function StatBlock({ value, label }: StatBlockProps): React.ReactElement {
  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        gap:           '4px',
        borderLeft:    '2px solid var(--accent-border)',
        paddingLeft:   '20px',
      }}
    >
      <span
        style={{
          fontFamily:    'var(--vault-font-display)',
          fontWeight:    700,
          fontSize:      '48px',
          letterSpacing: '-2px',
          color:         'var(--vault-text-primary)',
          lineHeight:    1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily:    'var(--vault-font-mono)',
          fontWeight:    500,
          fontSize:      '10px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color:         'var(--vault-text-secondary)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── About section ────────────────────────────────────────────────────────────

export default function About({ bio, experience, education }: AboutProps): React.ReactElement {
  const reducedMotion = useReducedMotion() ?? false;

  const yearsActive     = experience.length + 2;
  const projectsBuilt   = education.length + experience.length + 4;
  const clientsServed   = Math.max(experience.length, 3);

  const motionProps: Partial<HTMLMotionProps<'section'>> = reducedMotion
    ? {}
    : {
        initial:     { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        transition:  { duration: 0.6, ease: 'easeOut' as const },
        viewport:    { once: true },
      };

  return (
    <>
      {/* Responsive grid via scoped <style> */}
      <style>{`
        #about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }
        #about-stats {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        @media (max-width: 768px) {
          #about {
            padding: 72px 24px !important;
          }
          #about-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <motion.section
        id="about"
        aria-label="About"
        style={{
          padding:   '96px 48px',
          maxWidth:  '1200px',
          margin:    '0 auto',
        }}
        {...motionProps}
      >
        <SectionLabel />

        <div id="about-grid">
          {/* ── Left column: bio + experience + education ── */}
          <div>
            {/* Bio */}
            <p
              style={{
                fontFamily:   'var(--vault-font-body)',
                fontWeight:   300,
                fontSize:     '15px',
                color:        'var(--vault-text-secondary)',
                lineHeight:   1.75,
                marginBottom: '40px',
                marginTop:    0,
              }}
            >
              {bio}
            </p>

            {/* Experience */}
            {experience.length > 0 && (
              <div>
                <Subheading>Experience</Subheading>
                {experience.map((item, i) => (
                  <ExperienceItem
                    key={`${item.company}-${i}`}
                    item={item}
                    isLast={i === experience.length - 1}
                  />
                ))}
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div style={{ marginTop: '40px' }}>
                <Subheading>Education</Subheading>
                {education.map((item, i) => (
                  <EducationItem key={`${item.university}-${i}`} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* ── Right column: stat blocks ── */}
          <div id="about-stats">
            <StatBlock value={yearsActive}   label="Years active" />
            <StatBlock value={projectsBuilt} label="Projects built" />
            <StatBlock value={clientsServed} label="Clients" />
          </div>
        </div>
      </motion.section>
    </>
  );
}
