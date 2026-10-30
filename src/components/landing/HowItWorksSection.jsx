'use client';

const steps = [
  {
    number: '01',
    title: 'Drop your prescription',
    description: 'Drag and drop or click to upload any prescription image. We support JPG, PNG, and scanned documents of any quality.',
    tag: 'Upload',
  },
  {
    number: '02',
    title: 'AI reads and analyzes',
    description: 'Our Gemini-powered model extracts medications, dosages, and instructions. It flags any dangerous interactions in real time.',
    tag: 'Process',
  },
  {
    number: '03',
    title: 'Explore your dashboard',
    description: 'A clean 7-tab summary displays everything — medications, patient info, dosage schedule, safety warnings, and more.',
    tag: 'Review',
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      style={{
        background: '#0d0d12',
        padding: '100px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top divider */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 900, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
      }} />

      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div className="anim-fade-up" style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
            marginBottom: 16,
          }}>
            HOW IT WORKS
          </p>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.12,
            color: '#ffffff',
          }}>
            Three steps to a complete<br />
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>prescription summary</span>
          </h2>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {steps.map(({ number, title, description, tag }, i) => (
            <div
              key={number}
              className="anim-fade-up"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 32,
                padding: '36px 40px',
                background: '#0f0f15',
                borderRadius: i === 0 ? '16px 16px 4px 4px' : i === steps.length - 1 ? '4px 4px 16px 16px' : 4,
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'background 0.2s, border-color 0.2s',
                animationDelay: `${i * 80}ms`,
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0f0f15';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              }}
            >
              {/* Number */}
              <div style={{
                flexShrink: 0,
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '-0.01em',
                color: 'rgba(255,255,255,0.2)',
                width: 36,
                paddingTop: 2,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {number}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <h3 style={{
                    fontSize: 18, fontWeight: 700,
                    letterSpacing: '-0.02em', color: '#ffffff',
                  }}>
                    {title}
                  </h3>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    padding: '3px 8px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    {tag}
                  </span>
                </div>
                <p style={{
                  fontSize: 15, lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.45)',
                  maxWidth: 560,
                }}>
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
