import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMenu, HiX } from 'react-icons/hi';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
              U
            </div>
            <span className="text-lg font-bold text-white">
              Uni<span className="gradient-text">Void</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm text-surface-200 hover:text-white transition-colors px-3 py-2">Dashboard</Link>
                <Link to="/notes" className="text-sm text-surface-200 hover:text-white transition-colors px-3 py-2">Notes</Link>
                <Link to="/communities" className="text-sm text-surface-200 hover:text-white transition-colors px-3 py-2">Communities</Link>
                <Link to="/events" className="text-sm text-surface-200 hover:text-white transition-colors px-3 py-2">Events</Link>
                <Link to="/people" className="text-sm text-surface-200 hover:text-white transition-colors px-3 py-2">Find People</Link>
                <div className="w-px h-6 bg-surface-700 mx-2"></div>
                <NotificationBell />
                <Link to="/profile" className="flex items-center gap-2 text-sm text-surface-200 hover:text-white transition-colors">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-primary-500/30" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-semibold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {user.name?.split(' ')[0]}
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-xs py-2 px-3">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-surface-200 hover:text-white transition-colors px-3 py-2">Login</Link>
                <Link to="/register" className="btn-primary text-xs py-2">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-surface-200 hover:text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <HiX size={24} /> : <HiOutlineMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-white/5 animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-surface-200 hover:text-white py-2 px-3 rounded-lg hover:bg-surface-800/50">Dashboard</Link>
                <Link to="/notes" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-surface-200 hover:text-white py-2 px-3 rounded-lg hover:bg-surface-800/50">Notes</Link>
                <Link to="/communities" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-surface-200 hover:text-white py-2 px-3 rounded-lg hover:bg-surface-800/50">Communities</Link>
                <Link to="/events" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-surface-200 hover:text-white py-2 px-3 rounded-lg hover:bg-surface-800/50">Events</Link>
                <Link to="/people" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-surface-200 hover:text-white py-2 px-3 rounded-lg hover:bg-surface-800/50">Find People</Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-surface-200 hover:text-white py-2 px-3 rounded-lg hover:bg-surface-800/50">Profile</Link>
                <button onClick={handleLogout} className="w-full text-left text-sm text-red-400 hover:text-red-300 py-2 px-3 rounded-lg hover:bg-surface-800/50">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-surface-200 hover:text-white py-2 px-3 rounded-lg hover:bg-surface-800/50">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block text-center btn-primary w-full mt-2">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
