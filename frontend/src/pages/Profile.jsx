import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getProfile } from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlinePencil, HiOutlineCheck, HiOutlineX, HiOutlineLocationMarker,
  HiOutlineGlobeAlt, HiOutlineBriefcase, HiOutlineAcademicCap,
  HiOutlinePlus, HiOutlineLink, HiOutlineCamera,
  HiOutlineUserGroup, HiOutlineBadgeCheck,
} from 'react-icons/hi';

/* ─── helpers ─────────────────────────────────────────── */
const Avatar = ({ user, size = 'lg' }) => {
  const sz = size === 'lg' ? 'w-28 h-28 text-4xl' : 'w-10 h-10 text-base';
  if (user?.avatar) {
    return <img src={user.avatar} alt={user.name} className={`${sz} rounded-2xl object-cover ring-4 ring-primary-500/30`} />;
  }
  return (
    <div className={`${sz} rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold ring-4 ring-primary-500/30`}>
      {user?.name?.charAt(0).toUpperCase()}
    </div>
  );
};

const StatCard = ({ label, value, onClick }) => (
  <button
    onClick={onClick}
    className="text-center group cursor-pointer hover:scale-105 transition-transform duration-200"
  >
    <p className="text-xl font-bold text-white group-hover:text-primary-300 transition-colors">{value ?? 0}</p>
    <p className="text-[10px] uppercase tracking-wider text-surface-400 mt-0.5 group-hover:text-primary-400 transition-colors underline-offset-2 group-hover:underline">{label}</p>
  </button>
);

