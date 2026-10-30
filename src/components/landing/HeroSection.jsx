'use client';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DecryptedText from '../DecryptedText';
import BrandBadge from '../BrandBadge';

const Hyperspeed = dynamic(() => import('@/components/Hyperspeed'), { ssr: false });

/* ─── Toggle ─── */
function Toggle({ on, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 38,
        height: 22,
        background: on ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)',
        borderRadius: 999,
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s',
        border: '1px solid rgba(255,255,255,0.15)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: 3,
          width: 14,
          height: 14,
          background: '#ffffff',
          borderRadius: '50%',
          boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
          transition: 'transform 0.2s',
          transform: on ? 'translateX(16px)' : 'translateX(0)',
        }}
      />
    </div>
  );
}

/* ─── Main Component ─── */
export default function HeroSection() {
  const [demoOn, setDemoOn] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Fade in after mount so WebGL has time to initialize
  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const navigateWithFade = useCallback((href) => {
    setIsLeaving(true);
    setTimeout(() => router.push(href), 450);
  }, [router]);

      const effectOptions = useMemo(() => ({
        distortion: 'turbulentDistortion',
        length: 400,
        roadWidth: 10,
        islandWidth: 2,
        lanesPerRoad: 3,
        fov: 90,
        fovSpeedUp: 150,
        speedUp: 2,
        carLightsFade: 0.4,
        totalSideLightSticks: 20,
        lightPairsPerRoadWay: 40,
        shoulderLinesWidthPercentage: 0.05,
        brokenLinesWidthPercentage: 0.1,
        brokenLinesLengthPercentage: 0.5,
        lightStickWidth: [0.12, 0.5],
        lightStickHeight: [1.3, 1.7],
        movingAwaySpeed: [60, 80],
        movingCloserSpeed: [-120, -160],
        carLightsLength: [400 * 0.03, 400 * 0.2],
        carLightsRadius: [0.05, 0.14],
        carWidthPercentage: [0.3, 0.5],
        carShiftX: [-0.8, 0.8],
        carFloorSeparation: [0, 5],
        colors: {
          roadColor: 0x080808,
          islandColor: 0x0a0a0a,
          background: 0x000000,
          shoulderLines: 0xffffff,
          brokenLines: 0xffffff,
          leftCars: [0xff1010, 0x880000, 0x330000],
          rightCars: [0xffffff, 0xcccccc, 0x999999],
          sticks: 0xffffff
        }
      }), []);

      return (
        <section
          style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: '#0d0d12',
            fontFamily: "'Inter', sans-serif",
            opacity: isLeaving ? 0 : isMounted ? 1 : 0,
            transition: isLeaving ? 'opacity 0.4s ease' : 'opacity 0.8s ease',
          }}
        >
          {/* ── Google Font & Animations ── */}
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            *, *::before, *::after { box-sizing: border-box; }
            
            @keyframes lightingGlow {
              0%, 100% { 
                box-shadow: 0 0 15px rgba(168, 85, 247, 0.1), inset 0 0 8px rgba(168, 85, 247, 0.05); 
                border-color: rgba(168, 85, 247, 0.2); 
              }
              50% { 
                box-shadow: 0 0 25px rgba(168, 85, 247, 0.25), inset 0 0 12px rgba(168, 85, 247, 0.1); 
                border-color: rgba(168, 85, 247, 0.5); 
              }
            }

            .lighting-nav {
              animation: lightingGlow 4s infinite ease-in-out;
              position: relative;
              overflow: visible;
            }

            .lighting-nav::after {
              content: '';
              position: absolute;
              bottom: -1px;
              left: 15%;
              right: 15%;
              height: 2px;
              background: linear-gradient(90deg, 
                transparent, 
                #a855f7 20%, 
                #e879f9 50%, 
                #a855f7 80%, 
                transparent
              );
              filter: blur(1.5px);
              opacity: 0.9;
              z-index: 2;
            }
            
            .lighting-nav::before {
              content: '';
              position: absolute;
              bottom: -4px;
              left: 20%;
              right: 20%;
              height: 6px;
              background: #a855f7;
              filter: blur(12px);
              opacity: 0.35;
              z-index: 1;
            }

            .encrypted {
              color: #a855f7;
              opacity: 0.7;
              filter: blur(1px);
            }
          `}</style>

          {/* ── Canvas background ── */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <Hyperspeed effectOptions={effectOptions} isLeaving={isLeaving} />
          </div>

      {/* ── All UI above canvas ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
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

        {/* Ultra-Thin Floating Glow Navbar */}
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
            initial={{ boxShadow: '0 0 25px rgba(168, 85, 247, 0.15)' }}
            animate={{ 
              boxShadow: [
                '0 0 30px rgba(168, 85, 247, 0.2)',
                '0 0 50px rgba(168, 85, 247, 0.45)',
                '0 0 30px rgba(168, 85, 247, 0.2)'
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
              padding: '12px 28px', 
              background: 'rgba(10,10,15,0.7)', 
              backdropFilter: 'blur(30px)', 
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: 20, 
              border: '1px solid rgba(168, 85, 247, 0.4)',
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
              <button 
                onClick={() => navigateWithFade('/login')}
                style={{
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.7)',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: 10,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <DecryptedText 
                  text="Log In" 
                  speed={70}
                  maxIterations={10}
                  animateOn="hover"
                  useOriginalCharsOnly
                />
              </button>
              <button 
                onClick={() => navigateWithFade('/signup')}
                style={{
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: '8px 20px',
                  borderRadius: 10,
                  boxShadow: '0 4px 15px rgba(255,255,255,0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(255,255,255,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.25)'; }}
              >
                <DecryptedText 
                  text="Sign Up" 
                  speed={70}
                  maxIterations={10}
                  animateOn="hover"
                  useOriginalCharsOnly
                />
              </button>
            </div>
          </motion.nav>
        </div>

        {/* ── Hero ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '120px 24px 80px',
            maxWidth: 760,
            margin: '0 auto',
          }}
        >


          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(32px, 6vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              color: '#ffffff',
              marginBottom: 20,
              margin: '0 0 20px 0',
              textShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            Decode Your Health<br />
            <span style={{ fontSize: '0.75em', opacity: 0.9 }}>with AI-Powered Precision.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(14px, 1.5vw, 16px)',
              color: 'rgba(255, 255, 255, 0.4)',
              maxWidth: '540px',
              margin: '0 auto 40px',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Transform complex prescriptions into clear, actionable insights<br />
            with your specialized LipiRx AI Prescription Assistant.
          </p>

          {/* CTA buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={() => navigateWithFade('/signup')}
              style={{
                background: '#ffffff',
                color: '#0d0d12',
                fontSize: 14,
                fontWeight: 700,
                padding: '9px 22px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.18s, transform 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              onMouseDown={e  => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={e    => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <DecryptedText 
                text="Get started" 
                speed={70}
                maxIterations={10}
                animateOn="hover"
                useOriginalCharsOnly
              />
            </button>
            <button
              onClick={() => navigateWithFade('/login')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 14,
                fontWeight: 600,
                padding: '9px 22px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                cursor: 'pointer',
                transition: 'background 0.18s, border-color 0.18s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background    = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background    = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.15)';
              }}
            >
              <DecryptedText 
                text="Log in" 
                speed={70}
                maxIterations={10}
                animateOn="hover"
                encryptedClassName="encrypted"
              />
            </button>
          </div>
        </div>
      </div>

    </section>
  );
}
