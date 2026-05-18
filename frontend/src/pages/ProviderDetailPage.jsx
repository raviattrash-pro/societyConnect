import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getProviderDetail, createBooking, toggleFavorite, checkFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiOutlineStar, HiOutlineCalendar, HiOutlineBadgeCheck, HiOutlineLocationMarker, HiOutlineBriefcase, HiHeart, HiOutlineHeart } from 'react-icons/hi';

import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
export default function ProviderDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [bookingModal, setBookingModal] = useState(null);
  const [bookingForm, setBookingForm] = useState({ bookingDate: '', bookingTime: '', protectedBooking: true, emergencyBooking: false, instantBooking: false, paymentGateway: 'UPI' });

  useEffect(() => {
    if (id === '0') {
      setLoading(false);
      return;
    }
    fetchProviderDetail();
    if (user?.role === 'ROLE_RESIDENT') {
      checkFavorite(id).then(res => setIsFav(res.data)).catch(() => {});
    }
  }, [id, user]);

  const handleToggleFav = async () => {
    try {
      await toggleFavorite(id);
      setIsFav(!isFav);
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
    } catch {
      toast.error('Failed to update favorites');
    }
  };

  const fetchProviderDetail = async () => {
    try {
      const res = await getProviderDetail(id);
      setProvider(res.data);
    } catch (err) {
      toast.error('Failed to load provider details');
    } finally {
      setLoading(false);
    }
  };

  const renderExtraFields = () => {
    const cat = provider.categoryName || '';
    
    if (cat.includes('Grocery')) {
      return (
        <div className="form-group">
          <label>List of Items (Groceries) 🛒</label>
          <textarea 
            className="form-input" 
            placeholder="E.g. 2kg Rice, 1L Milk, Bread..." 
            value={bookingForm.itemList} 
            onChange={e => setBookingForm({...bookingForm, itemList: e.target.value})} 
            required 
            style={{ height: '100px' }} 
          />
        </div>
      );
    }
    
    if (cat.includes('Medical')) {
      return (
        <>
          <div className="form-group">
            <label>Type of Service 💊</label>
            <select 
              className="form-input" 
              value={bookingForm.consultationType} 
              onChange={e => setBookingForm({...bookingForm, consultationType: e.target.value})}
            >
              <option value="MEDICINE">Medicine Delivery</option>
              <option value="CONSULTATION">Doctor Consultation</option>
            </select>
          </div>
          <div className="form-group">
            <label>Medicine Names or Symptoms</label>
            <textarea 
              className="form-input" 
              placeholder="List medicines or describe symptoms..." 
              value={bookingForm.serviceDetails} 
              onChange={e => setBookingForm({...bookingForm, serviceDetails: e.target.value})} 
              style={{ height: '80px' }} 
            />
          </div>
        </>
      );
    }

    if (cat.includes('Tutor')) {
      return (
        <div className="form-group">
          <label>Subject & Grade/Class 📚</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="E.g. Mathematics, 10th Grade" 
            value={bookingForm.subject} 
            onChange={e => setBookingForm({...bookingForm, subject: e.target.value})} 
            required 
          />
        </div>
      );
    }

    if (cat.includes('Driver') || cat.includes('Packers')) {
      return (
        <>
          <div className="form-group">
            <label>Pickup Location 📍</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter pickup address" 
              value={bookingForm.locationFrom} 
              onChange={e => setBookingForm({...bookingForm, locationFrom: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Drop Location 🏁</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter destination" 
              value={bookingForm.locationTo} 
              onChange={e => setBookingForm({...bookingForm, locationTo: e.target.value})} 
              required 
            />
          </div>
        </>
      );
    }

    if (cat.includes('Salon') || cat.includes('Laundry') || cat.includes('Fitness')) {
      return (
        <div className="form-group">
          <label>Specific Services Required ✂️</label>
          <textarea 
            className="form-input" 
            placeholder="E.g. Haircut & Shave, or 5 Shirts for ironing..." 
            value={bookingForm.serviceDetails} 
            onChange={e => setBookingForm({...bookingForm, serviceDetails: e.target.value})} 
            required 
            style={{ height: '80px' }} 
          />
        </div>
      );
    }

    return (
      <div className="form-group">
        <label>Description of Issue / Requirements 🛠️</label>
        <textarea 
          className="form-input" 
          placeholder="Please describe what needs to be fixed..." 
          value={bookingForm.problemDescription} 
          onChange={e => setBookingForm({...bookingForm, problemDescription: e.target.value})} 
          required 
          style={{ height: '100px' }} 
        />
      </div>
    );
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const details = {
        category: provider.categoryName,
        ...bookingForm
      };

      await createBooking({ 
        serviceId: bookingModal.id, 
        bookingDate: bookingForm.bookingDate, 
        bookingTime: bookingForm.bookingTime + ':00',
        protectedBooking: bookingForm.protectedBooking,
        emergencyBooking: bookingForm.emergencyBooking,
        instantBooking: bookingForm.instantBooking,
        paymentGateway: bookingForm.paymentGateway,
        bookingDetails: JSON.stringify(details)
      });
      toast.success('Booking created successfully!');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setBookingModal(null);
      setBookingForm({ 
        bookingDate: '', bookingTime: '', protectedBooking: true, emergencyBooking: false, instantBooking: false, paymentGateway: 'UPI', itemList: '', consultationType: 'MEDICINE', 
        problemDescription: '', subject: '', locationFrom: '', locationTo: '', serviceDetails: '' 
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    }
  };

  const bookingEstimate = bookingModal ? {
    base: Number(bookingModal.price || 0),
    platform: Math.max(Number(bookingModal.price || 0) * 0.08, 20),
    protection: bookingForm.protectedBooking ? 49 : 0,
    emergency: bookingForm.emergencyBooking ? 99 : 0,
  } : null;

  if (loading) return <div className="spinner" />;
  if (id === '0') {
    return (
      <div className="page container">
        <div className="card" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚡</div>
          <h1>{t('emergency_help_desk', 'Emergency Help Desk')}</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {t('emergency_help_desk_desc', 'This is a quick-access desk for urgent society needs. Choose a real verified provider from the trusted search results to place a booking.')}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/search?sortBy=trust" className="btn btn-primary">{t('find_trusted_providers', 'Find Trusted Providers')}</Link>
            <Link to="/" className="btn btn-secondary">{t('back_home', 'Back Home')}</Link>
          </div>
        </div>
      </div>
    );
  }
  if (!provider) return <div className="container page"><div className="empty-state"><h3>Provider not found</h3></div></div>;

  return (
    <div className="page container">
      {/* Provider Header */}
      <motion.div 
        className="card" 
        style={{ marginBottom: '32px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', fontWeight: 700, color: 'white'
        }}>
          {provider.fullName?.charAt(0)}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ margin: 0 }}>{provider.fullName}</h1>
              {provider.isVerified && (
                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HiOutlineBadgeCheck size={24} /> Verified
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '1.1rem' }}>
              {provider.categoryName} • {provider.experienceYears} years experience
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {provider.isSuperProvider && (
                <span className="badge badge--success" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}>
                  🏆 Super Provider
                </span>
              )}
              {provider.averageRating && (
                <span className="badge badge--accepted" style={{ fontSize: '0.9rem' }}>
                  <HiOutlineStar style={{ verticalAlign: 'middle', marginRight: '4px' }}/> 
                  {provider.averageRating} ({provider.totalReviews} reviews)
                </span>
              )}
              <span className="badge badge--success" style={{ fontSize: '0.9rem' }}>
                Trust {provider.trustScore || 60}
              </span>
              {provider.protectionEligible && <span className="badge badge--accepted" style={{ fontSize: '0.9rem' }}>Protected bookings</span>}
              {provider.rwaApproved && <span className="badge badge--success" style={{ fontSize: '0.9rem' }}>Approved by RWA/Admin</span>}
              {provider.kycStatus && <span className="badge badge--accepted" style={{ fontSize: '0.9rem' }}>KYC {provider.kycStatus}</span>}
              <span className="badge badge--success" style={{ fontSize: '0.9rem' }}>Reliability {provider.reliabilityScore || 60}</span>
              {provider.emergencyEnabled && <span className="badge badge--warning" style={{ fontSize: '0.9rem' }}>{provider.responseTimeMinutes || 30} min urgent</span>}
              {provider.availability && (
                <span className={`badge ${provider.availability === 'AVAILABLE' ? 'badge--success' : 'badge--warning'}`} style={{ fontSize: '0.9rem' }}>
                  {provider.availability}
                </span>
              )}
            </div>
          </div>
          {user?.role === 'ROLE_RESIDENT' && (
            <button 
              className="btn btn-secondary" 
              onClick={handleToggleFav}
              style={{ color: isFav ? '#ef4444' : 'inherit', borderColor: isFav ? '#ef4444' : 'var(--border)' }}
            >
              {isFav ? <HiHeart size={20} /> : <HiOutlineHeart size={20} />} {isFav ? 'Saved' : 'Save Provider'}
            </button>
          )}
        </div>
      </motion.div>

      {/* About & Services Layout */}
      <div className="provider-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: About */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <h2 style={{ marginBottom: '16px' }}>About</h2>
          <div className="card">
            <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
              {provider.bio || 'No bio provided.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '20px' }}>
              <div><strong>{provider.completedJobs || 0}</strong><br /><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Completed jobs</span></div>
              <div><strong>{provider.repeatBookings || 0}</strong><br /><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Repeat bookings</span></div>
              <div><strong>{provider.premiumTier || 'FREE'}</strong><br /><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Provider tier</span></div>
            </div>
          </div>

          {(provider.servicePackages || provider.availableSlots || provider.portfolioUrls) && (
            <div className="card" style={{ marginTop: '20px' }}>
              <h2 style={{ marginBottom: '16px' }}>Packages, Slots & Portfolio</h2>
              {provider.servicePackages && <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}><strong>Packages:</strong><br />{provider.servicePackages}</p>}
              {provider.availableSlots && <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}><strong>Available slots:</strong><br />{provider.availableSlots}</p>}
              {provider.portfolioUrls && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginTop: '12px' }}>
                {provider.portfolioUrls.split('\n').filter(Boolean).slice(0, 6).map((url, idx) => <img key={idx} src={url.trim()} alt="Portfolio" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '12px' }} />)}
              </div>}
            </div>
          )}

          <h2 style={{ marginTop: '32px', marginBottom: '16px' }}>Reviews</h2>
          {provider.reviews?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No reviews yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {provider.reviews?.map(review => (
                <div key={review.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>{review.reviewerName}</strong>
                    <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center' }}>
                      <HiOutlineStar /> {review.rating}/5
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>"{review.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Column: Services */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <h2 style={{ marginBottom: '16px' }}>Services Offered</h2>
          {provider.services?.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon"><HiOutlineBriefcase /></div>
              <h3>No services listed</h3>
            </div>
          ) : (
            <div className="services-grid" style={{ gridTemplateColumns: '1fr' }}>
              {provider.services?.map((svc, i) => (
                <div key={svc.id} className="service-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 className="service-card__name">{svc.serviceName}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>{svc.description}</p>
                    <span className="service-card__price">₹{svc.price}</span>
                  </div>
                  {user?.role === 'ROLE_RESIDENT' && provider.availability === 'AVAILABLE' && (
                    <button className="btn btn-primary" onClick={() => setBookingModal(svc)}>
                      <HiOutlineCalendar /> Book
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Booking Modal */}
      {bookingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setBookingModal(null)}>
          <motion.div className="auth-card" style={{ width: '100%', maxWidth: '500px' }} onClick={e => e.stopPropagation()} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <h1 style={{ marginBottom: '8px' }}>Book Service</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{bookingModal.serviceName} with {provider.fullName}</p>
            
            <form onSubmit={handleBook}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={bookingForm.bookingDate} 
                    onChange={e => setBookingForm({...bookingForm, bookingDate: e.target.value})} 
                    required 
                    min={new Date().toISOString().split('T')[0]} 
                  />
                </div>
                <div className="form-group">
                  <label>Preferred Time</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={bookingForm.bookingTime} 
                    onChange={e => setBookingForm({...bookingForm, bookingTime: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0', paddingTop: '16px' }}>
                {renderExtraFields()}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label className="card" style={{ padding: '12px', cursor: 'pointer', borderColor: bookingForm.protectedBooking ? 'var(--success)' : 'var(--border)' }}>
                  <input
                    type="checkbox"
                    checked={bookingForm.protectedBooking}
                    disabled={!provider.protectionEligible}
                    onChange={e => setBookingForm({...bookingForm, protectedBooking: e.target.checked})}
                    style={{ marginRight: '8px' }}
                  />
                  Protected booking +₹49
                </label>
                <label className="card" style={{ padding: '12px', cursor: 'pointer', borderColor: bookingForm.emergencyBooking ? 'var(--warning)' : 'var(--border)' }}>
                  <input
                    type="checkbox"
                    checked={bookingForm.emergencyBooking}
                    disabled={!provider.emergencyEnabled}
                    onChange={e => setBookingForm({...bookingForm, emergencyBooking: e.target.checked})}
                    style={{ marginRight: '8px' }}
                  />
                  Emergency priority +₹99
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <label className="card" style={{ padding: '12px', cursor: 'pointer', borderColor: bookingForm.instantBooking ? 'var(--success)' : 'var(--border)' }}>
                  <input
                    type="checkbox"
                    checked={bookingForm.instantBooking}
                    onChange={e => setBookingForm({...bookingForm, instantBooking: e.target.checked})}
                    style={{ marginRight: '8px' }}
                  />
                  Instant booking
                </label>
                <select className="form-input" value={bookingForm.paymentGateway} onChange={e => setBookingForm({...bookingForm, paymentGateway: e.target.value})}>
                  <option value="UPI">UPI</option>
                  <option value="RAZORPAY_DEMO">Razorpay Demo</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              {bookingEstimate && (
                <div className="card" style={{ padding: '14px', marginTop: '14px', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Service price</span><strong>₹{bookingEstimate.base.toFixed(0)}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Platform fee</span><strong>₹{bookingEstimate.platform.toFixed(0)}</strong></div>
                  {bookingEstimate.protection > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Protection</span><strong>₹{bookingEstimate.protection}</strong></div>}
                  {bookingEstimate.emergency > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Emergency priority</span><strong>₹{bookingEstimate.emergency}</strong></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px' }}><span>Total estimate</span><strong>₹{(bookingEstimate.base + bookingEstimate.platform + bookingEstimate.protection + bookingEstimate.emergency).toFixed(0)}</strong></div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setBookingModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Booking</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
