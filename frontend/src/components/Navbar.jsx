import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getUnreadNotifications, getUnreadMessages } from '../services/api';
import { HiOutlineUser, HiOutlineLogout, HiOutlineViewGrid, HiOutlineBell, HiOutlineChatAlt2, HiOutlineShieldCheck, HiOutlineX, HiOutlineDownload } from 'react-icons/hi';
import ThemeToggle from './ThemeToggle';
import ColorPicker from './ColorPicker';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [notifPermission, setNotifPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    if (user) {
      const fetchCounts = () => {
        getUnreadNotifications().then(r => setUnreadNotifs(r.data.count || 0)).catch(() => {});
        getUnreadMessages().then(r => setUnreadMsgs(r.data.count || 0)).catch(() => {});
      };
      fetchCounts();
      const interval = setInterval(fetchCounts, 30000);
      return () => {
        clearInterval(interval);
        window.removeEventListener('scroll', handleScroll);
      };
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user]);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setIsInstalled(false);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallApp = useCallback(async () => {
    if (!installPrompt) {
      if (isInstalled) {
        toast.success('App is already installed!');
      } else {
        toast('Open this site in Chrome/Edge and serve over HTTPS to enable install.', { icon: 'ℹ️', duration: 4000 });
      }
      return;
    }
    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('🎉 App installed successfully!');
        setInstallPrompt(null);
        setIsInstalled(true);
      } else {
        toast('Install cancelled.', { icon: '😔' });
      }
    } catch {
      toast.error('Install failed. Please try again.');
    }
  }, [installPrompt, isInstalled]);

  const handleNotifications = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in this browser.');
      setNotifPermission('unsupported');
      return;
    }
    if (Notification.permission === 'granted') {
      toast.success('Notifications are already enabled!');
      setNotifPermission('granted');
      return;
    }
    if (Notification.permission === 'denied') {
      toast('Notifications are blocked. Please enable them in your browser settings.', { icon: '⚙️', duration: 5000 });
      setNotifPermission('denied');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
      if (result === 'granted') {
        toast.success('🔔 Notifications enabled!');
        new Notification('SocietyConnect', { body: 'You will now receive booking and message alerts!', icon: '/favicon.ico' });
      } else if (result === 'denied') {
        toast('Notifications blocked. You can change this in browser settings.', { icon: '⚙️' });
      } else {
        toast('Notification permission dismissed.', { icon: '😔' });
      }
    } catch {
      toast.error('Could not request notification permission.');
    }
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const getInstallStatus = () => {
    if (isInstalled) return { label: t('status_installed', 'Installed'), color: 'var(--success)', icon: '✅' };
    if (installPrompt) return { label: t('status_ready', 'Ready to install'), color: 'var(--primary)', icon: '📲' };
    return { label: t('status_not_available', 'Not available'), color: 'var(--text-muted)', icon: '⏳' };
  };

  const getNotifStatus = () => {
    if (notifPermission === 'granted') return { label: t('status_enabled', 'Enabled'), color: 'var(--success)', icon: '🔔' };
    if (notifPermission === 'denied') return { label: t('status_blocked', 'Blocked'), color: 'var(--danger)', icon: '🔕' };
    if (notifPermission === 'unsupported') return { label: t('status_unsupported', 'Not supported'), color: 'var(--text-muted)', icon: '❌' };
    return { label: t('status_not_set', 'Not set'), color: 'var(--warning)', icon: '🔕' };
  };

  const installStatus = getInstallStatus();
  const notifStatus = getNotifStatus();

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="navbar__logo" onClick={() => setIsOpen(false)}>
            ⚡ Society<span>Connect</span>
          </Link>
          
          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <HiOutlineX /> : <HiOutlineViewGrid />}
          </button>

          <div className={`navbar__links ${isOpen ? 'navbar__links--open' : ''}`}>
            <div className="mobile-menu-header">
              <button className="mobile-close" onClick={() => setIsOpen(false)}>
                <HiOutlineX />
              </button>
            </div>
            <ColorPicker />
            <ThemeToggle />
            <Link to="/search" className="btn btn-ghost" onClick={() => setIsOpen(false)}>{t('nav_explore', 'Services')}</Link>
            <Link to="/marketplace" className="btn btn-ghost" onClick={() => setIsOpen(false)}>{t('nav_marketplace', 'Skill-share')}</Link>
            <button 
              className="btn btn-ghost nav-badge-btn" 
              onClick={() => { setShowInstallModal(true); setIsOpen(false); }}
              title="Install & Alerts"
              style={{ padding: '8px', minWidth: '40px' }}
            >
              <HiOutlineDownload />
              {notifPermission === 'default' && <span className="nav-badge" style={{ background: 'var(--warning)', right: '4px', top: '4px' }}>!</span>}
            </button>
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-ghost" onClick={() => setIsOpen(false)}>
                  <HiOutlineViewGrid /> {t('nav_dashboard', 'Dash')}
                </Link>
                <Link to="/messages" className="btn btn-ghost nav-badge-btn" onClick={() => setIsOpen(false)} title={t('nav_messages', 'Messages')}>
                  <HiOutlineChatAlt2 />
                  {unreadMsgs > 0 && <span className="nav-badge">{unreadMsgs}</span>}
                </Link>
                <Link to="/notifications" className="btn btn-ghost nav-badge-btn" onClick={() => setIsOpen(false)} title={t('nav_notifications', 'Notifications')}>
                  <HiOutlineBell />
                  {unreadNotifs > 0 && <span className="nav-badge">{unreadNotifs}</span>}
                </Link>
                <Link to="/profile" className="btn btn-ghost" onClick={() => setIsOpen(false)} title={t('nav_profile', 'My Profile')}><HiOutlineUser /></Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="btn btn-ghost" style={{ color: 'var(--danger)' }} title="Logout">
                  <HiOutlineLogout />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setIsOpen(false)}>{t('btn_get_started', 'Get Started')}</Link>
              </>
            )}
            <select 
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              value={i18n.language}
              className="lang-select"
              style={{
                background: 'var(--bg-secondary)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: '12px',
                padding: '6px 10px', fontSize: '0.85rem', cursor: 'pointer',
                fontWeight: '500', outline: 'none', marginLeft: '8px'
              }}
            >
              <option value="en">EN</option>
              <option value="hi">हि</option>
              <option value="mr">म</option>
              <option value="ta">த</option>
            </select>
          </div>
        </div>
      </nav>

      {/* Install / Alerts Modal */}
      {showInstallModal && (
        <div className="modal-overlay" onClick={() => setShowInstallModal(false)}>
          <div className="install-modal" onClick={(e) => e.stopPropagation()}>
            <div className="install-modal__header">
              <h2>⚡ {t('install_alerts_title', 'Install & Alerts')}</h2>
              <button className="install-modal__close" onClick={() => setShowInstallModal(false)}>
                <HiOutlineX />
              </button>
            </div>

            <div className="install-modal__section">
              <div className="install-modal__row">
                <div className="install-modal__info">
                  <span className="install-modal__icon">{installStatus.icon}</span>
                  <div>
                    <h3>{t('install_app_title', 'Install App')}</h3>
                    <p>{t('install_app_desc', 'Add SocietyConnect to your home screen for quick access, offline support, and a native app experience.')}</p>
                  </div>
                </div>
                <div className="install-modal__status">
                  <span className="install-modal__badge" style={{ color: installStatus.color, borderColor: installStatus.color }}>
                    {installStatus.label}
                  </span>
                </div>
              </div>
              <button
                className={`btn ${installPrompt ? 'btn-primary' : 'btn-secondary'} install-modal__action`}
                onClick={handleInstallApp}
                disabled={isInstalled}
              >
                <HiOutlineDownload />
                {isInstalled ? t('btn_already_installed', 'Already Installed') : installPrompt ? t('btn_install_now', 'Install Now') : t('btn_not_available', 'Not Available')}
              </button>
              {!installPrompt && !isInstalled && (
                <p className="install-modal__hint">
                  💡 {t('install_hint', "To install, open this site in Chrome or Edge and ensure it's served over HTTPS.")}
                </p>
              )}
            </div>

            <div className="install-modal__divider" />

            <div className="install-modal__section">
              <div className="install-modal__row">
                <div className="install-modal__info">
                  <span className="install-modal__icon">{notifStatus.icon}</span>
                  <div>
                    <h3>{t('push_notifs_title', 'Push Notifications')}</h3>
                    <p>{t('push_notifs_desc', 'Get notified about new bookings, messages, and important updates in real time.')}</p>
                  </div>
                </div>
                <div className="install-modal__status">
                  <span className="install-modal__badge" style={{ color: notifStatus.color, borderColor: notifStatus.color }}>
                    {notifStatus.label}
                  </span>
                </div>
              </div>
              <button
                className={`btn ${notifPermission === 'default' ? 'btn-primary' : 'btn-secondary'} install-modal__action`}
                onClick={handleNotifications}
                disabled={notifPermission === 'unsupported'}
              >
                <HiOutlineBell />
                {notifPermission === 'granted' ? t('btn_notif_on', 'Notifications On') : notifPermission === 'denied' ? t('btn_notif_blocked', 'Blocked — Open Settings') : notifPermission === 'unsupported' ? t('btn_notif_unsupported', 'Not Supported') : t('btn_notif_enable', 'Enable Notifications')}
              </button>
              {notifPermission === 'denied' && (
                <p className="install-modal__hint">
                  ⚙️ {t('notif_blocked_hint', "Notifications were blocked. Go to your browser settings → Site Settings → Notifications to re-enable.")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
