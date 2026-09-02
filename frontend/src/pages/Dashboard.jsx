import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../services/api';
import { HiOutlineArrowRight, HiSparkles, HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineCalendar, HiOutlineDocumentText, HiOutlineVideoCamera, HiOutlineLocationMarker, HiBookmark } from 'react-icons/hi';
import { HiOutlineUserPlus } from 'react-icons/hi2';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-10 bg-gray-50/50 min-h-screen">
        <div className="animate-pulse space-y-8 max-w-[1200px] mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
          </div>
          <div className="h-64 bg-gray-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Sparkline SVG components for stats
  const SparklineUp = ({ color }) => (
    <svg className={`w-20 h-8 ${color}`} viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 25 C 20 25, 30 10, 50 15 C 70 20, 80 5, 100 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );

  const stats = [
    { label: 'Communities', count: data?.recentPosts?.length || 12, trend: '2 this week', icon: HiOutlineUserGroup, bg: 'bg-[#5c4dff]/10', text: 'text-[#5c4dff]', sparkColor: 'text-[#5c4dff]' },
    { label: 'Connections', count: 28, trend: '5 this week', icon: HiOutlineUserPlus, bg: 'bg-blue-500/10', text: 'text-blue-500', sparkColor: 'text-blue-400' },
    { label: 'Upcoming Events', count: data?.upcomingEvents?.length || 4, trend: '1 this week', icon: HiOutlineCalendar, bg: 'bg-emerald-500/10', text: 'text-emerald-500', sparkColor: 'text-emerald-400' },
    { label: 'Applications', count: 8, trend: '3 this week', icon: HiOutlineBriefcase, bg: 'bg-orange-500/10', text: 'text-orange-500', sparkColor: 'text-orange-400' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      <div className="p-6 lg:p-10 max-w-[1400px] mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="mb-10 relative">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          {greeting()}, {user?.name ? user.name.split(' ')[0] : 'User'}! 👋
        </h1>
        <p className="text-gray-500 font-medium">Let's make today productive.</p>
        
        {/* Background decorative city graphic (optional/CSS representation) */}
        <div className="absolute right-0 top-0 h-24 w-[400px] opacity-40 pointer-events-none hidden md:block">
           <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
           {/* Abstract city shapes using CSS */}
           <div className="absolute bottom-0 right-10 w-16 h-16 bg-blue-100 rounded-t-lg"></div>
           <div className="absolute bottom-0 right-32 w-12 h-20 bg-purple-100 rounded-t-lg"></div>
           <div className="absolute bottom-0 right-48 w-20 h-12 bg-indigo-100 rounded-t-lg"></div>
           <div className="absolute bottom-16 right-20 w-8 h-8 rounded-full bg-yellow-100"></div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.text}`} />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-500 mb-1">{stat.label}</p>
              <div className="flex flex-col">
                <p className="text-3xl font-black text-gray-900 mb-4">{stat.count}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="text-sm leading-none">↗</span> {stat.trend}
                  </p>
                  <SparklineUp color={stat.sparkColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Section: AI Banner & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* AI Buddy Banner (Left, spans 2 cols) */}
        <div className="lg:col-span-2 bg-gradient-to-r from-[#5c4dff] to-[#7f74ff] rounded-3xl p-8 sm:p-10 shadow-lg shadow-[#5c4dff]/20 relative overflow-hidden flex flex-col justify-center min-h-[260px]">
          {/* Abstract glows */}
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-50px] left-[30%] w-48 h-48 bg-[#938bff]/40 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 max-w-sm">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              Your AI Assistant
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">UniVoid AI Study Buddy</h2>
            <p className="text-white/80 text-sm font-medium mb-8 leading-relaxed">
              Your personal AI assistant for learning, doubts, and guidance.
            </p>
            <Link to="/ai-study-buddy" className="inline-flex items-center gap-2 bg-white text-[#5c4dff] px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all">
              Start a conversation <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* 3D Robot Graphic representation */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 min-w-[200px] hidden sm:flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 relative">
               <div className="absolute inset-0 bg-blue-300/30 blur-2xl rounded-full"></div>
               {/* Simplified Robot CSS */}
               <div className="absolute inset-0 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="w-24 h-20 bg-white rounded-3xl shadow-2xl border-4 border-gray-100 flex flex-col items-center justify-center gap-2 relative">
                     {/* Eyes */}
                     <div className="flex gap-4">
                        <div className="w-5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                        <div className="w-5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                     </div>
                     {/* Antenna */}
                     <div className="absolute -top-6 w-2 h-6 bg-gray-200 rounded-t-full"></div>
                     <div className="absolute -top-7 w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                     
                     {/* Floating UI Elements */}
                     <div className="absolute -left-12 top-4 w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg border border-white/40 flex items-center justify-center text-white text-xs">?</div>
                     <div className="absolute -right-10 -bottom-2 w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg border border-white/40 flex items-center justify-center text-white text-xs"><HiOutlineDocumentText/></div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events Widget (Right, spans 1 col) */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[17px] font-bold text-gray-900">Upcoming Events</h2>
            <Link to="/events" className="text-xs font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all</Link>
          </div>
          
          <div className="flex-1 space-y-4">
            {/* Event 1 */}
            <div className="flex gap-4 items-center group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-900 to-[#5c4dff] rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                <span className="text-[10px] font-black text-center leading-tight">Code<br/>Relay</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#5c4dff] transition-colors">Code Relay 2024</h3>
                <p className="text-[11px] font-medium text-gray-500 mt-1">24 May, 9:00 AM</p>
                <p className="text-[11px] text-gray-400 truncate">Main Auditorium</p>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md shrink-0 border border-blue-100">Online</span>
            </div>
            
            <div className="h-px bg-gray-50"></div>
            
            {/* Event 2 */}
            <div className="flex gap-4 items-center group cursor-pointer">
              <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-200">
                 <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=80" alt="Event" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#5c4dff] transition-colors">Web Dev Workshop</h3>
                <p className="text-[11px] font-medium text-gray-500 mt-1">21 May, 2:00 PM</p>
                <p className="text-[11px] text-gray-400 truncate">A Block, Room 101</p>
              </div>
            </div>

            <div className="h-px bg-gray-50"></div>

            {/* Event 3 */}
            <div className="flex gap-4 items-center group cursor-pointer">
              <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-200">
                 <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=100&q=80" alt="Event" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#5c4dff] transition-colors">Tech Fest '24</h3>
                <p className="text-[11px] font-medium text-gray-500 mt-1">25 May, 10:00 AM</p>
                <p className="text-[11px] text-gray-400 truncate">Main Auditorium</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recommended For You */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[17px] font-bold text-gray-900">Recommended for you</h2>
          <Link to="/explore" className="text-xs font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all</Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Item 1 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-[0_4px_15px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-[#5c4dff] uppercase tracking-wider bg-[#5c4dff]/5 border border-[#5c4dff]/10 px-2.5 py-1 rounded-full">Internship</span>
              <button className="text-gray-300 hover:text-[#5c4dff] transition-colors"><HiBookmark className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-sm">
                <HiOutlineBriefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#5c4dff] transition-colors line-clamp-1">Frontend Developer Intern</h3>
                <p className="text-[11px] font-medium text-gray-500">Acme Corp • Remote</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <p className="text-[11px] font-medium text-gray-400">Apply by 31 May</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-[0_4px_15px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">Community</span>
              <button className="text-gray-300 hover:text-[#5c4dff] transition-colors"><HiBookmark className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
                <HiSparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#5c4dff] transition-colors line-clamp-1">AI & ML Club</h3>
                <p className="text-[11px] font-medium text-gray-500">1.2k members</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex -space-x-2">
                <img src="https://i.pravatar.cc/150?u=1" className="w-6 h-6 rounded-full border-2 border-white" alt="member" />
                <img src="https://i.pravatar.cc/150?u=2" className="w-6 h-6 rounded-full border-2 border-white" alt="member" />
                <img src="https://i.pravatar.cc/150?u=3" className="w-6 h-6 rounded-full border-2 border-white" alt="member" />
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600">+32</div>
              </div>
            </div>
          </div>

          {/* Item 3 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-[0_4px_15px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">Event</span>
              <button className="text-gray-300 hover:text-[#5c4dff] transition-colors"><HiBookmark className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
                <HiOutlineCalendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#5c4dff] transition-colors line-clamp-1">Design Thinking Workshop</h3>
                <p className="text-[11px] font-medium text-gray-500">22 May, 1:30 PM</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1"><HiOutlineLocationMarker/> Seminar Hall</p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-[0_4px_15px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">Note</span>
              <button className="text-gray-300 hover:text-[#5c4dff] transition-colors"><HiBookmark className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500 text-white flex items-center justify-center shadow-sm">
                <HiOutlineDocumentText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#5c4dff] transition-colors line-clamp-1">Operating Systems Notes</h3>
                <p className="text-[11px] font-medium text-gray-500">By Aarav Patel</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <p className="text-[11px] font-medium text-gray-400">4.8 ⭐ • 123 downloads</p>
            </div>
          </div>
        </div>
      </div>
      
      </div>
    </div>
  );
};

export default Dashboard;
