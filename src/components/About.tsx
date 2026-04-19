'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { PortfolioData, WorkExperience, Education } from '@/types';
import { isFilled } from '@/lib/is-filled';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AboutProps {
  data?: PortfolioData['about'];
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

// ─── Profile image ────────────────────────────────────────────────────────────

interface AboutImageProps {
  image: string;
  name?: string;
}

function AboutImage({ image, name }: AboutImageProps): React.ReactElement {
  return (
    <div
      style={{
        width:        '100%',
        aspectRatio:  '1 / 1',
        border:       '1px solid var(--vault-border)',
        borderRadius: '12px',
        overflow:     'hidden',
        background:   'var(--vault-surface)',
        flexShrink:   0,
      }}
    >
      <img
        src={image}
        alt={name ?? 'Profile'}
        style={{
          width:     '100%',
          height:    '100%',
          objectFit: 'cover',
          display:   'block',
        }}
      />
    </div>
  );
}

// ─── Subheading ───────────────────────────────────────────────────────────────

interface SubheadingProps {
  children: string;
}

function Subheading({ children }: SubheadingProps): React.ReactElement {
  return (
    <h3
      style={{
        fontFamily:   'var(--vault-font-display)',
        fontWeight:   600,
        fontSize:     '18px',
        color:        'var(--vault-text-primary)',
        marginBottom: '20px',
        marginTop:    0,
        letterSpacing: '-0.3px',
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
        marginBottom:  isLast ? 0 : '24px',
        paddingBottom: isLast ? 0 : '24px',
        borderBottom:  isLast ? 'none' : '1px solid var(--vault-border)',
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
      {(isFilled(item.company) || isFilled(item.duration)) && (
        <p
          style={{
            fontFamily: 'var(--vault-font-mono)',
            fontSize:   '12px',
            color:      'var(--accent)',
            margin:     '4px 0 8px',
          }}
        >
          {[item.company, item.duration].filter(Boolean).join(' · ')}
        </p>
      )}
      {isFilled(item.description) && (
        <p
          style={{
            fontFamily: 'var(--vault-font-body)',
            fontWeight: 300,
            fontSize:   '14px',
            color:      'var(--vault-text-secondary)',
            lineHeight: 1.65,
            margin:     0,
          }}
        >
          {item.description}
        </p>
      )}
    </div>
  );
}

// ─── Education item ───────────────────────────────────────────────────────────

interface EducationItemProps {
  item: Education;
  isLast: boolean;
}

function EducationItem({ item, isLast }: EducationItemProps): React.ReactElement {
  return (
    <div
      style={{
        marginBottom:  isLast ? 0 : '20px',
        paddingBottom: isLast ? 0 : '20px',
        borderBottom:  isLast ? 'none' : '1px solid var(--vault-border)',
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
        {item.degree}
      </p>
      {(isFilled(item.university) || isFilled(item.from) || isFilled(item.to)) && (
        <p
          style={{
            fontFamily: 'var(--vault-font-mono)',
            fontSize:   '12px',
            color:      'var(--accent)',
            margin:     '4px 0 8px',
          }}
        >
          {[
            item.university,
            isFilled(item.from) && isFilled(item.to)
              ? `${item.from}–${item.to}`
              : undefined,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
      {isFilled(item.GPA) && (
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
      )}
    </div>
  );
}

// ─── About section ────────────────────────────────────────────────────────────

export default function About({ data }: AboutProps): React.ReactElement {
  const bio        = data?.bio;
  const image      = data?.image;
  const experience = (data?.experience ?? []).filter((e) => isFilled(e.position));
  const education  = (data?.education  ?? []).filter((e) => isFilled(e.degree));
  const hasImage   = isFilled(image);

  const reducedMotion = useReducedMotion() ?? false;

  const motionProps: Partial<HTMLMotionProps<'section'>> = reducedMotion
    ? {}
    : {
        initial:     { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0  },
        transition:  { duration: 0.6, ease: 'easeOut' as const },
        viewport:    { once: true },
      };

  return (
    <>
      <style>{`
        #about {
          padding: 96px 48px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Bio row: image + bio text */
        #about-bio-row {
          display: grid;
          grid-template-columns: ${hasImage ? '260px 1fr' : '1fr'};
          gap: 48px;
          align-items: start;
          margin-bottom: 56px;
        }

        /* Experience + Education columns */
        #about-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }

        @media (max-width: 768px) {
          #about {
            padding: 72px 24px !important;
          }
          #about-bio-row {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          #about-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <motion.section
        id="about"
        aria-label="About"
        {...motionProps}
      >
        <SectionLabel />

        {/* Bio row — image (if exists) + bio text */}
        {(hasImage || isFilled(bio)) && (
          <div id="about-bio-row">
            {hasImage && <AboutImage image={image!} name={data?.bio ? undefined : 'Profile'} />}

            {isFilled(bio) && (
              <p
                style={{
                  fontFamily:  'var(--vault-font-body)',
                  fontWeight:  300,
                  fontSize:    '16px',
                  color:       'var(--vault-text-secondary)',
                  lineHeight:  1.8,
                  margin:      0,
                  alignSelf:   'center',
                }}
              >
                {bio}
              </p>
            )}
          </div>
        )}

        {/* Divider between bio and details */}
        {(hasImage || isFilled(bio)) && (experience.length > 0 || education.length > 0) && (
          <div
            aria-hidden="true"
            style={{
              height:       '1px',
              background:   'var(--vault-border)',
              marginBottom: '48px',
            }}
          />
        )}

        {/* Experience + Education columns */}
        {(experience.length > 0 || education.length > 0) && (
          <div id="about-details-grid">
            {experience.length > 0 && (
              <div>
                <Subheading>Experience</Subheading>
                {experience.map((item, i) => (
                  <ExperienceItem
                    key={item.position ?? i}
                    item={item}
                    isLast={i === experience.length - 1}
                  />
                ))}
              </div>
            )}

            {education.length > 0 && (
              <div>
                <Subheading>Education</Subheading>
                {education.map((item, i) => (
                  <EducationItem
                    key={item.degree ?? i}
                    item={item}
                    isLast={i === education.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </motion.section>
    </>
  );
}
