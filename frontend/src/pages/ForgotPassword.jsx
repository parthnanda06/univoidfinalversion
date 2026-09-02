import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiArrowLeft } from 'react-icons/hi';
import { HiOutlineShieldCheck } from 'react-icons/hi2';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email or roll number');
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Reset link sent to your email!');
      setLoading(false);
      setEmail('');
    }, 1500);
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
        <div className="w-full lg:w-[520px] flex-shrink-0">
          <div className="w-full bg-[#1e1f26]/40 backdrop-blur-2xl p-8 sm:p-12 rounded-[24px] border border-white/10 shadow-2xl text-white">
            <div className="mb-8">
              <Link to="/login" className="inline-flex items-center text-sm font-medium text-surface-400 hover:text-white transition-colors mb-6">
                <HiArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">Forgot password?</h1>
              <p className="text-surface-300 text-sm sm:text-base leading-relaxed">
                No worries! Enter your email or roll number and we'll send you a reset link.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-surface-200 mb-2">Email or Roll Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiOutlineUser className="h-5 w-5 text-surface-400" />
                  </div>
                  <input 
                    type="text" 
                    className="w-full bg-[#121318]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-[#5c4dff] focus:border-transparent transition-all" 
                    placeholder="you@college.edu" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>
              
              <button type="submit" disabled={loading} className="w-full bg-[#5c4dff] hover:bg-[#4a3ddf] text-white rounded-xl py-3.5 text-base font-semibold shadow-lg hover:shadow-[#5c4dff]/25 transition-all mt-6">
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>
            
            <p className="text-center text-sm text-surface-400 mt-8">
              Remember your password?{' '}
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

export default ForgotPassword;
