import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { getUserById, sendConnectionRequest, cancelConnectionRequest, removeConnection, getConnectionRequests } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap, HiOutlineLocationMarker, HiOutlineGlobeAlt,
  HiOutlineUserAdd, HiOutlineArrowLeft,
  HiOutlineBadgeCheck, HiOutlineX, HiOutlineClock, HiOutlineChatAlt2,
} from 'react-icons/hi';

const LINK_META = [
  { key: 'website', label: 'Website', icon: '🌐', color: 'text-blue-400' },
  { key: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'text-blue-500' },
  { key: 'github', label: 'GitHub', icon: '🐙', color: 'text-purple-400' },
  { key: 'twitter', label: 'Twitter', icon: '🐦', color: 'text-sky-400' },
];

const UserProfile = () => {
  const { id } = useParams();
  const { user: me } = useAuth();
  const { openChat } = useChat();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [drawer, setDrawer] = useState(null);
  const [photoOpen, setPhotoOpen] = useState(false);

  // Close photo lightbox on Escape
  useEffect(() => {
    if (!photoOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setPhotoOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [photoOpen]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await getUserById(id);
        setProfile(data);
      } catch {
        toast.error('Could not load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const isConnected = me?.connections?.map(String)?.includes(id);
  const [isPending, setIsPending] = useState(false);

  // Check if we already sent a request
  useEffect(() => {
    if (!me || !id) return;
    getConnectionRequests().then(({ data }) => {
      const out = (data.outgoing || []).map(r => String(r.to._id || r.to));
      setIsPending(out.includes(id));
    }).catch(() => {});
  }, [me, id]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      if (isPending) {
        await cancelConnectionRequest(id);
        setIsPending(false);
        toast.success('Request cancelled');
      } else {
        await sendConnectionRequest(id);
        setIsPending(true);
        toast.success('Connection request sent!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not process request');
    } finally {
      setConnecting(false);
    }
  };

  const handleRemove = async () => {
    setConnecting(true);
    try {
      await removeConnection(id);
      setProfile(prev => ({
        ...prev,
        followers: (prev.followers || []).filter(f => String(f._id || f) !== String(me._id)),
        connections: (prev.connections || []).filter(c => String(c._id || c) !== String(me._id)),
      }));
      toast.success('Connection removed');
    } catch {
      toast.error('Could not remove connection');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto animate-pulse space-y-4">
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="h-32 bg-surface-800" />
          <div className="p-6 flex gap-4 -mt-10">
            <div className="w-20 h-20 rounded-2xl bg-surface-700" />
            <div className="flex-1 space-y-2 pt-6">
              <div className="h-4 bg-surface-700 rounded w-1/3" />
              <div className="h-3 bg-surface-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return (
    <div className="p-8 text-center">
      <p className="text-surface-400">User not found.</p>
      <Link to="/people" className="text-primary-400 text-sm mt-2 inline-block">← Back to People</Link>
    </div>
  );

  const tabs = ['about', 'skills', 'links'];
  if (profile.joinedCommunities?.length > 0) tabs.push('communities');

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto animate-fade-in">
      <Link to="/people" className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-white mb-6 transition-colors">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to People
      </Link>

      {/* Banner card */}
      <div className="glass-card rounded-3xl overflow-hidden mb-5">
        <div className="h-32 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-800 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'6\'/%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mt-1 gap-4">
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  onClick={() => setPhotoOpen(true)}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary-500/30"
                  style={{ cursor: 'default' }}
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-primary-500/30">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {profile.openToWork && (
                <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full ring-2 ring-surface-900">OPEN</span>
              )}
            </div>

            {/* Photo lightbox */}
            {photoOpen && profile.avatar && createPortal(
              <div
                onClick={() => setPhotoOpen(false)}
                style={{
                  position: 'fixed', inset: 0, zIndex: 99999,
                  background: 'rgba(0,0,0,0.92)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  paddingTop: '8vh',
                  cursor: 'default',
                }}
              >
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    maxWidth: '80vw', maxHeight: '75vh',
                    borderRadius: 20,
                    boxShadow: '0 8px 60px rgba(0,0,0,0.9)',
                    objectFit: 'contain',
                    animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                    cursor: 'default',
                  }}
                />
                <p style={{
                  color: 'white', fontWeight: 600, fontSize: 18,
                  marginTop: 20, letterSpacing: '0.02em',
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                }}>
                  {profile.name}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 6 }}>
                  Tap outside photo to close · Esc
                </p>
              </div>,
              document.body
            )}

            {me?._id !== id && (
              <div className="sm:mb-2 flex items-center gap-2">
                {isConnected && (
                  <button
                    onClick={() => openChat(profile)}
                    className="flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-xl transition-all duration-200 bg-primary-500/20 text-primary-300 border border-primary-500/30 hover:bg-primary-500/30"
                  >
                    <HiOutlineChatAlt2 className="w-4 h-4" /> Message
                  </button>
                )}
                {isConnected ? (
                  <button
                    onClick={handleRemove}
                    disabled={connecting}
                    className="group/rm flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-xl transition-all duration-200 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/25"
                  >
                    {connecting
                      ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <>
                          <span className="group-hover/rm:hidden">✓ Connected</span>
                          <span className="hidden group-hover/rm:inline">✕ Remove Connection</span>
                        </>
                    }
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className={`flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-xl transition-all duration-200 ${
                      isPending
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-red-500/10 hover:text-red-400'
                        : 'btn-primary'
                    }`}
                  >
                    {connecting ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isPending ? (
                      <><HiOutlineClock className="w-4 h-4" /> Pending · Cancel</>
                    ) : (
                      <><HiOutlineUserAdd className="w-4 h-4" /> Connect</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-white">{profile.name}</h1>
              {profile.role === 'admin' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-full">
                  <HiOutlineBadgeCheck className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            {profile.headline && <p className="text-accent-300 text-sm mt-1">{profile.headline}</p>}
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-surface-300">
              {profile.college && (
                <span className="flex items-center gap-1.5">
                  <HiOutlineAcademicCap className="w-3.5 h-3.5 text-primary-400" />
                  {[profile.college, profile.branch, profile.year].filter(Boolean).join(' · ')}
                </span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1.5">
                  <HiOutlineLocationMarker className="w-3.5 h-3.5 text-accent-400" />
                  {profile.location}
                </span>
              )}
            </div>
            <div className="flex gap-6 mt-4 pt-4 border-t border-white/5">
              {[
                { key: 'connections', label: 'Connections', val: profile.connections?.length ?? 0 },
                { key: 'followers',   label: 'Followers',   val: profile.followers?.length ?? 0 },
                { key: 'communities', label: 'Communities', val: profile.joinedCommunities?.length ?? 0 },
              ].map(({ key, label, val }) => (
                <button
                  key={key}
                  onClick={() => setDrawer(key)}
                  className="text-center group hover:scale-105 transition-transform duration-200"
                >
                  <p className="text-lg font-bold text-white group-hover:text-primary-300 transition-colors">{val}</p>
                  <p className="text-[10px] uppercase tracking-wider text-surface-400 group-hover:text-primary-400 transition-colors group-hover:underline underline-offset-2">{label}</p>
                </button>
              ))}
            </div>

            {/* Drawers */}
            {drawer && (
              <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setDrawer(null)}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div className="relative w-full max-w-md bg-surface-900 border border-white/10 rounded-3xl shadow-2xl max-h-[70vh] flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <h2 className="text-base font-bold text-white capitalize">{drawer}</h2>
                    <button onClick={() => setDrawer(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-800 text-surface-300 hover:text-white transition-all">
                      <HiOutlineX className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-1 p-4 space-y-2">
                    {drawer === 'communities' ? (
                      (profile.joinedCommunities || []).length === 0
                        ? <p className="text-center text-surface-400 text-sm py-10">No communities joined yet.</p>
                        : (profile.joinedCommunities || []).map(c => (
                          <Link key={c._id} to={`/communities/${c._id}`} onClick={() => setDrawer(null)}
                            className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors">
                            <span className="text-2xl">{c.icon || '💬'}</span>
                            <div>
                              <p className="text-sm font-semibold text-white">{c.name}</p>
                              <p className="text-xs text-surface-400">{c.memberCount ?? 0} members</p>
                            </div>
                          </Link>
                        ))
                    ) : (
                      (drawer === 'connections' ? profile.connections : profile.followers || []).length === 0
                        ? <p className="text-center text-surface-400 text-sm py-10">No one here yet.</p>
                        : (drawer === 'connections' ? profile.connections : profile.followers || []).map(person => (
                          <Link key={person._id} to={`/people/${person._id}`} onClick={() => setDrawer(null)}
                            className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors group">
                            {person.avatar
                              ? <img src={person.avatar} alt={person.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                              : <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">{person.name?.charAt(0).toUpperCase()}</div>
                            }
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white group-hover:text-primary-300 transition-colors truncate">{person.name}</p>
                              <p className="text-xs text-surface-400 truncate">{person.headline || person.college || ''}</p>
                            </div>
                          </Link>
                        ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-900/50 rounded-xl p-1 mb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
              activeTab === tab
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/20'
                : 'text-surface-300 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'about' && (
        <div className="glass-card rounded-2xl p-6 space-y-5">
          {profile.bio && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-2">About</p>
              <p className="text-sm text-surface-200 leading-relaxed">{profile.bio}</p>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'College', value: profile.college },
              { label: 'Branch', value: profile.branch },
              { label: 'Year', value: profile.year },
              { label: 'Location', value: profile.location },
              { label: 'Role', value: profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-1">{label}</p>
                <p className="text-sm text-white">{value || '—'}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-1">Member Since</p>
            <p className="text-sm text-white">{new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="glass-card rounded-2xl p-6">
          <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-4">Skills & Expertise</p>
          {profile.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <span key={skill} className="text-sm bg-primary-500/15 text-primary-300 border border-primary-500/20 px-4 py-1.5 rounded-full font-medium">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-surface-400 text-sm py-6 text-center">No skills added yet.</p>
          )}
        </div>
      )}

      {activeTab === 'links' && (
        <div className="glass-card rounded-2xl p-6">
          <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-4">Links</p>
          {LINK_META.map(({ key, label, icon, color }) =>
            profile.links?.[key] ? (
              <a
                key={key}
                href={profile.links[key]}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 hover:pl-1 transition-all group"
              >
                <span className="text-lg">{icon}</span>
                <span className="text-sm text-surface-200 group-hover:text-white transition-colors">{label}</span>
                <span className="text-xs text-surface-500 truncate ml-auto">{profile.links[key]}</span>
              </a>
            ) : null
          )}
          {!Object.values(profile.links || {}).some(Boolean) && (
            <p className="text-surface-400 text-sm py-6 text-center">No links added.</p>
          )}
        </div>
      )}

      {activeTab === 'communities' && (
        <div className="glass-card rounded-2xl p-6">
          <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-4">Communities</p>
          <div className="space-y-2">
            {profile.joinedCommunities?.map(c => (
              <Link
                key={c._id}
                to={`/communities/${c._id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/40 hover:bg-surface-800/60 transition-colors"
              >
                <span className="text-xl">{c.icon || '💬'}</span>
                <div>
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-xs text-surface-400">{c.memberCount} members</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
