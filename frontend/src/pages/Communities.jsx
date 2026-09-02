import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCommunities, createCommunity, joinCommunity, leaveCommunity } from '../services/api';
import { HiOutlinePlus, HiOutlineUserGroup, HiX, HiOutlineSearch, HiChevronDown, HiOutlineCode, HiOutlineChartBar, HiOutlineDesktopComputer, HiOutlineColorSwatch, HiOutlineChatAlt2, HiOutlineSparkles, HiOutlineShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Communities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: '', icon: '💬' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getCommunities()
      .then((res) => setCommunities(res.data))
      .catch(() => toast.error('Failed to load communities'))
      .finally(() => setLoading(false));
  }, []);

  const isMember = (community) => community.members?.some(m => (m._id || m) === user?._id);

  const handleJoin = async (id) => {
    try {
      const { data } = await joinCommunity(id);
      setCommunities(communities.map(c => c._id === id ? { ...c, members: [...c.members, user._id], memberCount: data.memberCount } : c));
      toast.success('Joined community!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    }
  };

  const handleLeave = async (id) => {
    try {
      const { data } = await leaveCommunity(id);
      setCommunities(communities.map(c => c._id === id ? { ...c, members: c.members.filter(m => (m._id || m) !== user._id), memberCount: data.memberCount } : c));
      toast.success('Left community');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name is required');
    setSubmitting(true);
    try {
      const { data } = await createCommunity(form);
      setCommunities([data, ...communities]);
      setShowModal(false);
      setForm({ name: '', description: '', category: '', icon: '💬' });
      toast.success('Community created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  const icons = ['💬', '⚔️', '🚀', '🎨', '🤖', '📚', '🎮', '🏋️', '🎵', '💡', '🔬', '🌍'];

  // For the mockup's featured communities, we can statically map some styles or use the first 4 real ones
  const featuredStyles = [
    { bg: 'from-purple-400 to-indigo-500', iconBg: 'bg-indigo-900', iconColor: 'text-white' },
    { bg: 'from-blue-400 to-cyan-500', iconBg: 'bg-blue-600', iconColor: 'text-white' },
    { bg: 'from-emerald-400 to-green-500', iconBg: 'bg-emerald-600', iconColor: 'text-white' },
    { bg: 'from-pink-400 to-rose-500', iconBg: 'bg-rose-600', iconColor: 'text-white' },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto animate-fade-in bg-[#fdfdfd] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="text-4xl shrink-0">
             👥
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Communities</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Join groups, share ideas, and connect with peers</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#5c4dff] hover:bg-[#4a3ddf] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2">
           <HiOutlinePlus className="w-4 h-4" /> Create Community
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text" 
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]" 
            placeholder="Search communities..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-56">
           <select className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all appearance-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
             <option value="">All Categories</option>
             <option value="Tech">Technology</option>
             <option value="Design">Design</option>
             <option value="Science">Science</option>
           </select>
           <HiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative w-full sm:w-48">
           <select className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all appearance-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
             <option value="popular">Sort by: Popular</option>
             <option value="newest">Sort by: Newest</option>
           </select>
           <HiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse border border-gray-200"></div>)}
        </div>
      ) : (
        <>
          {/* Featured Communities */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[17px] font-bold text-gray-900">Featured Communities</h2>
              <button className="text-xs font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {communities.slice(0, 4).map((c, i) => {
                const style = featuredStyles[i % featuredStyles.length];
                const _isMember = isMember(c);
                return (
                  <div key={c._id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-[0_4px_15px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all group flex flex-col">
                    {/* Banner Top */}
                    <div className={`h-24 w-full bg-gradient-to-br ${style.bg} relative overflow-hidden`}>
                       {/* Abstract circles */}
                       <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                       <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 bg-white/20 rounded-full blur-lg"></div>
                    </div>
                    {/* Content */}
                    <div className="px-5 pb-5 pt-0 relative flex-1 flex flex-col">
                      {/* Icon Overlap */}
                      <div className={`w-14 h-14 rounded-full ${style.iconBg} border-4 border-white flex items-center justify-center text-xl shadow-sm -mt-7 mb-3 relative z-10 mx-auto`}>
                        {c.icon}
                      </div>
                      
                      <h3 className="text-sm font-bold text-gray-900 text-center mb-1 group-hover:text-[#5c4dff] transition-colors">{c.name}</h3>
                      <p className="text-[11px] font-medium text-gray-500 text-center line-clamp-2 mb-4 flex-1">{c.description}</p>
                      
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 mb-4 px-2">
                         <span className="flex items-center gap-1"><HiOutlineUserGroup className="w-3.5 h-3.5"/> {(c.memberCount || 0).toLocaleString()} members</span>
                         <span className="text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Online</span>
                      </div>
                      
                      {_isMember ? (
                         <button onClick={() => navigate(`/communities/${c._id}`)} className="w-full py-2 rounded-xl bg-[#5c4dff]/10 text-[#5c4dff] font-bold text-[11px] hover:bg-[#5c4dff]/20 transition-colors">
                           Enter Community
                         </button>
                      ) : (
                         <button onClick={() => handleJoin(c._id)} className="w-full py-2 rounded-xl bg-gray-50 text-[#5c4dff] font-bold text-[11px] hover:bg-[#5c4dff]/10 transition-colors border border-gray-100">
                           Join
                         </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All Communities (Horizontal List style) */}
          <div className="mb-12">
            <h2 className="text-[17px] font-bold text-gray-900 mb-6">All Communities</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {communities.slice(4).map((c, i) => {
                 const _isMember = isMember(c);
                 return (
                  <div key={c._id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-md transition-all group flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                        {c.icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#5c4dff] transition-colors">{c.name}</h3>
                        <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">{c.description}</p>
                        <p className="text-[10px] font-medium text-gray-400 mt-1 flex items-center gap-1.5">
                           <span>{(c.memberCount || 0).toLocaleString()} members</span>
                           <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                           <span>{c.category || 'General'}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex items-center gap-2">
                       {_isMember ? (
                          <button onClick={() => navigate(`/communities/${c._id}`)} className="px-4 py-1.5 rounded-lg bg-[#5c4dff]/10 text-[#5c4dff] font-bold text-[11px] hover:bg-[#5c4dff]/20 transition-colors">
                            Enter
                          </button>
                       ) : (
                          <button onClick={() => handleJoin(c._id)} className="px-4 py-1.5 rounded-lg bg-white border border-gray-200 text-[#5c4dff] font-bold text-[11px] hover:bg-gray-50 transition-colors shadow-sm">
                            Join
                          </button>
                       )}
                    </div>
                  </div>
                 );
              })}
            </div>
            {communities.length <= 4 && (
              <p className="text-sm text-gray-500 text-center py-8">No more communities to show.</p>
            )}
          </div>
        </>
      )}

      {/* Features Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-gray-100 mt-auto">
         <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
               <HiOutlineUserGroup className="w-5 h-5" />
            </div>
            <div>
               <h4 className="text-xs font-bold text-gray-900 mb-1">Connect & Collaborate</h4>
               <p className="text-[10px] font-medium text-gray-500 leading-relaxed max-w-[150px]">Connect with like-minded students and grow together.</p>
            </div>
         </div>
         <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
               <HiOutlineChatAlt2 className="w-5 h-5" />
            </div>
            <div>
               <h4 className="text-xs font-bold text-gray-900 mb-1">Share & Learn</h4>
               <p className="text-[10px] font-medium text-gray-500 leading-relaxed max-w-[150px]">Share resources, ask questions and learn from others.</p>
            </div>
         </div>
         <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
               <HiOutlineSparkles className="w-5 h-5" />
            </div>
            <div>
               <h4 className="text-xs font-bold text-gray-900 mb-1">Grow Together</h4>
               <p className="text-[10px] font-medium text-gray-500 leading-relaxed max-w-[150px]">Build projects, join events and achieve more together.</p>
            </div>
         </div>
         <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
               <HiOutlineShieldCheck className="w-5 h-5" />
            </div>
            <div>
               <h4 className="text-xs font-bold text-gray-900 mb-1">Safe & Inclusive</h4>
               <p className="text-[10px] font-medium text-gray-500 leading-relaxed max-w-[150px]">A positive and supportive space for everyone.</p>
            </div>
         </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-gray-100 shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-md relative">
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"><HiX className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create Community</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {icons.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm({ ...form, icon })} className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all border ${form.icon === icon ? 'bg-[#5c4dff]/10 border-[#5c4dff] ring-2 ring-[#5c4dff]/20 scale-110' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>{icon}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Name *</label>
                <input type="text" className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all" placeholder="e.g., Code Warriors" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Category</label>
                <input type="text" className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all" placeholder="e.g., Coding, Design, Business" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Description</label>
                <textarea className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all" rows="3" placeholder="What's this community about?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-[#5c4dff] hover:bg-[#4a3ddf] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all mt-2">
                {submitting ? 'Creating...' : 'Create Community'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communities;
