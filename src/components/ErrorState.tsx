export default function ErrorState(): React.ReactElement {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--vault-bg)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--vault-font-mono)',
          fontSize: '13px',
          color: 'var(--vault-text-secondary)',
          letterSpacing: '0.3px',
        }}
      >
        Something went wrong loading this portfolio.
      </p>
    </div>
  );
}
