"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, User, ChevronDown, 
  CheckCircle2, Sparkles, Mail, Lock, Globe, X, AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import ElectricBorder from "@/components/ElectricBorder";
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, updateDoc } from "@/lib/firebase";

const translations = {
  en: {
    profile: "Your Profile",
    fullName: "Your full name",
    email: "Email",
    password: "Password",
    language: "Language",
    billing: "Billing",
    back: "Back to Dashboard",
    pro: "LipiRx Pro",
    upgrade: "Upgrade to Pro",
    changeEmail: "Change Email Address",
    changePass: "Change Password",
    delete: "Delete Account...",
    mgmt: "Account Management",
    updates: "Get health insights and LipiRx updates in your inbox",
    unlock: "Unlock unlimited scans and advanced clinical insights.",
    feat1: "Unlimited Report Scans",
    feat2: "Advanced Clinical Insights",
    feat3: "Export to PDF/Doctors",
    feat4: "Priority AI Pipeline",
    feat5: "Remove LipiRx Branding",
    save: "Save Changes",
    cancel: "Cancel",
    confirmDelete: "Yes, Delete Account",
    deleteWarning: "Are you sure? This action is permanent and will erase all your medical scan history.",
    newEmail: "New Email Address",
    newPass: "New Password",
    confirmPass: "Confirm New Password",
  },
  hi: {
    profile: "आपकी प्रोफ़ाइल",
    fullName: "आपका पूरा नाम",
    email: "ईमेल",
    password: "पासवर्ड",
    language: "भाषा",
    billing: "बिलिंग",
    back: "डैशबोर्ड पर वापस जाएं",
    pro: "लिपीआरएक्स प्रो",
    upgrade: "प्रो में अपग्रेड करें",
    changeEmail: "ईमेल पता बदलें",
    changePass: "पासवर्ड बदलें",
    delete: "खाता हटाएं...",
    mgmt: "खाता प्रबंधन",
    updates: "अपने इनबॉक्स में स्वास्थ्य संबंधी जानकारी और लिपीआरएक्स अपडेट प्राप्त करें",
    unlock: "असीमित स्कैन और उन्नत नैदानिक ​​जानकारी अनलॉक करें।",
    feat1: "असीमित रिपोर्ट स्कैन",
    feat2: "उन्नत नैदानिक ​​जानकारी",
    feat3: "पीडीएफ/डॉक्टरों को निर्यात करें",
    feat4: "प्राथमिकता एआई पाइपलाइन",
    feat5: "लिपीआरएक्स ब्रांडिंग हटाएं",
    save: "परिवर्तन सहेजें",
    cancel: "रद्द करें",
    confirmDelete: "हाँ, खाता हटाएँ",
    deleteWarning: "क्या आप वाकई ऐसा करना चाहते हैं? यह कार्रवाई स्थायी है और आपके सभी मेडिकल स्कैन इतिहास को मिटा देगी।",
    newEmail: "नया ईमेल पता",
    newPass: "नया पासवर्ड",
    confirmPass: "नए पासवर्ड की पुष्टि करें",
  },
  te: {
    profile: "మీ ప్రొఫైల్",
    fullName: "మీ పూర్తి పేరు",
    email: "ఇమెయిల్",
    password: "పాస్‌వర్డ్",
    language: "భాష",
    billing: "బిల్లింగ్",
    back: "డాష్‌బోర్డ్‌కు తిరిగి వెళ్ళండి",
    pro: "లిపిఆర్ఎక్స్ ప్రో",
    upgrade: "ప్రోకి అప్‌గ్రేడ్ చేయండి",
    changeEmail: "ఇమెయిల్ చిరునామాను మార్చండి",
    changePass: "పాస్‌వర్డ్‌ను మార్చండి",
    delete: "ఖాతాను తొలగించు...",
    mgmt: "ఖాతా నిర్వహణ",
    updates: "మీ ఇన్‌బాక్స్‌లో ఆరోగ్య సమాచారం మరియు లిపిఆర్ఎక్స్ అప్‌డేట్‌లను పొందండి",
    unlock: "అపరిమిత స్కాన్‌లు మరియు అధునాతన క్లినికల్ అంతర్దృష్టులను అన్‌లాక్ చేయండి.",
    feat1: "అపరిమిత రిపోర్ట్ స్కాన్‌లు",
    feat2: "అధునాతన క్లినికల్ అంతర్దృష్టులు",
    feat3: "PDF/డాక్టర్లకు ఎగుమతి చేయండి",
    feat4: "ప్రాధాన్యత AI పైప్‌లైన్",
    feat5: "లిపిఆర్ఎక్స్ బ్రాండింగ్‌ను తొలగించండి",
    save: "మార్పులను సేవ్ చేయి",
    cancel: "రద్దు చేయి",
    confirmDelete: "అవును, ఖాతాను తొలగించు",
    deleteWarning: "మీరు ఖచ్చితంగా ఉన్నారా? ఈ చర్య శాశ్వతమైనది మరియు మీ వైద్య స్కాన్ చరిత్రను తుడిచివేస్తుంది.",
    newEmail: "కొత్త ఇమెయిల్ చిరునామా",
    newPass: "కొత్త పాస్‌వర్డ్",
    confirmPass: "కొత్త పాస్‌వర్డ్‌ను నిర్ధారించండి",
  }
};

