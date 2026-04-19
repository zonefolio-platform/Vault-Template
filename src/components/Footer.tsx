'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FiArrowUp, FiExternalLink } from 'react-icons/fi';

export default function Footer(): React.ReactElement {
  const currentYear    = new Date().getFullYear();
  const reducedMotion  = useReducedMotion() ?? false;
  const [btnHovered,   setBtnHovered]   = useState(false);
  const [zfHovered,    setZfHovered]    = useState(false);

  function scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
  }

  const motionProps = reducedMotion
    ? {}
    : {
        initial:     { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0  },
        viewport:    { once: true },
        transition:  { duration: 0.6 },
      };

  return (
    <>
      <style>{`
        #vault-footer { padding: 40px 48px; }

        #vault-footer-row {
          display:         flex;
          flex-direction:  row;
          align-items:     center;
          justify-content: space-between;
          gap:             24px;
        }

        #vault-footer-left {
          display:     flex;
          align-items: center;
          gap:         16px;
        }

        #vault-footer-right {
          display:     flex;
          align-items: center;
          gap:         16px;
        }

        @media (max-width: 640px) {
          #vault-footer { padding: 40px 24px !important; }
          #vault-footer-row { flex-direction: column; gap: 20px; }
          #vault-footer-left { flex-direction: column; gap: 8px; text-align: center; }
          .footer-dot { display: none; }
        }
      `}</style>

      <motion.footer
        id="vault-footer"
        style={{ borderTop: '1px solid var(--vault-border)', marginTop: 'auto' }}
        {...motionProps}
      >
        <div id="vault-footer-row">
          {/* Left — copyright + tagline */}
          <div id="vault-footer-left">
            <p
              style={{
                fontFamily:    'var(--vault-font-mono)',
                fontSize:      '12px',
                color:         'var(--vault-text-secondary)',
                margin:        0,
                letterSpacing: '0.2px',
              }}
            >
              © {currentYear} · All rights reserved
            </p>

            <span
              className="footer-dot"
              aria-hidden="true"
              style={{
                width:        '3px',
                height:       '3px',
                borderRadius: '50%',
                background:   'var(--vault-text-muted)',
                flexShrink:   0,
                display:      'block',
              }}
            />

            <p
              style={{
                fontFamily:    'var(--vault-font-mono)',
                fontSize:      '12px',
                color:         'var(--vault-text-muted)',
                margin:        0,
                letterSpacing: '0.2px',
              }}
            >
              Crafted with precision
            </p>
          </div>

          {/* Right — Powered by ZoneFolio + scroll to top */}
          <div id="vault-footer-right">
            {/* Powered by ZoneFolio */}
            <div
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        '6px',
              }}
            >
              <span
                style={{
                  fontFamily:    'var(--vault-font-mono)',
                  fontSize:      '12px',
                  color:         'var(--vault-text-muted)',
                  letterSpacing: '0.2px',
                }}
              >
                Powered by
              </span>
              <a
                href="https://zonefolio.app"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setZfHovered(true)}
                onMouseLeave={() => setZfHovered(false)}
                style={{
                  display:        'inline-flex',
                  alignItems:     'center',
                  gap:            '4px',
                  fontFamily:     'var(--vault-font-mono)',
                  fontSize:       '12px',
                  fontWeight:     600,
                  color:          zfHovered ? 'var(--vault-text-primary)' : 'var(--accent)',
                  textDecoration: 'none',
                  transition:     'color 0.2s ease',
                  letterSpacing:  '0.2px',
                }}
              >
                ZoneFolio
                <FiExternalLink size={11} />
              </a>
            </div>

            {/* Divider */}
            <span
              aria-hidden="true"
              style={{
                width:      '1px',
                height:     '16px',
                background: 'var(--vault-border)',
                display:    'block',
                flexShrink: 0,
              }}
            />

            {/* Scroll to top */}
            <button
              type="button"
              onClick={scrollToTop}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              aria-label="Scroll to top"
              style={{
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                width:           '32px',
                height:          '32px',
                borderRadius:    '50%',
                background:      btnHovered ? 'var(--secondary)' : 'var(--vault-surface)',
                border:          `1px solid ${btnHovered ? 'var(--accent-border)' : 'var(--vault-border)'}`,
                color:           btnHovered ? 'var(--accent)' : 'var(--vault-text-secondary)',
                cursor:          'pointer',
                transition:      'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
                flexShrink:      0,
              }}
            >
              <FiArrowUp size={14} />
            </button>
          </div>
        </div>
      </motion.footer>
    </>
  );
}
