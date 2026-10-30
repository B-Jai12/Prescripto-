"use client";
import { motion } from "framer-motion";
import { Sparkles, Cpu, Search, CheckCircle2 } from "lucide-react";

export function ImageScanner() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 5 }}>
      {/* ── Downward Scanning Laser ── */}
      <motion.div
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute', left: 0, right: 0, height: '4px',
          background: 'linear-gradient(to right, transparent, #FF9FFC, #c084fc, #FF9FFC, transparent)',
          boxShadow: '0 0 20px 2px rgba(255, 159, 252, 0.6)',
        }}
      />
      
      {/* Subtle data fall background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, 400], opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: "linear" }}
            style={{
              position: 'absolute', left: `${i * 25}%`, top: -100, width: '1px', height: '100px',
              background: 'linear-gradient(to bottom, transparent, #c084fc)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function LoadingState() {
  const steps = [
    { label: "OCR Text Extraction", delay: 0.2, icon: Search },
    { label: "AI Clinical Analysis", delay: 0.8, icon: Cpu },
    { label: "Generating Safety Checks", delay: 1.4, icon: CheckCircle2 },
    { label: "Building Diet Plan", delay: 2.0, icon: Sparkles },
  ];

  return (
    <div style={{ 
      width: '100%', 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      paddingTop: 40, gap: 32
    }}>
      {/* Text Headers */}
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ 
          fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em',
          background: 'linear-gradient(to right, #fff, #FF9FFC, #fff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Analyzing Prescription
        </h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
          AI pipeline is processing your medical data...
        </p>
      </div>

      {/* Status Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 400 }}>
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: step.delay, duration: 0.5 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
              borderRadius: 20, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ 
              width: 32, height: 32, borderRadius: 10, 
              background: i < 2 ? 'rgba(74,222,128,0.1)' : 'rgba(192,132,252,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <step.icon size={16} color={i < 2 ? "#4ade80" : "#c084fc"} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
              {step.label}
            </span>
            {i < 2 && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Done</span>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} />
              </div>
            )}
            {i === 2 && (
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#c084fc', boxShadow: '0 0 15px #c084fc' }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
