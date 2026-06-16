import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';

export default function LipiChat({ prescriptionData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('English');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const translations = {
    English: {
      title: 'Chat with us', status: 'Replying in under 1 min', welcome: `Hello! I'm Lipi. I've analyzed your prescription for ${prescriptionData?.patient_details?.name || 'this patient'}. How can I assist you today?`,
      lipiSays: 'Lipi says', preview: "Hi! I've reviewed your results. Any questions?",
      chips: [
        { label: '💊 Explain Medicines', text: 'Please provide a detailed breakdown of all medicines in my prescription.' },
        { label: '🕒 Dosage Guide', text: 'How and when exactly should I take each of these medicines?' },
        { label: '⚠️ Safety & Side Effects', text: 'Are there any potential side effects or safety warnings I should know about?' },
        { label: '🥗 Diet Advice', text: 'What dietary changes or lifestyle tips do you recommend based on these medicines?' },
        { label: '🩺 Follow-up Tests', text: 'What medical tests or follow-up appointments are mentioned or recommended in my report?' },
        { label: '📋 Quick Summary', text: 'Please give me a simple, easy-to-read summary of my entire prescription and health status.' }
      ]
    },
    Hindi: {
      title: 'हमसे चैट करें', status: '1 मिनट से कम में जवाब', welcome: `नमस्ते! मैं लिपि हूँ। मैंने ${prescriptionData?.patient_details?.name || 'मरीज'} के पर्चे का विश्लेषण किया है। मैं आपकी कैसे मदद कर सकती हूँ?`,
      lipiSays: 'लिपि का संदेश', preview: 'नमस्ते! मैंने आपके परिणाम देख लिए हैं। कोई सवाल?',
      chips: [
        { label: '💊 दवाएं समझाएं', text: 'कृपया मेरे पर्चे की सभी दवाओं का विस्तृत विवरण दें।' },
        { label: '🕒 खुराक गाइड', text: 'मुझे इनमें से प्रत्येक दवा कब और कैसे लेनी चाहिए?' },
        { label: '⚠️ सुरक्षा और दुष्प्रभाव', text: 'क्या कोई संभावित दुष्प्रभाव या सुरक्षा चेतावनी है जिसके बारे में मुझे जानना चाहिए?' },
        { label: '🥗 आहार सलाह', text: 'इन दवाओं के आधार पर आप किन आहार परिवर्तनों या जीवनशैली युक्तियों की सलाह देते हैं?' },
        { label: '🩺 फॉलो-अप टेस्ट', text: 'मेरी रिपोर्ट में किन मेडिकल टेस्ट या फॉलो-अप अपॉइंटमेंट का उल्लेख या सिफारिश की गई है?' },
        { label: '📋 त्वरित सारांश', text: 'कृपया मुझे मेरे पूरे पर्चे और स्वास्थ्य स्थिति का एक सरल, पढ़ने में आसान सारांश दें।' }
      ]
    },
    Telugu: {
      title: 'మాతో చాట్ చేయండి', status: '1 నిమిషంలోపు సమాధానం', welcome: `నమస్కారం! నేను లిపిని. నేను ${prescriptionData?.patient_details?.name || 'రోగి'} యొక్క ప్రిస్క్రిప్షన్‌ను విశ్లేషించాను. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?`,
      lipiSays: 'లిపి చెబుతోంది', preview: 'నమస్కారం! నేను మీ ఫలితాలను సమీక్షించాను. ఏవైనా ప్రశ్నలు ఉన్నాయా?',
      chips: [
        { label: '💊 మందుల గురించి వివరించండి', text: 'దయచేసి నా ప్రిస్క్రిప్షన్‌లోని అన్ని మందుల వివరాలను అందించండి.' },
        { label: '🕒 మోతాదు మార్గదర్శి', text: 'నేను ఈ మందులలో ప్రతిదానిని ఎప్పుడు మరియు ఎలా తీసుకోవాలి?' },
        { label: '⚠️ భదుత్ర మరియు దుష్ప్రభావాలు', text: 'నేను తెలుసుకోవలసిన ఏవైనా సంభావ్య దుష్ప్రభావాలు లేదా భద్రతా హెచ్చరికలు ఉన్నాయా?' },
        { label: '🥗 ఆహార సలహాలు', text: 'ఈ మందుల ఆధారంగా మీరు ఏ ఆహార మార్పులు లేదా జీవనశైలి చిట్కాలను సిఫార్సు చేస్తారు?' },
        { label: '🩺 ఫాలో-అప్ పరీక్షలు', text: 'నా రిపోర్ట్‌లో ఏ వైద్య పరీక్షలు లేదా ఫాలో-అప్ అపాయింట్‌మెంట్‌లు పేర్కొనబడ్డాయి లేదా సిఫార్సు చేయబడ్డాయి?' },
        { label: '📋 శీఘ్ర సారాంశం', text: 'దయచేసి నా మొత్తం ప్రిస్క్రిప్షన్ మరియు ఆరోగ్య స్థితి యొక్క సరళమైన, సులభంగా చదవగలిగే సారాంశాన్ని నాకు ఇవ్వండి.' }
      ]
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([{ role: 'nurse', content: translations[language].welcome }]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen, language]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, context: prescriptionData, language })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'nurse', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'nurse', content: `Error: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages([{ role: 'nurse', content: translations[language].welcome }]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 1000, fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ position: 'relative', width: 'auto', height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                width: 380, height: 600, background: '#fff', borderRadius: 28, marginBottom: 4,
                boxShadow: '0 30px 100px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ padding: '24px 24px 16px', background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)', borderBottom: '1px solid rgba(255,159,252,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(0,0,0,0.03)', border: 'none', padding: 6, borderRadius: 8, cursor: 'pointer' }}><X size={14} color="#000" /></button>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#000' }}>{translations[language].title}</h3>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.4)' }}>{translations[language].status}</p>
                    </div>
                  </div>
                  <button onClick={handleClearChat} style={{ background: 'none', border: 'none', opacity: 0.4, cursor: 'pointer' }}><RotateCcw size={16} color="#000" /></button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                  <div style={{ background: '#fff', padding: '6px 12px', borderRadius: 10, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <img src="/assets/lipi_logo.png" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#000' }}>Lipi AI</span>
                  </div>
                  <div style={{ display: 'flex', gap: 3, background: 'rgba(0,0,0,0.03)', padding: 3, borderRadius: 8 }}>
                    {['English', 'Hindi', 'Telugu'].map(lang => (
                      <button
                        key={lang} onClick={() => setLanguage(lang)}
                        style={{
                          padding: '5px 8px', fontSize: 9, fontWeight: 800, borderRadius: 6, border: 'none', cursor: 'pointer',
                          background: language === lang ? '#FF9FFC' : 'transparent', color: language === lang ? '#000' : 'rgba(0,0,0,0.4)',
                          transition: 'all 0.2s'
                        }}
                      >{lang === 'English' ? 'ENG' : lang === 'Hindi' ? 'HIN' : 'TEL'}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, background: '#fff' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ alignSelf: msg.role === 'nurse' ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                    <div style={{ 
                      padding: '10px 14px', borderRadius: msg.role === 'nurse' ? '4px 16px 16px 16px' : '16px 16px 4px 16px',
                      background: msg.role === 'nurse' ? '#F3F4F6' : '#FF9FFC', color: msg.role === 'nurse' ? '#374151' : '#000',
                      fontSize: 13, fontWeight: 600
                    }}>{msg.content}</div>
                  </div>
                ))}
                {isTyping && <div style={{ padding: 10, background: '#F3F4F6', borderRadius: 12, width: 'fit-content' }}>...</div>}
              </div>

              <div style={{ padding: '0 16px 16px', background: '#fff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {translations[language].chips.map(chip => (
                    <button 
                      key={chip.label} onClick={() => handleSendMessage(chip.text)}
                      style={{ 
                        padding: '8px 10px', borderRadius: 14, border: '1.5px solid #FF9FFC', background: '#fff', color: '#000', 
                        fontSize: 9, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FF9FFC'; }} onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                    >{chip.label}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ position: 'relative', width: 48, height: 48 }}>
          {!isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                style={{
                  position: 'absolute', right: 60, bottom: 4, width: 180,
                  background: '#fff', padding: '8px 12px', borderRadius: '14px 14px 0 14px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.05)', pointerEvents: 'none'
                }}
              >
                <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: '#FF9FFC', marginBottom: 2 }}>{translations[language].lipiSays}</p>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.6)', lineHeight: 1.3 }}>{translations[language].preview}</p>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsOpen(true)}
                style={{ 
                  width: 48, height: 48, borderRadius: 16, background: '#FF9FFC', border: 'none', 
                  cursor: 'pointer', boxShadow: '0 10px 25px rgba(255,159,252,0.4)', position: 'absolute', right: 0, bottom: 0 
                }}
              >
                <img src="/assets/lipi_logo.png" style={{ width: '100%', height: '100%', borderRadius: 16, objectFit: 'cover' }} />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