const languages = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hindi (हिन्दी)' },
  { id: 'te', label: 'Telugu (తెలుగు)' }
];

export default function AccountPage() {
  const router = useRouter();
  
  // Use localStorage as an instant fallback so there is NO "Loading..."
  const [user, setUser] = useState({ name: 'User', email: '', initials: '👤' });
  const [fullName, setFullName] = useState('User'); // Dedicated state for the name field
  const [isPro, setIsPro] = useState(false); // kept for backward compatibility
  const [activeTab, setActiveTab] = useState('profile');
  const [lang, setLang] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // Modal States
  const [modal, setModal] = useState(null); // 'email', 'password', 'delete'
  const [formData, setFormData] = useState({ newEmail: '', newPass: '', confirmPass: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          // ── SECURITY GUARD: Wipe stale data if a different user is now logged in ──
          const storedUserId = localStorage.getItem('currentUserId');
          if (storedUserId && storedUserId !== authUser.uid) {
            // Different user — clear all previous user's cached data
            localStorage.removeItem('isPro');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('is_setup_complete');
          }
          // Always store the current user's ID
          localStorage.setItem('currentUserId', authUser.uid);

          // ── Fetch profile from Firestore (single source of truth) ──
          const docRef = doc(db, 'profiles', authUser.uid);
          const docSnap = await getDoc(docRef);
          let profile = null;

          if (docSnap.exists()) {
            profile = docSnap.data();
          }

          if (isMounted) {
            let finalName = 'User';
            if (profile?.full_name && profile.full_name.toLowerCase() !== 'user') {
              finalName = profile.full_name;
            }

            setUser({ name: finalName, email: authUser.email || '', initials: '👤' });
            setFullName(finalName);

            if (profile) {
              if (finalName !== 'User') {
                localStorage.setItem('is_setup_complete', 'true');
              }
            } else {
              // Brand new user — create blank profile doc
              const newProfile = {
                id: authUser.uid,
                full_name: 'User',
                email: authUser.email || '',
                is_pro: false,
                scan_count: 0,
                updated_at: new Date().toISOString()
              };
              await setDoc(docRef, newProfile);
              localStorage.setItem('isPro', 'false');
            }

            setLoadingAuth(false);
          }
        } else {
          if (isMounted) {
            router.push('/login');
          }
        }
      } catch (e) {
        if (isMounted) setLoadingAuth(false);
      }
    });

    return () => { 
      isMounted = false; 
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  const handleLangChange = (id) => {
    setLang(id);
    localStorage.setItem("userLang", id);
    setShowLangMenu(false);
  };

   const handleUpdateEmail = () => {
    localStorage.setItem("userEmail", formData.newEmail);
    setUser({...user, email: formData.newEmail});
    setModal(null);
  };

  const handleUpdateProfile = async () => {
    const authUser = auth.currentUser;
    
    if (!authUser) {
      alert("Session expired. Please log in again to save your changes.");
      router.push('/login');
      return;
    }

    if (!fullName || fullName.trim() === '') {
      alert("Name cannot be empty.");
      return;
    }

    setIsSaving(true);

    try {
      const docRef = doc(db, 'profiles', authUser.uid);
      await updateDoc(docRef, {
        full_name: fullName.trim(),
        updated_at: new Date().toISOString()
      });

      setUser(prev => ({ ...prev, name: fullName.trim() }));
      setFullName(fullName.trim());
      localStorage.setItem("userName", fullName.trim());
      localStorage.setItem("is_setup_complete", "true");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Profile save error:', error);
      alert("Failed to save: " + (error.message || "Unknown error. Check Firebase configuration."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    router.push('/');
  };

  const t = translations[lang];


  return (
    <div style={{ 
      minHeight: '100vh', background: '#000000', color: '#ffffff',
      fontFamily: lang === 'en' ? "'Inter', sans-serif" : "inherit", position: 'relative', overflowX: 'hidden'
    }}>
      {/* ── Success Notification ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            style={{
              position: 'fixed', top: 0, left: '50%', zIndex: 3000,
              background: '#4ade80', color: '#000', padding: '12px 24px',
              borderRadius: 12, fontWeight: 900, fontSize: 14,
              boxShadow: '0 10px 30px rgba(74, 222, 128, 0.3)',
              display: 'flex', alignItems: 'center', gap: 10
            }}
          >
            <Sparkles size={16} /> Profile Saved Successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 48, alignItems: 'start' }}>
          
          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <button 
              onClick={() => router.push('/app')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                padding: '8px 0'
              }}
            >
              <ArrowLeft size={18} /> {t.back}
            </button>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => setActiveTab('profile')} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', background: activeTab === 'profile' ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: activeTab === 'profile' ? '#FF9FFC' : 'rgba(255,255,255,0.4)',
              }}>
                <User size={18} /> {t.profile}
              </button>
            </nav>
          </aside>

          {/* Form */}
          <section>
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 40 }}>{t.profile}</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{t.fullName}</label>
                <input 
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 15 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{t.email}</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{user.email}</span>
                  <button onClick={() => setModal('email')} style={{ background: 'none', border: 'none', color: '#FF9FFC', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{t.changeEmail}</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{t.password}</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>••••••••••••••</span>
                  <button onClick={() => setModal('password')} style={{ background: 'none', border: 'none', color: '#FF9FFC', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{t.changePass}</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{t.language}</label>
                <div onClick={() => setShowLangMenu(!showLangMenu)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Globe size={18} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{languages.find(l => l.id === lang).label}</span>
                  </div>
                  <motion.div animate={{ rotate: showLangMenu ? 180 : 0 }}><ChevronDown size={18} style={{ color: 'rgba(255,255,255,0.3)' }} /></motion.div>
                </div>
                <AnimatePresence>
                  {showLangMenu && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, background: 'rgba(15, 15, 21, 0.95)', backdropFilter: 'blur(20px)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', zIndex: 100 }}>
                      {languages.map(l => (
                        <div key={l.id} onClick={() => handleLangChange(l.id)} style={{ padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: lang === l.id ? '#FF9FFC' : 'rgba(255,255,255,0.7)', background: lang === l.id ? 'rgba(255,159,252,0.05)' : 'transparent' }}>{l.label}</div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

                <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 40 }}>
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleUpdateProfile}
                    disabled={isSaving}
                    style={{ 
                      width: '100%', padding: '20px', borderRadius: 16, 
                      background: '#FF9FFC', color: '#000', fontWeight: 900, 
                      fontSize: 16, border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer',
                      boxShadow: '0 10px 30px rgba(255, 159, 252, 0.2)',
                      opacity: isSaving ? 0.7 : 1
                    }}
                  >
                    {isSaving ? 'Saving Changes...' : 'Save Changes'}
                  </motion.button>
                </div>
                
                <button 
                  onClick={() => setModal('delete')} 
                  style={{ textAlign: 'left', background: 'none', border: 'none', color: '#f87171', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '12px 0', marginTop: 10 }}
                >
                  {t.delete}
                </button>
              </div>
            </section>


        </div>
      </main>

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} style={{ width: '100%', maxWidth: 440, background: '#0F0F15', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 28, padding: 40, position: 'relative', zIndex: 1001, boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}>
              
              <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={20} /></button>
              
              {modal === 'email' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,159,252,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9FFC' }}><Mail size={24} /></div>
                  <h2 style={{ fontSize: 24, fontWeight: 800 }}>{t.changeEmail}</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{t.newEmail}</label>
                    <input type="email" value={formData.newEmail} onChange={e => setFormData({...formData, newEmail: e.target.value})} placeholder="new@example.com" style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                  </div>
                  <button onClick={handleUpdateEmail} style={{ width: '100%', padding: '16px', borderRadius: 14, background: '#fff', color: '#000', fontWeight: 800, border: 'none', cursor: 'pointer' }}>{t.save}</button>
                </div>
              )}

              {modal === 'password' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(192,132,252,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}><Lock size={24} /></div>
                  <h2 style={{ fontSize: 24, fontWeight: 800 }}>{t.changePass}</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{t.newPass}</label>
                      <input type="password" style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{t.confirmPass}</label>
                      <input type="password" style={{ width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                    </div>
                  </div>
                  <button onClick={() => setModal(null)} style={{ width: '100%', padding: '16px', borderRadius: 14, background: '#fff', color: '#000', fontWeight: 800, border: 'none', cursor: 'pointer' }}>{t.save}</button>
                </div>
              )}

              {modal === 'delete' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(248,113,113,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}><AlertTriangle size={24} /></div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f87171' }}>{t.delete}</h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{t.deleteWarning}</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => setModal(null)} style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>{t.cancel}</button>
                    <button onClick={handleDeleteAccount} style={{ flex: 1, padding: '14px', borderRadius: 12, background: '#f87171', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>{t.confirmDelete}</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
