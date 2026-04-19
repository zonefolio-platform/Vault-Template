'use client';

import { useState } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { SiWhatsapp } from 'react-icons/si';
import { PortfolioData } from '@/types';
import { isFilled } from '@/lib/is-filled';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactProps {
  data?: PortfolioData['contact'];
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel(): React.ReactElement {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
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

// ─── Display email link ────────────────────────────────────────────────────────

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
          font-size:       clamp(36px, 5vw, 64px);
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
      `}</style>
      <a href={`mailto:${email}`} className="contact-email">
        {email}
      </a>
    </>
  );
}

// ─── Contact detail card ──────────────────────────────────────────────────────

type IconComponent = React.ComponentType<{ size?: number }>;

interface ContactCardProps {
  Icon:   IconComponent;
  label:  string;
  value:  string;
  href?:  string;
}

function ContactCard({ Icon, label, value, href }: ContactCardProps): React.ReactElement {
  const [hovered, setHovered] = useState(false);

  const inner = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         '16px',
        background:  'var(--vault-surface)',
        border:      `1px solid ${hovered ? 'var(--accent-border)' : 'var(--vault-border)'}`,
        borderRadius: '12px',
        padding:     '20px 24px',
        transition:  'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow:   hovered ? '0 0 16px var(--highlight-glow)' : 'none',
        cursor:      href ? 'pointer' : 'default',
      }}
    >
      <span style={{ color: 'var(--accent)', display: 'flex', flexShrink: 0 }}>
        <Icon size={20} />
      </span>
      <div>
        <p
          style={{
            fontFamily:    'var(--vault-font-mono)',
            fontSize:      '10px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color:         'var(--vault-text-secondary)',
            margin:        '0 0 4px',
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: 'var(--vault-font-body)',
            fontSize:   '15px',
            fontWeight: 400,
            color:      'var(--vault-text-primary)',
            margin:     0,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'block' }}
      >
        {inner}
      </a>
    );
  }

  return inner;
}

// ─── Contact section ──────────────────────────────────────────────────────────

export default function Contact({ data }: ContactProps): React.ReactElement {
  const email    = data?.email;
  const phone    = data?.phone;
  const location = data?.location;
  const whatsapp = data?.whatsapp;

  const reducedMotion = useReducedMotion() ?? false;

  const motionProps: Partial<HTMLMotionProps<'section'>> = reducedMotion
    ? {}
    : {
        initial:     { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0  },
        transition:  { duration: 0.6, ease: 'easeOut' as const },
        viewport:    { once: true },
      };

  const hasCards = isFilled(phone) || isFilled(location) || isFilled(whatsapp);

  return (
    <>
      <style>{`
        #contact {
          padding: 120px 48px;
        }
        #contact-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          max-width: 760px;
          margin: 0 auto;
        }
        @media (max-width: 767px) {
          #contact {
            padding: 80px 24px !important;
          }
          #contact-cards {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <motion.section
        id="contact"
        aria-label="Contact"
        style={{
          textAlign: 'center',
          maxWidth:  '960px',
          margin:    '0 auto',
        }}
        {...motionProps}
      >
        <SectionLabel />

        {isFilled(email) && <EmailLink email={email!} />}

        {/* Divider between email and cards */}
        {isFilled(email) && hasCards && (
          <div
            aria-hidden="true"
            style={{
              height:       '1px',
              background:   'var(--vault-border)',
              marginBottom: '40px',
              maxWidth:     '760px',
              margin:       '0 auto 40px',
            }}
          />
        )}

        {hasCards && (
          <div id="contact-cards">
            {isFilled(phone) && (
              <ContactCard
                Icon={FiPhone}
                label="Phone"
                value={phone!}
                href={`tel:${phone}`}
              />
            )}
            {isFilled(whatsapp) && (
              <ContactCard
                Icon={SiWhatsapp}
                label="WhatsApp"
                value={`+${whatsapp}`}
                href={`https://wa.me/${whatsapp}`}
              />
            )}
            {isFilled(location) && (
              <ContactCard
                Icon={FiMapPin}
                label="Location"
                value={location!}
              />
            )}
          </div>
        )}
      </motion.section>
    </>
  );
}
