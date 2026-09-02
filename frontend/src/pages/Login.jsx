import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, oauthLogin } from '../services/api';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { BsMicrosoft } from 'react-icons/bs';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiArrowRight } from 'react-icons/hi';

const Login = () => {
  const [form, setForm] = useState({ email: '', phone: '', countryCode: '+91', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');
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
      toast.error('Google Login Failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loginMethod === 'email' && !form.email) return toast.error('Please enter your email');
    if (loginMethod === 'phone' && !form.phone) return toast.error('Please enter your phone number');
    if (!form.password) return toast.error('Please enter your password');
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden -mt-16 pt-16 relative flex items-center justify-center">
      {/* Full-screen Background Image with Clean Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/authbg.png')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-[#0a0a0f]/50 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-start px-6 sm:px-10 lg:pl-[8%] xl:pl-[12%] py-12">
        
        {/* Left side: Clean Dark Card */}
        <div className="w-full lg:w-[600px] xl:w-[650px] flex-shrink-0">
          <div className="w-full bg-[#1e1f26]/40 backdrop-blur-2xl p-8 sm:p-12 rounded-[24px] border border-white/10 shadow-2xl text-white">
            <div className="mb-6">
              <div className="flex bg-[#121318]/50 p-1 rounded-xl border border-white/10 w-fit">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${loginMethod === 'email' ? 'bg-surface-700/80 text-white shadow' : 'text-surface-400 hover:text-white hover:bg-surface-700/40'}`}
                >
                  Email Login
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${loginMethod === 'phone' ? 'bg-surface-700/80 text-white shadow' : 'text-surface-400 hover:text-white hover:bg-surface-700/40'}`}
                >
                  Phone Login
                </button>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {loginMethod === 'email' ? 'Welcome back! 👋' : 'Login with phone'}
              </h1>
              {loginMethod === 'email' && <p className="text-surface-300 text-sm sm:text-base">Login to continue to your account</p>}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {loginMethod === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-surface-200 mb-2">Email or Roll Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <HiOutlineUser className="h-5 w-5 text-surface-400" />
                    </div>
                    <input 
                      type="email" 
                      className="w-full bg-[#121318]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-[#5c4dff] focus:border-transparent transition-all" 
                      placeholder="you@college.edu" 
                      value={form.email} 
                      onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-surface-200 mb-2">Mobile Number</label>
                  <div className="flex gap-2">
                    <select 
                      className="bg-[#121318]/50 border border-white/10 rounded-xl py-3 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#5c4dff] focus:border-transparent transition-all appearance-none"
                      value={form.countryCode}
                      onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <HiOutlineUser className="h-5 w-5 text-surface-400" />
                      </div>
                      <input 
                        type="tel" 
                        className="w-full bg-[#121318]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-[#5c4dff] focus:border-transparent transition-all" 
                        placeholder="98765 43210" 
                        value={form.phone} 
                        onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-surface-200 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiOutlineLockClosed className="h-5 w-5 text-surface-400" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full bg-[#121318]/50 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-[#5c4dff] focus:border-transparent transition-all" 
                    placeholder="••••••••" 
                    value={form.password} 
                    onChange={(e) => setForm({ ...form, password: e.target.value })} 
                  />
                  <button 
                    type="button" 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-400 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-surface-600 bg-surface-700/50 text-[#5c4dff] focus:ring-[#5c4dff]" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-surface-300">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm font-medium text-[#5c4dff] hover:text-primary-300 transition-colors">Forgot password?</a>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#5c4dff] hover:bg-[#4a3ddf] text-white rounded-xl py-3.5 text-base font-semibold shadow-lg hover:shadow-[#5c4dff]/25 transition-all mt-4 flex items-center justify-center gap-2">
                {loading ? 'Logging in...' : 'Login'}
                {!loading && <HiArrowRight className="h-5 w-5" />}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-surface-400">or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-transparent hover:bg-white/5 border border-white/10 rounded-xl transition-all shadow-sm"
                >
                  <FcGoogle size={22} />
                  <span className="text-sm font-medium text-white">Google</span>
                </button>
                <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 bg-transparent hover:bg-white/5 border border-white/10 rounded-xl transition-all shadow-sm">
                  <BsMicrosoft size={20} className="text-[#00a4ef]" />
                  <span className="text-sm font-medium text-white">Microsoft</span>
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-surface-400 mt-8">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#5c4dff] hover:text-primary-300 font-bold transition-colors">Sign up</Link>
            </p>
          </div>
        </div>

                {/* Right side: Empty */}
        <div className="hidden lg:flex flex-1"></div>
      </div>
    </div>
  );
};

export default Login;
