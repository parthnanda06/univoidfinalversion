import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { HiOutlineViewGrid, HiOutlineBookOpen, HiOutlineUserGroup, HiOutlineCalendar, HiOutlineUser, HiOutlineSearch, HiOutlineChatAlt2, HiOutlineBriefcase } from 'react-icons/hi';

const Sidebar = () => {
  const { user } = useAuth();
  const { unreadTotal } = useChat();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard',      icon: HiOutlineViewGrid },
    { to: '/notes',     label: 'Study Notes',     icon: HiOutlineBookOpen },
    { to: '/communities',label:'Communities',     icon: HiOutlineUserGroup },
    { to: '/events',    label: 'Events',          icon: HiOutlineCalendar },
    { to: '/people',    label: 'Find People',     icon: HiOutlineSearch },
    { to: '/jobs',      label: user?.role === 'hr' ? 'Manage Jobs' : 'Jobs / Internships', icon: HiOutlineBriefcase },
    { to: '/messages',  label: 'Messages',        icon: HiOutlineChatAlt2, badge: unreadTotal },
    { to: '/profile',   label: 'My Profile',      icon: HiOutlineUser },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 flex-col glass border-r border-white/5 z-40">
      {/* User card */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-surface-200 truncate">{user?.college || user?.email}</p>
          </div>
        </div>
        {user?.role === 'admin' && (
          <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wider bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-full">Admin</span>
        )}
        {user?.role === 'hr' && (
          <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">HR / Recruiter</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-500/15 text-primary-300 border border-primary-500/20'
                  : 'text-surface-200 hover:bg-surface-800/50 hover:text-white border border-transparent'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="flex-1">{label}</span>
            {badge > 0 && (
              <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse-badge">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <p className="text-[10px] text-surface-700 text-center">UniVoid v1.0 — Student Ecosystem</p>
      </div>
    </aside>
  );
};

export default Sidebar;
