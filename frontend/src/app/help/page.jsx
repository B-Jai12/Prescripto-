"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Search, ArrowLeft, HelpCircle, CreditCard, ShieldCheck,
  MessageSquare, BookOpen, Building2, GraduationCap, ChevronRight,
  Stethoscope, FileText, Zap, ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import BorderGlow from "@/components/BorderGlow";

const helpCategories = [
  {
    id: 'getting-started',
    title: "Getting started with LipiRx",
    desc: "Real advice from the LipiRx medical AI team on scanning prescriptions for success.",
    icon: Stethoscope,
    color: '#FF9FFC',
    articles: 12
  },
  {
    id: 'faq',
    title: "FAQ",
    desc: "Answers to common clinical and technical questions about the LipiRx pipeline.",
    icon: HelpCircle,
    color: '#c084fc',
    articles: 32
  },
  {
    id: 'managing-account',
    title: "Managing your account",
    desc: "How to manage clinical data privacy, payments & the details of your medical account.",
    icon: ShieldCheck,
    color: '#38bdf8',
    articles: 8
  },
  {
    id: 'clinics',
    title: "LipiRx for Clinics",
    desc: "FAQs about using LipiRx for institutional medical education and hospital workflows.",
    icon: Building2,
    color: '#fbbf24',
    articles: 5
  },
  {
    id: 'education',
    title: "LipiRx for Medical Students",
    desc: "How to get the most out of your LipiRx for Education plan to speed up your clinical studies.",
    icon: GraduationCap,
    color: '#4ade80',
    articles: 3
  }
];

const technicalQuestions = [
  {
    id: 1,
    q: "How to get the most accurate OCR scan for handwritten prescriptions?",
    a: "Place the prescription on a flat, well-lit surface and ensure there are no shadows. Hold your phone directly above the paper and wait for the auto-focus to lock before capturing. Our medical AI is trained on over 100,000 clinical samples to handle complex handwriting."
  },
  {
    id: 2,
    q: "What languages does LipiRx support for prescription analysis?",
    a: "LipiRx currently supports English, Telugu, and Hindi for OCR and AI-driven analysis. If your prescription is in another language, uploading it in English mode will still extract key medicine names and dosages."
  },
  {
    id: 3,
    q: "How long does the prescription analysis take?",
    a: "Prescription analysis typically takes 30–60 seconds depending on prescription complexity and image quality. If the status bar doesn't move for over 2 minutes, please refresh the page — this is usually caused by a temporary connection drop."
  },
  {
    id: 4,
    q: "Is my prescription data stored or shared?",
    a: "No. LipiRx processes your prescription in real-time and does not store the raw image or personal medical data on our servers after analysis is complete. Your privacy is our top priority."
  },
  {
    id: 5,
    q: "What to do if the analysis is stuck?",
    a: "Try clearing your browser cache and cookies for the LipiRx site, then re-upload the image. Make sure the backend server is running on port 8000 before uploading. If the problem persists, contact support."
  },
  {
    id: 6,
    q: "Can I download my prescription analysis report?",
    a: "Yes! After analysis completes, click the download button (↓) in the top-right corner of the results page to save a PDF report of all medicines, safety warnings, wellness advice, and pricing."
  },
  {
    id: 7,
    q: "The LipiRx Clinical Counseling Service has been updated",
    a: "We have recently integrated our clinical insights directly into the main report summary. You now get doctor-verified context and severity ratings instantly alongside your OCR scan results."
  },
];

export default function HelpCenterPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  return (
    <div style={{
      minHeight: '100vh', background: '#000000', color: '#ffffff',
      fontFamily: "'Inter', sans-serif", position: 'relative', overflowX: 'hidden'
    }}>
      {/* ── Background ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(circle at 50% -10%, rgba(192, 132, 252, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, padding: '24px 40px',
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <button
            onClick={() => router.push('/app')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, background: 'none',
              border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} /> Back
          </button>
          <span
              onClick={() => router.push('/account')}
              style={{
                fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600,
                cursor: 'pointer', transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >
              Account
            </span>
        </div>
      </nav>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 1 }}>

        {/* ── Hero ── */}
        <section style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 32 }}>
            Answers to frequently asked questions about LipiRx
          </h1>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} size={20} />
              <input
                type="text"
                placeholder="Search for clinical articles, help, or troubleshooting..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '20px 20px 20px 64px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 16, outline: 'none', transition: 'all 0.3s'
                }}
                onFocus={e => e.target.style.borderColor = '#FF9FFC'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>
        </section>

        {/* ── Technical Questions (Accordion) ── */}
        <section style={{ marginBottom: 64 }}>
          <BorderGlow borderRadius={24} glowIntensity={0.2} colors={['rgba(255,255,255,0.1)']}>
            <div style={{ padding: 40, background: 'rgba(15, 15, 21, 0.5)', borderRadius: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Zap size={22} color="#FF9FFC" /> Technical Support & Common Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {technicalQuestions.map(item => (
                  <div
                    key={item.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div
                      onClick={() => setActiveFaq(activeFaq === item.id ? null : item.id)}
                      style={{
                        padding: '24px 0',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <span style={{
                        fontSize: 15, fontWeight: 600,
                        color: activeFaq === item.id ? '#FF9FFC' : '#fff',
                        transition: 'color 0.2s'
                      }}>
                        {item.q}
                      </span>
                      <motion.div
                        animate={{ rotate: activeFaq === item.id ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                      >
                        {activeFaq === item.id ? (
                          <ChevronDown size={20} color="#FF9FFC" />
                        ) : (
                          <ChevronRight size={20} color="rgba(255,255,255,0.2)" />
                        )}
                      </motion.div>
                    </div>

                    <AnimatePresence initial={false}>
                      {activeFaq === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          style={{ overflow: 'hidden' }}
                        >
                          <p style={{
                            paddingBottom: 24, fontSize: 14, lineHeight: 1.6,
                            color: 'rgba(255,255,255,0.5)', fontWeight: 500
                          }}>
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </BorderGlow>
        </section>

        {/* ── Footer ── */}
        <footer style={{ marginTop: 120, textAlign: 'center', opacity: 0.5 }}>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            LipiRx
          </div>
          <p style={{ fontSize: 14, marginBottom: 32 }}>
            If you can't find the answer to your question, please contact us at <span style={{ color: '#FF9FFC', fontWeight: 700 }}>adepumanojkumar96@gmail.com</span>
          </p>
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
