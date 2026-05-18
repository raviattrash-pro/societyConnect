import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { parseAiIntent } from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function AiConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { role: 'ai', text: t('ai_greeting', 'Hi! I am your SocietyConnect Concierge. Tell me what you need, or upload a photo of a problem, or use SOS for emergencies.') }
  ]);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setQuery('');
    setIsTyping(true);

    try {
      const res = await parseAiIntent(userText);
      const params = res.data;
      
      setTimeout(() => {
        setIsTyping(false);
        if (Object.keys(params).length === 0) {
          setMessages(prev => [...prev, { role: 'ai', text: t('ai_not_understand', 'I couldn\'t quite understand that. Could you be more specific about the service you need?') }]);
        } else {
          let reply = t('ai_found_reply', "I found exactly what you're looking for");
          if (params.categoryName) reply += ` ${t('at_label', 'in')} ${t(params.categoryName.trim().toLowerCase().replace(/ /g, '_'), params.categoryName)}`;
          reply += t('ai_redirecting', '! Redirecting you now...');
          
          setMessages(prev => [...prev, { role: 'ai', text: reply }]);
          
          setTimeout(() => {
            const searchParams = new URLSearchParams();
            if (params.categoryId) searchParams.append('category', params.categoryId);
            if (params.query) searchParams.append('query', params.query);
            if (params.minRating) searchParams.append('minRating', params.minRating);
            if (params.sortBy) searchParams.append('sortBy', params.sortBy);
            
            navigate(`/search?${searchParams.toString()}`);
            setIsOpen(false);
          }, 1500);
        }
      }, 1000);
    } catch (err) {
      setIsTyping(false);
      toast.error(t('ai_error_unavailable', "AI is currently unavailable."));
    }
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error(t('ai_unsupported_voice', "Voice recognition is not supported in this browser."));
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      // Automatically send if clear
      if (transcript.length > 5) {
        setTimeout(() => handleSend({ preventDefault: () => {} }, transcript), 500);
      }
    };
    recognition.start();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    toast.success(`Analyzing image: ${file.name}`);
    setIsTyping(true);
    // Simulation of Vision AI
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, 
        { role: 'user', text: `[Image Uploaded: ${file.name}]` },
        { role: 'ai', text: t('ai_vision_reply', 'I see a leaking faucet. I recommend booking a Plumber. Should I find one for you?') }
      ]);
    }, 2000);
  };

  const triggerSOS = () => {
    toast.error("🚨 EMERGENCY BROADCAST SENT", { duration: 5000 });
    setMessages(prev => [...prev, { role: 'ai', text: t('ai_sos_reply', 'EMERGENCY: I have alerted the society office and all available Plumbers/Electricians within 2km. Stay safe.') }]);
    // In real app, call backend broadcast API
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000,
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white',
          border: 'none', borderRadius: '50%', width: '60px', height: '60px',
          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)', cursor: 'pointer',
          display: isOpen ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
        }}
      >
        ✨
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
              style={{
              position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000,
              width: '350px', background: 'var(--bg-card)', borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', padding: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>✨ {t('ai_concierge_title', 'AI Concierge')}</h3>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>
            
            <div style={{ padding: '16px', height: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-elevated)',
                  color: msg.role === 'user' ? 'white' : 'var(--text)',
                  padding: '10px 14px', borderRadius: '12px', maxWidth: '85%', fontSize: '0.95rem'
                }}>
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {t('ai_thinking', 'Thinking...')}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', padding: '0 12px 8px', overflowX: 'auto' }}>
              <button onClick={triggerSOS} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '20px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>🚨 {t('ai_sos', 'SOS')}</button>
              <button onClick={() => document.getElementById('ai-upload').click()} style={{ background: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '20px', padding: '4px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>📷 {t('ai_diagnose', 'Diagnose')}</button>
              <button onClick={startVoiceSearch} style={{ background: isListening ? '#fef3c7' : '#f3f4f6', color: isListening ? '#d97706' : '#4b5563', border: '1px solid #d1d5db', borderRadius: '20px', padding: '4px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{isListening ? `🎙️ ${t('ai_listening', 'Listening...')}` : `🎤 ${t('ai_voice', 'Voice')}`}</button>
              <input type="file" id="ai-upload" hidden onChange={handleFileUpload} accept="image/*" />
            </div>

            <form onSubmit={handleSend} style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder={isListening ? t('ai_listening', 'Listening...') : t('ai_placeholder', 'Ask anything...')} 
                value={query} 
                onChange={e => setQuery(e.target.value)}
                style={{ margin: 0, flex: 1, borderRadius: '20px' }}
              />
              <button type="submit" className="btn btn-primary" style={{ borderRadius: '20px', padding: '0 20px' }}>{t('ai_send', 'Send')}</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
