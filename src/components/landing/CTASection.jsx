'use client';

export default function CTASection() {

  return (
    <section
      style={{
        background: '#0f0f15',
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

      {/* Subtle center glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 600, height: 300,
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div
        className="anim-fade-up"
        style={{
          maxWidth: 640,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 0,
          background: '#0d0d12',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 999, padding: '3px 3px',
          marginBottom: 32,
        }}>
          <span style={{
            background: '#ffffff', color: '#0d0d12',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
            padding: '3px 9px', borderRadius: 999, marginRight: 10,
          }}>
            FREE
          </span>
          <span style={{
            color: 'rgba(255,255,255,0.55)',
            paddingRight: 10, fontSize: 13,
          }}>
            No account required
          </span>
        </div>

        {/* Heading */}
        <h2 style={{
          fontSize: 'clamp(30px, 5vw, 50px)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          color: '#ffffff',
          marginBottom: 16,
        }}>
          Ready to decode your<br />
          <span style={{ color: 'rgba(255,255,255,0.45)' }}>first prescription?</span>
        </h2>

        <p style={{
          fontSize: 16, color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.6, marginBottom: 40,
        }}>
          No sign-up required. No credit card. Just upload and see the magic.
        </p>

        {/* CTA */}
        <a
          href="/signup"
          style={{
            background: '#ffffff',
            color: '#0d0d12',
            fontSize: 15,
            fontWeight: 700,
            padding: '14px 36px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '-0.01em',
            transition: 'opacity 0.18s, transform 0.15s',
            marginBottom: 24,
            textDecoration: 'none',
            display: 'inline-block',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1';    e.currentTarget.style.transform = 'translateY(0)'; }}
          onMouseDown={e  => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={e    => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
        >
          Try It Free — Upload Now
        </a>

        {/* Fine print */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 24, flexWrap: 'wrap',
        }}>
          {['Takes less than 3 seconds', 'Works on any device', 'No data stored'].map((item) => (
            <span key={item} style={{
              fontSize: 13, color: 'rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>✓</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
