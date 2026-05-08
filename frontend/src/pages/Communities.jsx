import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCommunities, createCommunity, joinCommunity, leaveCommunity } from '../services/api';
import { HiOutlinePlus, HiOutlineUserGroup, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Communities = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: '', icon: '💬' });
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">🏘️ Communities</h1>
          <p className="text-sm text-surface-200">Join groups, share ideas, and connect with peers</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><HiOutlinePlus className="w-4 h-4" /> Create Community</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-44 bg-surface-800/50 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🏗️</p>
          <p className="text-surface-200">No communities yet. Create the first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((c, i) => (
            <div key={c._id} className="glass-card rounded-2xl p-5 flex flex-col animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{c.icon}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white truncate">{c.name}</h3>
                  <span className="text-[10px] text-primary-300 bg-primary-500/15 px-2 py-0.5 rounded-full">{c.category}</span>
                </div>
              </div>
              <p className="text-xs text-surface-200 line-clamp-2 mb-4 flex-1">{c.description || 'No description.'}</p>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-1 text-[10px] text-surface-700">
                  <HiOutlineUserGroup className="w-3.5 h-3.5" />
                  <span>{c.memberCount} members</span>
                </div>
                {isMember(c) ? (
                  <div className="flex items-center gap-2">
                    <Link to={`/communities/${c._id}`} className="text-[11px] font-medium text-primary-400 hover:text-primary-300">Enter →</Link>
                    <button onClick={() => handleLeave(c._id)} className="text-[10px] text-surface-700 hover:text-red-400">Leave</button>
                  </div>
                ) : (
                  <button onClick={() => handleJoin(c._id)} className="btn-accent text-[11px] py-1.5 px-3">Join</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-6 sm:p-8 w-full max-w-md relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-surface-700 hover:text-white"><HiX className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-white mb-6">Create Community</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-surface-200 mb-1.5">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {icons.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm({ ...form, icon })} className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.icon === icon ? 'bg-primary-500/30 ring-2 ring-primary-500 scale-110' : 'bg-surface-800/50 hover:bg-surface-700/50'}`}>{icon}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-200 mb-1.5">Name *</label>
                <input type="text" className="input-field" placeholder="e.g., Code Warriors" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-200 mb-1.5">Category</label>
                <input type="text" className="input-field" placeholder="e.g., Coding, Design, Business" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-200 mb-1.5">Description</label>
                <textarea className="input-field" rows="3" placeholder="What's this community about?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3">
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
