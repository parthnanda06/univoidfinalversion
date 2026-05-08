import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../services/api';
import { HiOutlineBookOpen, HiOutlineChatAlt2, HiOutlineCalendar, HiOutlineArrowRight } from 'react-icons/hi';

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
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-surface-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-surface-800 rounded-2xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          {greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-surface-200 text-sm">Here's what's happening in your student universe.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: HiOutlineBookOpen, label: 'Latest Notes', count: data?.latestNotes?.length || 0, color: 'from-blue-500 to-indigo-500', link: '/notes' },
          { icon: HiOutlineChatAlt2, label: 'Recent Posts', count: data?.recentPosts?.length || 0, color: 'from-emerald-500 to-teal-500', link: '/communities' },
          { icon: HiOutlineCalendar, label: 'Upcoming Events', count: data?.upcomingEvents?.length || 0, color: 'from-amber-500 to-orange-500', link: '/events' },
        ].map((stat) => (
          <Link key={stat.label} to={stat.link} className="glass-card rounded-2xl p-5 group">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <HiOutlineArrowRight className="w-4 h-4 text-surface-700 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-2xl font-bold text-white mt-3">{stat.count}</p>
            <p className="text-xs text-surface-200">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Latest Notes */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">📚 Latest Study Notes</h2>
          <Link to="/notes" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">View all <HiOutlineArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.latestNotes?.slice(0, 3).map((note) => (
            <div key={note._id} className="glass-card rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-300 bg-primary-500/15 px-2 py-0.5 rounded-full">{note.subject}</span>
                <span className="text-[10px] text-surface-700">{note.fileType?.toUpperCase()}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2">{note.title}</h3>
              <p className="text-xs text-surface-200 line-clamp-2 mb-3">{note.description}</p>
              <div className="flex items-center justify-between text-[10px] text-surface-700">
                <span>By {note.uploadedBy?.name}</span>
                <span>{note.downloads} downloads</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Community Posts */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">💬 Community Activity</h2>
          <Link to="/communities" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">View all <HiOutlineArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="space-y-3">
          {data?.recentPosts?.slice(0, 4).map((post) => (
            <div key={post._id} className="glass-card rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {post.author?.name?.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{post.author?.name}</span>
                  <span className="text-[10px] text-surface-700">in</span>
                  <span className="text-[10px] text-primary-300">{post.community?.icon} {post.community?.name}</span>
                </div>
                <p className="text-xs text-surface-200 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-surface-700">
                  <span>❤️ {post.likeCount}</span>
                  <span>💬 {post.comments?.length || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">📅 Upcoming Events</h2>
          <Link to="/events" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">View all <HiOutlineArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data?.upcomingEvents?.slice(0, 4).map((event) => (
            <div key={event._id} className="glass-card rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-400 bg-accent-500/15 px-2 py-0.5 rounded-full">{event.category}</span>
                <span className="text-[10px] text-surface-700">{event.registrationCount || 0} going</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{event.title}</h3>
              <p className="text-xs text-surface-200 line-clamp-2 mb-3">{event.description}</p>
              <div className="flex items-center gap-2 text-[10px] text-surface-700">
                <span>📍 {event.location}</span>
                <span>•</span>
                <span>🗓 {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
