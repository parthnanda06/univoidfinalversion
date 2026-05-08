import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEvents, createEvent, registerForEvent } from '../services/api';
import { HiOutlinePlus, HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineExternalLink, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '', link: '', category: '' });
  const [submitting, setSubmitting] = useState(false);

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
    'Hackathon': 'from-purple-500 to-pink-500',
    'Workshop': 'from-blue-500 to-cyan-500',
    'Competition': 'from-red-500 to-orange-500',
    'Info Session': 'from-green-500 to-emerald-500',
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">🎪 Events & Opportunities</h1>
          <p className="text-sm text-surface-200">Discover hackathons, workshops, and more</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowModal(true)} className="btn-primary"><HiOutlinePlus className="w-4 h-4" /> Create Event</button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-52 bg-surface-800/50 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-surface-200">No upcoming events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {events.map((event, i) => {
            const gradient = categoryColors[event.category] || 'from-primary-500 to-primary-700';
            const dateObj = new Date(event.date);
            return (
              <div key={event._id} className="glass-card rounded-2xl overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-400 bg-accent-500/15 px-2 py-0.5 rounded-full">{event.category || 'General'}</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white leading-none">{dateObj.getDate()}</p>
                      <p className="text-[10px] text-surface-200 uppercase">{dateObj.toLocaleDateString('en-IN', { month: 'short' })}</p>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{event.title}</h3>
                  <p className="text-xs text-surface-200 line-clamp-3 mb-4">{event.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-surface-700 mb-4">
                    <span className="flex items-center gap-1"><HiOutlineLocationMarker className="w-3 h-3" />{event.location}</span>
                    <span className="flex items-center gap-1"><HiOutlineCalendar className="w-3 h-3" />{dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-[10px] text-surface-700">{event.registrationCount || 0} registered</span>
                    <div className="flex items-center gap-2">
                      {event.link && (
                        <a href={event.link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-surface-800/50 text-surface-200 hover:text-primary-400 transition-colors">
                          <HiOutlineExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {isRegistered(event) ? (
                        <span className="text-[11px] font-medium text-accent-400 bg-accent-500/15 px-3 py-1.5 rounded-lg">✓ Registered</span>
                      ) : (
                        <button onClick={() => handleRegister(event._id)} className="btn-accent text-[11px] py-1.5 px-3">Register</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal (Admin only) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-6 sm:p-8 w-full max-w-lg relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-surface-700 hover:text-white"><HiX className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-white mb-6">Create Event</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-surface-200 mb-1.5">Title *</label>
                <input type="text" className="input-field" placeholder="Event name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-200 mb-1.5">Date *</label>
                  <input type="datetime-local" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-200 mb-1.5">Category</label>
                  <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select</option>
                    <option>Hackathon</option>
                    <option>Workshop</option>
                    <option>Competition</option>
                    <option>Info Session</option>
                    <option>Meetup</option>
                    <option>General</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-200 mb-1.5">Description</label>
                <textarea className="input-field" rows="3" placeholder="Describe the event..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-200 mb-1.5">Location</label>
                  <input type="text" className="input-field" placeholder="Online / Venue" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-200 mb-1.5">Link</label>
                  <input type="url" className="input-field" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3">
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
