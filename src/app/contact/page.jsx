"use client";
import { motion } from "framer-motion";
import {
  Mail, MessageSquare, Phone, MapPin, ArrowLeft,
  Send, Sparkles, Activity, ShieldCheck, Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import BorderGlow from "@/components/BorderGlow";

export default function ContactPage() {
  const router = useRouter();

  const handleEmailClick = () => {
    const mailtoLink = "mailto:adepumanojkumar96@gmail.com?subject=LipiRx%20Inquiry&body=Hello%20LipiRx%20Team,";
    const tempLink = document.createElement('a');
    tempLink.href = mailtoLink;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#000000', color: '#ffffff',
      fontFamily: "'Inter', sans-serif", position: 'relative', overflowX: 'hidden'
    }}>
      {/* ── Background ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(circle at 50% -20%, rgba(192, 132, 252, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 24px', position: 'relative', zIndex: 1 }}>

        <button
          onClick={() => router.push('/app')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            marginBottom: 48, transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80, alignItems: 'center' }}>

          {/* ── Left Content ── */}
          <section>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 24, lineHeight: 1 }}>
                Let&apos;s talk about <br />
                <span style={{ color: '#FF9FFC' }}>your healthcare.</span>
              </h1>
              <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 48 }}>
                Whether you&apos;re a patient with a query or a hospital looking to integrate LipiRx, our specialized clinical team is ready to assist you.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {[
                  { icon: Mail, label: "Email our Team", value: "adepumanojkumar96@gmail.com", color: '#FF9FFC' },
                  { icon: Phone, label: "24/7 Clinical Support", value: "+91 9121032468", color: '#c084fc' },
                  { icon: MapPin, label: "location", value: "Bachupally , Hyderabad, Telangana, India", color: '#38bdf8' },
                ].map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 20 }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.03)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color
                    }}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: 15, fontWeight: 600 }}>{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* ── Right Content (Action Card) ── */}
          <section>
            <BorderGlow colors={['#FF9FFC', '#c084fc', '#38bdf8']} borderRadius={32} glowIntensity={0.8}>
              <div style={{
                padding: 48, background: 'rgba(15, 15, 21, 0.8)',
                backdropFilter: 'blur(32px)', borderRadius: 32,
                display: 'flex', flexDirection: 'column', gap: 32,
                textAlign: 'center'
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20, background: '#FF9FFC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000',
                  margin: '0 auto'
                }}>
                  <Send size={28} />
                </div>

                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Ready to connect?</h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                    Click below to open your mail client and send us a direct message. Our team usually responds within 2 hours.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button
                    onClick={handleEmailClick}
                    style={{
                      width: '100%', padding: '18px', borderRadius: 16,
                      background: '#ffffff', color: '#000', fontWeight: 900,
                      fontSize: 16, border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Open Mail Client <Zap size={18} fill="#000" />
                  </button>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>
                    Redirects to Outlook, Gmail, or your default app.
                  </p>
                </div>

                <div style={{
                  padding: '20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left'
                }}>
                  <ShieldCheck size={20} color="#4ade80" />
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                    Your clinical inquiries are protected by end-to-end encryption.
                  </p>
                </div>
              </div>
            </BorderGlow>
          </section>

        </div>

        {/* ── Footer ── */}
        <footer style={{ marginTop: 100, textAlign: 'center', opacity: 0.5 }}>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 16 }}>
            LipiRx
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
            {[
              { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61574775184901' },
              { name: 'Instagram', url: 'https://www.instagram.com/manojkumar_970_/' },
              { name: 'LinkedIn', url: 'https://www.linkedin.com/in/manojkumar-adepu-b9721831b' },
              { name: 'GitHub', url: 'https://github.com/manojkumar-96622' }
            ].map(s => (
              <a 
                key={s.name} 
                href={s.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  fontSize: 13, 
                  fontWeight: 700, 
                  color: 'rgba(255,255,255,0.4)', 
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#FF9FFC'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                {s.name}
              </a>
            ))}
          </div>
        </footer>

      </main>
    </div>
  );
}
