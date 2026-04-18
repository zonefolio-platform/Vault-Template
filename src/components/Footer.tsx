export default function Footer(): React.ReactElement {
  return (
    <footer
      style={{
        textAlign: 'center',
        padding: '32px 0',
        fontFamily: 'var(--vault-font-mono)',
        fontSize: '12px',
        color: 'var(--vault-text-muted)',
        letterSpacing: '0.3px',
        borderTop: '1px solid var(--vault-border)',
      }}
    >
      © {new Date().getFullYear()} · All rights reserved
    </footer>
  );
}
