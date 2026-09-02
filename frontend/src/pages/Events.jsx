import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEvents, createEvent, registerForEvent } from '../services/api';
import { 
  HiOutlinePlus, HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineExternalLink, HiX, 
  HiOutlineSearch, HiChevronDown, HiOutlineBookmark, HiOutlineCode, HiOutlinePresentationChartBar, 
  HiOutlineVideoCamera, HiOutlineStar, HiOutlineAcademicCap, HiOutlineUserGroup, HiOutlineCalendar as HiOutlineCalendarEvent, HiStar
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '', link: '', category: '' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getEvents({ upcoming: 'true' })
      .then((res) => setEvents(res.data))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const isRegistered = (event) => event.registrations?.some(r => (r._id || r) === user?._id);

  const handleRegister = async (id) => {
    try {
      const { data } = await registerForEvent(id);
      setEvents(events.map(e => e._id === id ? { ...e, registrations: [...(e.registrations || []), user._id], registrationCount: data.registrationCount } : e));
      toast.success('Registered!');
      const event = events.find(e => e._id === id);
      if (event?.link) window.open(event.link, '_blank');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return toast.error('Title and date are required');
    setSubmitting(true);
    try {
      const { data } = await createEvent(form);
      setEvents([data, ...events].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowModal(false);
      setForm({ title: '', description: '', date: '', location: '', link: '', category: '' });
      toast.success('Event created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryColors = {
    'Hackathon': 'text-purple-600 bg-purple-50 border-purple-100',
    'Workshop': 'text-blue-600 bg-blue-50 border-blue-100',
    'Event': 'text-emerald-600 bg-emerald-50 border-emerald-100',
    'Bootcamp': 'text-orange-600 bg-orange-50 border-orange-100',
    'Competition': 'text-rose-600 bg-rose-50 border-rose-100',
    'default': 'text-[#5c4dff] bg-[#5c4dff]/5 border-[#5c4dff]/10',
  };

  const bannerGradients = [
    'from-indigo-900 to-[#5c4dff]',
    'from-blue-500 to-cyan-400',
    'from-emerald-800 to-emerald-500',
    'from-orange-100 to-rose-100'
  ];

  const getBadgeStyle = (category) => categoryColors[category] || categoryColors['default'];

  // Mock categories for the "Browse by Categories" section
  const browseCategories = [
    { name: 'Hackathons', count: '24 Events', icon: <HiOutlineCode />, color: 'text-purple-600 bg-purple-50' },
    { name: 'Workshops', count: '18 Events', icon: <HiOutlinePresentationChartBar />, color: 'text-blue-600 bg-blue-50' },
    { name: 'Webinars', count: '12 Events', icon: <HiOutlineVideoCamera />, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Competitions', count: '15 Events', icon: <HiOutlineStar />, color: 'text-orange-600 bg-orange-50' },
    { name: 'Bootcamps', count: '10 Events', icon: <HiOutlineAcademicCap />, color: 'text-rose-600 bg-rose-50' },
    { name: 'Meetups', count: '8 Events', icon: <HiOutlineUserGroup />, color: 'text-[#5c4dff] bg-[#5c4dff]/10' },
  ];

  const registeredEvents = events.filter(e => isRegistered(e));

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="text-4xl shrink-0">
             🗓️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Events & Opportunities</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Discover hackathons, workshops, and more</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#5c4dff] hover:bg-[#4a3ddf] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2">
           <HiOutlinePlus className="w-4 h-4" /> Create Event
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text" 
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]" 
            placeholder="Search events, hackathons, workshops..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-48">
           <select className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all appearance-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
             <option value="">All Categories</option>
             <option>Hackathon</option>
             <option>Workshop</option>
             <option>Competition</option>
           </select>
           <HiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative w-full sm:w-48">
           <select className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all appearance-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
             <option value="">All Types</option>
             <option>Online</option>
             <option>Offline</option>
           </select>
           <HiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative w-full sm:w-48">
           <select className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all appearance-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
             <option value="upcoming">Sort by: Upcoming</option>
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
          {/* Upcoming Events (Horizontal Featured) */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[15px] font-bold text-gray-900">Upcoming Events</h2>
              <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all</button>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {events.slice(0, 4).map((event, i) => {
                const badgeStyle = getBadgeStyle(event.category);
                const bannerStyle = bannerGradients[i % bannerGradients.length];
                const dateObj = new Date(event.date);
                return (
                  <div key={event._id} className="min-w-[280px] sm:min-w-[320px] bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-[0_4px_15px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all group flex flex-col shrink-0">
                    {/* Banner Image Area */}
                    <div className={`h-32 w-full bg-gradient-to-br ${bannerStyle} relative flex items-center justify-center`}>
                       {/* Abstract elements */}
                       <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                       <button className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-lg flex items-center justify-center text-white transition-colors">
                          <HiOutlineBookmark className="w-4 h-4" />
                       </button>
                       {/* Placeholder graphics for event banner */}
                       <div className="text-white font-black text-xl tracking-wider text-center px-4 leading-tight">
                          {event.title.toUpperCase()}
                       </div>
                    </div>
                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="mb-3">
                         <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeStyle}`}>
                            {event.category || 'Event'}
                         </span>
                      </div>
                      
                      <h3 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-[#5c4dff] transition-colors line-clamp-1">{event.title}</h3>
                      
                      <div className="space-y-1.5 mb-5">
                         <p className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5">
                            <HiOutlineCalendarEvent className="w-3.5 h-3.5 text-gray-400" />
                            {dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, {dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                         </p>
                         <p className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5">
                            <HiOutlineLocationMarker className="w-3.5 h-3.5 text-gray-400" />
                            {event.location}
                         </p>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                         <div className="flex -space-x-2">
                            <img src="https://i.pravatar.cc/150?u=1" className="w-6 h-6 rounded-full border-2 border-white" alt="avatar" />
                            <img src="https://i.pravatar.cc/150?u=2" className="w-6 h-6 rounded-full border-2 border-white" alt="avatar" />
                            <img src="https://i.pravatar.cc/150?u=3" className="w-6 h-6 rounded-full border-2 border-white" alt="avatar" />
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[8px] font-bold text-gray-500">+{event.registrationCount || 45}</div>
                         </div>
                         <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View Details</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Browse by Categories */}
          <div className="mb-12">
            <h2 className="text-[15px] font-bold text-gray-900 mb-6">Browse by Categories</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
               {browseCategories.map((cat, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 min-w-[200px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer group">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform ${cat.color}`}>
                        {cat.icon}
                     </div>
                     <div>
                        <h4 className="text-[13px] font-bold text-gray-900 group-hover:text-[#5c4dff] transition-colors">{cat.name}</h4>
                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">{cat.count}</p>
                     </div>
                  </div>
               ))}
               <button className="w-12 h-12 shrink-0 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-all self-center ml-2 text-gray-400 hover:text-[#5c4dff]">
                  <HiChevronDown className="w-5 h-5 -rotate-90" />
               </button>
            </div>
          </div>

          {/* Bottom Split Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
             
             {/* Left Column: All Events */}
             <div className="lg:col-span-2 space-y-6">
               <h2 className="text-[15px] font-bold text-gray-900 mb-2">All Events</h2>
               
               <div className="space-y-4">
                 {events.map((event, i) => {
                   const dateObj = new Date(event.date);
                   const badgeStyle = getBadgeStyle(event.category);
                   const _isRegistered = isRegistered(event);
                   
                   return (
                     <div key={event._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-100 rounded-3xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-md transition-all group">
                        
                        <div className="flex items-center gap-4 min-w-0">
                           {/* Square Thumbnail */}
                           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-900 to-[#5c4dff] flex items-center justify-center text-white shrink-0 shadow-sm relative overflow-hidden">
                              <span className="text-[9px] font-black tracking-wider text-center leading-tight">
                                 {event.title.split(' ').slice(0, 2).join('\n').toUpperCase()}
                              </span>
                           </div>
                           
                           {/* Details */}
                           <div className="min-w-0">
                              <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#5c4dff] transition-colors">{event.title}</h3>
                              <p className="text-[11px] font-medium text-gray-500 mt-1 truncate">
                                 {dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, {dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} • {event.location}
                              </p>
                           </div>
                        </div>

                        {/* Actions (Right Side) */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-50">
                           <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md border hidden sm:block ${badgeStyle}`}>
                              {event.category || 'Event'}
                           </span>
                           
                           {_isRegistered ? (
                              <button className="px-5 py-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-[11px] border border-emerald-100 flex items-center gap-1.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Registered
                              </button>
                           ) : (
                              <button onClick={() => handleRegister(event._id)} className="px-5 py-2 rounded-xl bg-[#5c4dff]/5 text-[#5c4dff] border border-[#5c4dff]/20 font-bold text-[11px] hover:bg-[#5c4dff]/10 transition-colors">
                                 Register
                              </button>
                           )}
                        </div>
                     </div>
                   );
                 })}
               </div>
               
               {events.length > 0 && (
                 <div className="pt-2">
                    <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all events →</button>
                 </div>
               )}
             </div>

             {/* Right Column: Sidebar */}
             <div className="space-y-6">
                
                {/* My Registrations */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                   <div className="flex items-center justify-between mb-5">
                     <h3 className="text-[15px] font-bold text-gray-900">My Registrations</h3>
                     <button className="text-[10px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all</button>
                   </div>
                   
                   {registeredEvents.length === 0 ? (
                      <p className="text-xs text-gray-500 font-medium">You haven't registered for any events yet.</p>
                   ) : (
                      <div className="space-y-5">
                         {registeredEvents.slice(0, 3).map((event) => {
                            const dateObj = new Date(event.date);
                            return (
                               <div key={event._id} className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 to-blue-500 flex items-center justify-center shrink-0">
                                     <span className="text-[8px] text-white font-bold">{event.title.slice(0, 2).toUpperCase()}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <h4 className="text-xs font-bold text-gray-900 truncate">{event.title}</h4>
                                     <p className="text-[10px] font-medium text-gray-500 mt-0.5">{dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, {dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                                  </div>
                                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 shrink-0">Registered</span>
                               </div>
                            )
                         })}
                      </div>
                   )}
                </div>

                {/* Host an Event Promo */}
                <div className="bg-gradient-to-br from-[#ebeaff] to-[#f4f3ff] border border-[#5c4dff]/20 rounded-3xl p-6 relative overflow-hidden group">
                   {/* Decorative elements */}
                   <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-[#5c4dff]/10 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
                   <div className="absolute right-4 bottom-4 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center rotate-12 group-hover:rotate-6 transition-transform">
                      <div className="text-2xl text-[#5c4dff]"><HiStar className="w-8 h-8 text-yellow-400" /></div>
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full"></div>
                   </div>
                   
                   <div className="relative z-10 max-w-[200px]">
                      <h3 className="text-[15px] font-black text-gray-900 mb-2">Host an event?</h3>
                      <p className="text-[11px] font-medium text-gray-600 mb-5 leading-relaxed">
                         Create and manage events for your community.
                      </p>
                      <button onClick={() => setShowModal(true)} className="bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-xl font-bold text-[11px] shadow-sm transition-colors flex items-center gap-1.5 border border-gray-100">
                         Create Event →
                      </button>
                   </div>
                </div>
             </div>
             
          </div>
        </>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-gray-100 shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-lg relative">
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"><HiX className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create Event</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Title *</label>
                <input type="text" className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all" placeholder="Event name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Date *</label>
                  <input type="datetime-local" className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Category</label>
                  <select className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select</option>
                    <option>Hackathon</option>
                    <option>Workshop</option>
                    <option>Competition</option>
                    <option>Info Session</option>
                    <option>Meetup</option>
                    <option>Bootcamp</option>
                    <option>General</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Description</label>
                <textarea className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all" rows="3" placeholder="Describe the event..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Location</label>
                  <input type="text" className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all" placeholder="Online / Venue" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Link</label>
                  <input type="url" className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-[#5c4dff] hover:bg-[#4a3ddf] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all mt-2">
                {submitting ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
