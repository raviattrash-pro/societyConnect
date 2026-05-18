import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getMyBookings, addReview, updatePayment, getSetting, createBooking, raiseBookingDispute } from '../services/api';
import { HiOutlineClipboardList, HiOutlineStar, HiOutlineSearch } from 'react-icons/hi';

const SkeletonCard = () => (
  <div className="card" style={{ padding: '24px', marginBottom: '16px', opacity: 0.5 }}>
    <div className="skeleton" style={{ height: '24px', width: '60%', marginBottom: '12px' }} />
    <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '8px' }} />
    <div className="skeleton" style={{ height: '16px', width: '40%' }} />
  </div>
);

export default function ResidentDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [disputeModal, setDisputeModal] = useState(null);
  const [trackingModal, setTrackingModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [paymentForm, setPaymentForm] = useState({ screenshotUrl: '', transactionId: '' });
  const [disputeReason, setDisputeReason] = useState('');
  const [qrUrl, setQrUrl] = useState('/admin_payment_qr.png');
  const [trackProgress, setTrackProgress] = useState(0);

  useEffect(() => { 
    fetchBookings(); 
    getSetting('payment_qr_url').then(res => {
      if (res.data.value) setQrUrl(res.data.value);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let interval;
    let pollInterval;

    if (trackingModal && window.L) {
      setTrackProgress(0);
      
      const startTracking = async () => {
        const container = document.getElementById('map-container');
        if (!container) return;

        // Initial setup
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const resLat = pos.coords.latitude;
          const resLng = pos.coords.longitude;
          
          // Use latest booking data from modal (initially)
          let provLat = trackingModal.providerLat;
          let provLng = trackingModal.providerLng;

          const map = window.L.map('map-container', { zoomControl: false }).setView([resLat, resLng], 14);
          container._leaflet_map = map;
          window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

          const providerIcon = window.L.divIcon({ html: '<div style="font-size: 2.2rem;">🛵</div>', className: 'custom-div-icon', iconSize: [40, 40], iconAnchor: [20, 20] });
          const homeIcon = window.L.divIcon({ html: '<div style="font-size: 2.2rem;">🏠</div>', className: 'custom-div-icon', iconSize: [40, 40], iconAnchor: [20, 20] });

          const providerMarker = window.L.marker([provLat || resLat, provLng || resLng], { icon: providerIcon }).addTo(map);
          window.L.marker([resLat, resLng], { icon: homeIcon }).addTo(map);

          // Polling for real-time updates from server
          pollInterval = setInterval(async () => {
            try {
              const res = await getMyBookings();
              const latestBooking = res.data.find(b => b.id === trackingModal.id);
              if (latestBooking && latestBooking.providerLat && latestBooking.providerLng) {
                providerMarker.setLatLng([latestBooking.providerLat, latestBooking.providerLng]);
                const bounds = window.L.latLngBounds([[latestBooking.providerLat, latestBooking.providerLng], [resLat, resLng]]);
                map.fitBounds(bounds, { padding: [50, 50] });
              }
            } catch (err) { console.error("Poll failed", err); }
          }, 5000);

        }, (err) => {
          toast.error("GPS access failed. Showing provider only.");
          const map = window.L.map('map-container', { zoomControl: false }).setView([trackingModal.providerLat || 12.9716, trackingModal.providerLng || 77.5946], 13);
          if (container) container._leaflet_map = map;
          window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        }, { enableHighAccuracy: true });
      };

      startTracking();
    }

    return () => { 
      clearInterval(interval); 
      clearInterval(pollInterval);
      const container = document.getElementById('map-container');
      if (container && container._leaflet_map) {
        container._leaflet_map.remove();
        delete container._leaflet_map;
      }
    };
  }, [trackingModal]);

  const fetchBookings = async () => {
    try { const res = await getMyBookings(); setBookings(res.data); }
    catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await addReview({ bookingId: reviewModal.id, rating: reviewForm.rating, comment: reviewForm.comment });
      toast.success('Review submitted!'); setReviewModal(null); fetchBookings();
    } catch (err) { 
      const msg = err.response?.data?.message || 'Failed';
      toast.error(msg); 
      if (msg.toLowerCase().includes('already reviewed')) {
        setReviewModal(null);
      }
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await updatePayment(paymentModal.id, paymentForm.screenshotUrl, paymentForm.transactionId);
      toast.success('Payment submitted for verification!'); setPaymentModal(null); fetchBookings();
    } catch (err) { toast.error('Failed to submit payment'); }
  };

  const handleRepeatBooking = async (booking) => {
    try {
      await createBooking({
        serviceId: booking.serviceId,
        bookingDate: new Date().toISOString().slice(0, 10),
        bookingTime: '10:00:00',
        protectedBooking: booking.protectedBooking,
        emergencyBooking: false,
        instantBooking: true,
        paymentGateway: booking.paymentGateway || 'UPI',
        bookingDetails: booking.bookingDetails || '{}'
      });
      toast.success('Repeat booking created for today at 10:00');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Repeat booking failed'); }
  };

  const handleDispute = async (e) => {
    e.preventDefault();
    try {
      await raiseBookingDispute(disputeModal.id, disputeReason);
      toast.success('Guarantee/dispute request raised');
      setDisputeModal(null);
      setDisputeReason('');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to raise dispute'); }
  };

  const pending = bookings.filter(b => b.status === 'PENDING').length;
  const completed = bookings.filter(b => b.status === 'COMPLETED').length;

  return (
    <div className="page container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>{t('my_dashboard', 'My Dashboard')}</h1>
          <Link to="/search" className="btn btn-primary"><HiOutlineSearch /> {t('nav_explore', 'Services')}</Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-card__label">{t('total_bookings', 'Total Bookings')}</div><div className="stat-card__value stat-card__value--primary">{bookings.length}</div></div>
          <div className="stat-card"><div className="stat-card__label">{t('pending', 'Pending')}</div><div className="stat-card__value stat-card__value--warning">{pending}</div></div>
          <div className="stat-card"><div className="stat-card__label">{t('completed', 'Completed')}</div><div className="stat-card__value stat-card__value--success">{completed}</div></div>
        </div>

        <h2 style={{ marginBottom: '16px' }}><HiOutlineClipboardList style={{ verticalAlign: 'middle' }} /> {t('my_bookings', 'My Bookings')}</h2>

        {loading ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            {[1, 2, 3].map(n => <SkeletonCard key={n} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📋</div>
            <h3>{t('no_bookings', 'No bookings yet')}</h3>
            <p>{t('explore_to_book', 'Explore services to make your first booking')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {bookings.map((b, idx) => (
              <motion.div 
                key={b.id} 
                className="booking-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
              >
                <div className="booking-card__info">
                  <h3>{t(b.serviceName.trim().toLowerCase().replace(/ /g, '_'), b.serviceName)}</h3>
                  <p>{t('provider_label', 'Provider')}: {t(b.providerName.trim().toLowerCase().replace(/ /g, '_'), b.providerName)} {b.status === 'ACCEPTED' && <strong>• 📞 {b.providerPhone}</strong>} • {b.bookingDate} {t('at_label', 'at')} {b.bookingTime}</p>
                  {b.bookingDetails && (
                    <div style={{ marginTop: '10px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.85rem' }}>
                      {(() => {
                        try {
                          const d = JSON.parse(b.bookingDetails);
                          return (
                            <div style={{ color: 'var(--text-secondary)' }}>
                              {d.itemList && <div>🛒 {t('items_label', 'Items')}: {d.itemList}</div>}
                              {d.consultationType && <div>💊 {t('medical_label', 'Medical')}: {d.consultationType} {d.serviceDetails && `(${d.serviceDetails})`}</div>}
                              {d.subject && <div>📚 {t('subject_label', 'Subject')}: {d.subject}</div>}
                              {d.locationFrom && <div>📍 {t('route_label', 'Route')}: {d.locationFrom} ➡️ {d.locationTo}</div>}
                              {d.problemDescription && <div>🛠️ {t('issue_label', 'Issue')}: {d.problemDescription}</div>}
                            </div>
                          );
                        } catch { return null; }
                      })()}
                    </div>
                  )}
                  {b.status === 'ACCEPTED' && (
                    <div style={{ marginTop: '12px' }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => setTrackingModal(b)} style={{ color: 'var(--primary)', padding: '4px 0', fontSize: '0.85rem' }}>
                        📍 {t('track_provider', 'Track Provider')} ({t('arriving_in', 'Arriving in')} {b.providerEta || '15 mins'})
                      </button>
                    </div>
                  )}
                  {b.timeline && (
                    <div style={{ marginTop: '10px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.8rem' }}>
                      <strong>{t('timeline_label', 'Timeline')}:</strong>
                      {b.timeline.split('\n').map((line, i) => {
                        const parts = line.split('|');
                        return <div key={i} style={{ color: 'var(--text-secondary)' }}>{parts[1] || 'UPDATE'} - {parts[2] || line}</div>;
                      })}
                    </div>
                  )}
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {b.protectedBooking && <span className="badge badge--success">{t('guarantee_label', 'Guarantee')}: {b.guaranteeStatus || 'ACTIVE'} ({b.reworkWindowDays || 7} days)</span>}
                    {b.disputeStatus && b.disputeStatus !== 'NONE' && <span className="badge badge--warning">{t('dispute_label', 'Dispute')}: {b.disputeStatus}</span>}
                    {b.gatewayOrderId && <span className="badge badge--accepted">{b.paymentGateway}: {b.gatewayOrderId}</span>}
                  </div>
                </div>
                <div className="booking-card__actions">
                  <span className={`badge badge--${b.status.toLowerCase()}`}>{t(`status_${b.status.toLowerCase()}`, b.status)}</span>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleRepeatBooking(b)}>{t('btn_repeat', 'Repeat')}</button>
                  {b.status === 'ACCEPTED' && b.paymentStatus === 'PENDING' && (
                    <button className="btn btn-sm btn-primary" onClick={() => setPaymentModal(b)}>💳 {t('pay_now', 'Pay Now')}</button>
                  )}
                  {b.protectedBooking && ['COMPLETED', 'ACCEPTED'].includes(b.status) && (
                    <button className="btn btn-sm btn-danger" onClick={() => setDisputeModal(b)}>{t('guarantee_claim', 'Guarantee Claim')}</button>
                  )}
                  {b.status === 'COMPLETED' && (
                    b.isReviewed ? (
                      <span className="badge badge--completed" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>✅ {t('label_reviewed', 'Reviewed')}</span>
                    ) : (
                      <button className="btn btn-sm btn-secondary" onClick={() => setReviewModal(b)}><HiOutlineStar /> {t('add_review', 'Review')}</button>
                    )
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {trackingModal && (
        <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: '40px' }} onClick={() => setTrackingModal(null)}>
          <motion.div className="auth-card" onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%', maxWidth: '600px', padding: 0, position: 'relative', background: 'var(--bg-card)' }}>
            
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Live Tracking</h2>
              <button onClick={() => setTrackingModal(null)} className="btn btn-ghost" style={{ fontSize: '1.5rem', padding: '4px 12px' }}>&times;</button>
            </div>

            <div style={{ position: 'relative' }}>
              <div id="map-container" style={{ height: '400px', width: '100%' }} />
              
              <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', zIndex: 1000, display: 'flex', gap: '8px' }}>
                <input 
                  className="form-input" 
                  placeholder="Enter your city/area (e.g. Jharkhand)..." 
                  style={{ background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flex: 1 }}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                       const query = e.target.value;
                       if (!query) return;
                       toast.loading("Finding location...", { id: 'geo' });
                       try {
                         const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                         const data = await res.json();
                         if (data && data.length > 0) {
                           const { lat, lon } = data[0];
                           const newLat = parseFloat(lat);
                           const newLon = parseFloat(lon);
                           
                           // Access the map instance
                           const container = document.getElementById('map-container');
                           if (container && container._leaflet_map) {
                             const map = container._leaflet_map;
                             map.setView([newLat, newLon], 13);
                             
                             // Update markers if needed
                             // For now, just centering is enough to "work"
                             toast.success("Location updated!", { id: 'geo' });
                           }
                         } else {
                           toast.error("Location not found", { id: 'geo' });
                         }
                       } catch (err) {
                         toast.error("Search failed", { id: 'geo' });
                       }
                    }
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ color: 'var(--primary)', margin: '0 0 4px 0' }}>{trackingModal.providerName} is on the way</h3>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Estimated Arrival: <strong>{trackingModal.providerEta || '10 min'}</strong></p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>10 min</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1.2 km away</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <a href={`tel:${trackingModal.providerPhone}`} className="btn btn-secondary" style={{ flex: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>📞 Call Provider</a>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/messages?userId=${trackingModal.providerId}`)}>💬 Chat</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <motion.div className="auth-card" onClick={e => e.stopPropagation()} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <h1>Leave a Review</h1>
            <p>{reviewModal.serviceName}</p>
            <form onSubmit={handleReview}>
              <div className="form-group"><label>Rating</label>
                <select className="form-input" value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{'⭐'.repeat(n)} ({n})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Comment</label><textarea className="form-input" value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} placeholder="Share your experience..." /></div>
              <button className="btn btn-primary" style={{ width: '100%' }}>Submit Review</button>
            </form>
          </motion.div>
        </div>
      )}

      {disputeModal && (
        <div className="modal-overlay" onClick={() => setDisputeModal(null)}>
          <motion.div className="auth-card" onClick={e => e.stopPropagation()} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <h1>Guarantee / Dispute</h1>
            <p>{disputeModal.serviceName}</p>
            <form onSubmit={handleDispute}>
              <div className="form-group">
                <label>Reason</label>
                <textarea className="form-input" value={disputeReason} onChange={e => setDisputeReason(e.target.value)} placeholder="Describe the issue, refund/rework request, or complaint..." required />
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }}>Raise Request</button>
            </form>
          </motion.div>
        </div>
      )}

      {paymentModal && (
        <div className="modal-overlay" onClick={() => setPaymentModal(null)}>
          <motion.div className="auth-card" onClick={e => e.stopPropagation()} initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ maxWidth: '500px' }}>
            <h1>Online Payment</h1>
            <p>Scan the QR code below to pay <strong>₹{paymentModal.totalPrice}</strong></p>
            
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <img src={qrUrl} alt="Payment QR" style={{ width: '180px', borderRadius: '16px', boxShadow: 'var(--neu-flat)', border: '4px solid white' }} />
            </div>

            <form onSubmit={handlePayment}>
              <div className="form-group">
                <label>Transaction ID / UTR</label>
                <input className="form-input" placeholder="Enter transaction ID" value={paymentForm.transactionId} onChange={e => setPaymentForm({...paymentForm, transactionId: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Upload Payment Screenshot</label>
                <input 
                  type="file" 
                  className="form-input" 
                  accept="image/*"
                  style={{ width: '100%' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setPaymentForm({...paymentForm, screenshotUrl: reader.result});
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                Note: Admin will verify your transaction details before confirming the payment.
              </p>
              <button className="btn btn-primary" style={{ width: '100%' }}>Submit Payment Details</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
