import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getMyBookings, getMyServices, createService, deleteService, updateBookingStatus, updateEta, updateProviderLocation, getMyProfile, updateBusinessSettings } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineCheck, HiOutlineX, HiOutlineClock, HiOutlineLocationMarker, HiOutlineTrendingUp, HiOutlineArchive, HiOutlineSparkles } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import { getProviderEarnings } from '../services/api';

export default function ProviderDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddService, setShowAddService] = useState(false);
  const [serviceForm, setServiceForm] = useState({ serviceName: '', description: '', price: '' });
  const [etaModal, setEtaModal] = useState(null);
  const [etaInput, setEtaInput] = useState('');
  const [trackingId, setTrackingId] = useState(null);
  const [businessForm, setBusinessForm] = useState({ premiumTier: 'FREE', emergencyEnabled: false, protectionEligible: true, responseTimeMinutes: 45, availableSlots: '', servicePackages: '', portfolioUrls: '', autoReply: '', isGreen: false, ecoPractices: '' });

  useEffect(() => { 
    fetchData(); 
    return () => { if (trackingId) navigator.geolocation.clearWatch(trackingId); };
  }, []);

  const handleStartJourney = (booking) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    if (trackingId) {
      navigator.geolocation.clearWatch(trackingId);
      setTrackingId(null);
      toast.success("Stopped sharing location");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        updateProviderLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {});
      },
      (err) => { toast.error("Error getting location: " + err.message); },
      { enableHighAccuracy: true }
    );
    
    setTrackingId(watchId);
    toast.success("Location sharing started! Customer can now track you live.");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, sRes, pRes] = await Promise.all([getMyBookings(), getMyServices(), getMyProfile()]);
      setBookings(bRes.data); setServices(sRes.data);
      setBusinessForm({
        premiumTier: pRes.data.premiumTier || 'FREE',
        emergencyEnabled: !!pRes.data.emergencyEnabled,
        protectionEligible: pRes.data.protectionEligible !== false,
        responseTimeMinutes: pRes.data.responseTimeMinutes || 45,
        availableSlots: pRes.data.availableSlots || '',
        servicePackages: pRes.data.servicePackages || '',
        portfolioUrls: pRes.data.portfolioUrls || '',
        autoReply: pRes.data.autoReply || '',
        isGreen: !!pRes.data.isGreen,
        ecoPractices: pRes.data.ecoPractices || ''
      });
      const eRes = await getProviderEarnings();
      setEarnings(eRes.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await createService({ ...serviceForm, price: parseFloat(serviceForm.price) });
      toast.success('Service added!'); setShowAddService(false);
      setServiceForm({ serviceName: '', description: '', price: '' }); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    try { await deleteService(id); toast.success('Deleted'); fetchData(); }
    catch (err) { toast.error('Failed'); }
  };

  const handleStatus = async (id, status) => {
    try { await updateBookingStatus(id, status); toast.success(`Booking ${status.toLowerCase()}`); fetchData(); }
    catch (err) { toast.error('Failed'); }
  };

  const handleUpdateEta = async (e) => {
    e.preventDefault();
    try {
      await updateEta(etaModal.id, etaInput);
      toast.success('ETA updated!'); setEtaModal(null); fetchData();
    } catch (err) { toast.error('Failed to update ETA'); }
  };

  const handleBusinessSettings = async (e) => {
    e.preventDefault();
    try {
      await updateBusinessSettings({
        ...businessForm,
        responseTimeMinutes: parseInt(businessForm.responseTimeMinutes, 10)
      });
      toast.success('Business growth settings updated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    }
  };

  const pending = bookings.filter(b => b.status === 'PENDING').length;
  const completed = bookings.filter(b => b.status === 'COMPLETED').length;

  return (
    <div className="page container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 style={{ marginBottom: '4px' }}>Provider Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {user?.fullName || 'Complete your profile'} {user?.isVerified && '✅ Verified'}
        </p>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-card__label">My Services</div><div className="stat-card__value stat-card__value--primary">{services.length}</div></div>
          <div className="stat-card"><div className="stat-card__label">Pending Requests</div><div className="stat-card__value stat-card__value--warning">{pending}</div></div>
          <div className="stat-card"><div className="stat-card__label">Completed</div><div className="stat-card__value stat-card__value--success">{completed}</div></div>
          <div className="stat-card"><div className="stat-card__label">Rating</div><div className="stat-card__value stat-card__value--accent">{user?.averageRating ? `⭐ ${user.averageRating}` : 'N/A'}</div></div>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '32px', 
          background: 'var(--bg-secondary)', 
          padding: '6px', 
          borderRadius: '16px',
          boxShadow: 'var(--neu-inset)',
          width: 'fit-content'
        }}>
          <button 
            className={`tab-btn ${tab === 'bookings' ? 'active' : ''}`} 
            onClick={() => setTab('bookings')}
          >
            Booking Requests
          </button>
          <button 
            className={`tab-btn ${tab === 'services' ? 'active' : ''}`} 
            onClick={() => setTab('services')}
          >
            My Services
          </button>
          <button 
            className={`tab-btn ${tab === 'growth' ? 'active' : ''}`} 
            onClick={() => setTab('growth')}
          >
            Growth & Analytics
          </button>
          <button 
            className={`tab-btn ${tab === 'inventory' ? 'active' : ''}`} 
            onClick={() => setTab('inventory')}
          >
            Inventory
          </button>
        </div>

        <style>{`
          .tab-btn {
            padding: 12px 24px;
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

        {loading ? <div className="spinner" /> : tab === 'bookings' ? (
          bookings.length === 0 ? (
            <div className="empty-state"><div className="empty-state__icon">📋</div><h3>No bookings yet</h3></div>
          ) : bookings.map(b => (
            <div key={b.id} className="booking-card">
              <div className="booking-card__info">
                <h3>{b.serviceName}</h3>
                <p>Customer: {b.residentName} • {b.bookingDate} at {b.bookingTime} • ₹{b.totalPrice}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {b.protectedBooking && <span className="badge badge--success">Protected</span>}
                  {b.emergencyBooking && <span className="badge badge--warning">Emergency priority</span>}
                  {b.platformFee > 0 && <span className="badge">Platform fee ₹{Number(b.platformFee).toFixed(0)}</span>}
                </div>
                {b.bookingDetails && (
                  <div style={{ marginTop: '10px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.9rem' }}>
                    <strong>Details:</strong>
                    {(() => {
                      try {
                        const d = JSON.parse(b.bookingDetails);
                        return (
                          <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                            {d.itemList && <div>🛒 Items: {d.itemList}</div>}
                            {d.consultationType && <div>💊 Medical: {d.consultationType} {d.serviceDetails && `(${d.serviceDetails})`}</div>}
                            {d.subject && <div>📚 Subject: {d.subject}</div>}
                            {d.locationFrom && <div>📍 Route: {d.locationFrom} ➡️ {d.locationTo}</div>}
                            {d.problemDescription && <div>🛠️ Issue: {d.problemDescription}</div>}
                            {d.serviceDetails && !d.consultationType && <div>📝 Note: {d.serviceDetails}</div>}
                          </div>
                        );
                      } catch { return <span> {b.bookingDetails}</span>; }
                    })()}
                  </div>
                )}
              </div>
              <div className="booking-card__actions">
                <span className={`badge badge--${b.status.toLowerCase()}`}>{b.status}</span>
                {b.status === 'PENDING' && <>
                  <button className="btn btn-sm btn-success" onClick={() => handleStatus(b.id, 'ACCEPTED')}><HiOutlineCheck /></button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleStatus(b.id, 'CANCELLED')}><HiOutlineX /></button>
                </>}
                {b.status === 'ACCEPTED' && <>
                  <button 
                    className={`btn btn-sm ${trackingId ? 'btn-danger' : 'btn-ghost'}`} 
                    title={trackingId ? 'Stop Sharing Location' : 'Start Journey & Share Location'} 
                    onClick={() => handleStartJourney(b)}
                  >
                    <HiOutlineLocationMarker />
                  </button>
                  <button className="btn btn-sm btn-ghost" title="Set ETA" onClick={() => { setEtaModal(b); setEtaInput(b.providerEta || ''); }}><HiOutlineClock /></button>
                  <button className="btn btn-sm btn-success" onClick={() => handleStatus(b.id, 'COMPLETED')}>Complete</button>
                </>}
                {b.status === 'ACCEPTED' && <button className="btn btn-sm btn-secondary" onClick={() => handleStatus(b.id, 'ON_THE_WAY')}>On Way</button>}
                {b.status === 'ON_THE_WAY' && <button className="btn btn-sm btn-secondary" onClick={() => handleStatus(b.id, 'ARRIVED')}>Arrived</button>}
                {b.status === 'ARRIVED' && <button className="btn btn-sm btn-success" onClick={() => handleStatus(b.id, 'COMPLETED')}>Complete</button>}
              </div>
              {b.providerEta && b.status === 'ACCEPTED' && (
                <div style={{ width: '100%', marginTop: '10px', fontSize: '0.85rem', color: 'var(--primary-dark)' }}>
                  📍 ETA set: <strong>{b.providerEta}</strong>
                </div>
              )}
            </div>
          ))
        ) : tab === 'services' ? (
          <>
            <button className="btn btn-primary" style={{ marginBottom: '16px' }} onClick={() => setShowAddService(!showAddService)}><HiOutlinePlus /> Add Service</button>
            {showAddService && (
              <motion.form className="card" style={{ marginBottom: '20px' }} onSubmit={handleAddService} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                <div className="form-group"><label>Service Name</label><input className="form-input" value={serviceForm.serviceName} onChange={e => setServiceForm({...serviceForm, serviceName: e.target.value})} required placeholder="e.g. Tap Leakage Repair" /></div>
                <div className="form-group"><label>Description</label><textarea className="form-input" value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} /></div>
                <div className="form-group"><label>Price (₹)</label><input type="number" className="form-input" value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: e.target.value})} required /></div>
                <button className="btn btn-primary">Save Service</button>
              </motion.form>
            )}
            {services.length === 0 ? (
              <div className="empty-state"><div className="empty-state__icon">🛠️</div><h3>No services listed</h3></div>
            ) : (
              <div className="services-grid">
                {services.map(s => (
                  <div key={s.id} className="service-card">
                    <h3 className="service-card__name">{s.serviceName}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.description}</p>
                    <div className="service-card__footer">
                      <span className="service-card__price">₹{s.price}</span>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteService(s.id)}><HiOutlineTrash /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : tab === 'growth' ? (
          <div className="grid" style={{ alignItems: 'start' }}>
            <form className="card" onSubmit={handleBusinessSettings}>
              <h2 style={{ marginBottom: '8px' }}>Provider Growth Engine</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Tune how your profile earns trust, urgent bookings, and premium visibility.</p>
              <div className="form-group">
                <label>Premium Tier</label>
                <select className="form-input" value={businessForm.premiumTier} onChange={e => setBusinessForm({...businessForm, premiumTier: e.target.value})}>
                  <option value="FREE">Free</option>
                  <option value="PRO">Pro - ₹499/month</option>
                  <option value="ELITE">Elite - ₹999/month</option>
                </select>
              </div>
              <div className="form-group">
                <label>Average Response Time (minutes)</label>
                <input type="number" className="form-input" min="5" max="240" value={businessForm.responseTimeMinutes} onChange={e => setBusinessForm({...businessForm, responseTimeMinutes: e.target.value})} />
              </div>
              <label style={{ display: 'block', marginBottom: '12px' }}>
                <input type="checkbox" checked={businessForm.emergencyEnabled} onChange={e => setBusinessForm({...businessForm, emergencyEnabled: e.target.checked})} style={{ marginRight: '8px' }} />
                Accept emergency priority bookings
              </label>
              <label style={{ display: 'block', marginBottom: '20px' }}>
                <input type="checkbox" checked={businessForm.protectionEligible} onChange={e => setBusinessForm({...businessForm, protectionEligible: e.target.checked})} style={{ marginRight: '8px' }} />
                Offer protected booking guarantee
              </label>
              <div className="form-group"><label>Available Slots</label><textarea className="form-input" value={businessForm.availableSlots} onChange={e => setBusinessForm({...businessForm, availableSlots: e.target.value})} placeholder="Today 6 PM, Tomorrow 10 AM" /></div>
              <div className="form-group"><label>Service Packages</label><textarea className="form-input" value={businessForm.servicePackages} onChange={e => setBusinessForm({...businessForm, servicePackages: e.target.value})} placeholder="Basic / Standard / Premium packages" /></div>
              <div className="form-group"><label>Portfolio URLs</label><textarea className="form-input" value={businessForm.portfolioUrls} onChange={e => setBusinessForm({...businessForm, portfolioUrls: e.target.value})} placeholder="One image URL per line" /></div>
              <div className="form-group"><label>Auto Reply</label><textarea className="form-input" value={businessForm.autoReply} onChange={e => setBusinessForm({...businessForm, autoReply: e.target.value})} placeholder="Thanks for booking. I will call before arrival." /></div>
              
              <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)', marginBottom: '20px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', marginBottom: '8px', fontSize: '1rem' }}><HiOutlineSparkles /> Eco-Friendly Certification</h3>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  <input type="checkbox" checked={businessForm.isGreen} onChange={e => setBusinessForm({...businessForm, isGreen: e.target.checked})} style={{ marginRight: '8px' }} />
                  I use eco-friendly supplies and sustainable practices
                </label>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.8rem' }}>Eco Practices Description</label>
                  <input className="form-input" value={businessForm.ecoPractices} onChange={e => setBusinessForm({...businessForm, ecoPractices: e.target.value})} placeholder="e.g. Non-toxic sprays, 100% biodegradable cleaners" />
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }}>Save Growth Settings</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white' }}>
                <h2 style={{ marginBottom: '16px', color: 'white' }}>Earnings Analytics</h2>
                {earnings ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8' }}>Total Revenue</span>
                      <strong style={{ fontSize: '1.5rem', color: '#10b981' }}>₹{earnings.totalEarnings}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8' }}>Growth (Monthly)</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>↑ {earnings.growthPercent}%</span>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Top Services</span>
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(earnings.topServices).map(([name, count]) => (
                          <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span>{name}</span>
                            <strong>{count} bookings</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : <p>Loading analytics...</p>}
              </div>
              <div className="card">
                <h2 style={{ marginBottom: '16px' }}>How You Earn More</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div><strong>Pro visibility</strong><p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>Better placement when users sort by trust and premium providers.</p></div>
                  <div><strong>Emergency leads</strong><p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>Urgent jobs carry a priority fee and higher conversion intent.</p></div>
                  <div><strong>Protected jobs</strong><p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>Guarantee-backed services help residents book faster.</p></div>
                </div>
              </div>
            </div>
          </div>
        ) : tab === 'inventory' ? (
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}><HiOutlineArchive /> Digital Inventory Manager</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Track your spare parts (taps, wires, valves) and let customers pre-pay for them.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              <button className="card" style={{ border: '2px dashed var(--border)', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '24px' }}>
                <HiOutlinePlus style={{ fontSize: '24px' }} />
                <span>Add Item</span>
              </button>
              {/* Mock items */}
              <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>Copper Wire</strong> <HiOutlineTrash style={{ color: 'var(--danger)', cursor: 'pointer' }} /></div>
                <div style={{ fontSize: '1.2rem', margin: '8px 0' }}>₹150</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Qty: 10 meters</div>
              </div>
              <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>Ball Valve</strong> <HiOutlineTrash style={{ color: 'var(--danger)', cursor: 'pointer' }} /></div>
                <div style={{ fontSize: '1.2rem', margin: '8px 0' }}>₹450</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Qty: 4 pcs</div>
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>

      {etaModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setEtaModal(null)}>
          <motion.div className="auth-card" onClick={e => e.stopPropagation()} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <h1>Update Arrival Time</h1>
            <p>Inform customer how much time you'll take to reach</p>
            <form onSubmit={handleUpdateEta}>
              <div className="form-group">
                <label>ETA (e.g. 15 mins, 1 hour)</label>
                <input className="form-input" value={etaInput} onChange={e => setEtaInput(e.target.value)} required placeholder="15 mins" />
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }}>Update ETA</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
