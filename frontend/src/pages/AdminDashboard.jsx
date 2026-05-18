import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAdminDashboard, getAdminUsers, toggleUserStatus, verifyProvider, getUnverifiedProviders, getSetting, updateSetting, getAdminJobs, syncDefaults, toggleDefaults, getGrievances, resolveGrievance, getMarketplaceIntelligence, getRevenueSummary } from '../services/api';
import { HiOutlineShieldCheck, HiOutlineUsers, HiOutlineBriefcase, HiOutlineCheckCircle, HiOutlineBan, HiOutlineClipboardList, HiOutlineCog, HiOutlineBadgeCheck, HiOutlineTrendingUp } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [unverified, setUnverified] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState('');
  const [grievances, setGrievances] = useState([]);
  const [defaultEnabled, setDefaultEnabled] = useState(false);
  const [marketplace, setMarketplace] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [pendingSkills, setPendingSkills] = useState([]);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'overview') {
        const res = await getAdminDashboard();
        setStats(res.data);
      } else if (tab === 'users') {
        const res = await getAdminUsers();
        setUsers(res.data);
      } else if (tab === 'verify') {
        const res = await getUnverifiedProviders();
        setUnverified(res.data);
      } else if (tab === 'jobs') {
        const res = await getAdminJobs();
        setJobs(res.data);
      } else if (tab === 'grievances') {
        const res = await getGrievances();
        setGrievances(res.data);
      } else if (tab === 'growth') {
        const [res, rev] = await Promise.all([getMarketplaceIntelligence(), getRevenueSummary().catch(() => ({ data: null }))]);
        setMarketplace(res.data);
        setRevenue(rev.data);
      } else if (tab === 'skills') {
        // Load from localStorage to bridge with MarketplacePage
        const localPending = JSON.parse(localStorage.getItem('pending_skills') || '[]');
        
        // Mock data if local is empty
        const mocks = [
          { id: 101, residentName: 'Rahul Verma', skillName: 'Guitar Lessons', price: 600, description: 'Beginner to intermediate classes at home.', status: 'PENDING' },
          { id: 102, residentName: 'Priya Mani', skillName: 'South Indian Cooking', price: 400, description: 'Learn authentic Kerala and Tamil Nadu recipes.', status: 'PENDING' }
        ];
        
        setPendingSkills(localPending.length > 0 ? localPending : mocks);
      } else if (tab === 'settings') {
        const qrRes = await getSetting('payment_qr_url');
        setQrUrl(qrRes.data.value);
        const defRes = await getSetting('enable_default_providers');
        setDefaultEnabled(defRes.data?.value === 'true');
      }
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleToggleDefaults = async (enabled) => {
    setLoading(true);
    try {
      await toggleDefaults(enabled);
      setDefaultEnabled(enabled);
      toast.success(`Default providers ${enabled ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Failed to toggle'); }
    finally { setLoading(false); }
  };

  const handleSyncDefaults = async () => {
    setLoading(true);
    try {
      await syncDefaults();
      toast.success('Default providers synced for all categories');
      loadData();
    } catch { toast.error('Failed to sync'); }
    finally { setLoading(false); }
  };

  const handleResolveGrievance = async (id) => {
    try {
      await resolveGrievance(id);
      toast.success('Grievance resolved and password reset');
      loadData();
    } catch { toast.error('Failed to resolve'); }
  };

  const handleToggleUser = async (id) => {
    try {
      await toggleUserStatus(id);
      toast.success('User status updated');
      loadData();
    } catch { toast.error('Failed to update'); }
  };

  const handleApproveSkill = (id) => {
    const skillToApprove = pendingSkills.find(s => s.id === id);
    if (skillToApprove) {
      // 1. Remove from pending in localStorage
      const pending = JSON.parse(localStorage.getItem('pending_skills') || '[]');
      const updatedPending = pending.filter(s => s.id !== id);
      localStorage.setItem('pending_skills', JSON.stringify(updatedPending));

      // 2. Add to approved in localStorage
      const approved = JSON.parse(localStorage.getItem('approved_skills') || '[]');
      localStorage.setItem('approved_skills', JSON.stringify([...approved, { ...skillToApprove, status: 'APPROVED' }]));

      // 3. Update local state
      setPendingSkills(prev => prev.filter(s => s.id !== id));
      toast.success(t('skill_approved_toast', 'Skill approved and listed on Marketplace!'));
    }
  };

  const tabs = [
    { id: 'overview', label: t('admin_overview', 'Overview'), icon: <HiOutlineClipboardList /> },
    { id: 'users', label: t('admin_users', 'Users'), icon: <HiOutlineUsers /> },
    { id: 'verify', label: t('admin_verify', 'Verify Providers'), icon: <HiOutlineCheckCircle /> },
    { id: 'skills', label: t('admin_skills', 'Skill Approvals'), icon: <HiOutlineBadgeCheck /> },
    { id: 'jobs', label: t('admin_jobs', 'All Job Leads'), icon: <HiOutlineBriefcase /> },
    { id: 'growth', label: t('admin_growth', 'Growth Engine'), icon: <HiOutlineTrendingUp /> },
    { id: 'grievances', label: t('admin_grievances', 'Grievances'), icon: <HiOutlineBadgeCheck /> },
    { id: 'settings', label: t('admin_settings', 'Settings'), icon: <HiOutlineCog /> },
  ];

  return (
    <div className="page">
      <div className="dashboard container">
        {/* Sidebar */}
        <div className="sidebar">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiOutlineShieldCheck /> {t('admin_panel', 'Admin Panel')}
          </h2>
          <nav className="sidebar__nav">
            {tabs.map(t => (
              <button key={t.id} className={`sidebar__link ${tab === t.id ? 'sidebar__link--active' : ''}`} onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="dashboard__content">
          {loading ? <div className="spinner" /> : (
            <>
              {tab === 'overview' && stats && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 style={{ marginBottom: 24 }}>{t('platform_overview', 'Platform Overview')}</h2>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-card__label">{t('total_users', 'Total Users')}</div>
                      <div className="stat-card__value stat-card__value--primary">{stats.totalUsers}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card__label">{t('providers', 'Providers')}</div>
                      <div className="stat-card__value stat-card__value--accent">{stats.totalProviders}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card__label">{t('residents', 'Residents')}</div>
                      <div className="stat-card__value stat-card__value--success">{stats.totalResidents}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card__label">{t('total_bookings', 'Total Bookings')}</div>
                      <div className="stat-card__value stat-card__value--warning">{stats.totalBookings}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card__label">{t('pending_bookings', 'Pending Bookings')}</div>
                      <div className="stat-card__value" style={{ color: 'var(--warning)' }}>{stats.pendingBookings}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card__label">{t('completed_bookings', 'Completed Bookings')}</div>
                      <div className="stat-card__value" style={{ color: 'var(--success)' }}>{stats.completedBookings}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card__label">{t('total_services', 'Total Services')}</div>
                      <div className="stat-card__value stat-card__value--primary">{stats.totalServices}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card__label">{t('reviews', 'Reviews')}</div>
                      <div className="stat-card__value stat-card__value--accent">{stats.totalReviews}</div>
                    </div>
                    <div className="stat-card" style={{ borderColor: 'var(--danger)' }}>
                      <div className="stat-card__label">{t('unverified_providers', 'Unverified Providers')}</div>
                      <div className="stat-card__value" style={{ color: 'var(--danger)' }}>{stats.unverifiedProviders}</div>
                    </div>
                  </div>

                  {/* Advanced Analytics */}
                  <h2 style={{ marginTop: 40, marginBottom: 24, borderTop: '1px solid var(--border)', paddingTop: 24 }}>{t('indepth_analytics', 'In-Depth Analytics')}</h2>
                  
                  {/* Revenue */}
                  <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', color: 'white' }}>
                    <h3 style={{ margin: 0, opacity: 0.9 }}>{t('total_revenue', 'Total Platform Revenue')}</h3>
                    <h2 style={{ margin: '8px 0 0 0', fontSize: '2rem' }}>₹{stats.totalRevenue?.toLocaleString()}</h2>
                  </div>

                  <div className="grid">
                    {/* Most Used Services */}
                    <div className="card">
                      <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                        📈 {t('most_used_services', 'Most Used Services')}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stats.mostUsedServices?.map((m, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{m.name}</span>
                            <span className="badge badge--accepted">{m.value} {t('bookings', 'bookings')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* High Demand Services */}
                    <div className="card">
                      <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                        🔥 {t('high_demand_services', 'High Demand (Job Requests)')}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stats.highDemandServices?.map((m, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{m.name}</span>
                            <span className="badge badge--warning">{m.value} {t('requests', 'requests')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Least Used Services */}
                    <div className="card">
                      <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                        📉 {t('least_used_services', 'Least Used Services')}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stats.leastUsedServices?.map((m, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{m.name}</span>
                            <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{m.value} {t('bookings', 'bookings')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top Providers Hall of Fame */}
                  <div className="card" style={{ marginTop: 24 }}>
                    <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>🏆 {t('provider_hall_of_fame', 'Provider Hall of Fame (Top Recommended)')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {stats.topProviders?.map((p, i) => (
                        <div key={p.profileId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>#{i + 1}</div>
                            <div>
                              <h4 style={{ margin: 0 }}>{p.fullName} {p.isSuperProvider && '🏆'}</h4>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.categoryName}</span>
                            </div>
                          </div>
                          <span className="badge badge--accepted" style={{ fontSize: '0.9rem' }}>⭐ {p.averageRating} ({p.totalReviews} {t('reviews', 'reviews')})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}

               {tab === 'users' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 style={{ marginBottom: 24 }}>{t('user_management', 'User Management')} ({users.length})</h2>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>{t('label_id', 'ID')}</th>
                          <th>{t('label_email', 'Email')}</th>
                          <th>{t('label_name', 'Name')}</th>
                          <th>{t('label_role', 'Role')}</th>
                          <th>{t('label_status', 'Status')}</th>
                          <th>{t('label_actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.email}</td>
                            <td>{u.fullName}</td>
                            <td><span className="badge badge--accepted">{u.role?.replace('ROLE_', '')}</span></td>
                             <td>
                              <span className={`badge ${u.isEnabled ? 'badge--completed' : 'badge--cancelled'}`}>
                                {u.isEnabled ? t('status_active', 'ACTIVE') : t('status_disabled', 'DISABLED')}
                              </span>
                            </td>
                            <td>
                              <button className={`btn btn-sm ${u.isEnabled ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggleUser(u.id)}>
                                {u.isEnabled ? <><HiOutlineBan /> {t('btn_disable', 'Disable')}</> : <><HiOutlineCheckCircle /> {t('btn_enable', 'Enable')}</>}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

               {tab === 'verify' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 style={{ marginBottom: 24 }}>{t('provider_verification', 'Provider Verification')} ({unverified.length})</h2>
                  {unverified.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state__icon">✅</div>
                      <h3>{t('all_providers_verified', 'All providers are verified')}</h3>
                    </div>
                  ) : (
                    unverified.map(p => (
                      <div key={p.id} className="booking-card">
                        <div className="booking-card__info">
                          <h3>{p.fullName || p.email}</h3>
                          <p>{p.email} • {p.categoryName}</p>
                        </div>
                        <div className="booking-card__actions">
                          <button className="btn btn-success btn-sm" onClick={() => handleVerify(p.id)}>
                            <HiOutlineCheckCircle /> {t('btn_verify', 'Verify')}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

               {tab === 'skills' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ margin: 0 }}>{t('resident_skill_approvals', 'Resident Skill Approvals')} ({pendingSkills.length})</h2>
                    <span className="badge badge--warning">{t('requires_review', 'Requires Review')}</span>
                  </div>
                  
                  {pendingSkills.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state__icon">🌟</div>
                      <h3>{t('no_pending_skill_submissions', 'No pending skill submissions')}</h3>
                      <p>{t('all_resident_skills_processed', 'All resident skills have been processed.')}</p>
                    </div>
                  ) : (
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>{t('label_resident', 'Resident')}</th>
                            <th>{t('label_skill', 'Skill')}</th>
                            <th>{t('label_rate', 'Rate')}</th>
                            <th>{t('label_description', 'Description')}</th>
                            <th>{t('label_actions', 'Actions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingSkills.map(s => (
                            <tr key={s.id}>
                              <td><strong>{s.residentName}</strong></td>
                              <td>{s.skillName}</td>
                              <td>₹{s.price}/hr</td>
                              <td style={{ maxWidth: '300px' }}>{s.description}</td>
                              <td>
                               <button className="btn btn-success btn-sm" onClick={() => handleApproveSkill(s.id)}>
                                  <HiOutlineCheckCircle /> {t('btn_approve', 'Approve')}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

               {tab === 'jobs' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 style={{ marginBottom: 24 }}>{t('all_job_leads', 'All Platform Job Leads')} ({jobs.length})</h2>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>{t('label_id', 'ID')}</th>
                          <th>{t('label_resident', 'Resident')}</th>
                          <th>{t('label_society', 'Society')}</th>
                          <th>{t('label_category', 'Category')}</th>
                          <th>{t('label_description', 'Description')}</th>
                          <th>{t('label_price', 'Price')}</th>
                          <th>{t('label_status', 'Status')}</th>
                          <th>{t('label_provider', 'Provider')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map(j => (
                          <tr key={j.id}>
                            <td>{j.id}</td>
                            <td>{j.residentName}</td>
                            <td>{j.societyName}</td>
                            <td><span className="badge">{j.categoryName}</span></td>
                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.description}</td>
                            <td>₹{j.expectedPrice || 'N/A'}</td>
                            <td>
                              <span className={`badge ${j.status === 'OPEN' ? 'badge--warning' : 'badge--completed'}`}>
                                 {j.status}
                              </span>
                            </td>
                            <td>{j.acceptedByProviderName || <span style={{ color: 'var(--text-muted)' }}>{t('label_unassigned', 'Unassigned')}</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

               {tab === 'growth' && marketplace && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 style={{ marginBottom: 24 }}>{t('startup_growth_engine', 'Startup Growth Engine')}</h2>
                  <div className="stats-grid">
                    <div className="stat-card"><div className="stat-card__label">{t('verified_providers', 'Verified Providers')}</div><div className="stat-card__value stat-card__value--success">{marketplace.verifiedProviders}</div></div>
                    <div className="stat-card"><div className="stat-card__label">{t('emergency_providers', 'Emergency Providers')}</div><div className="stat-card__value stat-card__value--warning">{marketplace.emergencyProviders}</div></div>
                    <div className="stat-card"><div className="stat-card__label">{t('protected_bookings', 'Protected Bookings')}</div><div className="stat-card__value stat-card__value--primary">{marketplace.protectedBookings}</div></div>
                    <div className="stat-card"><div className="stat-card__label">{t('completed_jobs', 'Completed Jobs')}</div><div className="stat-card__value stat-card__value--accent">{marketplace.completedBookings}</div></div>
                    <div className="stat-card"><div className="stat-card__label">{t('platform_commission', 'Platform Commission')}</div><div className="stat-card__value stat-card__value--success">₹{revenue?.platformCommission || 0}</div></div>
                    <div className="stat-card"><div className="stat-card__label">{t('open_disputes', 'Open Disputes')}</div><div className="stat-card__value stat-card__value--warning">{revenue?.disputes || 0}</div></div>
                  </div>

                  <div className="grid" style={{ marginTop: 24 }}>
                    <div className="card">
                      <h3 style={{ marginBottom: 16 }}>{t('revenue_levers', 'Revenue Levers')}</h3>
                      {marketplace.revenueLevers?.map(item => (
                        <div key={item.name} style={{ borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
                          <strong>{item.name} - {item.price}</strong>
                          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>{item.value}</p>
                        </div>
                      ))}
                     </div>
                    <div className="card">
                      <h3 style={{ marginBottom: 16 }}>{t('group_deal_pipeline', 'Group Deal Pipeline')}</h3>
                      {marketplace.groupDeals?.map(deal => (
                        <div key={deal.title} style={{ borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
                          <strong>{deal.title}</strong>
                          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>{deal.category} • {deal.targetHomes} homes • {deal.saving}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

               {tab === 'grievances' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 style={{ marginBottom: 24 }}>{t('user_grievances_title', 'User Grievances & Password Resets')}</h2>
                  {grievances.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state__icon">📩</div>
                      <h3>{t('no_open_grievances', 'No open grievances')}</h3>
                    </div>
                  ) : (
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>{t('label_id', 'ID')}</th>
                            <th>{t('label_user', 'User')}</th>
                            <th>{t('label_type', 'Type')}</th>
                            <th>{t('label_description', 'Description')}</th>
                            <th>{t('label_status', 'Status')}</th>
                            <th>{t('label_actions', 'Actions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grievances.map(g => (
                            <tr key={g.id}>
                              <td>{g.id}</td>
                              <td>{g.userEmail}</td>
                              <td><span className="badge">{g.type}</span></td>
                              <td style={{ maxWidth: '300px' }}>{g.description}</td>
                              <td>
                                <span className={`badge ${g.status === 'RESOLVED' ? 'badge--completed' : 'badge--warning'}`}>
                                  {g.status}
                                </span>
                              </td>
                              <td>
                               {g.status === 'OPEN' && (
                                  <button className="btn btn-primary btn-sm" onClick={() => handleResolveGrievance(g.id)}>
                                    {t('btn_resolve_reset', 'Resolve & Reset Pwd')}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

               {tab === 'settings' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 style={{ marginBottom: 24 }}>{t('platform_settings', 'Platform Settings')}</h2>
                  
                  <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ margin: 0 }}>{t('automated_defaults', 'Automated Default Providers')}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                          {t('automated_defaults_desc', 'Manage the fallback "Default Person" accounts for each service category.')}
                        </p>
                      </div>
                       <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={handleSyncDefaults} disabled={loading}>
                          {loading ? t('syncing', 'Syncing...') : t('btn_sync_accounts', 'Sync Accounts')}
                        </button>
                        <button 
                          className={`btn btn-sm ${defaultEnabled ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleDefaults(!defaultEnabled)}
                        >
                          {defaultEnabled ? t('btn_disable_all', 'Disable All') : t('btn_enable_all', 'Enable All')}
                        </button>
                      </div>
                    </div>
                     <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <strong>{t('label_status', 'Status')}:</strong> {defaultEnabled ? <span style={{ color: 'var(--success)' }}>{t('label_active_visible', 'Active (Visible to users)')}</span> : <span style={{ color: 'var(--danger)' }}>{t('label_inactive_hidden', 'Inactive (Hidden)')}</span>}
                    </div>
                  </div>

                  <div className="card">
                    <h3>{t('payment_config', 'Payment Configuration')}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                      {t('payment_config_desc', 'Update the QR code image URL that residents see when paying online.')}
                    </p>
                    <div className="form-group">
                      <label>{t('upload_qr_label', 'Upload QR Code Image')}</label>
                      <input 
                        type="file"
                        className="form-input" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const base64String = reader.result;
                              setQrUrl(base64String);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                       <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        {t('upload_qr_hint', 'Supported formats: PNG, JPG, SVG. Max size: 2MB.')}
                      </p>
                    </div>
                    <button className="btn btn-primary" onClick={async () => {
                      try {
                        if (!qrUrl) { toast.error(t('select_image_first', 'Please select an image first')); return; }
                        await updateSetting('payment_qr_url', qrUrl);
                        toast.success(t('qr_updated_success', 'QR Code updated successfully!'));
                      } catch { toast.error(t('failed_update_settings', 'Failed to update settings')); }
                    }}>
                      {t('btn_save_qr', 'Save QR Code')}
                    </button>

                    <div style={{ marginTop: '24px', textAlign: 'center', padding: '20px', background: 'var(--bg)', borderRadius: '16px', boxShadow: 'var(--neu-inset)' }}>
                      <p style={{ fontSize: '0.85rem', marginBottom: '12px' }}>{t('qr_preview', 'QR Preview')}:</p>
                      {qrUrl ? (
                        <img src={qrUrl} alt="QR Preview" style={{ width: '180px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                      ) : (
                        <p style={{ color: 'var(--text-muted)' }}>{t('no_image_uploaded', 'No image uploaded yet')}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