/* ─── People Drawer Modal ────────────────────────────── */
const PeopleDrawer = ({ title, items, type, onClose }) => {
  if (!items) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-md bg-surface-900 border border-white/10 rounded-3xl shadow-2xl max-h-[70vh] flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-800 text-surface-300 hover:text-white transition-all">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {items.length === 0 ? (
            <p className="text-center text-surface-400 text-sm py-10">
              {type === 'communities' ? 'No communities joined yet.' : 'No one here yet.'}
            </p>
          ) : type === 'communities' ? (
            items.map(c => (
              <Link
                key={c._id}
                to={`/communities/${c._id}`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors"
              >
                <span className="text-2xl">{c.icon || '💬'}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-surface-400">{c.memberCount ?? 0} members</p>
                </div>
              </Link>
            ))
          ) : (
            items.map(person => (
              <Link
                key={person._id}
                to={`/people/${person._id}`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors group"
              >
                {person.avatar ? (
                  <img src={person.avatar} alt={person.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {person.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-primary-300 transition-colors truncate">{person.name}</p>
                  <p className="text-xs text-surface-400 truncate">{person.headline || person.college || person.email || ''}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const FieldRow = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-surface-300 mb-1.5">{label}</label>
    {children}
  </div>
);

/* ─── Main Component ──────────────────────────────────── */
const Profile = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const skillInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  // drawer: null | 'connections' | 'followers' | 'communities'
  const [drawer, setDrawer] = useState(null);
  // populated profile data for drawers (followers/connections are full objects here)
  const [profileData, setProfileData] = useState(null);
  const [photoOpen, setPhotoOpen] = useState(false);

  useEffect(() => {
    getProfile().then(({ data }) => setProfileData(data)).catch(() => {});
  }, [user?._id]);

  // Close photo lightbox on Escape
  useEffect(() => {
    if (!photoOpen) return;
    const handler = (e) => { if (e.key === 'Escape') setPhotoOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [photoOpen]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error('Image must be under 3 MB'); return; }
    const reader = new FileReader();
    reader.onload = () => set('avatar', reader.result);
    reader.readAsDataURL(file);
  };

  const [form, setForm] = useState({
    name: user?.name || '',
    college: user?.college || '',
    branch: user?.branch || '',
    year: user?.year || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    headline: user?.headline || '',
    location: user?.location || '',
    openToWork: user?.openToWork || false,
    skills: user?.skills || [],
    links: {
      website: user?.links?.website || '',
      linkedin: user?.links?.linkedin || '',
      github: user?.links?.github || '',
      twitter: user?.links?.twitter || '',
    },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setLink = (key, val) => setForm(f => ({ ...f, links: { ...f.links, [key]: val } }));

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || form.skills.includes(s) || form.skills.length >= 20) return;
    set('skills', [...form.skills, s]);
    setNewSkill('');
    skillInputRef.current?.focus();
  };

  const removeSkill = (skill) => set('skills', form.skills.filter(s => s !== skill));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProfile(form);
      setUser(data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setForm({
      name: user?.name || '',
      college: user?.college || '',
      branch: user?.branch || '',
      year: user?.year || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
      headline: user?.headline || '',
      location: user?.location || '',
      openToWork: user?.openToWork || false,
      skills: user?.skills || [],
      links: {
        website: user?.links?.website || '',
        linkedin: user?.links?.linkedin || '',
        github: user?.links?.github || '',
        twitter: user?.links?.twitter || '',
      },
    });
    setEditing(false);
  };

  const tabs = ['about', 'skills', 'links', 'communities'];

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto animate-fade-in">

      {/* ── Banner + Avatar ── */}
      <div className="relative glass-card rounded-3xl overflow-hidden mb-6">
        {/* Banner gradient */}
        <div className="h-36 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-800 relative">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'10\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-1">
            <div className="relative group/avatar">
              {/* Hidden file input */}
              {editing && (
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              )}

              {/* Avatar — clickable: zoom-in when viewing, file-picker when editing */}
              <div
                className={`relative ${editing ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (editing) avatarInputRef.current?.click();
                  else if (user?.avatar) setPhotoOpen(true);
                }}
              >
                {/* Show preview if editing and form.avatar set, else show saved avatar */}
                {(editing ? form.avatar : user?.avatar) ? (
                  <img
                    src={editing ? form.avatar : user.avatar}
                    alt="avatar"
                    className="w-28 h-28 rounded-2xl object-cover ring-4 ring-primary-500/30"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-primary-500/30">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Camera overlay (edit mode only) */}
                {editing && (
                  <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1">
                    <HiOutlineCamera className="w-7 h-7 text-white" />
                    <span className="text-white text-[10px] font-semibold">Change Photo</span>
                  </div>
                )}
              </div>

              {/* Photo lightbox — view mode only */}
              {photoOpen && user?.avatar && createPortal(
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
                    src={user.avatar}
                    alt={user.name}
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
                    {user.name}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 6 }}>
                    Tap outside photo to close · Esc
                  </p>
                </div>,
                document.body
              )}

              {/* Open to work badge */}
              {user?.openToWork && !editing && (
                <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full ring-2 ring-surface-900">
                  OPEN TO WORK
                </span>
              )}
            </div>
            <div className="flex gap-2 sm:mb-2">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
                  id="edit-profile-btn"
                >
                  <HiOutlinePencil className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <>
                  <button onClick={cancelEdit} className="btn-secondary flex items-center gap-2 text-sm px-4 py-2">
                    <HiOutlineX className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
                  >
                    <HiOutlineCheck className="w-4 h-4" />
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name + headline */}
          {editing ? (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldRow label="Full Name">
                  <input
                    className="input-field py-2"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. John Doe"
                  />
                </FieldRow>
                <FieldRow label="Headline">
                  <input
                    className="input-field py-2"
                    value={form.headline}
                    onChange={e => set('headline', e.target.value)}
                    placeholder="e.g. Aspiring Web Developer"
                  />
                </FieldRow>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldRow label="Location">
                  <input
                    className="input-field py-2"
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                    placeholder="e.g. Mumbai, India"
                  />
                </FieldRow>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-white/10 bg-surface-800 text-primary-500 focus:ring-primary-500/20"
                      checked={form.openToWork}
                      onChange={e => set('openToWork', e.target.checked)}
                    />
                    <span className="text-sm text-surface-300 group-hover:text-white transition-colors font-medium">Open to Work</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                {user?.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-full ring-1 ring-primary-500/30">
                    <HiOutlineBadgeCheck className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              {user?.headline && <p className="text-accent-300 text-sm mt-1">{user?.headline}</p>}
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-surface-400">
                {user?.college && (
                  <span className="flex items-center gap-1.5">
                    <HiOutlineAcademicCap className="w-3.5 h-3.5 text-primary-400" />
                    {[user.college, user.branch, user.year].filter(Boolean).join(' · ')}
                  </span>
                )}
                {user?.location && (
                  <span className="flex items-center gap-1.5">
                    <HiOutlineLocationMarker className="w-3.5 h-3.5 text-accent-400" />
                    {user.location}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="flex gap-6 mt-5 pt-4 border-t border-white/5">
            <StatCard label="Connections" value={profileData?.connections?.length} onClick={() => setDrawer('connections')} />
            <StatCard label="Followers" value={profileData?.followers?.length} onClick={() => setDrawer('followers')} />
            <StatCard label="Communities" value={profileData?.joinedCommunities?.length} onClick={() => setDrawer('communities')} />
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
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

      {/* ── Content Area ── */}
      <div className="glass-card rounded-2xl p-6 min-h-[300px]">
        {activeTab === 'about' && (
          <div className="space-y-6 animate-fade-in">
            {editing ? (
              <div className="space-y-4">
                <FieldRow label="About / Bio">
                  <textarea
                    className="input-field py-2 min-h-[120px] resize-none"
                    value={form.bio}
                    onChange={e => set('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                  />
                </FieldRow>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FieldRow label="College">
                    <input className="input-field" value={form.college} onChange={e => set('college', e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Branch">
                    <input className="input-field" value={form.branch} onChange={e => set('branch', e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Year">
                    <select className="input-field" value={form.year} onChange={e => set('year', e.target.value)}>
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </FieldRow>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] uppercase tracking-widest text-surface-500 font-bold mb-3">About</h3>
                  <p className="text-sm text-surface-200 leading-relaxed">
                    {user?.bio || 'No bio yet. Click Edit Profile to add one!'}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-1">College</p>
                    <p className="text-sm text-white font-medium">{user?.college || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-1">Branch</p>
                    <p className="text-sm text-white font-medium">{user?.branch || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-surface-500 mb-1">Year</p>
                    <p className="text-sm text-white font-medium">{user?.year || '—'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="animate-fade-in">
            <h3 className="text-[10px] uppercase tracking-widest text-surface-500 font-bold mb-4">Skills & Expertise</h3>
            <div className="space-y-6">
              {editing && (
                <div className="flex gap-2">
                  <input
                    ref={skillInputRef}
                    className="input-field py-2 flex-1"
                    placeholder="Add a skill (e.g. React)"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <button onClick={addSkill} className="btn-secondary px-4">Add</button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {form.skills.map(skill => (
                  <div key={skill} className="flex items-center gap-2 bg-primary-500/10 text-primary-300 border border-primary-500/20 px-3 py-1.5 rounded-xl">
                    <span className="text-sm font-medium">{skill}</span>
                    {editing && (
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">
                        <HiOutlineX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {form.skills.length === 0 && (
                  <p className="text-sm text-surface-500 italic py-4">No skills added yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-[10px] uppercase tracking-widest text-surface-500 font-bold mb-4">Social & Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'website', label: 'Portfolio/Website', icon: <HiOutlineGlobeAlt /> },
                { key: 'linkedin', label: 'LinkedIn', icon: <HiOutlineLink /> },
                { key: 'github', label: 'GitHub', icon: <HiOutlineLink /> },
                { key: 'twitter', label: 'Twitter', icon: <HiOutlineLink /> },
              ].map(({ key, label, icon }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-surface-400 mb-1.5">{label}</label>
                  {editing ? (
                    <input
                      className="input-field py-2"
                      placeholder={`https://${key}.com/...`}
                      value={form.links[key]}
                      onChange={e => setLink(key, e.target.value)}
                    />
                  ) : (
                    user?.links?.[key] ? (
                      <a
                        href={user.links[key]}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors truncate"
                      >
                        {icon} {user.links[key]}
                      </a>
                    ) : (
                      <p className="text-sm text-surface-600">—</p>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'communities' && (
          <div className="animate-fade-in">
            <h3 className="text-[10px] uppercase tracking-widest text-surface-500 font-bold mb-4">Joined Communities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profileData?.joinedCommunities?.length > 0 ? (
                profileData.joinedCommunities.map(c => (
                  <Link
                    key={c._id}
                    to={`/communities/${c._id}`}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-surface-800/40 border border-white/5 hover:bg-surface-800/60 transition-colors"
                  >
                    <span className="text-2xl">{c.icon || '💬'}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{c.name}</p>
                      <p className="text-xs text-surface-400">{c.memberCount ?? 0} members</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-surface-500 italic py-4 col-span-2 text-center">No communities joined yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Drawers */}
      {drawer === 'connections' && profileData && (
        <PeopleDrawer title="Connections" items={profileData.connections} type="connections" onClose={() => setDrawer(null)} />
      )}
      {drawer === 'followers' && profileData && (
        <PeopleDrawer title="Followers" items={profileData.followers} type="followers" onClose={() => setDrawer(null)} />
      )}
      {drawer === 'communities' && profileData && (
        <PeopleDrawer title="Communities" items={profileData.joinedCommunities} type="communities" onClose={() => setDrawer(null)} />
      )}
    </div>
  );
};

export default Profile;
