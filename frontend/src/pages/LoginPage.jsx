import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { loginUser, getMyProfile, forgotPassword, resetPassword, raiseGrievance } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login', 'forgot', 'reset', 'grievance'
  const [form, setForm] = useState({ email: '', password: '' });
  const [resetForm, setResetForm] = useState({ email: '', token: '', newPassword: '' });
  const [grievanceForm, setGrievanceForm] = useState({ email: '', description: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGrievanceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await raiseGrievance(grievanceForm);
      toast.success(res.data.message || 'Grievance raised! Admin will review it.');
      setMode('login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to raise grievance');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      const { token } = res.data;
      
      localStorage.setItem('token', token);
      const profileRes = await getMyProfile();
      login(token, profileRes.data);
      
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword({ email: resetForm.email });
      toast.success(res.data.message || 'Check your email/messages for the reset token!', { duration: 6000 });
      setMode('reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset token');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword({ token: resetForm.token, newPassword: resetForm.newPassword });
      toast.success('Password reset successfully! Please log in.');
      setMode('login');
      setForm({ ...form, password: '' }); // clear pass
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {mode === 'login' && (
          <>
            <h1>Welcome Back</h1>
            <p>Sign in to your SocietyConnect account</p>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input id="login-email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <label htmlFor="login-password">Password</label>
                  <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>Forgot?</button>
                </div>
                <input id="login-password" type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '24px', marginBottom: 0 }}>
              Don't have an account? <Link to="/register">Create one</Link>
            </p>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h1>Forgot Password</h1>
            <p>Enter your email to receive a reset token</p>

            <form onSubmit={handleForgotSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-input" placeholder="you@example.com" value={resetForm.email} onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })} required />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Token'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
              Still having trouble? <button type="button" onClick={() => setMode('grievance')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>Raise a grievance to Admin</button>
            </p>

            <button type="button" className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }} onClick={() => setMode('login')}>
              Back to Login
            </button>
          </>
        )}

        {mode === 'grievance' && (
          <>
            <h1>Raise Grievance</h1>
            <p>Admin will review your request and reset your password if verified.</p>

            <form onSubmit={handleGrievanceSubmit}>
              <div className="form-group">
                <label>Registered Email</label>
                <input type="email" className="form-input" placeholder="you@example.com" value={grievanceForm.email} onChange={(e) => setGrievanceForm({ ...grievanceForm, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description of Issue</label>
                <textarea className="form-input" placeholder="E.g. I lost access to my email and forgot my password..." value={grievanceForm.description} onChange={(e) => setGrievanceForm({ ...grievanceForm, description: e.target.value })} required style={{ height: '100px' }} />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Grievance'}
              </button>
            </form>

            <button type="button" className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }} onClick={() => setMode('login')}>
              Back to Login
            </button>
          </>
        )}

        {mode === 'reset' && (
          <>
            <h1>Reset Password</h1>
            <p>Enter the token you received and your new password</p>

            <form onSubmit={handleResetSubmit}>
              <div className="form-group">
                <label>Reset Token</label>
                <input type="text" className="form-input" placeholder="Paste your token here" value={resetForm.token} onChange={(e) => setResetForm({ ...resetForm, token: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="form-input" placeholder="••••••••" value={resetForm.newPassword} onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })} required minLength="6" />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <button type="button" className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }} onClick={() => setMode('login')}>
              Back to Login
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
