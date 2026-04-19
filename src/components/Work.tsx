'use client';

import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PortfolioData, Project } from '@/types';
import { isFilled } from '@/lib/is-filled';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkProps {
  data?: PortfolioData['projects'];
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel(): React.ReactElement {
  return (
    <p style={{
      fontFamily: 'var(--vault-font-mono)', fontSize: '10px', fontWeight: 500,
      letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)',
      paddingLeft: '10px', borderLeft: '1px solid var(--accent)', marginBottom: '48px',
    }}>
      Selected work
    </p>
  );
}

// ─── Card link ────────────────────────────────────────────────────────────────

interface CardLinkProps { href: string; label: string; primary?: boolean; }

function CardLink({ href, label, primary = false }: CardLinkProps): React.ReactElement {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily:     'var(--vault-font-mono)',
        fontSize:       '12px',
        letterSpacing:  '0.3px',
        padding:        '7px 14px',
        borderRadius:   '6px',
        textDecoration: 'none',
        display:        'inline-flex',
        alignItems:     'center',
        transition:     'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
        ...(primary
          ? {
              background:  hovered ? 'var(--accent)' : 'transparent',
              border:      '1px solid var(--accent-border)',
              color:       hovered ? '#ffffff'         : 'var(--accent)',
            }
          : {
              background:  hovered ? 'var(--vault-surface)' : 'transparent',
              border:      '1px solid var(--vault-border)',
              color:       hovered ? 'var(--vault-text-primary)' : 'var(--vault-text-secondary)',
            }),
      }}
    >
      {label}
    </a>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, isFeatured = false }: { project: Project; isFeatured?: boolean }): React.ReactElement {
  const [hovered, setHovered] = useState(false);
  const hasImage = isFilled(project.image);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:    'var(--vault-surface)',
        border:        hovered ? '1px solid var(--accent-border)' : '1px solid var(--vault-border)',
        borderRadius:  '16px',
        overflow:      'hidden',
        display:       'flex',
        flexDirection: 'column',
        height:        '100%',
        transition:    'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow:     hovered ? '0 0 24px var(--highlight-glow)' : 'none',
      }}
    >
      {hasImage && (
        <div style={{ width: '100%', aspectRatio: isFeatured ? '21 / 9' : '16 / 9', overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={project.image!} alt={project.name ?? ''} loading="lazy" decoding="async"
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transition: 'transform 0.3s ease',
              transform: hovered ? 'scale(1.02)' : 'scale(1)',
            }}
          />
        </div>
      )}

      <div style={{ padding: isFeatured ? '24px 28px' : '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{
          fontFamily: 'var(--vault-font-display)', fontWeight: 500,
          fontSize: isFeatured ? '24px' : '18px', color: 'var(--vault-text-primary)',
          marginBottom: '8px', marginTop: 0, lineHeight: 1.2,
        }}>
          {project.name}
        </h3>

        {isFilled(project.description) && (
          <p style={{
            fontFamily: 'var(--vault-font-body)', fontWeight: 300, fontSize: '14px',
            color: 'var(--vault-text-secondary)', marginBottom: '12px', marginTop: 0,
            lineHeight: 1.6, display: '-webkit-box',
            WebkitLineClamp: isFeatured ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {project.description}
          </p>
        )}

        {isFilled(project.technologies) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {project.technologies!.filter(isFilled).map((tech) => (
              <span key={tech} style={{ fontFamily: 'var(--vault-font-mono)', fontSize: '11px', color: 'var(--accent)' }}>
                {tech}
              </span>
            ))}
          </div>
        )}

        {(isFilled(project.liveUrl) || isFilled(project.githubUrl)) && (
          <div style={{ display: 'flex', gap: '16px', marginTop: 'auto', paddingTop: '8px' }}>
            {isFilled(project.liveUrl)   && <CardLink href={project.liveUrl!}   label="View live →" primary />}
            {isFilled(project.githubUrl) && <CardLink href={project.githubUrl!} label="Source" />}
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Pagination dots ──────────────────────────────────────────────────────────

function PaginationDots({ count, active }: { count: number; active: number }): React.ReactElement {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            height:     '5px',
            width:      i === active ? '20px' : '5px',
            borderRadius: '3px',
            background: i === active ? 'var(--accent)' : 'var(--vault-border-mid)',
            transition: 'width 0.3s ease, background 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

// ─── Work section ─────────────────────────────────────────────────────────────

export default function Work({ data }: WorkProps): React.ReactElement {
  const projects      = (data?.projects ?? []).filter((p) => isFilled(p.name));
  const reducedMotion = useReducedMotion() ?? false;
  const sliderRef     = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  if (projects.length === 0) {
    return (
      <section id="work" aria-label="Selected work" style={{ padding: '96px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <SectionLabel />
        <p style={{ fontFamily: 'var(--vault-font-body)', fontSize: '15px', color: 'var(--vault-text-secondary)' }}>
          No projects to display yet.
        </p>
      </section>
    );
  }

  const featuredIdx = projects.findIndex((p) => isFilled(p.image));
  const pinnedIdx   = featuredIdx !== -1 ? featuredIdx : 0;
  const featured    = projects[pinnedIdx];
  const rest        = projects.filter((_, i) => i !== pinnedIdx);

  function onSliderScroll(): void {
    const slider = sliderRef.current;
    if (!slider || rest.length <= 1) return;
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    if (maxScroll === 0) return;
    setActiveSlide(Math.round((slider.scrollLeft / maxScroll) * (rest.length - 1)));
  }

  return (
    <>
      <style>{`
        #work {
          padding: clamp(72px, 8vw, 96px) clamp(24px, 4vw, 48px);
          max-width: 1200px;
          margin: 0 auto;
        }

        .slider-label {
          font-family: var(--vault-font-mono);
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--vault-text-muted);
          margin-bottom: 20px;
          display: block;
        }

        .work-slider-outer {
          position: relative;
        }

        /* Left fade */
        .work-slider-outer::before {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 72px;
          background: linear-gradient(to right, var(--vault-bg), transparent);
          pointer-events: none;
          z-index: 1;
        }

        /* Right fade */
        .work-slider-outer::after {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0;
          width: 72px;
          background: linear-gradient(to left, var(--vault-bg), transparent);
          pointer-events: none;
          z-index: 1;
        }

        .work-slider {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 4px;
        }
        .work-slider::-webkit-scrollbar { display: none; }

        .work-slide {
          flex: 0 0 380px;
          scroll-snap-align: center;
        }

        /*
          Spacer elements at both ends — avoids the browser bug where
          padding-inline-end on overflow:auto is ignored for scroll extent.
          This makes every card (including the last) fully centerable.
        */
        .work-slider-spacer {
          flex: 0 0 calc(50% - 190px);
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .work-slide          { flex: 0 0 78%; }
          .work-slider-spacer  { flex: 0 0 11%; }
          .work-slider-outer::before,
          .work-slider-outer::after { width: 40px; }
        }

        @media (max-width: 480px) {
          .work-slide         { flex: 0 0 85%; }
          .work-slider-spacer { flex: 0 0 7.5%; }
        }
      `}</style>

      <section id="work" aria-label="Selected work">
        <SectionLabel />

        {/* Featured — full width */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true }}
          style={{ marginBottom: rest.length > 0 ? '48px' : 0 }}
        >
          <ProjectCard project={featured} isFeatured />
        </motion.div>

        {/* Rest — centered horizontal scroll slider */}
        {rest.length > 0 && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
            viewport={{ once: true }}
          >
            <span className="slider-label">More projects</span>

            <div className="work-slider-outer">
              <div
                ref={sliderRef}
                className="work-slider"
                onScroll={onSliderScroll}
              >
                <div className="work-slider-spacer" aria-hidden="true" />
                {rest.map((project, i) => (
                  <div key={project.name ?? i} className="work-slide">
                    <ProjectCard project={project} />
                  </div>
                ))}
                <div className="work-slider-spacer" aria-hidden="true" />
              </div>
            </div>

            {/* Pagination dots */}
            {rest.length > 1 && (
              <PaginationDots count={rest.length} active={activeSlide} />
            )}
          </motion.div>
        )}
      </section>
    </>
  );
}
