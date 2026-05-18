import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAdminDashboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { HiOutlineUsers, HiOutlineBriefcase, HiOutlineCurrencyRupee, HiOutlineChartBar, HiOutlineFire, HiOutlineThumbDown } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN') {
      getAdminDashboard()
        .then(res => { setStats(res.data); setLoading(false); })
        .catch(err => { toast.error("Failed to load dashboard data"); setLoading(false); });
    }
  }, [user]);

  if (user?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/dashboard" />;
  }

  if (loading || !stats) return <div className="spinner" />;

  return (
    <div className="page container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ marginBottom: '8px' }}>Admin Analytics Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Real-time platform insights and utilization metrics.</p>

        {/* KPI Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', color: 'white' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><HiOutlineUsers size={28} /></div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Total Users</p>
              <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{stats.totalUsers}</h2>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><HiOutlineBriefcase size={28} /></div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Total Providers</p>
              <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{stats.totalProviders}</h2>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><HiOutlineChartBar size={28} /></div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Total Bookings</p>
              <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{stats.totalBookings}</h2>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}><HiOutlineCurrencyRupee size={28} /></div>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Total Revenue</p>
              <h2 style={{ margin: 0, fontSize: '1.8rem' }}>₹{stats.totalRevenue.toLocaleString()}</h2>
            </div>
          </div>
        </div>

        {/* Analytics Grids */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          
          {/* Most Used Services */}
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <HiOutlineChartBar color="var(--primary)" /> Most Used Services
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.mostUsedServices.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{m.name}</span>
                  <span className="badge badge--accepted">{m.value} bookings</span>
                </div>
              ))}
            </div>
          </div>

          {/* High Demand Services */}
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <HiOutlineFire color="#ef4444" /> High Demand (Job Requests)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.highDemandServices.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{m.name}</span>
                  <span className="badge badge--warning">{m.value} requests</span>
                </div>
              ))}
            </div>
          </div>

          {/* Least Used Services */}
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <HiOutlineThumbDown color="#64748b" /> Least Used Services
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.leastUsedServices.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{m.name}</span>
                  <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{m.value} bookings</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Top Providers Hall of Fame */}
        <div className="card">
          <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>🏆 Provider Hall of Fame (Top Recommended)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats.topProviders.map((p, i) => (
              <div key={p.profileId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>#{i + 1}</div>
                  <div>
                    <h4 style={{ margin: 0 }}>{p.fullName} {p.isSuperProvider && '🏆'}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.categoryName}</span>
                  </div>
                </div>
                <span className="badge badge--accepted" style={{ fontSize: '0.9rem' }}>⭐ {p.averageRating} ({p.totalReviews} reviews)</span>
              </div>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
