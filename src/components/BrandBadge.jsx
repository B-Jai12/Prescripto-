export default function BrandBadge({ compact = false, subtitle = 'AI Prescription Assistant' }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        lineHeight: 1.04,
        alignItems: 'flex-start',
        gap: 2
      }}
    >
      <span
        style={{
          fontSize: compact ? 22 : 28,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          background: 'linear-gradient(90deg, #FF9FFC 0%, #c084fc 50%, #38bdf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block',
          filter: 'drop-shadow(0 2px 8px rgba(168, 85, 247, 0.25))'
        }}
      >
        LipiRx
      </span>
      {!compact && (
        <span
          style={{
            fontSize: 9,
            color: 'rgba(255, 255, 255, 0.45)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 700
          }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}
