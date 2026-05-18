import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategories, getServices, getRecentActivity, getTrendingProviders, getEmergencyProviders, getMarketplaceIntelligence } from '../services/api';
import { HiOutlineSearch, HiOutlineStar, HiOutlineBadgeCheck, HiOutlineShieldCheck, HiOutlineLightningBolt, HiOutlineTrendingUp } from 'react-icons/hi';
import { getServiceImage } from '../utils/imageUtils';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [emergency, setEmergency] = useState([]);
  const [marketplace, setMarketplace] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activeActivity, setActiveActivity] = useState(0);

  // Carousel State
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const heroImages = [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ];

  useEffect(() => {
    getCategories().then(res => setCategories(res.data)).catch(() => {});
    getServices().then(res => setFeatured(res.data.slice(0, 6))).catch(() => {});
    getRecentActivity().then(res => setActivities(res.data)).catch(() => {});
    getTrendingProviders().then(res => setTrending(res.data)).catch(() => {});
    getEmergencyProviders().then(res => setEmergency(res.data)).catch(() => {});
    getMarketplaceIntelligence().then(res => setMarketplace(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (activities.length > 0) {
      const interval = setInterval(() => {
        setActiveActivity(prev => (prev + 1) % activities.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activities]);

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentHeroImage(prev => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(heroInterval);
  }, []);

  return (
    <div className="page">
      <motion.section
        className="hero container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '40px', textAlign: 'left', padding: '80px 0 60px', flexWrap: 'wrap' }}
      >
        {activities.length > 0 && (
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '400px', height: '40px', overflow: 'hidden', zIndex: 10 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activities[activeActivity].id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="activity-ticker"
                style={{
                  background: 'rgba(79, 70, 229, 0.15)',
                  border: '1px solid rgba(79, 70, 229, 0.3)',
                  color: '#4338ca',
                  padding: '8px 20px',
                  borderRadius: '30px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  margin: '0 auto',
                  width: 'fit-content',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{activities[activeActivity].icon}</span>
                <span>
                  {activeActivity === 0 && t('activity_1', 'A neighbor just booked Plumbing service.')}
                  {activeActivity === 1 && t('activity_2', { name: t('john_doe', 'John Doe') })}
                  {activeActivity === 2 && t('activity_3', 'Urgent: 5 slots left for AC Maintenance group deal.')}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <div style={{ flex: 1, zIndex: 2, minWidth: '300px' }}>
          <span className="hero__badge" style={{ marginTop: activities.length > 0 ? '50px' : 0 }}>{t('hero_badge', 'Trusted by Local Communities')}</span>
          <h1 style={{ textAlign: 'left', margin: '0 0 24px 0' }}>
            {t('hero_title_1', 'Find Trusted Local')}<br /><span>{t('hero_title_2', 'Service Providers')}</span>
          </h1>
          <p style={{ margin: '0 0 40px 0', textAlign: 'left' }}>
            {t('hero_subtitle', 'Connect with verified plumbers, electricians, carpenters, and more in your society. Built on community trust and real reviews.')}
          </p>
          <div className="hero__actions" style={{ justifyContent: 'flex-start' }}>
            <Link to="/search" className="btn btn-primary btn-lg">
              <HiOutlineSearch /> {t('hero_btn_explore', 'Explore Services')}
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              {t('hero_btn_provider', 'Join as Provider')}
            </Link>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative', minWidth: '320px', height: '450px' }}>
          <div style={{ position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', filter: 'blur(60px)', opacity: 0.3, zIndex: 0, borderRadius: '50%' }}></div>
          
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentHeroImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8 }}
              src={heroImages[currentHeroImage]} 
              alt="Home Services Carousel" 
              style={{ position: 'absolute', width: '100%', maxWidth: '500px', height: '100%', borderRadius: '24px', boxShadow: 'var(--shadow-lg)', zIndex: 1, objectFit: 'cover' }} 
            />
          </AnimatePresence>
          
          {/* Carousel Indicators */}
          <div style={{ position: 'absolute', bottom: '-20px', display: 'flex', gap: '8px', zIndex: 2 }}>
            {heroImages.map((_, idx) => (
              <div 
                key={idx}
                onClick={() => setCurrentHeroImage(idx)}
                style={{ width: '10px', height: '10px', borderRadius: '50%', background: currentHeroImage === idx ? 'var(--primary)' : 'rgba(150, 150, 150, 0.4)', cursor: 'pointer', transition: 'all 0.3s ease', transform: currentHeroImage === idx ? 'scale(1.2)' : 'scale(1)' }}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {marketplace && (
        <section className="container" style={{ paddingBottom: '56px' }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
              <HiOutlineShieldCheck size={28} color="var(--success)" />
              <h3>{t('protected_trust', 'Protected Trust')}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{t('protected_trust_desc', { count: marketplace.protectedBookings })}</p>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
              <HiOutlineLightningBolt size={28} color="var(--warning)" />
              <h3>{t('emergency_mode', 'Emergency Mode')}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{t('emergency_mode_desc', { count: marketplace.emergencyProviders })}</p>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <HiOutlineTrendingUp size={28} color="var(--primary)" />
              <h3>{t('society_savings', 'Society Savings')}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{t('society_savings_desc', 'Group deals turn society-wide demand into better prices and platform revenue.')}</p>
            </div>
          </div>
        </section>
      )}

      {emergency.length > 0 && (
        <section className="container" style={{ paddingBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: 6, textAlign: 'left' }}>{t('emergency_ready', 'Emergency Ready')}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{t('emergency_ready_desc', 'Fast-response providers for urgent issues inside your community.')}</p>
            </div>
            <Link to="/search?sortBy=trust" className="btn btn-secondary">{t('view_all', 'View All')}</Link>
          </div>
          <div className="grid">
            {emergency.slice(0, 3).map((provider) => (
              <div key={provider.profileId || provider.fullName} className="card" style={{ border: '1px solid rgba(245, 158, 11, 0.45)' }}>
                <h3 style={{ marginBottom: '8px' }}>{t(provider.fullName.toLowerCase().replace(/ /g, '_'), provider.fullName)}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>{t(provider.categoryName.toLowerCase().replace(/ /g, '_'), provider.categoryName)}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span className="badge badge--warning">{provider.responseTimeMinutes || 30} min {t('response', 'response')}</span>
                  <span className="badge badge--success">{t('trust_score', { score: provider.trustScore || 70 })}</span>
                </div>
                <Link to={provider.profileId ? `/provider/${provider.profileId}` : '/search?sortBy=trust'} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {provider.profileId ? t('book_emergency', 'Book Emergency') : t('find_emergency_help', 'Find Emergency Help')}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="categories-section container">
        <h2 className="section-title">{t('browse_by_category', 'Browse by Category')}</h2>
        <div className="categories-grid">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              className="category-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/search?category=${cat.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="category-card__icon">{cat.iconUrl}</div>
                <div className="category-card__name">{t(cat.name.trim().toLowerCase().replace(/ /g, '_'), cat.name)}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {trending.length > 0 && (
        <section className="container" style={{ paddingBottom: '60px' }}>
          <h2 className="section-title">{t('trending_society', 'Trending in Your Society')}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', textAlign: 'center' }}>{t('trending_society_desc', 'Providers your neighbors trust the most right now.')}</p>
          <div className="grid">
            {trending.map((provider, i) => (
              <motion.div
                key={provider.profileId}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ border: '1px solid var(--primary-light)', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #f59e0b, #d97706)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <img 
                    src={getServiceImage(provider.categoryName, provider.profileId || provider.fullName)} 
                    alt={provider.fullName}
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
                  />
                  <div>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {t(provider.fullName.trim().toLowerCase().replace(/ /g, '_'), provider.fullName)}
                      {provider.isVerified && <HiOutlineBadgeCheck color="var(--success)" size={20} />}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t(provider.categoryName.trim().toLowerCase().replace(/ /g, '_'), provider.categoryName)}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="badge badge--accepted" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    <HiOutlineStar color="#f59e0b" style={{ marginRight: '4px', verticalAlign: 'middle' }}/>
                    <strong>{provider.averageRating}</strong> ({provider.totalReviews} {t('reviews', 'reviews')})
                  </span>
                  {provider.isSuperProvider && (
                    <span className="badge badge--success" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', border: 'none' }}>
                      {t('super_provider', 'Super Provider')}
                    </span>
                  )}
                  <span className="badge badge--success">{t('trust_score', { score: provider.trustScore || 70 })}</span>
                </div>

                <Link to={`/provider/${provider.profileId}`} className="btn btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                  {t('view_profile', 'View Profile')}
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

    {featured.length > 0 && (
        <section className="container" style={{ paddingBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>{t('featured_services', 'Featured Services')}</h2>
            <Link to="/search" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>{t('view_all', 'View All')}</Link>
          </div>
          <div className="services-grid">
            {featured.map((svc, i) => (
              <motion.div
                key={svc.id}
                className="service-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ padding: 0, overflow: 'hidden' }}
              >
                <div style={{ height: '200px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={getServiceImage(svc.categoryName, svc.id || svc.serviceName)} 
                    alt={svc.serviceName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {svc.categoryName && (
                    <span className="service-card__category" style={{ position: 'absolute', top: '16px', left: '16px', margin: 0, background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      {t(svc.categoryName.toLowerCase().replace(/ /g, '_'), svc.categoryName)}
                    </span>
                  )}
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 className="service-card__name">{t(svc.serviceName.trim().toLowerCase().replace(/ /g, '_'), svc.serviceName)}</h3>
                  <p className="service-card__provider">
                    {t('by', 'by')} <Link to={`/provider/${svc.providerId}`} style={{ fontWeight: 600 }}>{t(svc.providerName.trim().toLowerCase().replace(/ /g, '_'), svc.providerName)}</Link>
                    {svc.isVerified && <span style={{ color: 'var(--success)', marginLeft: '4px', fontSize: '0.8rem' }}>{t('verified', 'Verified')}</span>}
                  </p>
                  <div className="service-card__footer">
                    <span className="service-card__price">₹ {svc.price}</span>
                    {svc.averageRating && (
                      <span className="service-card__rating">
                        <HiOutlineStar /> {svc.averageRating}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
