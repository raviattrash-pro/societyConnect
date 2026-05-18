import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getResidentSkills, sendMessage as sendApiMessage } from '../services/api';
import { HiOutlineLightBulb, HiOutlineChatAlt2, HiOutlineX, HiOutlinePaperAirplane, HiOutlinePhone, HiOutlineMail } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function MarketplacePage() {
  const { t } = useTranslation();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactTarget, setContactTarget] = useState(null);
  const [messageSent, setMessageSent] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ skillName: '', price: '', description: '' });

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await getResidentSkills();
        const apiSkills = res.data && res.data.length > 0 ? res.data : [];
        
        // Merge with locally approved skills for demo persistence
        const localApproved = JSON.parse(localStorage.getItem('approved_skills') || '[]');
        setSkills([...apiSkills, ...localApproved]);
      } catch (error) {
        const localApproved = JSON.parse(localStorage.getItem('approved_skills') || '[]');
        setSkills(localApproved.length > 0 ? localApproved : null); // Fallback to mock if nothing local
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const mockSkills = [
    { id: 1, residentId: 901, residentEmail: 'ramu.p@society.com', residentName: t('ramu', 'Ramu'), skillName: t('plumber_service', 'Plumbing'), price: 500, description: t('skill_1_desc', 'Expert in fixing leaks and new installations.') },
    { id: 2, residentId: 902, residentEmail: 'vikram.d@society.com', residentName: t('vikram_das', 'Vikram Das'), skillName: t('tutor_service', 'Math Tutoring'), price: 800, description: t('skill_2_desc', '10+ years experience teaching high school mathematics.') },
    { id: 3, residentId: 903, residentEmail: 'sneha.p@society.com', residentName: t('sneha_patil', 'Sneha Patil'), skillName: t('skill_3_name', 'Home Baked Cakes'), price: 1200, description: t('skill_3_desc', 'Eggless customized cakes for birthdays and events.') }
  ];

  const displaySkills = (skills && skills.length > 0) ? skills : mockSkills;

  const handleListSkill = (e) => {
    e.preventDefault();
    
    // Simulate API call
    toast.promise(
      new Promise(async (resolve) => {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 2000));
        
        // Save to local pending skills for admin to see
        const newSkill = {
          id: Date.now(),
          residentName: 'Current User', // In real app, get from AuthContext
          skillName: formData.skillName,
          price: formData.price,
          description: formData.description,
          status: 'PENDING'
        };
        const pending = JSON.parse(localStorage.getItem('pending_skills') || '[]');
        localStorage.setItem('pending_skills', JSON.stringify([...pending, newSkill]));
        
        resolve();
      }),
      {
        loading: t('sending', 'Sending...'),
        success: t('toast_skill_success', 'Your skill "{{skillName}}" has been submitted for verification! Once approved, it will appear in the marketplace.', { skillName: formData.skillName }),
        error: t('message_failed', 'Failed to send message'),
      },
      { duration: 5000 }
    );
    
    setShowModal(false);
    setFormData({ skillName: '', price: '', description: '' });
  };

  const handleContact = (skill) => {
    setContactTarget(skill);
    setShowContactModal(true);
    setMessageSent(false);
    setMessage(t('initial_message', 'Hi! I am interested in your skill: ') + skill.skillName);
  };

  const submitMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          // 1. Try real API
          if (contactTarget.residentId) {
            await sendApiMessage({
              receiverId: contactTarget.residentId,
              content: message.trim()
            });
          }

          // 2. Local persistence for demo (MessagesPage will read this)
          const localMsgs = JSON.parse(localStorage.getItem('local_messages') || '[]');
          const newMessage = {
            id: Date.now(),
            senderId: 'current_user', // Mock sender
            receiverId: contactTarget.residentId || 999,
            receiverEmail: contactTarget.residentEmail || 'neighbor@society.com',
            content: message.trim(),
            createdAt: new Date().toISOString()
          };
          localStorage.setItem('local_messages', JSON.stringify([...localMsgs, newMessage]));

          setTimeout(() => {
            setMessageSent(true);
            resolve();
          }, 1000);
        } catch (err) {
          reject(err);
        }
      }),
      {
        loading: t('sending', 'Sending message...'),
        success: t('message_sent_toast', 'Connection request sent!'),
        error: t('message_failed', 'Failed to send message'),
      }
    );
    setMessage('');
  };

  return (
    <div className="page container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{t('marketplace_title', 'Skill-share')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('marketplace_subtitle', 'Discover hidden talents within your society. Book skills from neighbors!')}</p>
        </div>

        {loading ? <div className="spinner" /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {displaySkills.map(s => (
              <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.3s ease' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--primary-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
                      {s.residentName ? s.residentName.charAt(0) : '?'}
                    </div>
                    <div>
                      <h3 style={{ margin: 0 }}>{s.skillName}</h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('by', 'by')} {s.residentName}</span>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>{s.description}</p>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{s.price}<small style={{ fontWeight: 'normal', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('per_hour', '/hr')}</small></span>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => handleContact(s)}
                  >
                    <HiOutlineChatAlt2 /> {t('marketplace_contact', 'Contact Neighbor')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card" style={{ marginTop: '64px', background: 'var(--bg-elevated)', textAlign: 'center', padding: '40px' }}>
          <HiOutlineLightBulb style={{ fontSize: '48px', color: 'var(--warning)', marginBottom: '16px' }} />
          <h2>{t('marketplace_share_title', 'Want to share your skill?')}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{t('marketplace_share_subtitle', 'Join 50+ neighbors already earning by helping the community.')}</p>
          <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
            {t('marketplace_list_btn', 'List Your Skill')}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card"
              style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
              >
                <HiOutlineX />
              </button>
              <h2 style={{ marginBottom: '24px' }}>{t('marketplace_list_btn', 'List Your Skill')}</h2>
              <form onSubmit={handleListSkill} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>{t('prompt_skill', 'What skill would you like to list?')}</label>
                  <input
                    type="text"
                    required
                    value={formData.skillName}
                    onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                    placeholder={t('skill_name_placeholder', 'e.g. Yoga, Tutoring, Baking')}
                  />
                </div>
                <div className="form-group">
                  <label>{t('prompt_price', 'What is your expected hourly rate (₹)?')}</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder={t('skill_price_placeholder', '500')}
                  />
                </div>
                <div className="form-group">
                  <label>{t('description', 'Description')}</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('skill_desc_placeholder', 'Tell us more about your service...')}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                  {t('btn_submit_approval', 'Submit for Approval')}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showContactModal && contactTarget && (
          <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card"
              style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowContactModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
              >
                <HiOutlineX />
              </button>
              <h2 style={{ marginBottom: '8px' }}>{t('contact_neighbor', 'Contact Neighbor')}</h2>
              
              {!messageSent ? (
                <>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{t('message_to', 'Message to')} <strong>{contactTarget.residentName}</strong></p>
                  <form onSubmit={submitMessage} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                      <label>{t('your_message', 'Your Message')}</label>
                      <textarea
                        rows="4"
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t('type_message_here', 'Type your message here...')}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <HiOutlinePaperAirplane style={{ transform: 'rotate(90deg)' }} /> {t('ai_send', 'Send')}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: 'center', padding: '20px 0' }}
                >
                  <div style={{ width: '60px', height: '60px', background: 'var(--success-glow)', color: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px' }}>
                    ✓
                  </div>
                  <h3>{t('message_sent_title', 'Message Sent!')}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{t('contact_details_shared', 'Your neighbor has been notified. Here are their contact details:')}</p>
                  
                  <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <HiOutlinePhone style={{ color: 'var(--primary)' }} />
                      <span>+91 98765 43210</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <HiOutlineMail style={{ color: 'var(--primary)' }} />
                      <span>{contactTarget.residentName.toLowerCase().replace(' ', '.')}@society.com</span>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-secondary" 
                    style={{ marginTop: '24px', width: '100%' }}
                    onClick={() => setShowContactModal(false)}
                  >
                    {t('close', 'Close')}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
      `}</style>

    </div>
  );
}
