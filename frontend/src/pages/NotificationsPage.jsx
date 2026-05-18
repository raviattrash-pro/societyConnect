import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { HiOutlineBell, HiOutlineCheck, HiOutlineCheckCircle } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { toast.error('Failed to update'); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to update'); }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return t('time_ago_m', { count: mins }, `${mins}m ago`);
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('time_ago_h', { count: hours }, `${hours}h ago`);
    const days = Math.floor(hours / 24);
    return t('time_ago_d', { count: days }, `${days}d ago`);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="spinner" />;

  return (
    <div className="page container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          <HiOutlineBell style={{ verticalAlign: 'middle', marginRight: 8 }} />
          {t('notifications', 'Notifications')} {unreadCount > 0 && <span className="badge badge--pending">{t('unread_new', { count: unreadCount }, `${unreadCount} new`)}</span>}
        </h1>
        {unreadCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
            <HiOutlineCheckCircle /> {t('mark_all_read', 'Mark All Read')}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🔔</div>
          <h3>{t('no_notifications', 'No notifications yet')}</h3>
          <p>{t('notification_empty_hint', "You'll see updates about bookings, messages, and more here.")}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card"
              style={{
                opacity: n.isRead ? 0.6 : 1,
                borderLeft: n.isRead ? '3px solid var(--border)' : '3px solid var(--primary)',
                cursor: n.isRead ? 'default' : 'pointer',
              }}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{t(n.title.trim().toLowerCase().replace(/ /g, '_'), n.title)}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {(() => {
                      const regexAccepted = /Your booking for (.*) has been accepted!/;
                      const regexCompleted = /Your booking for (.*) is completed\. Please leave a review\./;
                      const regexCancelled = /Your booking for (.*) has been cancelled\./;
                      
                      const matchAccepted = n.message.match(regexAccepted);
                      if (matchAccepted) return t('notif_msg_accepted', { service: t(matchAccepted[1].trim().toLowerCase().replace(/ /g, '_'), matchAccepted[1]) });
                      
                      const matchCompleted = n.message.match(regexCompleted);
                      if (matchCompleted) return t('notif_msg_completed', { service: t(matchCompleted[1].trim().toLowerCase().replace(/ /g, '_'), matchCompleted[1]) });
                      
                      const matchCancelled = n.message.match(regexCancelled);
                      if (matchCancelled) return t('notif_msg_cancelled', { service: t(matchCancelled[1].trim().toLowerCase().replace(/ /g, '_'), matchCancelled[1]) });
                      
                      return n.message;
                    })()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {n.createdAt ? formatTime(n.createdAt) : ''}
                  </span>
                  {!n.isRead && <span className="badge badge--accepted" style={{ fontSize: '0.65rem' }}>{t('label_new', 'NEW')}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
