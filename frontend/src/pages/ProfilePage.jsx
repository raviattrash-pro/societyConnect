import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateResidentProfile, updateProviderProfile, getCategories, getMyFavorites, createJob, getMyJobs, getJobLeads, acceptJob, changePassword } from '../services/api';
import { HiOutlineStar } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, loadProfile } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'favorites', 'jobs'
  const [favorites, setFavorites] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobForm, setJobForm] = useState({ categoryId: '', description: '', expectedPrice: '' });

  const [residentForm, setResidentForm] = useState({ fullName: '', phone: '', societyName: '', address: '', flatNumber: '', gateInstructions: '', preferredTimings: '', societyCode: '' });
  const [providerForm, setProviderForm] = useState({ fullName: '', phone: '', categoryId: '', experienceYears: '', basePrice: '', bio: '', availability: 'AVAILABLE', idProofUrl: '', addressProofUrl: '', servicePackages: '', portfolioUrls: '', availableSlots: '', autoReply: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      if (user.role === 'ROLE_RESIDENT' || user.role === 'ROLE_ADMIN') {
        setResidentForm({ fullName: user.fullName || '', phone: user.phone || '', societyName: user.societyName || '', address: user.address || '', flatNumber: user.flatNumber || '', gateInstructions: user.gateInstructions || '', preferredTimings: user.preferredTimings || '', societyCode: user.societyCode || '' });
        if (activeTab === 'favorites') {
          getMyFavorites().then(res => setFavorites(res.data)).catch(() => {});
        } else if (activeTab === 'jobs') {
          getMyJobs().then(res => setJobs(res.data)).catch(() => {});
          getCategories().then(res => setCategories(res.data)).catch(() => {});
        }
      } else {
        setProviderForm({ fullName: user.fullName || '', phone: user.phone || '', categoryId: user.categoryId || '', experienceYears: user.experienceYears || '', basePrice: user.basePrice || '', bio: user.bio || '', availability: user.availability || 'AVAILABLE', idProofUrl: user.idProofUrl || '', addressProofUrl: user.addressProofUrl || '', servicePackages: user.servicePackages || '', portfolioUrls: user.portfolioUrls || '', availableSlots: user.availableSlots || '', autoReply: user.autoReply || '' });
        getCategories().then(res => setCategories(res.data)).catch(() => {});
        if (activeTab === 'jobs') {
          getJobLeads().then(res => setJobs(res.data)).catch(() => {});
        }
      }
    }
  }, [user, activeTab]);

  const handleResident = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await updateResidentProfile(residentForm); await loadProfile(); toast.success('Profile updated!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleProvider = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await updateProviderProfile({ ...providerForm, categoryId: parseInt(providerForm.categoryId), experienceYears: parseInt(providerForm.experienceYears), basePrice: parseFloat(providerForm.basePrice) });
      await loadProfile(); toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await createJob({ ...jobForm, expectedPrice: parseFloat(jobForm.expectedPrice) || null, categoryId: parseInt(jobForm.categoryId) });
      toast.success('Job posted successfully!');
      setJobForm({ categoryId: '', description: '', expectedPrice: '' });
      const res = await getMyJobs();
      setJobs(res.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleAcceptJob = async (jobId) => {
    try {
      await acceptJob(jobId);
      toast.success('Job accepted! Contact the resident.');
      const res = await getJobLeads();
      setJobs(res.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await changePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      await loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="spinner" />;

  return (
    <div className="page container" style={{ maxWidth: '600px' }}>
      {user.mustChangePassword && (
        <div className="card" style={{ borderLeft: '4px solid var(--warning)', marginBottom: '24px', background: 'rgba(245, 158, 11, 0.1)' }}>
          <h3 style={{ color: '#b45309', margin: 0 }}>⚠️ Action Required: Change Your Password</h3>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>An admin has reset your password. For security, you must set a new password before continuing.</p>
        </div>
      )}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 style={{ marginBottom: '8px' }}>{t('my_profile', 'My Profile')}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>{user.email} • {user.role === 'ROLE_RESIDENT' ? t('label_resident', 'Resident') : user.role === 'ROLE_ADMIN' ? t('label_admin', 'Administrator') : t('label_provider', 'Service Provider')}</p>

        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '32px', 
          background: 'var(--bg-secondary)', 
          padding: '6px', 
          borderRadius: '16px',
          boxShadow: 'var(--neu-inset)',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} 
            onClick={() => setActiveTab('profile')}
          >
            {t('profile_details', 'Profile Details')}
          </button>
          
          {user.role === 'ROLE_RESIDENT' || user.role === 'ROLE_ADMIN' ? (
            <>
              <button 
                className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`} 
                onClick={() => setActiveTab('favorites')}
              >
                {t('saved_providers', 'Saved Providers')} ❤️
              </button>
              <button 
                className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`} 
                onClick={() => setActiveTab('jobs')}
              >
                {t('post_job', 'Post a Job')} 💼
              </button>
            </>
          ) : (
            <button 
              className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`} 
              onClick={() => setActiveTab('jobs')}
            >
              {t('job_leads', 'Job Leads')} 🎯
            </button>
          )}
          
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} 
            onClick={() => setActiveTab('security')}
          >
            {t('security', 'Security')} 🔐
          </button>
        </div>

        <style>{`
          .tab-btn {
            flex: 1;
            padding: 12px 20px;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            border-radius: 12px;
            transition: all 0.3s ease;
            white-space: nowrap;
          }
          .tab-btn:hover {
            color: var(--text);
            background: rgba(255,255,255,0.05);
          }
          .tab-btn.active {
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 15px var(--primary-glow);
          }
        `}</style>

        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="card">
            <h2 style={{ marginBottom: '16px' }}>{t('change_password_title', 'Change Password')}</h2>
            <div className="form-group"><label>{t('old_password', 'Old Password')}</label><input type="password" placeholder="••••••••" className="form-input" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} required /></div>
            <div className="form-group"><label>{t('new_password', 'New Password')}</label><input type="password" placeholder="••••••••" className="form-input" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} required minLength="6" /></div>
            <div className="form-group"><label>{t('confirm_password', 'Confirm New Password')}</label><input type="password" placeholder="••••••••" className="form-input" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} required minLength="6" /></div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? t('btn_updating', 'Updating...') : t('btn_update_password', 'Update Password')}</button>
          </form>
        )}

        {activeTab === 'profile' && (
          user.role === 'ROLE_RESIDENT' || user.role === 'ROLE_ADMIN' ? (
            <form onSubmit={handleResident} className="card">
              <div className="form-group"><label>{t('full_name', 'Full Name')}</label><input className="form-input" value={residentForm.fullName} onChange={e => setResidentForm({...residentForm, fullName: e.target.value})} required /></div>
              <div className="form-group"><label>{t('phone_label', 'Phone')}</label><input className="form-input" value={residentForm.phone} onChange={e => setResidentForm({...residentForm, phone: e.target.value})} required /></div>
              <div className="form-group"><label>{t('society_name', 'Society Name')}</label><input className="form-input" value={residentForm.societyName} onChange={e => setResidentForm({...residentForm, societyName: e.target.value})} required /></div>
              <div className="form-group"><label>{t('address_label', 'Address')}</label><textarea className="form-input" value={residentForm.address} onChange={e => setResidentForm({...residentForm, address: e.target.value})} /></div>
              <div className="form-group"><label>{t('flat_number', 'Flat / House Number')}</label><input className="form-input" value={residentForm.flatNumber} onChange={e => setResidentForm({...residentForm, flatNumber: e.target.value})} placeholder="A-1204" /></div>
              <div className="form-group"><label>{t('gate_instructions', 'Gate Instructions')}</label><textarea className="form-input" value={residentForm.gateInstructions} onChange={e => setResidentForm({...residentForm, gateInstructions: e.target.value})} placeholder={t('gate_instructions_placeholder', 'Entry gate, intercom, parking instructions...')} /></div>
              <div className="form-group"><label>{t('preferred_timings', 'Preferred Service Timings')}</label><input className="form-input" value={residentForm.preferredTimings} onChange={e => setResidentForm({...residentForm, preferredTimings: e.target.value})} placeholder={t('preferred_timings_placeholder', 'Weekdays after 6 PM')} /></div>
              <div className="form-group"><label>{t('society_invite_code', 'Society Invite Code')}</label><input className="form-input" value={residentForm.societyCode} onChange={e => setResidentForm({...residentForm, societyCode: e.target.value})} placeholder="RWA invite code" /></div>
              <div className="card" style={{ padding: '14px', marginBottom: '20px', background: 'var(--bg-secondary)' }}>
                <strong>{t('loyalty_referral', 'Loyalty & Referral')}</strong>
                <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)' }}>{t('points_label', 'Points')}: {user.loyaltyPoints || 0} • {t('referral_label', 'Referral')}: {user.referralCode || t('referral_desc', 'Save profile to generate')}</p>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? t('btn_saving', 'Saving...') : t('btn_save_profile', 'Save Profile')}</button>
            </form>
          ) : (
            <form onSubmit={handleProvider} className="card">
              <div className="form-group"><label>Full Name</label><input className="form-input" value={providerForm.fullName} onChange={e => setProviderForm({...providerForm, fullName: e.target.value})} required /></div>
              <div className="form-group"><label>Phone</label><input className="form-input" value={providerForm.phone} onChange={e => setProviderForm({...providerForm, phone: e.target.value})} required /></div>
              <div className="form-group"><label>Service Category</label>
                <select className="form-input" value={providerForm.categoryId} onChange={e => setProviderForm({...providerForm, categoryId: e.target.value})} required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Experience (Years)</label><input type="number" className="form-input" value={providerForm.experienceYears} onChange={e => setProviderForm({...providerForm, experienceYears: e.target.value})} /></div>
              <div className="form-group"><label>Base Price (₹)</label><input type="number" className="form-input" value={providerForm.basePrice} onChange={e => setProviderForm({...providerForm, basePrice: e.target.value})} /></div>
              <div className="form-group"><label>Bio</label><textarea className="form-input" value={providerForm.bio} onChange={e => setProviderForm({...providerForm, bio: e.target.value})} placeholder="Describe your expertise..." /></div>
              <div className="card" style={{ padding: '14px', marginBottom: '20px', background: 'var(--bg-secondary)' }}>
                <strong>KYC Status:</strong> {user.kycStatus || 'NOT_SUBMITTED'} • {user.rwaApproved ? 'Approved by RWA/Admin' : 'Awaiting RWA/Admin approval'}
              </div>
              <div className="form-group"><label>ID Proof URL / Base64</label><input className="form-input" value={providerForm.idProofUrl} onChange={e => setProviderForm({...providerForm, idProofUrl: e.target.value})} placeholder="Paste uploaded ID proof URL" /></div>
              <div className="form-group"><label>Address Proof URL / Base64</label><input className="form-input" value={providerForm.addressProofUrl} onChange={e => setProviderForm({...providerForm, addressProofUrl: e.target.value})} placeholder="Paste uploaded address proof URL" /></div>
              <div className="form-group"><label>Service Packages</label><textarea className="form-input" value={providerForm.servicePackages} onChange={e => setProviderForm({...providerForm, servicePackages: e.target.value})} placeholder="Basic: Rs 299, Standard: Rs 499, Premium: Rs 899" /></div>
              <div className="form-group"><label>Portfolio Image URLs</label><textarea className="form-input" value={providerForm.portfolioUrls} onChange={e => setProviderForm({...providerForm, portfolioUrls: e.target.value})} placeholder="One image URL per line" /></div>
              <div className="form-group"><label>Available Slots</label><textarea className="form-input" value={providerForm.availableSlots} onChange={e => setProviderForm({...providerForm, availableSlots: e.target.value})} placeholder="Today 6 PM, Tomorrow 10 AM, Sunday 4 PM" /></div>
              <div className="form-group"><label>Auto Reply Template</label><textarea className="form-input" value={providerForm.autoReply} onChange={e => setProviderForm({...providerForm, autoReply: e.target.value})} placeholder="Thanks for booking. I will call before arrival." /></div>
              <div className="form-group"><label>Availability</label>
                <select className="form-input" value={providerForm.availability} onChange={e => setProviderForm({...providerForm, availability: e.target.value})}>
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="EMERGENCY_ONLY">Emergency Only</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
            </form>
          )
        )}

        {activeTab === 'favorites' && (
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>{t('favorite_providers', 'My Favorite Providers')}</h2>
            {favorites.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{t('no_favorites_hint', "You haven't saved any providers yet. ❤️ them to see them here!")}</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {favorites.map(fav => (
                  <Link key={fav.id} to={`/provider/${fav.providerId}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
                    <div><h4 style={{ margin: 0 }}>{t(fav.providerName.trim().toLowerCase().replace(/ /g, '_'), fav.providerName)}</h4><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t(fav.categoryName.trim().toLowerCase().replace(/ /g, '_'), fav.categoryName)}</span></div>
                    {fav.averageRating && <span className="badge badge--accepted" style={{ fontSize: '0.8rem' }}><HiOutlineStar /> {fav.averageRating}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          user.role === 'ROLE_RESIDENT' || user.role === 'ROLE_ADMIN' ? (
            <div className="card">
              <h2 style={{ marginBottom: '16px' }}>{t('post_custom_job', 'Post a Custom Job')}</h2>
              <form onSubmit={handleJobSubmit} style={{ marginBottom: '32px' }}>
                <div className="form-group">
                  <label>{t('service_category', 'Service Category')}</label>
                  <select className="form-input" value={jobForm.categoryId} onChange={e => setJobForm({...jobForm, categoryId: e.target.value})} required>
                    <option value="">{t('select_category', 'Select category')}</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{t(c.name.trim().toLowerCase().replace(/ /g, '_'), c.name)}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>{t('expected_price', 'Expected Price (₹) - Optional')}</label><input type="number" className="form-input" value={jobForm.expectedPrice} onChange={e => setJobForm({...jobForm, expectedPrice: e.target.value})} /></div>
                <div className="form-group"><label>{t('description', 'Description')}</label><textarea className="form-input" placeholder={t('job_desc_placeholder', 'E.g. My AC is leaking water...')} value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} required /></div>
                <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>{loading ? t('btn_posting', 'Posting...') : t('btn_post_job', 'Post Job Request')}</button>
              </form>

              <h3 style={{ marginBottom: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>{t('my_posted_jobs', 'My Posted Jobs')}</h3>
              {jobs.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{t('no_jobs_posted', 'No jobs posted yet.')}</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {jobs.map(job => (
                    <div key={job.id} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0 }}>{t(job.categoryName.trim().toLowerCase().replace(/ /g, '_'), job.categoryName)}</h4>
                        <span className={`badge badge--${job.status === 'OPEN' ? 'warning' : 'success'}`} style={{ fontSize: '0.75rem' }}>{t(`status_${job.status.toLowerCase()}`, job.status)}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{job.description}</p>
                      {job.expectedPrice && <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}><strong>{t('expected_label', 'Expected')}:</strong> ₹{job.expectedPrice}</div>}
                      {job.status === 'ACCEPTED' && <div style={{ fontSize: '0.85rem', color: 'var(--success)' }}>{t('accepted_by', 'Accepted by')}: <strong>{job.acceptedByProviderName}</strong></div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <h2 style={{ marginBottom: '16px' }}>Local Job Leads</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Residents looking for your specific service category right now.</p>
              {jobs.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No open jobs in your category currently.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {jobs.map(job => (
                    <div key={job.id} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ margin: 0 }}>{job.residentName} <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>({job.societyName})</span></h4>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(job.createdAt).toLocaleString()}</span>
                        </div>
                        {job.expectedPrice && <span className="badge badge--success" style={{ height: 'fit-content' }}>₹{job.expectedPrice}</span>}
                      </div>
                      <p style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>"{job.description}"</p>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAcceptJob(job.id)}>Accept Job</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </motion.div>
    </div>
  );
}
