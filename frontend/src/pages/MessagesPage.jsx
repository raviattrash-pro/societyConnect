import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getMyConversations, getConversation, sendMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePaperAirplane, HiOutlineChatAlt2, HiOutlineArrowLeft } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      const interval = setInterval(() => fetchMessages(activeChat), 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await getMyConversations();
      let apiConvs = res.data || [];
      
      // Merge with local messages for demo persistence
      const localMsgs = JSON.parse(localStorage.getItem('local_messages') || '[]');
      const combined = [...apiConvs, ...localMsgs];
      
      // Sort by date descending
      combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setConversations(combined);
      if (combined.length > 0) {
        const first = combined[0];
        const partnerId = first.senderId === user?.userId || first.senderId === 'current_user' ? first.receiverId : first.senderId;
        setActiveChat(partnerId);
      }
    } catch { 
      // Fallback to local only if API fails
      const localMsgs = JSON.parse(localStorage.getItem('local_messages') || '[]');
      setConversations(localMsgs);
      if (localMsgs.length > 0) {
        setActiveChat(localMsgs[0].receiverId);
      }
    }
    finally { setLoading(false); }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await getConversation(userId);
      let apiMsgs = res.data || [];
      
      const localMsgs = JSON.parse(localStorage.getItem('local_messages') || '[]');
      const relevantLocal = localMsgs.filter(m => 
        (m.receiverId === userId) || (m.senderId === userId)
      );
      
      const combined = [...apiMsgs, ...relevantLocal];
      combined.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setMessages(combined);
    } catch {
      const localMsgs = JSON.parse(localStorage.getItem('local_messages') || '[]');
      const relevantLocal = localMsgs.filter(m => 
        (m.receiverId === userId) || (m.senderId === userId)
      );
      setMessages(relevantLocal.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeChat) return;
    
    const partner = partners.find(p => p.id === activeChat);
    const content = newMsg.trim();
    setNewMsg('');

    try {
      // 1. Try real API
      await sendMessage({ receiverId: activeChat, content });
    } catch { 
      /* Fail silently and rely on local for demo */ 
    }

    // 2. Local persistence for demo
    const localMsgs = JSON.parse(localStorage.getItem('local_messages') || '[]');
    const newMessage = {
      id: Date.now(),
      senderId: user?.userId || 'current_user',
      receiverId: activeChat,
      receiverEmail: partner?.email || 'neighbor@society.com',
      content,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('local_messages', JSON.stringify([...localMsgs, newMessage]));
    
    // Refresh list locally
    fetchMessages(activeChat);
    fetchConversations();
  };

  const getPartnerEmail = (conv) => {
    if (!user) return '';
    return conv.senderId === user.userId ? conv.receiverEmail : conv.senderEmail;
  };

  const getPartnerIds = () => {
    const ids = new Map();
    conversations.forEach(conv => {
      const isMe = conv.senderId === user?.userId || conv.senderId === 'current_user';
      const partnerId = isMe ? conv.receiverId : conv.senderId;
      const partnerEmail = isMe ? conv.receiverEmail : conv.senderEmail;
      if (!ids.has(partnerId)) ids.set(partnerId, { id: partnerId, email: partnerEmail, lastMsg: conv.content, time: conv.createdAt });
    });
    return Array.from(ids.values());
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="spinner" />;

  const partners = getPartnerIds();

  return (
    <div className="page container">
      <h1 className={activeChat ? 'mobile-hide' : ''} style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>
        <HiOutlineChatAlt2 style={{ verticalAlign: 'middle', marginRight: 8 }} /> {t('messages', 'Messages')}
      </h1>

      {partners.length === 0 && !activeChat ? (
        <div className="empty-state">
          <div className="empty-state__icon">💬</div>
          <h3>{t('no_conversations', 'No conversations yet')}</h3>
          <p>{t('start_conversation', 'Start a conversation by booking a service or contacting a provider.')}</p>
        </div>
      ) : (
        <div className={`chat-layout ${activeChat ? 'chat-active' : ''}`}>
          {/* Sidebar */}
          <div className="chat-sidebar">
            <div style={{ padding: '0 8px 16px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
              <input 
                type="text" 
                placeholder={t('search_chats', 'Search chats...')} 
                className="form-input" 
                style={{ height: '40px', fontSize: '0.9rem' }}
              />
            </div>
            {partners.map(p => (
              <div
                key={p.id}
                className={`chat-contact ${activeChat === p.id ? 'chat-contact--active' : ''}`}
                onClick={() => setActiveChat(p.id)}
              >
                <div className="chat-contact__avatar" style={{ background: activeChat === p.id ? 'var(--primary)' : 'var(--bg-secondary)' }}>
                  {p.email?.[0]?.toUpperCase()}
                </div>
                <div className="chat-contact__info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div className="chat-contact__name">{p.email?.split('@')[0] || t('neighbor', 'neighbor')}</div>
                    <div className="chat-contact__time">{formatTime(p.time)}</div>
                  </div>
                  <div className="chat-contact__preview">{p.lastMsg?.substring(0, 30)}{p.lastMsg?.length > 30 ? '...' : ''}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Window */}
          <div className="chat-messages">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="chat-header" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => setActiveChat(null)}>
                  <HiOutlineArrowLeft style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }} />
                  <div className="chat-contact__avatar" style={{ width: 40, height: 40, fontSize: '1rem' }}>
                    {partners.find(p => p.id === activeChat)?.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="chat-header__info">
                    <div className="chat-header__name">
                      {partners.find(p => p.id === activeChat)?.email?.split('@')[0] || t('neighbor', 'neighbor')}
                    </div>
                    <div className="chat-header__status">
                      {t('online', 'online')} • +91 98765 43210
                    </div>
                  </div>
                </div>

                {/* Message List */}
                <div className="chat-messages__list">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.01 }}
                      className={`chat-bubble ${msg.senderId === user?.userId || msg.senderId === 'current_user' ? 'chat-bubble--sent' : 'chat-bubble--received'}`}
                    >
                      <div className="chat-bubble__content">
                        {(() => {
                          const regex = /Hello! I have accepted your booking\. My contact number is (\d+)\. I also received your contact: (\d+)\. Let's chat here or call if needed!/;
                          const match = msg.content.match(regex);
                          if (match) {
                            return t('msg_accepted_template', { phone1: match[1], phone2: match[2] });
                          }
                          return msg.content;
                        })()}
                      </div>
                      <div className="chat-bubble__time">{formatTime(msg.createdAt)}</div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form className="chat-input" onSubmit={handleSend}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('type_message', 'Type a message...')}
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" style={{ width: '48px', height: '48px', padding: 0, borderRadius: '50%' }}>
                    <HiOutlinePaperAirplane style={{ fontSize: '1.2rem', marginLeft: '4px' }} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💬</div>
                <h3>{t('select_chat_hint', 'Select a neighbor to start chatting')}</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
