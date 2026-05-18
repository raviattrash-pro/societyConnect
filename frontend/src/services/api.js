import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth APIs
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);
export const raiseGrievance = (data) => API.post('/auth/grievance', data);

// Profile APIs
export const getMyProfile = () => API.get('/profiles/me');
export const updateResidentProfile = (data) => API.put('/profiles/resident', data);
export const updateProviderProfile = (data) => API.put('/profiles/provider', data);
export const changePassword = (data) => API.post('/users/change-password', data);

// Admin APIs (continued)
export const syncDefaults = () => API.post('/admin/sync-defaults');
export const toggleDefaults = (enabled) => API.post('/admin/toggle-defaults', { enabled });
export const getGrievances = () => API.get('/admin/grievances');
export const resolveGrievance = (id) => API.patch(`/admin/grievances/${id}/resolve`);

// Category APIs
export const getCategories = () => API.get('/categories');

// Service APIs
export const getServices = (query, categoryId) => {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (categoryId) params.append('categoryId', categoryId);
  return API.get(`/services?${params.toString()}`);
};
export const getServiceById = (id) => API.get(`/services/${id}`);
export const createService = (data) => API.post('/services', data);
export const updateService = (id, data) => API.put(`/services/${id}`, data);
export const deleteService = (id) => API.delete(`/services/${id}`);
export const getMyServices = () => API.get('/services/my');

// Booking APIs
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my');
export const updateBookingStatus = (id, status) => API.patch(`/bookings/${id}/status`, { status });
export const updatePayment = (id, screenshotUrl, transactionId) => API.patch(`/bookings/${id}/payment`, { screenshotUrl, transactionId });
export const updateEta = (id, eta) => API.patch(`/bookings/${id}/eta`, { eta });
export const raiseBookingDispute = (id, reason) => API.patch(`/bookings/${id}/dispute`, { reason });
export const resolveBookingDispute = (id, resolution) => API.patch(`/bookings/${id}/dispute/resolve`, { resolution });
export const getRevenueSummary = () => API.get('/bookings/revenue-summary');

// Review APIs
export const addReview = (data) => API.post('/reviews', data);
export const getProviderReviews = (providerId) => API.get(`/reviews/provider/${providerId}`);

// Message APIs
export const sendMessage = (data) => API.post('/messages', data);
export const getConversation = (userId) => API.get(`/messages/conversation/${userId}`);
export const getMyConversations = () => API.get('/messages/conversations');
export const getUnreadMessages = () => API.get('/messages/unread');

// Notification APIs
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.patch('/notifications/read-all');
export const getUnreadNotifications = () => API.get('/notifications/unread');

// Admin APIs
export const getAdminDashboard = () => API.get('/admin/dashboard');
export const getAdminUsers = () => API.get('/admin/users');
export const toggleUserStatus = (id) => API.patch(`/admin/users/${id}/toggle`);
export const verifyProvider = (id) => API.patch(`/admin/providers/${id}/verify`);
export const getUnverifiedProviders = () => API.get('/admin/providers/unverified');
export const getSetting = (key) => API.get(`/admin/settings/${key}`);
export const getAdminJobs = () => API.get('/admin/jobs');
export const updateSetting = (key, value) => API.patch(`/admin/settings/${key}`, { value });

// Provider APIs
export const getProviderDetail = (id) => API.get(`/providers/${id}`);
export const updateProviderLocation = (lat, lng) => API.patch('/providers/location', { lat, lng });

// Engagement APIs
export const toggleFavorite = (id) => API.post(`/favorites/${id}`);
export const getMyFavorites = () => API.get('/favorites');
export const checkFavorite = (id) => API.get(`/favorites/${id}/check`);
export const getRecentActivity = () => API.get('/activity').catch(() => ({ data: [] }));
export const getTrendingProviders = () => API.get('/trending').catch(() => ({ data: [] }));
const marketplaceSeed = {
  trustPromise: 'Verified society providers, protected bookings, emergency response, and group savings.',
  completedBookings: 0,
  protectedBookings: 0,
  verifiedProviders: 0,
  emergencyProviders: 0,
  revenueLevers: [
    { name: 'Society Pro', price: 'Rs 2,999/month', value: 'RWA dashboard, verified vendor directory, complaints, announcements' },
    { name: 'Provider Pro', price: 'Rs 499/month', value: 'Boosted profile, trust analytics, priority lead alerts' },
    { name: 'Protected Booking', price: 'Rs 49/booking', value: 'Rework support and dispute assistance' },
    { name: 'Emergency Lead', price: 'Rs 99/urgent booking', value: 'Priority routing to fast-response providers' },
  ],
  groupDeals: [
    { title: 'Society Pest Shield', category: 'Pest Control', targetHomes: 10, saving: 'Up to 25%' },
    { title: 'RO Service Camp', category: 'RO / Water Purifier', targetHomes: 15, saving: 'Up to 30%' },
    { title: 'AC Summer Checkup', category: 'AC Repair', targetHomes: 20, saving: 'Up to 20%' },
  ],
};

const emergencyProviderSeed = [
  { profileId: 0, fullName: 'Emergency Help Desk', categoryName: 'Urgent Home Services', trustScore: 85, responseTimeMinutes: 20, isVerified: true, protectionEligible: true, emergencyEnabled: true },
];

export const getEmergencyProviders = () => Promise.resolve({ data: emergencyProviderSeed });
export const getMarketplaceIntelligence = () => Promise.resolve({ data: marketplaceSeed });
export const updateBusinessSettings = (data) => API.patch('/providers/business-settings', data);

// Job APIs (Reverse Bidding)
export const createJob = (data) => API.post('/jobs', data);
export const getMyJobs = () => API.get('/jobs/me');
export const getJobLeads = () => API.get('/jobs/leads');
export const acceptJob = (id) => API.patch(`/jobs/${id}/accept`);

// AI APIs
export const parseAiIntent = (text) => API.get(`/ai/parse-intent?text=${encodeURIComponent(text)}`);

// Analytics & New Features
export const getProviderEarnings = () => API.get('/analytics/provider/earnings');
export const getInventory = () => API.get('/inventory');
export const getResidentSkills = () => API.get('/marketplace/skills');

// Admin APIs
// getAdminDashboard is already defined above

export default API;

