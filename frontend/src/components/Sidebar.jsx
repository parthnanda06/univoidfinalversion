import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { HiOutlineViewGrid, HiOutlineBookOpen, HiOutlineUserGroup, HiOutlineCalendar, HiOutlineUser, HiOutlineSearch, HiOutlineChatAlt2, HiOutlineBriefcase, HiSparkles, HiChevronDown } from 'react-icons/hi';
import { HiOutlineSparkles } from 'react-icons/hi2';

const Sidebar = () => {
  const { user } = useAuth();
  const { unreadTotal } = useChat();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard',      icon: HiOutlineViewGrid },
    { to: '/notes',     label: 'Study Notes',     icon: HiOutlineBookOpen },
    { to: '/communities',label:'Communities',     icon: HiOutlineUserGroup },
    { to: '/events',    label: 'Events',          icon: HiOutlineCalendar },
    { to: '/jobs',      label: user?.role === 'hr' ? 'Manage Jobs' : 'Opportunities', icon: HiOutlineBriefcase },
    { to: '/messages',  label: 'Messages',        icon: HiOutlineChatAlt2, badge: unreadTotal },
    { to: '/ai-study-buddy', label: 'AI Study Buddy', icon: HiSparkles },
    { to: '/profile',   label: 'My Profile',      icon: HiOutlineUser },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-[72px] bottom-0 w-64 flex-col bg-white border-r border-gray-100 z-40 overflow-y-auto custom-scrollbar">
      {/* Profile Header (From Mockup) */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-[#5c4dff] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {user?.name ? user.name.charAt(0)?.toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-[11px] font-medium text-gray-500 truncate">{user?.year || '1st Sem'} • {user?.branch || 'CSE (AI)'}</p>
            </div>
          </div>
          <HiChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1.5">
        {navItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-[#5c4dff]/5 text-[#5c4dff]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className={`w-5 h-5 shrink-0 group-hover:scale-110 transition-transform ${to === '/dashboard' && !window.location.pathname.startsWith('/dashboard') ? 'text-blue-500' : ''}`} />
            <span className="flex-1">{label}</span>
            {badge > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm animate-pulse-badge">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Pro Upgrade Card (From Mockup) */}
      <div className="p-5 mt-auto mb-4 mx-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100/50">
        <p className="text-xs font-semibold text-gray-500 mb-1">Unlock more with</p>
        <p className="text-[15px] font-bold text-[#5c4dff] flex items-center gap-1 mb-3">
          UniVoid Pro <HiSparkles className="text-orange-400" />
        </p>
        <p className="text-[11px] text-gray-600 mb-4 font-medium leading-relaxed">
          Get advanced AI help, unlimited notes, and premium features.
        </p>
        <button className="w-full bg-[#5c4dff] hover:bg-[#4a3ddf] text-white text-xs font-bold py-2.5 rounded-xl shadow-md shadow-[#5c4dff]/20 transition-all hover:-translate-y-0.5">
          Upgrade Now →
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-2">
        <p className="text-[10px] font-medium text-gray-400">UniVoid v1.0 — Student Ecosystem</p>
      </div>
    </aside>
  );
};

export default Sidebar;
