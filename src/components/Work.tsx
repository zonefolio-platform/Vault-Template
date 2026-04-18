'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Project } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkProps {
  projects: Project[];
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
      Selected work
    </p>
  );
}

// ─── Image placeholder ────────────────────────────────────────────────────────

interface ImagePlaceholderProps {
  name: string;
  height: string;
}

function ImagePlaceholder({ name, height }: ImagePlaceholderProps): React.ReactElement {
  return (
    <div
      aria-hidden="true"
      style={{
        width:          '100%',
        height,
        background:     'var(--secondary)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--vault-font-display)',
          fontWeight: 700,
          fontSize:   '32px',
          color:      'var(--vault-text-muted)',
        }}
      >
        {name.charAt(0)}
      </span>
    </div>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
  isFeatured?: boolean;
}

function ProjectCard({ project, isFeatured = false }: ProjectCardProps): React.ReactElement {
  const [hovered, setHovered]       = useState(false);
  const [imgHovered, setImgHovered] = useState(false);

  const imageHeight = isFeatured ? '60%' : '50%';
  const titleSize   = isFeatured ? '24px' : '20px';

  return (
    <article
      onMouseEnter={() => { setHovered(true); setImgHovered(true); }}
      onMouseLeave={() => { setHovered(false); setImgHovered(false); }}
      style={{
        background:    'var(--vault-surface)',
        border:        hovered
          ? '1px solid var(--accent-border)'
          : '1px solid var(--vault-border)',
        borderRadius:  '16px',
        overflow:      'hidden',
        display:       'flex',
        flexDirection: 'column',
        height:        '100%',
        transition:    'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow:     hovered ? '0 0 24px var(--highlight-glow)' : 'none',
      }}
    >
      {/* Image area */}
      <div
        style={{
          width:    '100%',
          height:   imageHeight,
          minHeight: isFeatured ? '280px' : '180px',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {project.image ? (
          <img
            src={project.image}
            alt={project.name}
            style={{
              width:      '100%',
              height:     '100%',
              objectFit:  'cover',
              transition: 'transform 0.3s ease',
              transform:  imgHovered ? 'scale(1.02)' : 'scale(1)',
              display:    'block',
            }}
          />
        ) : (
          <ImagePlaceholder name={project.name} height="100%" />
        )}
      </div>

      {/* Card body */}
      <div
        style={{
          padding:       '20px 24px',
          display:       'flex',
          flexDirection: 'column',
          flex:          1,
        }}
      >
        {/* Title */}
        <h3
          style={{
            fontFamily:   'var(--vault-font-display)',
            fontWeight:   500,
            fontSize:     titleSize,
            color:        'var(--vault-text-primary)',
            marginBottom: '8px',
            lineHeight:   1.2,
          }}
        >
          {project.name}
        </h3>

        {/* Description */}
        <p
          style={{
            fontFamily:        'var(--vault-font-body)',
            fontWeight:        300,
            fontSize:          '14px',
            color:             'var(--vault-text-secondary)',
            marginBottom:      '12px',
            lineHeight:        1.6,
            display:           '-webkit-box',
            WebkitLineClamp:   2,
            WebkitBoxOrient:   'vertical',
            overflow:          'hidden',
          }}
        >
          {project.description}
        </p>

        {/* Technologies */}
        {project.technologies.length > 0 && (
          <div
            style={{
              display:      'flex',
              flexWrap:     'wrap',
              gap:          '8px',
              marginBottom: '12px',
            }}
          >
            {project.technologies.map((tech) => (
              <span
                key={tech}
                style={{
                  fontFamily: 'var(--vault-font-mono)',
                  fontSize:   '11px',
                  color:      'var(--accent)',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        {(project.liveUrl || project.githubUrl) && (
          <div
            style={{
              display:    'flex',
              gap:        '16px',
              marginTop:  'auto',
            }}
          >
            {project.liveUrl && (
              <CardLink href={project.liveUrl} label="View live →" />
            )}
            {project.githubUrl && (
              <CardLink href={project.githubUrl} label="Source" />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Card link ────────────────────────────────────────────────────────────────

interface CardLinkProps {
  href: string;
  label: string;
}

function CardLink({ href, label }: CardLinkProps): React.ReactElement {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily:  'var(--vault-font-mono)',
        fontSize:    '12px',
        color:       hovered
          ? 'var(--vault-text-primary)'
          : 'var(--vault-text-secondary)',
        textDecoration: 'none',
        transition:  'color 0.2s ease',
      }}
    >
      {label}
    </a>
  );
}

// ─── Animated wrapper ─────────────────────────────────────────────────────────

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  reducedMotion: boolean;
  style?: React.CSSProperties;
}

function FadeIn({ children, delay = 0, reducedMotion, style }: FadeInProps): React.ReactElement {
  if (reducedMotion) {
    return <div style={style}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      viewport={{ once: true }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── Work section ─────────────────────────────────────────────────────────────

export default function Work({ projects }: WorkProps): React.ReactElement {
  const reducedMotion = useReducedMotion() ?? false;

  if (!projects || projects.length === 0) {
    return (
      <section
        id="work"
        aria-label="Selected work"
        style={{
          padding:   '96px 48px',
          maxWidth:  '1200px',
          margin:    '0 auto',
        }}
      >
        <SectionLabel />
        <p
          style={{
            fontFamily: 'var(--vault-font-body)',
            fontSize:   '15px',
            color:      'var(--vault-text-secondary)',
          }}
        >
          No projects to display yet.
        </p>
      </section>
    );
  }

  // Derive featured and rest
  const featuredIndex = projects.findIndex((p) => p.image);
  const featuredIdx   = featuredIndex !== -1 ? featuredIndex : 0;
  const featured      = projects[featuredIdx];
  const rest          = projects
    .filter((_, i) => i !== featuredIdx)
    .slice(0, 3);

  return (
    <>
      {/* Responsive grid styles via scoped <style> */}
      <style>{`
        #work-grid {
          display: grid;
          grid-template-columns: 60fr 40fr;
          gap: 24px;
        }
        #work-right-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        @media (max-width: 768px) {
          #work-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section
        id="work"
        aria-label="Selected work"
        style={{
          padding:   'clamp(72px, 8vw, 96px) clamp(24px, 4vw, 48px)',
          maxWidth:  '1200px',
          margin:    '0 auto',
        }}
      >
        <SectionLabel />

        <div id="work-grid">
          {/* Featured card — left column */}
          <FadeIn reducedMotion={reducedMotion} delay={0} style={{ minHeight: 0 }}>
            <ProjectCard project={featured} isFeatured />
          </FadeIn>

          {/* Rest — right column (stacked) */}
          {rest.length > 0 && (
            <div id="work-right-col">
              {rest.map((project, i) => (
                <FadeIn
                  key={project.name}
                  reducedMotion={reducedMotion}
                  delay={0.1 + i * 0.1}
                  style={{ flex: 1, minHeight: 0 }}
                >
                  <ProjectCard project={project} />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
