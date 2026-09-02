import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser, oauthLogin } from '../services/api';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', college: '', branch: '', year: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/login'
        }
      });
      if (error) throw error;
    } catch (err) {
      toast.error('Google Sign-Up Failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Name, email, and password are required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    
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
    <div className="h-screen overflow-hidden -mt-16 pt-16 relative flex items-center justify-center">
      {/* Full-screen Background Image with Clean Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/authbg.png')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-[#0a0a0f]/50 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-start px-6 sm:px-10 lg:pl-[8%] xl:pl-[12%] py-12">
        
        {/* Left side: Form */}
        <div className="w-full lg:w-[450px] flex-shrink-0">
          <div className="w-full bg-[#1e1f26]/40 backdrop-blur-2xl p-8 sm:p-12 rounded-[24px] border border-white/10 shadow-2xl text-white">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Create your account ✨</h1>
              <p className="text-surface-300 text-sm sm:text-base">Join UniVoid and explore endless opportunities</p>
            </div>
            
            <button 
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent hover:bg-white/5 border border-white/10 rounded-xl transition-all shadow-sm mb-6"
            >
              <FcGoogle size={22} />
              <span className="text-sm font-medium text-white">Sign up with Google</span>
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1e1f26] px-2 text-surface-400">Or continue with</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-200 mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <HiOutlineUser className="h-5 w-5 text-surface-400" />
                    </div>
                    <input type="text" className="w-full bg-[#121318]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-[#5c4dff] focus:border-transparent transition-all" placeholder="John Doe" value={form.name} onChange={update('name')} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-200 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <HiOutlineMail className="h-5 w-5 text-surface-400" />
                    </div>
                    <input type="email" className="w-full bg-[#121318]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-[#5c4dff] focus:border-transparent transition-all" placeholder="you@college.edu" value={form.email} onChange={update('email')} />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-200 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <HiOutlineLockClosed className="h-5 w-5 text-surface-400" />
                    </div>
                    <input type="password" className="w-full bg-[#121318]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-[#5c4dff] focus:border-transparent transition-all" placeholder="Min 6 characters" value={form.password} onChange={update('password')} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-200 mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <HiOutlineLockClosed className="h-5 w-5 text-surface-400" />
                    </div>
                    <input type="password" className="w-full bg-[#121318]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-[#5c4dff] focus:border-transparent transition-all" placeholder="••••••••" value={form.confirmPassword} onChange={update('confirmPassword')} />
                  </div>
                </div>
              </div>

              {/* Role Selector */}
              <div className="mt-2">
                <label className="block text-sm font-medium text-surface-200 mb-2">I am a…</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ value:'student', emoji:'🎓', label:'Student', sub:'Browse jobs & apply' }, { value:'hr', emoji:'💼', label:'HR/Recruiter', sub:'Post jobs & hire' }].map(r => (
                    <button key={r.value} type="button" onClick={() => setForm(f=>({...f,role:r.value}))}
                      className={`p-3 rounded-xl border text-left transition-all ${form.role===r.value ? 'border-primary-500 bg-primary-600/20' : 'border-white/10 bg-[#121318]/50 hover:bg-surface-700/50'}`}>
                      <div className="text-xl mb-1">{r.emoji}</div>
                      <p className={`text-sm font-bold ${form.role===r.value ? 'text-[#5c4dff]' : 'text-white'}`}>{r.label}</p>
                      <p className="text-[11px] text-surface-400">{r.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Academic info */}
              {form.role === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-surface-300 mb-1.5">College</label>
                    <input type="text" className="w-full bg-[#121318]/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-[#5c4dff] transition-all" placeholder="IIT Delhi" value={form.college} onChange={update('college')} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-300 mb-1.5">Branch</label>
                    <input type="text" className="w-full bg-[#121318]/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-[#5c4dff] transition-all" placeholder="CSE" value={form.branch} onChange={update('branch')} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-300 mb-1.5">Year</label>
                    <select className="w-full bg-[#121318]/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#5c4dff] transition-all appearance-none" value={form.year} onChange={update('year')}>
                      <option value="" className="bg-surface-800">Select</option>
                      <option className="bg-surface-800">1st Year</option><option className="bg-surface-800">2nd Year</option><option className="bg-surface-800">3rd Year</option><option className="bg-surface-800">4th Year</option><option className="bg-surface-800">5th Year</option>
                    </select>
                  </div>
                </div>
              )}
              
              <button type="submit" disabled={loading} className="w-full bg-[#5c4dff] hover:bg-[#4a3ddf] text-white rounded-xl py-3.5 text-base font-semibold shadow-lg hover:shadow-[#5c4dff]/25 transition-all mt-6">
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
            
            <p className="text-center text-sm text-surface-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-[#5c4dff] hover:text-primary-300 font-bold transition-colors">Login</Link>
            </p>
          </div>
        </div>

                {/* Right side: Empty */}
        <div className="hidden lg:flex flex-1"></div>
      </div>
    </div>
  );
};

export default Register;
