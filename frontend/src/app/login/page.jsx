'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import BorderGlow from '../../components/BorderGlow';
import DecryptedText from '../../components/DecryptedText';
import { supabase } from '@/lib/supabase';

const GridScan = dynamic(() => import('../../components/GridScan').then(m => m.GridScan), { ssr: false });


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("currentUserId", data.user.id);
        
        // Fetch profile to pre-populate user name in local storage
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user.id)
          .single();
          
        if (profile) {
          if (profile.full_name && profile.full_name.toLowerCase() !== 'user') {
            localStorage.setItem('userName', profile.full_name);
            localStorage.setItem('is_setup_complete', 'true');
          }
        }

        router.push('/app');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{
      height: '100vh', width: '100vw', background: '#000000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      {/* ── GridScan Background ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <GridScan
          sensitivity={0.55} lineThickness={1} linesColor="#2F293A" gridScale={0.1}
          scanColor="#FF9FFC" scanOpacity={0.4} enablePost bloomIntensity={0.6}
          chromaticAberration={0.002} noiseIntensity={0.01} lineJitter={0.1}
          scanGlow={0.5} scanSoftness={2} enableWebcam={false} showPreview={false}
        />
      </div>

      {/* Back to home */}
      <a href="/" style={{
        position: 'absolute', top: 32, left: 32,
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 14, color: 'rgba(255,255,255,0.45)',
        textDecoration: 'none', transition: 'color 0.18s', zIndex: 10,
      }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>←</span> Back
      </a>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        <BorderGlow
          edgeSensitivity={30} glowColor="300 80 60" backgroundColor="rgba(15, 15, 21, 0.7)"
          borderRadius={28} glowRadius={50} glowIntensity={1.5} coneSpread={25}
          animated={true} colors={['#FF9FFC', '#c084fc', '#38bdf8']}
        >
          <div style={{ padding: '48px 40px', backdropFilter: 'blur(16px) saturate(180%)' }}>
            <a href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              fontSize: 16, fontWeight: 600, color: '#ffffff',
              textDecoration: 'none', marginBottom: 40,
            }}>
              <DecryptedText text="LipiRx" speed={100} maxIterations={20} characters="ABCD1234!?" animateOn="view" revealDirection="center" />
            </a>

            <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff', marginBottom: 12 }}>
              <DecryptedText text="Login" animateOn="view" speed={60} />
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>Secure access to your clinical dashboard</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"
                  style={{
                    width: '100%', padding: '16px 20px', background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#ffffff',
                    fontSize: 15, outline: 'none', transition: 'all 0.3s', fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(255,159,252,0.4)'; e.target.style.background = 'rgba(255,159,252,0.05)'; e.target.style.boxShadow = '0 0 0 4px rgba(255,159,252,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.02)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                  <a href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 0.2s' }}>Forgot password?</a>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                  style={{
                    width: '100%', padding: '16px 20px', background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#ffffff',
                    fontSize: 15, outline: 'none', transition: 'all 0.3s', fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(255,159,252,0.4)'; e.target.style.background = 'rgba(255,159,252,0.05)'; e.target.style.boxShadow = '0 0 0 4px rgba(255,159,252,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.02)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {error && <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ fontSize: 13, color: '#ff5555', margin: '-8px 0' }}>{error}</motion.p>}

              <button type="submit" disabled={loading}
                style={{
                  marginTop: 12, width: '100%', padding: '16px', background: loading ? 'rgba(255,255,255,0.7)' : '#ffffff',
                  color: '#000000', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em', transition: 'all 0.4s',
                  boxShadow: '0 10px 30px -10px rgba(255,255,255,0.3)',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(255,255,255,0.4)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(255,255,255,0.3)'; }}
              >
                {loading ? 'Validating credentials...' : 'Sign in'}
              </button>
            </form>



            <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.3)', marginTop: 32 }}>
              Don&apos;t have an account? <a href="/signup" style={{ color: '#FF9FFC', fontWeight: 700, textDecoration: 'none' }}>Create an account</a>
            </p>
          </div>
        </BorderGlow>
      </motion.div>
    </div>
  );
}
