'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BorderGlow from '../../components/BorderGlow';
import DecryptedText from '../../components/DecryptedText';
import GridScan from '../../components/GridScan';
import { auth, db, createUserWithEmailAndPassword, doc, setDoc } from '@/lib/firebase';


export default function SignupPage() {
  const router = useRouter();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      if (user) {
        // Create user profile in Firestore
        const docRef = doc(db, 'profiles', user.uid);
        await setDoc(docRef, {
          id: user.uid,
          full_name: name,
          email: email,
          is_pro: false,
          scan_count: 0,
          updated_at: new Date().toISOString()
        });

        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", name);
        localStorage.setItem("currentUserId", user.uid);
        localStorage.setItem("is_setup_complete", "true");
        router.push('/app');
      }
    } catch (err) {
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('Connection failed. If you use an adblocker or privacy shield, it may be blocking Firebase. You can also enable local offline mode by adding NEXT_PUBLIC_USE_MOCK_FIREBASE=true to .env.local and restarting the dev server.');
      } else {
        setError(err.message || 'An error occurred during signup');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '16px 20px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14, color: '#ffffff',
    fontSize: 15, outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'rgba(255,255,255,0.5)', marginBottom: 12,
    textTransform: 'uppercase', letterSpacing: '0.05em'
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = 'rgba(255,159,252,0.4)';
    e.target.style.background = 'rgba(255,159,252,0.05)';
    e.target.style.boxShadow = '0 0 0 4px rgba(255,159,252,0.1)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
    e.target.style.background = 'rgba(255,255,255,0.02)';
    e.target.style.boxShadow = 'none';
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
        style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}
      >
        <BorderGlow
          edgeSensitivity={30} glowColor="300 80 60" backgroundColor="rgba(15, 15, 21, 0.7)"
          borderRadius={28} glowRadius={50} glowIntensity={1.5} coneSpread={25}
          animated={true} colors={['#FF9FFC', '#c084fc', '#38bdf8']}
        >
          <div style={{ padding: '48px 40px', backdropFilter: 'blur(16px) saturate(180%)' }}>
            <a href="/" style={{
              display: 'inline-flex', alignItems: 'center',
              textDecoration: 'none', marginBottom: 40,
            }}>
              <span style={{
                fontSize: 24, fontWeight: 900, letterSpacing: '-0.04em',
                background: 'linear-gradient(90deg, #FF9FFC 0%, #c084fc 50%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                filter: 'drop-shadow(0 2px 8px rgba(168, 85, 247, 0.25))'
              }}>
                LipiRx
              </span>
            </a>

            <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff', marginBottom: 12 }}>
              <DecryptedText text="Create account" animateOn="view" speed={60} />
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>Start decoding prescriptions instantly</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
                <div>
                  <label style={labelStyle}>Confirm</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              </div>

              {error && <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ fontSize: 13, color: '#ff5555' }}>{error}</motion.p>}

              <button type="submit" disabled={loading}
                style={{
                  marginTop: 8, width: '100%', padding: '16px', background: loading ? 'rgba(255,255,255,0.7)' : '#ffffff',
                  color: '#000000', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em', transition: 'all 0.4s',
                  boxShadow: '0 10px 30px -10px rgba(255,255,255,0.3)',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(255,255,255,0.4)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(255,255,255,0.3)'; }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>



            <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.3)', marginTop: 32 }}>
              Already have an account? <a href="/login" style={{ color: '#FF9FFC', fontWeight: 700, textDecoration: 'none' }}>Log in here</a>
            </p>
          </div>
        </BorderGlow>
      </motion.div>
    </div>
  );
}
