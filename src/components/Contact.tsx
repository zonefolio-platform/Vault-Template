'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { PortfolioData, SocialLink } from '@/types';
import { isFilled } from '@/lib/is-filled';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactProps {
  data?: PortfolioData['contact'];
  socialLinks?: SocialLink[];
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel(): React.ReactElement {
  return (
    <div
      style={{
        display:        'flex',
        justifyContent: 'center',
        marginBottom:   '48px',
      }}
    >
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
          margin:        0,
        }}
      >
        Contact
      </p>
    </div>
  );
}

// ─── Email link ───────────────────────────────────────────────────────────────

interface EmailLinkProps {
  email: string;
}

function EmailLink({ email }: EmailLinkProps): React.ReactElement {
  return (
    <>
      <style>{`
        .contact-email {
          font-family:     var(--vault-font-display);
          font-weight:     700;
          font-size:       64px;
          letter-spacing:  -2px;
          color:           var(--vault-text-primary);
          text-decoration: none;
          display:         block;
          margin-bottom:   48px;
          transition:      color 0.2s ease;
          word-break:      break-word;
        }
        .contact-email:hover {
          color: var(--accent);
        }
        @media (max-width: 767px) {
          .contact-email {
            font-size: 40px;
          }
        }
      `}</style>
      <a
        href={`mailto:${email}`}
        className="contact-email"
      >
        {email}
      </a>
    </>
  );
}

// ─── Social links ─────────────────────────────────────────────────────────────

interface SocialLinksListProps {
  links: SocialLink[];
}

function SocialLinksList({ links }: SocialLinksListProps): React.ReactElement {
  const visibleLinks = links.filter((link) => isFilled(link.url) && isFilled(link.platform));

  if (visibleLinks.length === 0) return <></>;

  return (
    <>
      <style>{`
        .contact-social-link {
          font-family:     var(--vault-font-mono);
          font-size:       13px;
          color:           var(--vault-text-secondary);
          text-decoration: none;
          transition:      color 0.2s ease;
        }
        .contact-social-link:hover {
          color: var(--accent);
        }
      `}</style>
      <nav
        aria-label="Social links"
        style={{
          display:        'flex',
          flexWrap:       'wrap',
          justifyContent: 'center',
          gap:            '24px',
        }}
      >
        {visibleLinks.map((link, i) => (
          <a
            key={link.platform ?? i}
            href={link.url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-social-link"
          >
            {link.platform}
          </a>
        ))}
      </nav>
    </>
  );
}

// ─── Contact section ──────────────────────────────────────────────────────────

export default function Contact({ data, socialLinks = [] }: ContactProps): React.ReactElement {
  const email      = data?.email;
  const validLinks = socialLinks.filter((l) => isFilled(l.url) && isFilled(l.platform));
  const reducedMotion = useReducedMotion() ?? false;

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
      <style>{`
        #contact {
          padding: 120px 48px;
        }
        @media (max-width: 767px) {
          #contact {
            padding: 80px 24px !important;
          }
        }
      `}</style>

      <motion.section
        id="contact"
        aria-label="Contact"
        style={{
          textAlign: 'center',
          maxWidth:  '900px',
          margin:    '0 auto',
        }}
        {...motionProps}
      >
        <SectionLabel />

        {isFilled(email) && <EmailLink email={email!} />}

        <SocialLinksList links={validLinks} />
      </motion.section>
    </>
  );
}
