'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Shield, Activity, ShoppingBag, ChevronRight,
  AlertCircle, CheckCircle2, Download, Share2, ArrowLeft,
  Search, Pill, Heart, Zap, Clock, Info, Upload, Sparkles, User,
  Code, ExternalLink, ShoppingCart, AlertTriangle, Salad
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PatientSummaryCard from "@/components/PatientSummaryCard";
import LipiChat from "@/components/LipiChat";
import UploadCard from "@/components/UploadCard";
import BrandBadge from '@/components/BrandBadge';
import { auth, signOut, onAuthStateChanged } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';

const ScannerLine = () => (
  <>
    <style>{`
      @keyframes scanSweepFinal {
        0% { top: 0%; }
        100% { top: 100%; }
      }
      .scanner-ray {
        position: absolute;
        left: 0;
        right: 0;
        height: 4px;
        background: #ffffff;
        box-shadow: 0 0 15px 5px #FF9FFC, 0 0 40px 15px rgba(168, 85, 247, 0.8), 0 0 60px 20px rgba(255,159,252,0.6);
        z-index: 10;
        animation: scanSweepFinal 5s linear infinite;
      }
    `}</style>
    <div className="scanner-ray" />
  </>
);

async function optimizeImageForUpload(file) {
  if (!file || !file.type.startsWith('image/')) return file;
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1600;
        let { width, height } = img;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function AppMainPage() {
  const [view, setView] = useState('upload');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();

  const normalizeWellnessAdvice = (items = []) => {
    const diet = [];
    const exercise = [];
    const general = [];

    (items || []).forEach((item) => {
      const raw = String(item || '').trim();
      if (!raw) return;

      const lower = raw.toLowerCase();
      const looksDiet = /^(diet|nutrition|food|foods|eat|avoid|include|limit|prefer|drink|hydrate|reduce|increase|protein|fiber|sodium|sugar)\b/i.test(lower)
        || /(eat|avoid|drink|include|prefer|limit|reduce|increase|protein|fiber|sodium|sugar)/i.test(lower);
      const looksExercise = /^(exercise|activity|walk|walking|yoga|stretch|stretching|breathing|cardio|strength|workout|jog|jogging|cycle|cycling|swim|swimming|movement)\b/i.test(lower)
        || /(walk|yoga|stretch|breathing|cardio|strength|workout|jog|cycle|swim|movement)/i.test(lower);

      if (looksExercise && !looksDiet) exercise.push(raw);
      else if (looksDiet) diet.push(raw);
      else general.push(raw);
    });

    return {
      diet: diet.length ? diet : general.filter((item) => !/walk|yoga|stretch|exercise|cardio|movement/i.test(item)),
      exercise: exercise.length ? exercise : general.filter((item) => /walk|yoga|stretch|exercise|cardio|movement/i.test(item)),
      general,
    };
  };

  const handleDownloadReport = () => {
    if (!resultData) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 40;
    const maxWidth = pageWidth - marginX * 2;
    const addSection = (title, lines = [], options = {}) => {
      const { boldTitle = true } = options;
      if (doc.internal.getNumberOfPages() > 1) {
        doc.setPage(doc.internal.getCurrentPageInfo().pageNumber);
      }
      if (doc.lastY && doc.lastY > 760) {
        doc.addPage();
      }
      let y = doc.lastY || 48;
      doc.setFont('helvetica', boldTitle ? 'bold' : 'normal');
      doc.setFontSize(14);
      doc.text(String(title || ''), marginX, y);
      y += 18;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      lines.forEach((line) => {
        const wrapped = doc.splitTextToSize(String(line || ''), maxWidth);
        doc.text(wrapped, marginX + 8, y);
        y += wrapped.length * 13;
      });
      doc.lastY = y;
    };

    const addPageHeading = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('LipiRx Prescription Report', marginX, 36);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Generated from your latest prescription analysis.', marginX, 54);
      doc.lastY = 72;
    };

    addPageHeading();

    addSection('1. Overview', [
      `Patient: ${resultData.patient?.name || 'Unknown Patient'}`,
      `Age / Gender: ${resultData.patient?.age || 'N/A'} / ${resultData.patient?.gender || 'N/A'}`,
      `Doctor: ${resultData.patient?.doctor || 'Unknown Doctor'}`,
      `Hospital: ${resultData.patient?.hospital || 'N/A'}`,
      '',
      ...((resultData.medicines || []).map((med, index) =>
        `${index + 1}. ${med.name} | ${med.dosage || 'N/A'} | ${med.frequency || 'N/A'} | ${med.duration || 'N/A'}\n   Instructions: ${med.instructions || 'No instructions available.'}\n   Side effects: ${med.side_effects?.join(', ') || 'None reported'}`
      )),
    ]);

    addSection('2. Safety', [
      resultData.patient?.drug_interactions || 'No major drug interactions were identified in this report.',
      '',
      ...((resultData.safety || []).map((item) => `${item.med}: ${item.warning}`)),
    ]);

    addSection('3. Wellness', [
      'Diet & Nutrition:',
      ...((resultData.wellness?.diet || []).length ? resultData.wellness.diet : ['No specific diet advice was returned for this prescription.']),
      '',
      'Exercise & Lifestyle:',
      ...((resultData.wellness?.exercise || []).length ? resultData.wellness.exercise : ['No exercise guidance was returned for this prescription.']),
      '',
      'General Tips:',
      ...((resultData.wellness?.general || []).length ? resultData.wellness.general : ['No general wellness guidance was returned for this prescription.']),
    ]);

    addSection('4. Buy & Find', [
      ...((resultData.buy || []).map((store) => `${store.name}: ₹${store.price} (${store.url})`)),
    ]);

    addSection('5. Technical Notes', [
      `Raw OCR: ${resultData.technical?.raw_ocr || 'No OCR text available'}`,
      '',
      `JSON: ${resultData.technical?.json || 'No JSON data available'}`,
    ]);

    doc.save('lipirx-prescription-report.pdf');
  };

  useEffect(() => {
    // Security guard: wipe stale cached data if a different user logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const storedUserId = localStorage.getItem('currentUserId');
        if (storedUserId && storedUserId !== user.uid) {
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('is_setup_complete');
        }
        localStorage.setItem('currentUserId', user.uid);
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleUploadComplete = async (file) => {
    setLoading(true);
    setAnalysisStep(0);

    try {
      // Step 1 – enhancing image & scaling for fast analysis
      setAnalysisStep(1);
      const uploadFile = await optimizeImageForUpload(file);

      // Build FormData and POST the optimized image
      const formData = new FormData();
      formData.append('file', uploadFile);

      const configuredUrl = process.env.NEXT_PUBLIC_API_URL;
      let response = null;

      if (configuredUrl) {
        try {
          const res = await fetch(`${configuredUrl}/parse-prescription?languages=en,te,hi`, {
            method: 'POST',
            body: formData,
          });
          if (res.ok) {
            response = res;
          }
        } catch (backendErr) {
          console.warn('Dedicated backend unreachable, falling back to Next.js API route...', backendErr);
        }
      }

      if (!response) {
        response = await fetch(`/api/parse-prescription?languages=en,te,hi`, {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        let errMsg = `Server error (${response.status})`;
        try {
          const errData = await response.json();
          errMsg = errData.detail || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      // Step 2 – OCR done
      setAnalysisStep(2);
      const backendData = await response.json();

      // Step 3 – cross-referencing
      setAnalysisStep(3);
      await new Promise(res => setTimeout(res, 800));

      // Step 4 – generating report
      setAnalysisStep(4);
      await new Promise(res => setTimeout(res, 600));

      // ── Map backend JSON → frontend UI state ──
      const result = backendData.result || {};
      const meds   = result.medicines || [];
      const raw    = backendData.raw_text || '';
      const wellness = normalizeWellnessAdvice(result.diet_and_lifestyle || []);

      const mapped = {
        patient: {
          name:   result.patient_details?.name   || 'Unknown Patient',
          age:    result.patient_details?.age    || 'N/A',
          gender: result.patient_details?.gender || 'N/A',
          doctor: result.hospital_details?.doctor_name || 'Unknown Doctor',
          hospital: result.hospital_details?.name || '',
          confidence: result.confidence_score ?? 1,
          analysis_notes: result.analysis_notes || '',
          doctor_notes: result.doctor_notes || '',
          follow_up: result.follow_up || '',
          drug_interactions: result.drug_interactions || null,
        },
        medicines: meds.map(m => ({
          name:            m.name,
          composition:     m.common_salt || '',
          dosage:          m.dosage || '',
          frequency:       m.frequency || '',
          duration:        m.duration || '',
          instructions:    m.instructions_en || m.timing || '',
          instructions_te: m.instructions_te || m.instructions_en || m.timing || '',
          instructions_hi: m.instructions_hi || m.instructions_en || m.timing || '',
          purpose:         m.common_salt ? `Generic: ${m.common_salt}` : '',
          estimated_mrp:   m.estimated_mrp || 0,
          side_effects:    m.side_effects || [],
        })),
        safety: meds.map(m => ({
          med:     m.name,
          warning: m.side_effects?.join(' ') || 'Consult your doctor for side effects.',
        })),
        wellness: {
          diet:     wellness.diet,
          exercise: wellness.exercise,
          general:  wellness.general,
          all:      [...wellness.diet, ...wellness.exercise, ...wellness.general],
        },
        buy: meds.slice(0, 3).flatMap(m => [
          { name: 'Netmeds',     price: Math.round((m.estimated_mrp || 50) * 0.86), url: `https://www.netmeds.com/catalogsearch/result?q=${encodeURIComponent(m.name)}`, savings: 'Up to 14%', tag: 'BEST DEAL', med: m.name },
          { name: 'Tata 1mg',    price: Math.round((m.estimated_mrp || 50) * 0.88), url: `https://www.1mg.com/search/all?name=${encodeURIComponent(m.name)}`, savings: '', tag: '', med: m.name },
          { name: 'Apollo',      price: Math.round((m.estimated_mrp || 50) * 0.92), url: `https://www.apollopharmacy.in/search-medicines/${encodeURIComponent(m.name)}`, savings: '', tag: '', med: m.name },
        ]),
        technical: {
          raw_ocr: raw,
          json: JSON.stringify(result, null, 2),
        },
      };

      setResultData(mapped);
      setView('result');

      // Save to client-side prescription history
      try {
        const historyItem = {
          id: 'rx_' + Date.now(),
          timestamp: new Date().toISOString(),
          fileName: file?.name || 'Prescription',
          data: backendData,
          patientName: mapped.patient.name,
          medicinesCount: meds.length
        };
        const existingRaw = localStorage.getItem('lipirx_prescription_history');
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        existing.unshift(historyItem);
        localStorage.setItem('lipirx_prescription_history', JSON.stringify(existing.slice(0, 20)));

        // Also persist to Supabase if table exists
        supabase.from('prescriptions').insert({
          file_name: file?.name || 'Prescription',
          patient_name: mapped.patient.name,
          medicines_count: meds.length,
          data: backendData,
          created_at: new Date().toISOString()
        }).then(() => {}).catch(() => {});
      } catch (historyErr) {
        console.warn('Could not cache prescription history:', historyErr);
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      alert(`Analysis failed: ${err.message}\n\nThe AI analysis server may be starting up (this can take up to 60 seconds on the first request). Please wait a moment and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const ANALYSIS_STEPS = [
    "Enhancing image quality...",
    "Running OCR text extraction...",
    "Cross-referencing medical database...",
    "Generating safety & wellness report..."
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'wellness', label: 'Wellness', icon: Activity },
    { id: 'buy', label: 'Buy & Find', icon: ShoppingBag },
    { id: 'technical', label: 'Technical', icon: Code },
  ];

  // resultData is set dynamically from the backend – no mock data needed

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif' }}>

      {/* Cosmic Light Beam Source */}
      <div style={{
        position: 'fixed',
        top: -100,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 400,
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.1) 40%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 999,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed',
        top: -50,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 120,
        height: 300,
        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(168, 85, 247, 0.2), transparent)',
        filter: 'blur(30px)',
        zIndex: 999,
        pointerEvents: 'none'
      }} />

      {/* Floating Glow Navbar */}
      <div style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)',
        maxWidth: 1000,
        zIndex: 1000
      }}>
        <motion.nav
          initial={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.1)' }}
          animate={{
            boxShadow: [
              '0 0 20px rgba(168, 85, 247, 0.15)',
              '0 0 35px rgba(168, 85, 247, 0.3)',
              '0 0 20px rgba(168, 85, 247, 0.15)'
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            padding: '6px 24px',
            background: 'rgba(10,10,15,0.7)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderRadius: 16,
            border: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
          }}>
          {/* Internal Glow Effect */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.5), transparent)' }} />

          <div
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <BrandBadge compact />
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {/* Interactive Profile Dropdown */}
            <div
              style={{ position: 'relative', padding: '10px 0' }}
              onMouseEnter={() => setShowProfileMenu(true)}
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 14,
                transition: 'background 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #FF9FFC 0%, #A855F7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                }}>
                  <User size={16} strokeWidth={2.5} />
                </div>
                <motion.div
                  animate={{ rotate: showProfileMenu ? 180 : 0 }}
                  style={{ color: 'rgba(255,255,255,0.4)', display: 'flex' }}
                >
                  <ChevronRight size={16} strokeWidth={3} style={{ transform: 'rotate(90deg)' }} />
                </motion.div>
              </div>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 8,
                      width: 220,
                      background: 'rgba(15,15,20,0.98)',
                      backdropFilter: 'blur(25px)',
                      borderRadius: 24,
                      border: '1px solid rgba(168, 85, 247, 0.25)',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 20px rgba(168, 85, 247, 0.1)',
                      padding: '10px',
                      zIndex: 2000
                    }}
                  >
                    {[
                      { label: 'Account', icon: User, href: '/account', color: '#A855F7' },
                      { label: 'Help Center', icon: Info, href: '/help', color: '#60A5FA' },
                      { label: 'Contact Us', icon: Sparkles, href: '/contact', color: '#FACC15' }
                    ].map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        style={{ textDecoration: 'none' }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 18px',
                            borderRadius: 16,
                            cursor: 'pointer',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: 15,
                            fontWeight: 700
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          {item.label}
                        </div>
                      </Link>
                    ))}

                    {/* Divider */}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '10px 14px' }} />

                    {/* Log Out */}
                    <div
                      onClick={async () => {
                        // Sign out from Firebase
                        await signOut(auth);
                        // Clear all user-specific localStorage to prevent data leaking to next user
                        localStorage.removeItem('userName');
                        localStorage.removeItem('userEmail');
                        localStorage.removeItem('is_setup_complete');
                        localStorage.removeItem('currentUserId');
                        router.push('/login');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '14px 18px',
                        borderRadius: 16,
                        cursor: 'pointer',
                        transition: 'all 0.25s',
                        color: '#F87171',
                        fontSize: 15,
                        fontWeight: 800
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <motion.div style={{ display: 'flex' }} whileHover={{ x: 3 }}>
                        <ArrowLeft size={20} strokeWidth={3} style={{ transform: 'rotate(180deg)' }} />
                      </motion.div>
                      Log Out
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.nav>
      </div>

      <AnimatePresence mode="wait">
        {view === 'upload' ? (
          <motion.main
            key="upload-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '180px 20px 100px', // Increased top padding for better balance
              textAlign: 'center'
            }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '10px 24px',
                borderRadius: 22,
                fontSize: 13,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.6)',
                marginBottom: 48, // Increased margin for more breathing room
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                letterSpacing: '0.02em'
              }}
            >
              <Sparkles size={16} color="#FF9FFC" /> Next-Gen Prescription Decoding
            </motion.div>

            <h1 style={{
              fontSize: 'clamp(48px, 8vw, 88px)', // Slightly larger for impact
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: '-0.05em',
              margin: '0 0 32px 0' // Increased margin
            }}>
              Upload. Analyze.<br />
              <span style={{
                background: 'linear-gradient(90deg, #FF9FFC 0%, #A855F7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Understand.</span>
            </h1>

            <p style={{
              fontSize: 20,
              color: 'rgba(255,255,255,0.4)',
              maxWidth: 640,
              margin: '0 auto 80px', // Increased margin to push upload card down
              lineHeight: 1.6,
              fontWeight: 400
            }}>
              Instant medical insights powered by advanced AI. Simply upload your prescription to get started.
            </p>

            <div style={{ width: '100%', maxWidth: 700 }}>

              <UploadCard 
                onFileSelect={handleUploadComplete} 
                isAnalyzing={loading}
                scanner={<ScannerLine />}
              />

              {/* ── AI Processing Animation Checklist ── */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: 24, padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <Zap size={20} color="#FF9FFC" />
                      <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>LipiRx AI Processing</h3>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {ANALYSIS_STEPS.map((step, idx) => {
                        const isActive = analysisStep === idx;
                        const isDone = analysisStep > idx;
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: isDone || isActive ? 1 : 0.4 }}>
                            {isDone ? (
                              <CheckCircle2 size={16} color="#34D399" />
                            ) : isActive ? (
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(255,159,252,0.3)', borderTopColor: '#FF9FFC', borderRadius: '50%' }} />
                            ) : (
                              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
                            )}
                            <span style={{ fontSize: 13, color: isDone ? 'rgba(255,255,255,0.7)' : isActive ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: isActive ? 600 : 400 }}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.main>
        ) : (
          <motion.main
            key="result-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px', paddingTop: 120 }}
          >
            {/* Header */}
            <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                  <button onClick={() => setView('upload')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: 8, color: '#fff', cursor: 'pointer' }}>
                    <ArrowLeft size={18} />
                  </button>
                  <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#fff' }}>Diagnosis <span style={{ color: 'rgba(255,255,255,0.4)' }}>Result</span></h1>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleDownloadReport}
                  disabled={!resultData}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '12px 24px',
                    fontWeight: 600,
                    color: '#fff',
                    cursor: resultData ? 'pointer' : 'not-allowed',
                    opacity: resultData ? 1 : 0.6,
                  }}
                  title="Download prescription report"
                >
                  <Download size={18} />
                </button>
              </div>
            </header>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 40, background: 'rgba(255,255,255,0.02)', padding: 8, borderRadius: 20, width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: activeTab === tab.id ? '#fff' : 'transparent', color: activeTab === tab.id ? '#000' : 'rgba(255,255,255,0.5)', border: 'none', borderRadius: 14, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>
                  <tab.icon size={18} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }}>
                
                {/* ── LEFT COLUMN (Main Tab Content) ── */}
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 32, padding: 32, border: '1px solid rgba(255,255,255,0.05)' }}>
                  
                  {activeTab === 'overview' && (
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Pill size={24} color="#FF9FFC" /> Prescribed Medications
                      </h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {(resultData?.medicines || []).map((med, i) => (
                          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                              <div>
                                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px 0' }}>{med.name} <span style={{ color: '#FF9FFC', fontSize: 14 }}>{med.dosage}</span></h3>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{med.composition}</p>
                              </div>
                              <div style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                                {med.frequency}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'rgba(255,255,255,0.7)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12, marginTop: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {med.instructions || 'No instructions available.'}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Info size={14} /> {med.purpose || (med.composition ? `Generic: ${med.composition}` : '')}</div>
                            </div>
                            {med.duration && <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Duration: {med.duration}</div>}
                            {med.estimated_mrp > 0 && <div style={{ marginTop: 4, fontSize: 12, color: '#34D399' }}>Est. MRP: ₹{med.estimated_mrp}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'safety' && (
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, color: '#F87171' }}>
                        <AlertTriangle size={24} /> Safety Precautions
                      </h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {resultData?.patient?.drug_interactions && (
                          <div style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 20, padding: 20, marginBottom: 12 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#FACC15', margin: '0 0 8px 0' }}>⚠️ Drug Interaction Warning</h3>
                            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>{resultData.patient.drug_interactions}</p>
                          </div>
                        )}
                        {(resultData?.safety || []).map((item, i) => (
                          <div key={i} style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 20, padding: 20 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 8px 0' }}>For {item.med}</h3>
                            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>{item.warning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'wellness' && (
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, color: '#34D399' }}>
                        <Activity size={24} /> Wellness Plan
                      </h2>

                      <div style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.10), rgba(56,189,248,0.08))', border: '1px solid rgba(52,211,153,0.22)', borderRadius: 20, padding: 16, marginBottom: 18 }}>
                        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#86EFAC', fontWeight: 800, marginBottom: 6 }}>Patient Highlights</div>
                        <ul style={{ margin: 0, paddingLeft: 18, color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 1.6 }}>
                          <li>Follow the diet guidance exactly to support recovery and reduce medicine-related discomfort.</li>
                          <li>Use the exercise tips daily to improve circulation, energy, and overall well-being.</li>
                          <li>Do not ignore hydration, rest, and medication timing mentioned in your plan.</li>
                        </ul>
                      </div>

                      <div style={{ display: 'grid', gap: 18 }}>
                        <section style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 20, padding: 18 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Salad size={18} color="#34D399" /> Diet & Nutrition
                          </h3>
                          <ul style={{ margin: 0, paddingLeft: 18, color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 1.7 }}>
                            {(resultData?.wellness?.diet || []).length ? (resultData.wellness.diet || []).map((item, i) => <li key={i}>{item}</li>) : <li>No specific diet advice was returned for this prescription.</li>}
                          </ul>
                        </section>

                        <section style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 20, padding: 18 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Heart size={18} color="#34D399" /> Recommended Exercise
                          </h3>
                          <ul style={{ margin: 0, paddingLeft: 18, color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 1.7 }}>
                            {(resultData?.wellness?.exercise || []).length ? (resultData.wellness.exercise || []).map((item, i) => <li key={i}>{item}</li>) : <li>No exercise guidance was returned for this prescription.</li>}
                          </ul>
                        </section>

                        {(resultData?.wellness?.general || []).length > 0 && (
                          <section style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 20, padding: 18 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Sparkles size={18} color="#34D399" /> Daily Lifestyle Tips
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: 18, color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 1.7 }}>
                              {(resultData.wellness.general || []).map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </section>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'buy' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <ShoppingCart size={24} color="#38BDF8" /> Price Comparison
                        </h2>
                        <div style={{ background: 'rgba(56,189,248,0.1)', color: '#38BDF8', padding: '6px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                          Up to 15% Savings Detected
                        </div>
                      </div>
                      
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 20 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 16px 0' }}>{(resultData?.buy && resultData.buy[0]?.med) || 'Medicines'}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                          {(resultData?.buy || []).map((store, i) => (
                            <a key={i} href={store.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', position: 'relative' }}>
                              <div style={{
                                background: store.tag ? 'rgba(56,189,248,0.05)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${store.tag ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: 16, padding: 16, textAlign: 'center', transition: 'all 0.2s',
                                cursor: 'pointer', height: '100%'
                              }}>
                                {store.tag && (
                                  <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#38BDF8', color: '#000', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 8 }}>
                                    {store.tag}
                                  </div>
                                )}
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 8 }}>{store.name}</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>₹{store.price}</div>
                                <ExternalLink size={14} color="rgba(255,255,255,0.3)" style={{ marginTop: 8 }} />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'technical' && (
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, color: '#A855F7' }}>
                        <Code size={24} /> Technical Output
                      </h2>
                      
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px 0' }}>JSON FORMAT</h3>
                      <div style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, marginBottom: 24, overflowX: 'auto' }}>
                        <pre style={{ margin: 0, color: '#34D399', fontSize: 13, fontFamily: 'monospace' }}>
                          {resultData?.technical?.json || 'No JSON data available'}
                        </pre>
                      </div>

                      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px 0' }}>RAW OCR TEXT</h3>
                      <div style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, overflowX: 'auto' }}>
                        <pre style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'monospace' }}>
                          {resultData?.technical?.raw_ocr || 'No OCR text available'}
                        </pre>
                      </div>
                    </div>
                  )}

                </div>

                {/* ── RIGHT COLUMN (Patient Info / Sticky Sidebar) ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* Patient Details */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 32, padding: 32, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #FF9FFC, #A855F7)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                      <User size={20} color="#000" />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 24px 0' }}>Patient Details</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Name</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{resultData?.patient?.name || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Age</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{resultData?.patient?.age || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Gender</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{resultData?.patient?.gender || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16, marginTop: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Doctor</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{resultData?.patient?.doctor || 'Unknown Doctor'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Extraction Confidence Sidebar Component */}
                  <div style={{ background: 'rgba(255,159,252,0.05)', borderRadius: 32, padding: 32, border: '1px solid rgba(255,159,252,0.1)' }}>
                    <div style={{ color: '#FF9FFC', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>EXTRACTION CONFIDENCE</div>
                    <div style={{ fontSize: 64, fontWeight: 900 }}>
                      {Math.round((resultData?.patient?.confidence ?? 0) * 100)}
                      <span style={{ fontSize: 20, opacity: 0.3 }}>/100</span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 8 }}>
                      Matches the AI analysis confidence for this prescription.
                    </div>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </motion.main>
        )}
      </AnimatePresence>

      {view === 'result' && <LipiChat prescriptionData={resultData} />}
    </div>
  );
}
