import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchUsers, sendConnectionRequest, cancelConnectionRequest, getConnectionRequests, removeConnection } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiOutlineSearch, HiOutlineUserGroup, HiOutlineCalendar, HiOutlineDocumentText, HiOutlineUserAdd, HiOutlineClock } from 'react-icons/hi';
import toast from 'react-hot-toast';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [pendingOutIds, setPendingOutIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  
  const [people, setPeople] = useState([]);
  
  // In a real app we'd search across all collections. For now, we fetch users,
  // and mock the rest to show the UI from the design.
  useEffect(() => {
    setLoading(true);
    if (query) {
      searchUsers(query, 1)
        .then(res => setPeople(res.data.users))
        .catch(() => toast.error('Failed to load search results'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    
    // Fetch pending requests
    getConnectionRequests().then(({ data }) => {
      setPendingOutIds((data.outgoing || []).map(r => String(r.to._id || r.to)));
    }).catch(() => {});
  }, [query]);

  const handleConnect = async (person) => {
    const isConnected = currentUser?.connections?.some(c => String(c._id || c) === String(person._id));
    const isPending = pendingOutIds.includes(person._id);
    
    setActionLoading(person._id);
    try {
      if (isConnected) {
        await removeConnection(person._id);
        setPeople(prev => prev.map(p => {
          if (p._id !== person._id) return p;
          return { ...p, connections: (p.connections || []).filter(c => String(c) !== String(currentUser._id)) };
        }));
        toast.success('Connection removed');
      } else if (isPending) {
        await cancelConnectionRequest(person._id);
        setPendingOutIds(prev => prev.filter(id => id !== person._id));
      } else {
        await sendConnectionRequest(person._id);
        setPendingOutIds(prev => [...prev, person._id]);
        toast.success('Connection request sent!');
      }
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = ['All', 'People', 'Posts', 'Communities', 'Events'];

  // Mock data for UI presentation based on the screenshot
  const mockPosts = [
    { id: 1, author: 'Parth Bhanushali', time: '2 days ago', group: 'Python Developers', content: 'Just completed a Python project using Flask and PostgreSQL. Learned a lot about backend security and API design. Happy to share the repo!', tag: 'Project Showcase', likes: 24, comments: 11, image: true },
    { id: 2, author: 'Riya Shah', time: '1 day ago', group: 'AI & ML Enthusiasts', content: 'What are the best resources to master Python for Data Science in 2024? Looking for courses and project ideas.', tag: 'Help!', likes: 5, comments: 2, image: false },
  ];

  const mockCommunities = [
    { id: 1, name: 'Python Developers', members: '2.4K', online: '156', icon: '🐍' },
    { id: 2, name: 'AI & ML Students', members: '1.2K', online: '94', icon: '🤖' },
    { id: 3, name: 'Coding Club', members: '950', online: '63', icon: '</>' },
    { id: 4, name: 'Data Science Hub', members: '1.5K', online: '125', icon: '📊' },
  ];

  const mockEvents = [
    { id: 1, name: 'Code Relay 2024', date: '24 May, 9:00 AM', location: 'Main Auditorium', category: 'Hackathon', banner: 'from-indigo-900 to-[#5c4dff]' },
    { id: 2, name: 'Python Workshop', date: '26 May, 2:00 PM', location: 'Seminar Hall', category: 'Workshop', banner: 'from-blue-500 to-cyan-400' },
    { id: 3, name: 'Tech Fest \'24', date: '30 May, 10:00 AM', location: 'Campus Grounds', category: 'Event', banner: 'from-emerald-800 to-emerald-500' },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-[1200px] mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
         <div className="w-10 h-10 rounded-full bg-[#5c4dff]/10 flex items-center justify-center text-xl shrink-0">
            🔍
         </div>
         <h1 className="text-2xl font-bold text-gray-900">
            Search results for <span className="text-[#5c4dff]">"{query}"</span>
         </h1>
      </div>

      {/* Page Search Bar */}
      <div className="relative mb-8 max-w-2xl">
         <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
         <input
            type="text"
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all shadow-sm"
            placeholder="Refine your search..."
            defaultValue={query}
            onKeyDown={(e) => {
               if (e.key === 'Enter') {
                  const newQuery = e.target.value.trim();
                  if (newQuery) {
                     window.location.href = `/search?q=${encodeURIComponent(newQuery)}`;
                  }
               }
            }}
         />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-fit">
         {tabs.map(tab => (
            <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab 
                     ? 'bg-[#5c4dff] text-white shadow-md' 
                     : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
               }`}
            >
               {tab}
            </button>
         ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-8">
           <div className="h-64 bg-gray-100 rounded-3xl"></div>
           <div className="h-64 bg-gray-100 rounded-3xl"></div>
        </div>
      ) : (
        <div className="space-y-12">
           
           {/* PEOPLE SECTION */}
           {(activeTab === 'All' || activeTab === 'People') && (
             <div>
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-bold text-gray-900">People</h2>
                   <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all people →</button>
                </div>
                
                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                   {people.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm">No people found for "{query}"</div>
                   ) : (
                      <div className="divide-y divide-gray-50">
                         {people.map(person => (
                            <div key={person._id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                               <div className="flex items-center gap-4">
                                  <Link to={`/people/${person._id}`} className="shrink-0">
                                    {person.avatar ? (
                                      <img src={person.avatar} className="w-12 h-12 rounded-full object-cover" alt={person.name} />
                                    ) : (
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5c4dff] to-blue-500 flex items-center justify-center text-white font-bold">
                                        {person.name?.charAt(0)?.toUpperCase()}
                                      </div>
                                    )}
                                  </Link>
                                  <div>
                                     <div className="flex items-center gap-1.5 mb-1">
                                        <Link to={`/people/${person._id}`} className="text-sm font-bold text-gray-900 group-hover:text-[#5c4dff] transition-colors">
                                          {person.name}
                                        </Link>
                                        <span className="text-[#5c4dff] text-xs">✓</span>
                                     </div>
                                     <p className="text-[11px] font-medium text-gray-500 mb-0.5">
                                        {person.headline || 'Student at UniVoid'}
                                     </p>
                                     <p className="text-[10px] text-gray-400">
                                        {[person.college, person.branch].filter(Boolean).join(' • ')}
                                     </p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-3">
                                  {person._id !== currentUser?._id && (() => {
                                    const isConnected = currentUser?.connections?.some(c => String(c._id || c) === String(person._id));
                                    const isPending = pendingOutIds.includes(person._id);
                                    const isLoading = actionLoading === person._id;
                                    
                                    return (
                                      <button 
                                        onClick={() => handleConnect(person)}
                                        disabled={isLoading}
                                        className={`group/btn relative px-4 py-2 rounded-full border text-xs font-bold transition-colors min-w-[90px] flex items-center justify-center ${
                                          isConnected
                                            ? 'border-gray-200 text-gray-700 bg-white hover:border-red-200 hover:text-red-500 hover:bg-red-50'
                                            : isPending
                                              ? 'border-yellow-500/20 text-yellow-600 bg-yellow-50 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
                                              : 'border-[#5c4dff]/20 text-[#5c4dff] hover:bg-[#5c4dff]/5'
                                        }`}
                                      >
                                        {isLoading ? (
                                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : isConnected ? (
                                          <>
                                            <span className="group-hover/btn:hidden flex items-center gap-1">✓ Connected</span>
                                            <span className="hidden group-hover/btn:flex items-center gap-1">✕ Remove</span>
                                          </>
                                        ) : isPending ? (
                                          <>
                                            <span className="group-hover/btn:hidden flex items-center gap-1"><HiOutlineClock className="w-3.5 h-3.5" /> Pending</span>
                                            <span className="hidden group-hover/btn:flex items-center gap-1">✕ Cancel</span>
                                          </>
                                        ) : (
                                          <>
                                            <HiOutlineUserAdd className="w-3.5 h-3.5 mr-1" /> Connect
                                          </>
                                        )}
                                      </button>
                                    );
                                  })()}
                                  <button className="text-gray-400 hover:text-gray-900">
                                     ⋮
                                  </button>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             </div>
           )}

           {/* POSTS SECTION */}
           {(activeTab === 'All' || activeTab === 'Posts') && (
             <div>
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-bold text-gray-900">Posts</h2>
                   <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all posts →</button>
                </div>
                
                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-gray-50">
                   {mockPosts.map(post => (
                      <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 shrink-0 flex items-center justify-center text-sm font-bold text-blue-600">{post.author.charAt(0)}</div>
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[13px] font-bold text-gray-900">{post.author}</span>
                                  <span className="text-[10px] text-gray-400">{post.time} in <span className="text-[#5c4dff] font-medium">{post.group}</span></span>
                               </div>
                               
                               <div className="flex items-start justify-between gap-6">
                                  <div className="flex-1">
                                     <p className="text-[13px] font-medium text-gray-700 leading-relaxed mb-3">
                                        {post.content}
                                     </p>
                                     <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">{post.tag}</span>
                                        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
                                           <span>♡ {post.likes}</span>
                                           <span>💬 {post.comments}</span>
                                        </div>
                                     </div>
                                  </div>
                                  {post.image && (
                                     <div className="w-32 h-20 bg-gray-900 rounded-xl shrink-0 flex items-center justify-center text-3xl">
                                        🐍
                                     </div>
                                  )}
                               </div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}

           {/* COMMUNITIES SECTION */}
           {(activeTab === 'All' || activeTab === 'Communities') && (
             <div>
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-bold text-gray-900">Communities</h2>
                   <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all communities →</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {mockCommunities.map(comm => (
                      <div key={comm.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all text-center">
                         <div className="w-14 h-14 rounded-full bg-gray-50 border-4 border-white flex items-center justify-center text-2xl mx-auto shadow-sm mb-3">
                            {comm.icon}
                         </div>
                         <h4 className="text-[13px] font-bold text-gray-900 mb-1">{comm.name}</h4>
                         <div className="flex justify-center items-center gap-2 text-[10px] font-medium text-gray-500 mb-4">
                            <span>{comm.members} members</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {comm.online} online</span>
                         </div>
                         <button className="w-full py-2 rounded-xl bg-[#5c4dff]/5 text-[#5c4dff] font-bold text-[11px] hover:bg-[#5c4dff]/10 transition-colors border border-[#5c4dff]/10">
                            Join
                         </button>
                      </div>
                   ))}
                </div>
             </div>
           )}

           {/* EVENTS SECTION */}
           {(activeTab === 'All' || activeTab === 'Events') && (
             <div>
                <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-bold text-gray-900">Events</h2>
                   <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all events →</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {mockEvents.map(event => (
                      <div key={event.id} className="bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                         <div className={`h-24 w-full bg-gradient-to-br ${event.banner} relative flex items-center justify-center p-4`}>
                            <h4 className="text-white font-black text-center text-sm uppercase tracking-wider">{event.name}</h4>
                         </div>
                         <div className="p-4 flex-1 flex flex-col">
                            <h4 className="text-xs font-bold text-gray-900 mb-2 line-clamp-1">{event.name}</h4>
                            <p className="text-[10px] font-medium text-gray-500 flex items-center gap-1.5 mb-1.5">
                               <HiOutlineCalendar className="w-3.5 h-3.5" /> {event.date}
                            </p>
                            <button className="mt-4 w-full py-2 rounded-xl bg-[#5c4dff]/5 text-[#5c4dff] font-bold text-[11px] hover:bg-[#5c4dff]/10 transition-colors border border-[#5c4dff]/10">
                               Interested
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}
           
        </div>
      )}
    </div>
  );
};

export default SearchResults;
