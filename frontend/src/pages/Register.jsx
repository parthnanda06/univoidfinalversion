import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', branch: '', year: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Name, email, and password are required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data.user, data.token);
      toast.success('Account created! Welcome to UniVoid 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"></div>
      </div>
      <div className="glass-card rounded-2xl p-8 sm:p-10 w-full max-w-lg animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Join UniVoid</h1>
          <p className="text-sm text-surface-200">Create your account and start exploring</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-200 mb-1.5">Full Name *</label>
              <input type="text" className="input-field" placeholder="John Doe" value={form.name} onChange={update('name')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-200 mb-1.5">Email *</label>
              <input type="email" className="input-field" placeholder="you@college.edu" value={form.email} onChange={update('email')} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-200 mb-1.5">Password *</label>
            <input type="password" className="input-field" placeholder="Min 6 characters" value={form.password} onChange={update('password')} />
          </div>

          {/* Role Selector */}
          <div>
            <label className="block text-xs font-medium text-surface-200 mb-2">I am a…</label>
            <div className="grid grid-cols-2 gap-3">
              {[{ value:'student', emoji:'🎓', label:'Student', sub:'Browse jobs & apply' }, { value:'hr', emoji:'💼', label:'HR / Recruiter', sub:'Post jobs & hire' }].map(r => (
                <button key={r.value} type="button" onClick={() => setForm(f=>({...f,role:r.value}))}
                  className={`p-3 rounded-xl border text-left transition-all ${form.role===r.value ? 'border-primary-500/60 bg-primary-500/10' : 'border-white/10 bg-surface-800/30 hover:border-white/20'}`}>
                  <div className="text-xl mb-1">{r.emoji}</div>
                  <p className="text-sm font-semibold text-white">{r.label}</p>
                  <p className="text-[11px] text-surface-400">{r.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Academic info — students only */}
          {form.role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-200 mb-1.5">College</label>
                <input type="text" className="input-field" placeholder="IIT Delhi" value={form.college} onChange={update('college')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-200 mb-1.5">Branch</label>
                <input type="text" className="input-field" placeholder="CSE" value={form.branch} onChange={update('branch')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-200 mb-1.5">Year</label>
                <select className="input-field" value={form.year} onChange={update('year')}>
                  <option value="">Select</option>
                  <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>5th Year</option>
                </select>
              </div>
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-surface-200 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
