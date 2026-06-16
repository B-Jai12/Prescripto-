'use client';

const features = [
  {
    emoji: '💊',
    title: 'Medication Extraction',
    description: 'Pulls every drug name, dosage, and frequency from any prescription automatically — handwritten or printed.',
    delay: '0ms',
  },
  {
    emoji: '⚡',
    title: 'Instant Processing',
    description: 'Results in under 3 seconds. No waiting, no manual entry, no transcription errors.',
    delay: '60ms',
  },
  {
    emoji: '⚠️',
    title: 'Drug Interaction Warnings',
    description: 'Flags dangerous combinations and contraindications before they ever reach the patient.',
    delay: '120ms',
  },
  {
    emoji: '📋',
    title: 'Structured Summary',
    description: 'Returns a clean 7-tab dashboard: Medications, Dosage, Warnings, History, and more.',
    delay: '180ms',
  },
  {
    emoji: '📤',
    title: 'Drag & Drop Upload',
    description: 'Upload any image — JPG, PNG, scanned documents — and our AI gets to work immediately.',
    delay: '240ms',
  },
  {
    emoji: '🔒',
    title: 'Privacy First',
    description: 'Images are processed securely and never stored. Patient data stays completely protected.',
    delay: '300ms',
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        background: '#0f0f15',
        padding: '100px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle divider line from hero */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 900, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div className="anim-fade-up" style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
            marginBottom: 16,
          }}>
            CAPABILITIES
          </p>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.12,
            color: '#ffffff',
            marginBottom: 16,
          }}>
            Everything a pharmacist needs,<br />
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>powered by AI</span>
          </h2>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.45)',
            maxWidth: 480, margin: '0 auto', lineHeight: 1.6,
          }}>
            From handwritten scripts to printed prescriptions — our AI reads it all and breaks it down instantly.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 1,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {features.map(({ emoji, title, description, delay }) => (
            <div
              key={title}
              className="anim-fade-up"
              style={{
                background: '#0f0f15',
                padding: '36px 32px',
                cursor: 'default',
                transition: 'background 0.2s',
                animationDelay: delay,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0f0f15'; }}
            >
              <div style={{ fontSize: 28, marginBottom: 16 }}>{emoji}</div>
              <h3 style={{
                fontSize: 16, fontWeight: 700,
                color: '#ffffff', marginBottom: 10,
                letterSpacing: '-0.01em',
              }}>
                {title}
              </h3>
              <p style={{
                fontSize: 14, lineHeight: 1.65,
                color: 'rgba(255,255,255,0.45)',
              }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
