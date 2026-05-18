import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getServices, getCategories, createBooking, createJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiOutlineSearch, HiOutlineStar, HiOutlineCalendar, HiOutlineFilter, HiOutlinePlusCircle } from 'react-icons/hi';
import confetti from 'canvas-confetti';
import { getServiceImage } from '../utils/imageUtils';
import { useTranslation } from 'react-i18next';
export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [availability, setAvailability] = useState('');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');
  const [showFilters, setShowFilters] = useState(false);

  const [bookingModal, setBookingModal] = useState(null);
  const [jobModal, setJobModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ bookingDate: '', bookingTime: '', protectedBooking: true, emergencyBooking: false });
  const [jobForm, setJobForm] = useState({ categoryId: '', description: '', expectedPrice: '' });

  useEffect(() => {
    getCategories().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchServices(); }, [categoryId, sortBy, availability, minRating]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (categoryId) params.append('categoryId', categoryId);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('minRating', minRating);
      if (availability) params.append('availability', availability);
      if (sortBy) params.append('sortBy', sortBy);

      const API = (await import('../services/api')).default;
      const res = await API.get(`/services?${params.toString()}`);
      
      setServices(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const renderExtraFields = () => {
    if (!bookingModal) return null;
    const cat = bookingModal.categoryName || '';
    
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
            style={{ height: '80px' }} 
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
            <label>Notes (Medicines/Symptoms)</label>
            <textarea 
              className="form-input" 
              placeholder="List medicines or symptoms..." 
              value={bookingForm.serviceDetails} 
              onChange={e => setBookingForm({...bookingForm, serviceDetails: e.target.value})} 
              style={{ height: '60px' }} 
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Pickup Location 📍</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Address" 
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
              placeholder="Destination" 
              value={bookingForm.locationTo} 
              onChange={e => setBookingForm({...bookingForm, locationTo: e.target.value})} 
              required 
            />
          </div>
        </div>
      );
    }

    // Default for Plumber, Electrician, Carpenter, etc.
    return (
      <div className="form-group">
        <label>Description of Issue / Requirements 🛠️</label>
        <textarea 
          className="form-input" 
          placeholder="Please describe what needs to be fixed..." 
          value={bookingForm.problemDescription} 
          onChange={e => setBookingForm({...bookingForm, problemDescription: e.target.value})} 
          required 
          style={{ height: '80px' }} 
        />
      </div>
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchServices();
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const details = {
        category: bookingModal.categoryName,
        ...bookingForm
      };

      await createBooking({ 
        serviceId: bookingModal.id, 
        bookingDate: bookingForm.bookingDate, 
        bookingTime: bookingForm.bookingTime + ':00',
        protectedBooking: bookingForm.protectedBooking,
        emergencyBooking: bookingForm.emergencyBooking,
        bookingDetails: JSON.stringify(details)
      });
      toast.success(bookingForm.protectedBooking ? 'Protected booking created!' : 'Booking created!');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setBookingModal(null);
      setBookingForm({ 
        bookingDate: '', bookingTime: '', protectedBooking: true, emergencyBooking: false, itemList: '', consultationType: 'MEDICINE', 
        problemDescription: '', subject: '', locationFrom: '', locationTo: '', serviceDetails: '' 
      });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await createJob({ 
        categoryId: parseInt(jobForm.categoryId), 
        description: jobForm.description, 
        expectedPrice: parseFloat(jobForm.expectedPrice) 
      });
      toast.success('Job request posted! Providers in this category will see your lead.');
      setJobModal(false);
      setJobForm({ categoryId: '', description: '', expectedPrice: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post job'); }
  };

  const bookingEstimate = bookingModal ? {
    base: Number(bookingModal.price || 0),
    platform: Math.max(Number(bookingModal.price || 0) * 0.08, 20),
    protection: bookingForm.protectedBooking ? 49 : 0,
    emergency: bookingForm.emergencyBooking ? 99 : 0,
  } : null;

  return (
    <div className="page container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 style={{ marginBottom: '24px' }}>{t('explore_services_title', 'Explore Services')}</h1>
        
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <input className="form-input" placeholder={t('search_placeholder', 'Search services...')} value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="form-input" style={{ maxWidth: '200px' }} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">{t('all_categories', 'All Categories')}</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.iconUrl} {t(c.name.toLowerCase().replace(/ /g, '_'), c.name)}</option>)}
          </select>
          <button type="button" className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
            <HiOutlineFilter /> {t('filters', 'Filters')}
          </button>
          <button type="submit" className="btn btn-primary"><HiOutlineSearch /> {t('search', 'Search')}</button>
        </form>

        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            className="card" 
            style={{ marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}
          >
            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
              <label>{t('min_price', 'Min Price (₹)')}</label>
              <input type="number" className="form-input" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" />
            </div>
            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
              <label>{t('max_price', 'Max Price (₹)')}</label>
              <input type="number" className="form-input" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="10000" />
            </div>
            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
              <label>{t('min_rating', 'Min Rating')}</label>
              <select className="form-input" value={minRating} onChange={e => setMinRating(e.target.value)}>
                <option value="">{t('any_rating', 'Any Rating')}</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
              <label>{t('availability', 'Availability')}</label>
              <select className="form-input" value={availability} onChange={e => setAvailability(e.target.value)}>
                <option value="">{t('any_status', 'Any Status')}</option>
                <option value="AVAILABLE">{t('available', 'Available')}</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
              <label>{t('sort_by', 'Sort By')}</label>
              <select className="form-input" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="">{t('relevance', 'Relevance')}</option>
                <option value="price_asc">{t('price_low_high', 'Price: Low to High')}</option>
                <option value="price_desc">{t('price_high_low', 'Price: High to Low')}</option>
                <option value="rating">{t('highest_rated', 'Highest Rated')}</option>
                <option value="trust">{t('highest_trust', 'Highest Trust Score')}</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
              <button type="button" className="btn btn-primary" onClick={fetchServices}>{t('apply', 'Apply')}</button>
            </div>
          </motion.div>
        )}

        {loading ? <div className="spinner" /> : services.length === 0 ? (
          <div className="empty-state"><div className="empty-state__icon">🔍</div><h3>{t('not_found', 'No services found')}</h3></div>
        ) : (
              <div className="services-grid">
            {services.map((s, i) => (
              <motion.div 
                key={s.id} 
                className="service-card" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }}
                style={{ padding: 0, overflow: 'hidden' }}
              >
                <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                  <img 
                    src={getServiceImage(s.categoryName, s.id || s.serviceName)} 
                    alt={s.serviceName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {s.categoryName && (
                    <span className="service-card__category" style={{ position: 'absolute', top: '16px', left: '16px', margin: 0, background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      {t(s.categoryName.trim().toLowerCase().replace(/ /g, '_'), s.categoryName)}
                    </span>
                  )}
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 className="service-card__name">{t(s.serviceName.trim().toLowerCase().replace(/ /g, '_'), s.serviceName)}</h3>
                  <p className="service-card__provider">
                    {t('by', 'by')} <Link to={`/provider/${s.providerId}`} style={{ fontWeight: 600 }}>{t(s.providerName.trim().toLowerCase().replace(/ /g, '_'), s.providerName)}</Link>
                    {s.isVerified && <span style={{ color: 'var(--success)', marginLeft: '4px', fontSize: '0.8rem' }}>✓</span>}
                  </p>
                  <div className="service-card__footer">
                    <span className="service-card__price">₹{s.price}</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {s.averageRating && <span className="service-card__rating"><HiOutlineStar /> {s.averageRating}</span>}
                      {user?.role === 'ROLE_RESIDENT' && s.availability === 'AVAILABLE' && (
                        <button className="btn btn-primary btn-sm" onClick={() => setBookingModal(s)}><HiOutlineCalendar /> {t('book', 'Book')}</button>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
                    <span className="badge badge--success">{t('trust', 'Trust')} {s.trustScore || 60}</span>
                    {s.isGreen && <span className="badge" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>🌿 {t('eco_friendly', 'Eco-Friendly')}</span>}
                    {s.protectionEligible && <span className="badge badge--accepted">{t('protected', 'Protected')}</span>}
                    {s.emergencyEnabled && <span className="badge badge--warning">{s.responseTimeMinutes || 30} min {t('urgent', 'urgent')}</span>}
                    {s.premiumTier && s.premiumTier !== 'FREE' && <span className="badge">{s.premiumTier}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '48px', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
          <h2 style={{ marginBottom: '12px' }}>{t('cant_find_need', "Can't find what you need?")}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{t('post_job_desc', 'Post a custom job request and let verified providers contact you with their best offers.')}</p>
          <button className="btn btn-secondary" onClick={() => {
            if (!user) { toast.error('Please login to post a job'); return; }
            setJobModal(true);
          }}>
            <HiOutlinePlusCircle /> {t('request_custom_service', 'Request Custom Service')}
          </button>
        </div>
      </motion.div>

      {jobModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setJobModal(false)}>
          <motion.div className="auth-card" onClick={e => e.stopPropagation()} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <h1>Post Job Lead</h1>
            <p>Tell providers what you need and your budget</p>
            <form onSubmit={handlePostJob}>
              <div className="form-group">
                <label>Service Category</label>
                <select className="form-input" value={jobForm.categoryId} onChange={e => setJobForm({...jobForm, categoryId: e.target.value})} required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Description of Work</label>
                <textarea className="form-input" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} required placeholder="Describe what needs to be fixed/done..." />
              </div>
              <div className="form-group">
                <label>Expected Budget (₹)</label>
                <input type="number" className="form-input" value={jobForm.expectedPrice} onChange={e => setJobForm({...jobForm, expectedPrice: e.target.value})} required placeholder="e.g. 500" />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setJobModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Post Lead</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {bookingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setBookingModal(null)}>
          <motion.div className="auth-card" style={{ width: '100%', maxWidth: '500px' }} onClick={e => e.stopPropagation()} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <h1 style={{ marginBottom: '8px' }}>Book Service</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{bookingModal.serviceName} with {bookingModal.providerName}</p>
            
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
                    disabled={!bookingModal.protectionEligible}
                    onChange={e => setBookingForm({...bookingForm, protectedBooking: e.target.checked})}
                    style={{ marginRight: '8px' }}
                  />
                  Protected booking +₹49
                </label>
                <label className="card" style={{ padding: '12px', cursor: 'pointer', borderColor: bookingForm.emergencyBooking ? 'var(--warning)' : 'var(--border)' }}>
                  <input
                    type="checkbox"
                    checked={bookingForm.emergencyBooking}
                    disabled={!bookingModal.emergencyEnabled}
                    onChange={e => setBookingForm({...bookingForm, emergencyBooking: e.target.checked})}
                    style={{ marginRight: '8px' }}
                  />
                  Emergency priority +₹99
                </label>
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
