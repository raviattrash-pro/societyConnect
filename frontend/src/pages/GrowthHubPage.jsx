import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getEmergencyProviders, getMarketplaceIntelligence } from '../services/api';
import {
  HiOutlineBadgeCheck,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineTrendingUp,
  HiOutlineUsers,
} from 'react-icons/hi';

export default function GrowthHubPage() {
  const [marketplace, setMarketplace] = useState(null);
  const [emergencyProviders, setEmergencyProviders] = useState([]);
  const [joinedDeals, setJoinedDeals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('joinedGroupDeals') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    getMarketplaceIntelligence().then(res => setMarketplace(res.data)).catch(() => {});
    getEmergencyProviders().then(res => setEmergencyProviders(res.data)).catch(() => {});
  }, []);

  const groupDeals = useMemo(() => marketplace?.groupDeals || [], [marketplace]);
  const revenueLevers = useMemo(() => marketplace?.revenueLevers || [], [marketplace]);

  const handleJoinDeal = (title) => {
    const next = joinedDeals.includes(title)
      ? joinedDeals.filter(item => item !== title)
      : [...joinedDeals, title];
    setJoinedDeals(next);
    localStorage.setItem('joinedGroupDeals', JSON.stringify(next));
    toast.success(next.includes(title) ? 'Interest added for society deal' : 'Removed from deal interest');
  };

  return (
    <div className="page container">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <div style={{ maxWidth: '760px' }}>
            <span className="badge badge--success" style={{ marginBottom: '12px' }}>Startup Growth Engine</span>
            <h1 style={{ marginBottom: '12px' }}>SocietyConnect Marketplace Hub</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              A business-ready command center for trusted local services, protected bookings, emergency response,
              provider subscriptions, and society-wide group buying.
            </p>
          </div>
          <Link to="/search?sortBy=trust" className="btn btn-primary">
            <HiOutlineShieldCheck /> Find Trusted Help
          </Link>
        </div>

        <div className="stats-grid" style={{ marginBottom: '36px' }}>
          <div className="stat-card">
            <div className="stat-card__label">Verified Providers</div>
            <div className="stat-card__value stat-card__value--success">{marketplace?.verifiedProviders || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Emergency Network</div>
            <div className="stat-card__value stat-card__value--warning">{marketplace?.emergencyProviders || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Protected Bookings</div>
            <div className="stat-card__value stat-card__value--primary">{marketplace?.protectedBookings || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Completed Jobs</div>
            <div className="stat-card__value stat-card__value--accent">{marketplace?.completedBookings || 0}</div>
          </div>
        </div>
      </motion.section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '18px' }}>Moat Features</h2>
        <div className="grid">
          <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
            <HiOutlineShieldCheck size={30} color="var(--success)" />
            <h3>Trust Score</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Ranking based on verification, rating, reviews, response time, completed work, and premium quality signals.</p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
            <HiOutlineLightningBolt size={30} color="var(--warning)" />
            <h3>Emergency Dispatch</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Urgent booking path for plumbing, electrical, medical, locksmith, and other high-intent needs.</p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <HiOutlineUsers size={30} color="var(--primary)" />
            <h3>Group Buying</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Society-wide campaigns convert clustered demand into cheaper prices and platform commission.</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '16px', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>Society Group Deals</h2>
          <span className="badge badge--accepted">Local network effect</span>
        </div>
        <div className="grid">
          {groupDeals.map((deal, index) => {
            const joined = joinedDeals.includes(deal.title);
            const pledged = Math.min((index + 3) * 3 + (joined ? 1 : 0), deal.targetHomes);
            const pct = Math.round((pledged / deal.targetHomes) * 100);
            return (
              <div key={deal.title} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ marginBottom: '4px' }}>{deal.title}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{deal.category}</p>
                  </div>
                  <span className="badge badge--success">{deal.saving}</span>
                </div>
                <div style={{ height: '10px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)' }} />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{pledged}/{deal.targetHomes} homes interested</p>
                <button className={`btn ${joined ? 'btn-success' : 'btn-secondary'}`} style={{ width: '100%', marginTop: '12px' }} onClick={() => handleJoinDeal(deal.title)}>
                  <HiOutlineCheckCircle /> {joined ? 'Interested' : 'Join Deal'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '18px' }}>Emergency Providers</h2>
        {emergencyProviders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon"><HiOutlineLightningBolt /></div>
            <h3>No emergency providers yet</h3>
          </div>
        ) : (
          <div className="grid">
            {emergencyProviders.slice(0, 6).map(provider => (
              <div key={provider.profileId || provider.fullName} className="card">
                <h3 style={{ marginBottom: '6px' }}>{provider.fullName}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '14px' }}>{provider.categoryName}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span className="badge badge--success"><HiOutlineStar /> Trust {provider.trustScore || 60}</span>
                  <span className="badge badge--warning">{provider.responseTimeMinutes || 30} min</span>
                  {provider.isVerified && <span className="badge badge--accepted"><HiOutlineBadgeCheck /> Verified</span>}
                </div>
                <Link to={provider.profileId ? `/provider/${provider.profileId}` : '/search?sortBy=trust'} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {provider.profileId ? 'Book Now' : 'Find Emergency Help'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ marginBottom: '18px' }}>Revenue Engine</h2>
        <div className="grid">
          {revenueLevers.map(item => (
            <div key={item.name} className="card">
              <HiOutlineTrendingUp size={28} color="var(--primary)" />
              <h3>{item.name}</h3>
              <strong style={{ display: 'block', marginBottom: '8px' }}>{item.price}</strong>
              <p style={{ color: 'var(--text-secondary)' }}>{item.value}</p>
            </div>
          ))}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.18), rgba(16, 185, 129, 0.14))' }}>
            <HiOutlineBriefcase size={28} color="var(--success)" />
            <h3>Startup Operating Model</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Subscription revenue from societies, SaaS revenue from providers, commission from bookings, and premium fees from urgent/protected jobs.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
