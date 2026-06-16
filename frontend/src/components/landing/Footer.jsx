'use client';

const techStack = ['Gemini AI', 'Next.js', 'Canvas 2D'];

export default function Footer() {
  return (
    <footer
      style={{
        background: '#0a0a0f',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '64px 24px 40px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Main grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 48,
          marginBottom: 48,
        }}>
          {/* Brand */}
          <div>
            <div
              style={{
                fontSize: 15, fontWeight: 700, color: '#ffffff',
                textDecoration: 'none', marginBottom: 12,
                letterSpacing: '0.5px'
              }}
            >
              LipiRx
            </div>
            <p style={{
              fontSize: 14, lineHeight: 1.65,
              color: 'rgba(255,255,255,0.3)',
              maxWidth: 220,
            }}>
              Prescription intelligence, simplified. Powered by Gemini AI.
            </p>
          </div>

          {/* Empty Space for Minimalism */}
          <div />

          {/* Tech */}
          <div>
            <p style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
              marginBottom: 20,
            }}>
              Built With
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {techStack.map((tech) => (
                <span
                  key={tech}
                  style={{
                    fontSize: 12, fontWeight: 500,
                    padding: '5px 12px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
            <p style={{
              fontSize: 13, marginTop: 20,
              color: 'rgba(255,255,255,0.25)',
            }}>
              Built with ❤️ for healthcare
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between',
          gap: 12,
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
            © 2026 LipiRx. All rights reserved.
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
            Not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
