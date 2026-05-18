import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AiConcierge from './components/AiConcierge';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import ResidentDashboard from './pages/ResidentDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';
import ProviderDetailPage from './pages/ProviderDetailPage';
import GrowthHubPage from './pages/GrowthHubPage';
import MarketplacePage from './pages/MarketplacePage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'ROLE_ADMIN') return <AdminDashboard />;
  if (user?.role === 'ROLE_PROVIDER') return <ProviderDashboard />;
  return <ResidentDashboard />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;

  return (
    <>
      <Navbar />
      <AiConcierge />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/growth" element={<GrowthHubPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/provider/:id" element={<ProviderDetailPage />} />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardRouter /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><NotificationsPage /></ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute><MessagesPage /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
