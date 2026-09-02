import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getProfile, addProject, updateProject, deleteProject, addExperience, updateExperience, deleteExperience, getGlobalPosts, createGlobalPost, deleteGlobalPost, updateGlobalPost } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePencil, HiOutlineCheck, HiOutlineX, HiOutlineLocationMarker,
  HiOutlineGlobeAlt, HiOutlineBriefcase, HiOutlineAcademicCap,
  HiOutlinePlus, HiOutlineLink, HiOutlineCamera, HiCheckCircle,
  HiOutlineUserGroup, HiOutlineBadgeCheck, HiOutlineMail,
  HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineDocumentText, HiOutlineChartBar,
  HiOutlineDotsHorizontal, HiOutlineThumbUp, HiOutlineAnnotation, HiOutlineShare, HiOutlineBookmark,
  HiOutlineExternalLink, HiOutlineSparkles, HiOutlineTerminal, HiOutlineCode, HiOutlineColorSwatch,
  HiOutlineChat, HiOutlineClock, HiOutlineRefresh, HiOutlineSearch, HiOutlineChevronDown,
  HiOutlineDesktopComputer, HiOutlineStar, HiOutlineEye, HiOutlineHeart, HiOutlineCursorClick,
  HiThumbUp, HiBookmark
} from 'react-icons/hi';
import SkillModal from '../components/SkillModal';
import ProjectModal from '../components/ProjectModal';
import ExperienceModal from '../components/ExperienceModal';

/* ─── helpers ─────────────────────────────────────────── */
const Avatar = ({ user, size = 'lg' }) => {
  const sz = size === 'lg' ? 'w-32 h-32 text-4xl' : 'w-10 h-10 text-base';
  if (user?.avatar) {
    return <img src={user.avatar} alt={user.name} className={`${sz} rounded-full object-cover ring-4 ring-white shadow-md bg-white`} />;
  }
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold ring-4 ring-white shadow-md`}>
      {user?.name?.charAt(0)?.toUpperCase()}
    </div>
  );
};

const StatItem = ({ label, value, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center group cursor-pointer hover:scale-105 transition-transform duration-200">
    <p className="text-xl font-bold text-gray-900 group-hover:text-[#5c4dff] transition-colors">{value ?? 0}</p>
    <p className="text-[11px] font-medium text-gray-500 mt-1">{label}</p>
  </button>
);

/* ─── People Drawer Modal ────────────────────────────── */
const PeopleDrawer = ({ title, items, type, onClose }) => {
  if (!items) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-2xl max-h-[70vh] flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-10">
              {type === 'communities' ? 'No communities joined yet.' : 'No one here yet.'}
            </p>
          ) : type === 'communities' ? (
            items.map(c => (
              <Link key={c._id} to={`/communities/${c._id}`} onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors">
                <span className="text-2xl">{c.icon || '💬'}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.memberCount ?? 0} members</p>
                </div>
              </Link>
            ))
          ) : (
            items.map(person => (
              <Link key={person._id} to={`/people/${person._id}`} onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors group">
                <Avatar user={person} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#5c4dff] transition-colors truncate">{person.name}</p>
                  <p className="text-xs text-gray-500 truncate">{person.headline || person.college || person.email || ''}</p>
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
    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

/* ─── Main Component ──────────────────────────────────── */
const Profile = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('About');
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  
  const skillInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);
  const [postText, setPostText] = useState('');
  const [mockPosts, setMockPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [openPostDropdownId, setOpenPostDropdownId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostContent, setEditPostContent] = useState('');
  
  const [drawer, setDrawer] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showCameraPermissionModal, setShowCameraPermissionModal] = useState(false);
  const videoRef = useRef(null);


  // Skill Modal State
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillModalMode, setSkillModalMode] = useState('add'); // 'add' or 'edit'
  const [editingSkillInitialData, setEditingSkillInitialData] = useState(null);

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectInitialData, setEditingProjectInitialData] = useState(null);

  // Experience Modal State
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperienceInitialData, setEditingExperienceInitialData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getProfile();
        setProfileData(data);
      } catch (err) {}
    };
    fetchProfile();
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await getGlobalPosts();
      setMockPosts(res.data.map(p => ({
        ...p,
        timeAgo: 'Just now', 
        isLiked: false,
        isBookmarked: false
      })));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteGlobalPost(postId);
      setMockPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete post');
    }
  };

  const handleEditPostSubmit = async (postId) => {
    if (!editPostContent.trim()) return;
    try {
      const { data: updatedPost } = await updateGlobalPost(postId, { content: editPostContent });
      setMockPosts(prev => prev.map(p => p.id === postId ? { ...p, content: updatedPost.content } : p));
      setEditingPostId(null);
      setEditPostContent('');
      toast.success('Post updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update post');
    }
  };

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
    reader.onload = () => {
      set('avatar', reader.result);
      if (!editing) setEditing(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!window.confirm('are you sure you wants to remove your profile picture??')) return;
    setIsAvatarMenuOpen(false);
    
    set('avatar', '');
    
    try {
      const { data } = await updateProfile({ ...form, avatar: '' });
      setUser(data);
      toast.success('Profile picture removed!');
    } catch (err) {
      toast.error('Failed to remove profile picture');
    }
  };

  const startCamera = async () => {
    setIsAvatarMenuOpen(false);
    setShowCameraPermissionModal(true);
  };

  const confirmCameraPermission = async () => {
    setShowCameraPermissionModal(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      toast.error('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      set('avatar', dataUrl);
      if (!editing) setEditing(true);
      stopCamera();
    }
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
    complexSkills: user?.complexSkills?.length > 0 
      ? user.complexSkills 
      : (user?.skills || []).map((s, i) => ({
          id: `legacy-${i}`,
          name: s,
          category: 'Technical Skills',
          level: 'Intermediate',
          percentage: 50,
          description: ''
        })),
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

  const handleSaveSkill = async (skillData) => {
    let updatedSkills = [...(form.complexSkills || [])];
    
    if (skillModalMode === 'add') {
      const newSkill = { ...skillData, id: Date.now().toString() };
      updatedSkills.push(newSkill);
    } else {
      updatedSkills = updatedSkills.map(s => s.id === skillData.id ? skillData : s);
    }
    
    set('complexSkills', updatedSkills);
    
    try {
      const { data } = await updateProfile({ ...form, complexSkills: updatedSkills });
      setUser(data);
      setIsSkillModalOpen(false);
      toast.success(skillModalMode === 'add' ? 'Skill added!' : 'Skill updated!');
    } catch (err) {
      toast.error('Failed to save skill');
    }
  };

  const openAddSkillModal = () => {
    setSkillModalMode('add');
    setEditingSkillInitialData(null);
    setIsSkillModalOpen(true);
  };

  const openEditSkillModal = (skill = null) => {
    setSkillModalMode('edit');
    setEditingSkillInitialData(skill);
    setIsSkillModalOpen(true);
  };

  const openAddProjectModal = () => {
    setEditingProjectInitialData(null);
    setIsProjectModalOpen(true);
  };
  const openEditProjectModal = (proj) => {
    setEditingProjectInitialData(proj);
    setIsProjectModalOpen(true);
  };
  const handleSaveProject = async (data) => {
    try {
      if (editingProjectInitialData) {
        const res = await updateProject(editingProjectInitialData._id, data);
        setProfileData(prev => ({ ...prev, projectsList: prev.projectsList.map(p => p._id === res.data.id ? res.data : p) }));
        toast.success('Project updated');
      } else {
        const res = await addProject(data);
        setProfileData(prev => ({ ...prev, projectsList: [res.data, ...(prev.projectsList || [])] }));
        toast.success('Project added');
      }
      setIsProjectModalOpen(false);
    } catch (err) {
      toast.error('Failed to save project');
    }
  };

  const openAddExperienceModal = () => {
    setEditingExperienceInitialData(null);
    setIsExperienceModalOpen(true);
  };
  const openEditExperienceModal = (exp) => {
    setEditingExperienceInitialData(exp);
    setIsExperienceModalOpen(true);
  };
  const handleSaveExperience = async (data) => {
    try {
      if (editingExperienceInitialData) {
        const res = await updateExperience(editingExperienceInitialData._id, data);
        setProfileData(prev => ({ ...prev, experiences: prev.experiences.map(e => e._id === res.data.id ? res.data : e) }));
        toast.success('Experience updated');
      } else {
        const res = await addExperience(data);
        setProfileData(prev => ({ ...prev, experiences: [res.data, ...(prev.experiences || [])] }));
        toast.success('Experience added');
      }
      setIsExperienceModalOpen(false);
    } catch (err) {
      toast.error('Failed to save experience');
    }
  };

  const handlePost = async () => {
    if (!postText.trim() && !selectedFile) {
      toast.error('Please write something or attach a file to post.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', postText);
      if (selectedFile) {
        formData.append('media', selectedFile);
      }

      const res = await createGlobalPost(formData);
      const newPost = {
        ...res.data,
        timeAgo: 'Just now',
        isLiked: false,
        isBookmarked: false,
        likes: 0,
        comments: 0
      };

      setMockPosts(prev => [newPost, ...prev]);
      setPostText('');
      setSelectedFile(null);
      toast.success('Update posted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post update');
    }
  };

  const handleLikePost = (postId) => {
    setMockPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
  };

  const handleBookmarkPost = (postId) => {
    setMockPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, isBookmarked: !p.isBookmarked };
      }
      return p;
    }));
    toast.success('Post bookmarked!');
  };

  const handleSharePost = () => {
    toast.success('Link copied to clipboard!');
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
      complexSkills: user?.complexSkills || [],
      links: {
        website: user?.links?.website || '',
        linkedin: user?.links?.linkedin || '',
        github: user?.links?.github || '',
        twitter: user?.links?.twitter || '',
      },
    });
    setEditing(false);
  };

  const tabs = ['About', 'Skills', 'Projects', 'Experience', 'Preferences', 'Achievements', 'Activity'];

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-72px)] p-3 sm:p-6">
      <div className="max-w-[1200px] mx-auto animate-fade-in space-y-4 sm:space-y-6">

        {/* ── Top Profile Card ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
          
          {/* Cover Photo Area */}
          <div className="h-48 md:h-56 w-full bg-gradient-to-r from-[#2e4fd0] via-[#00a896] to-[#5c4dff] relative">
            <button className="absolute top-4 right-4 bg-gray-900/40 hover:bg-gray-900/60 text-white backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border border-white/10">
              <HiOutlineCamera className="w-4 h-4" /> Edit Cover
            </button>
          </div>

          <div className="px-6 md:px-10 pb-8 relative">
            {/* Avatar & Action Buttons Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 sm:-mt-12 mb-4 relative z-10 gap-4">
              
              <div className="relative group">
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                
                <div className="relative cursor-pointer" onClick={() => {
                  if (editing) setIsAvatarMenuOpen(!isAvatarMenuOpen);
                  else if (user?.avatar) setPhotoOpen(true);
                }}>
                  {editing && form.avatar ? (
                     <img src={form.avatar} alt="avatar" className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-md bg-white" />
                  ) : (
                     <Avatar user={user} size="lg" />
                  )}

                  {/* Camera overlay / button */}
                  {editing ? (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <HiOutlineCamera className="text-white w-8 h-8" />
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsAvatarMenuOpen(!isAvatarMenuOpen); }}
                      className="absolute bottom-2 right-2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <HiOutlineCamera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Avatar Menu Dropdown */}
                {isAvatarMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[60] animate-fade-in">
                    <button 
                      onClick={() => { setIsAvatarMenuOpen(false); avatarInputRef.current?.click(); }} 
                      className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#5c4dff] flex items-center gap-2"
                    >
                      <HiOutlinePhotograph className="w-4 h-4" /> Upload from Device
                    </button>
                    <button 
                      onClick={startCamera} 
                      className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#5c4dff] flex items-center gap-2"
                    >
                      <HiOutlineVideoCamera className="w-4 h-4" /> Capture Photo
                    </button>
                    <button 
                      onClick={handleRemovePhoto} 
                      className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <HiOutlineX className="w-4 h-4" /> Remove Photo
                    </button>
                  </div>
                )}
              </div>

              {/* Edit Buttons */}
              <div className="flex items-center gap-2 mb-2 sm:mb-6">
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="bg-[#5c4dff] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#5c4dff]/20 hover:bg-[#4a3ddf] transition-all flex items-center gap-2">
                    <HiOutlinePencil className="w-4 h-4" /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button onClick={cancelEdit} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} className="bg-[#5c4dff] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#5c4dff]/20 hover:bg-[#4a3ddf] transition-all flex items-center gap-2">
                      <HiOutlineCheck className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* User Info Area */}
            {editing ? (
              <div className="space-y-4 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow label="Full Name">
                    <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none" value={form.name} onChange={e => set('name', e.target.value)} />
                  </FieldRow>
                  <FieldRow label="Headline">
                    <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none" value={form.headline} onChange={e => set('headline', e.target.value)} />
                  </FieldRow>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow label="Location">
                    <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none" value={form.location} onChange={e => set('location', e.target.value)} />
                  </FieldRow>
                  <FieldRow label="LinkedIn URL">
                    <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none" value={form.links.linkedin} onChange={e => setLink('linkedin', e.target.value)} />
                  </FieldRow>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-[22px] font-bold text-gray-900">{user?.name}</h1>
                  <HiCheckCircle className="text-[#5c4dff] w-5 h-5" />
                </div>
                <p className="text-[13px] font-medium text-gray-600 mb-3 max-w-2xl">
                  {user?.headline || 'Add a headline (e.g. AI Enthusiast | Full Stack Developer)'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[12px] font-medium text-gray-500">
                  <span className="flex items-center gap-1.5"><HiOutlineLocationMarker className="w-4 h-4 text-[#5c4dff]" /> {user?.location || 'Add location'}</span>
                  <span className="flex items-center gap-1.5"><HiOutlineMail className="w-4 h-4 text-gray-400" /> {user?.email}</span>
                  {user?.links?.linkedin && (
                     <a href={user.links.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#5c4dff] transition-colors">
                        <HiOutlineLink className="w-4 h-4 text-[#0077b5]" /> linkedin.com/in/{user.links.linkedin.split('/').pop()}
                     </a>
                  )}
                </div>
              </div>
            )}

            {/* Stats Row */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap justify-between sm:justify-start sm:gap-16 gap-6 px-2 sm:px-8">
                <StatItem label="Connections" value={profileData?.connections?.length || 12} onClick={() => setDrawer('connections')} />
                <StatItem label="Communities" value={profileData?.joinedCommunities?.length || 8} onClick={() => setDrawer('communities')} />
                <StatItem label="Notes" value={24} />
                <StatItem label="Achievements" value={6} />
                <StatItem label="Projects" value={3} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex items-center gap-6 border-b border-gray-200 px-2 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[13px] font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab 
                  ? 'border-[#5c4dff] text-[#5c4dff]' 
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab === 'About' && <HiOutlineUserGroup className="w-4 h-4" />}
              {tab === 'Skills' && <HiOutlineBriefcase className="w-4 h-4" />}
              {tab === 'Projects' && <HiOutlineDocumentText className="w-4 h-4" />}
              {tab === 'Experience' && <HiOutlineAcademicCap className="w-4 h-4" />}
              {tab === 'Preferences' && <HiOutlineCheck className="w-4 h-4" />}
              {tab === 'Achievements' && <HiOutlineBadgeCheck className="w-4 h-4" />}
              {tab === 'Activity' && <HiOutlineChartBar className="w-4 h-4" />}
              {tab}
            </button>
          ))}
        </div>

        {/* ── Main Content Grid ── */}
        {activeTab === 'About' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Left Column (Feed) */}
            <div className="flex-1 w-full space-y-6">
              
              {/* Compose Box */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
                 <div className="flex gap-3 sm:gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#5c4dff] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                       {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <input 
                       type="text" 
                       value={postText}
                       onChange={(e) => setPostText(e.target.value)}
                       placeholder="Share an update with your UniVoid network..." 
                       className="w-full bg-gray-50 border border-gray-100 rounded-full px-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all"
                    />
                 </div>
                 <div className="flex flex-col pl-14 mb-2">
                    {selectedFile && (
                      <div className="flex items-center gap-2 text-[13px] font-medium mb-3 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 w-fit">
                        <button onClick={() => setFilePreviewOpen(true)} className="text-[#0a66c2] hover:underline cursor-pointer">
                          {selectedFile.name}
                        </button>
                        <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-gray-700 mt-0.5 ml-1">
                          <HiOutlineX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} 
                      className="hidden" 
                    />
                 </div>
                 <div className="flex items-center justify-between pl-14">
                    <div className="flex items-center gap-2 sm:gap-4">
                       <button onClick={() => { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); }} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"><HiOutlinePhotograph className="w-4 h-4 text-[#5c4dff]" /> Photo</button>
                       <button onClick={() => { fileInputRef.current.accept = "video/*"; fileInputRef.current.click(); }} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"><HiOutlineVideoCamera className="w-4 h-4 text-[#34d399]" /> Video</button>
                       <button onClick={() => { fileInputRef.current.accept = ".pdf,.doc,.docx,.txt"; fileInputRef.current.click(); }} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors hidden sm:flex"><HiOutlineDocumentText className="w-4 h-4 text-orange-400" /> Document</button>
                       <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors hidden sm:flex"><HiOutlineChartBar className="w-4 h-4 text-[#5c4dff]" /> Poll</button>
                    </div>
                    <div className="flex items-center gap-3">
                       <select className="bg-transparent text-xs font-bold text-gray-500 outline-none cursor-pointer">
                          <option>Everyone</option>
                       </select>
                       <button onClick={handlePost} className="bg-[#5c4dff] text-white px-5 py-1.5 rounded-full text-xs font-bold hover:bg-[#4a3ddf] shadow-md shadow-[#5c4dff]/20 transition-all">
                          Post
                       </button>
                    </div>
                 </div>
              </div>

              {/* Mock Feed Posts */}
              {loadingPosts && <div className="text-center text-gray-500 my-4 text-sm font-medium">Loading posts...</div>}
              {!loadingPosts && mockPosts.length === 0 && <div className="text-center text-gray-500 my-4 text-sm font-medium">No posts yet. Be the first to share!</div>}
              {mockPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
                   <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex gap-3">
                         {post.author?.avatar ? (
                            <img src={post.author.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                         ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                               {post.author?.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                         )}
                         <div>
                            <h4 className="text-[13px] font-bold text-gray-900">{post.author?.name || user?.name}</h4>
                            <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">{new Date(post.createdAt).toLocaleDateString()} • <HiOutlineGlobeAlt className="w-3 h-3" /> Everyone</p>
                         </div>
                      </div>
                      <div className="relative">
                         <button 
                           onClick={() => setOpenPostDropdownId(openPostDropdownId === post.id ? null : post.id)} 
                           className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-full hover:bg-gray-50"
                         >
                           <HiOutlineDotsHorizontal className="w-5 h-5" />
                         </button>
                         
                         {openPostDropdownId === post.id && (
                           <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-10">
                              <button onClick={() => { setOpenPostDropdownId(null); toast.success('Link copied to share!'); }} className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#5c4dff] flex items-center gap-2">
                                 <HiOutlineShare className="w-4 h-4" /> Share via
                              </button>
                              {post.authorId === user?.id && (
                                <>
                                  <button onClick={() => { setOpenPostDropdownId(null); setEditingPostId(post.id); setEditPostContent(post.content || post.text || ''); }} className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#5c4dff] flex items-center gap-2">
                                     <HiOutlinePencil className="w-4 h-4" /> Edit post
                                  </button>
                                  <button onClick={() => { setOpenPostDropdownId(null); handleDeletePost(post.id); }} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                     <HiOutlineX className="w-4 h-4" /> Delete post
                                  </button>
                                </>
                              )}
                           </div>
                         )}
                      </div>
                   </div>
                   
                   <div className="mb-4 text-[13px] text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                      {editingPostId === post.id ? (
                        <div className="flex flex-col gap-2">
                           <textarea 
                             className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#5c4dff]"
                             rows={3}
                             value={editPostContent}
                             onChange={(e) => setEditPostContent(e.target.value)}
                           />
                           <div className="flex justify-end gap-2">
                             <button onClick={() => setEditingPostId(null)} className="px-3 py-1 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-md">Cancel</button>
                             <button onClick={() => handleEditPostSubmit(post.id)} className="px-3 py-1 text-xs font-bold bg-[#5c4dff] text-white rounded-md hover:bg-[#4a3ddf]">Save</button>
                           </div>
                        </div>
                      ) : (
                        <p>{post.content || post.text}</p>
                      )}
                   </div>
                   
                   {post.mediaUrl ? (
                     <div className="w-full rounded-xl overflow-hidden mb-4 border border-gray-100">
                        {post.mediaType?.startsWith('video/') ? (
                           <video src={post.mediaUrl} controls className="w-full max-h-96 object-contain bg-black" />
                        ) : post.mediaType?.startsWith('image/') ? (
                           <img src={post.mediaUrl} alt="Post media" className="w-full max-h-96 object-cover" />
                        ) : (
                           <div className="bg-gray-50 p-6 flex flex-col items-center">
                              <HiOutlineDocumentText className="w-12 h-12 text-gray-400 mb-2" />
                              <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#5c4dff] font-bold hover:underline">Download Document</a>
                           </div>
                        )}
                     </div>
                   ) : null}
                   
                   <div className="flex items-center gap-4 text-[11px] font-semibold text-gray-500 pb-3 border-b border-gray-100 mb-3">
                      <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-[#5c4dff] flex items-center justify-center text-white text-[10px]"><HiThumbUp /></span> {post.likeCount || post.likes || 0}</span>
                      <span className="flex items-center gap-1 hover:underline cursor-pointer hover:text-[#5c4dff]"><HiOutlineAnnotation className="w-4 h-4" /> {post.comments?.length || post.comments || 0}</span>
                   </div>
                   
                   <div className="flex items-center justify-between pt-1">
                      <button onClick={() => handleLikePost(post.id)} className={`flex items-center gap-2 text-[12px] font-bold px-4 py-2 rounded-lg transition-colors ${post.isLiked ? 'text-[#5c4dff] bg-[#5c4dff]/10' : 'text-gray-500 hover:bg-gray-50'}`}>
                         {post.isLiked ? <HiThumbUp className="w-4 h-4" /> : <HiOutlineThumbUp className="w-4 h-4" />} Like
                      </button>
                      <button onClick={() => toast('Comment section coming soon!', { icon: '💬' })} className="flex items-center gap-2 text-[12px] font-bold text-gray-500 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                         <HiOutlineAnnotation className="w-4 h-4" /> Comment
                      </button>
                      <button onClick={handleSharePost} className="flex items-center gap-2 text-[12px] font-bold text-gray-500 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
                         <HiOutlineShare className="w-4 h-4" /> Share
                      </button>
                      <button onClick={() => handleBookmarkPost(post.id)} className={`flex items-center gap-2 text-[12px] font-bold px-4 py-2 rounded-lg transition-colors hidden sm:flex ${post.isBookmarked ? 'text-[#5c4dff]' : 'text-gray-500 hover:bg-gray-50'}`}>
                         {post.isBookmarked ? <HiBookmark className="w-4 h-4" /> : <HiOutlineBookmark className="w-4 h-4" />}
                      </button>
                   </div>
                </div>
              ))}
            </div>

            {/* Right Column (Widgets) */}
            <div className="w-full lg:w-[360px] flex-shrink-0 space-y-6">
              
              {/* Projects Widget */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                 <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[13px] font-bold text-gray-900">Projects</h3>
                    <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all</button>
                 </div>
                 <div className="space-y-4">
                    {[
                       { title: 'AI Startup Idea Validator', desc: 'AI-based platform that validates startup ideas using ML models and market analysis.', tags: ['Python', 'ML', 'Flask'], icon: '🚀', bg: 'bg-blue-50 text-blue-500' },
                       { title: 'IPL Chatbot', desc: 'NLP chatbot that provides IPL updates, stats and answers fan queries.', tags: ['Python', 'NLP', 'Flask'], icon: '🏏', bg: 'bg-indigo-900 text-yellow-400' },
                       { title: 'ReWear - Odoo Hackathon', desc: 'Sustainable fashion platform built during Odoo Hackathon.', tags: ['MongoDB', 'Express', 'React'], icon: '👕', bg: 'bg-teal-50 text-teal-500' },
                    ].map((p, i) => (
                       <div key={i} className="flex gap-3 group">
                          <div className={`w-10 h-10 rounded-xl ${p.bg} flex items-center justify-center shrink-0 border border-gray-100 text-lg`}>
                             {p.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-start justify-between">
                                <h4 className="text-[12px] font-bold text-gray-900 group-hover:text-[#5c4dff] transition-colors">{p.title}</h4>
                                <button className="text-gray-400 hover:text-[#5c4dff] opacity-0 group-hover:opacity-100 transition-opacity"><HiOutlineExternalLink className="w-3.5 h-3.5" /></button>
                             </div>
                             <p className="text-[10px] font-medium text-gray-500 mt-0.5 leading-relaxed mb-1.5 line-clamp-2">{p.desc}</p>
                             <div className="flex flex-wrap gap-1">
                                {p.tags.map(t => <span key={t} className="bg-gray-50 border border-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{t}</span>)}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Communities Widget */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                 <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[13px] font-bold text-gray-900">Top Communities</h3>
                    <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all</button>
                 </div>
                 <div className="space-y-4">
                    {[
                       { name: 'AI/ML Students', members: '1.2k members', icon: '🤖', bg: 'bg-indigo-50 text-indigo-500' },
                       { name: 'Hackathon Lovers', members: '850 members', icon: '💻', bg: 'bg-rose-50 text-rose-500' },
                       { name: 'Competitive Programming', members: '1.5k members', icon: '🏆', bg: 'bg-blue-50 text-blue-500' },
                    ].map((c, i) => (
                       <div key={i} className="flex items-center gap-3 group cursor-pointer">
                          <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                             {c.icon}
                          </div>
                          <div>
                             <h4 className="text-[12px] font-bold text-gray-900 group-hover:text-[#5c4dff] transition-colors">{c.name}</h4>
                             <p className="text-[10px] font-medium text-gray-500">{c.members}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Achievements Widget */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                 <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[13px] font-bold text-gray-900">Achievements</h3>
                    <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all</button>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 text-lg">🏆</div>
                       <div>
                          <h4 className="text-[12px] font-bold text-gray-900">AVISHKAAR Season 3 - Finalist</h4>
                          <p className="text-[10px] font-medium text-gray-500">Hackathon</p>
                       </div>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        )}
        
        {/* ── Skills Tab ── */}
        {activeTab === 'Skills' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Left Column (Overview Widget) */}
            <div className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 animate-fade-in">
              <h3 className="text-[14px] font-bold text-gray-900 mb-6">Skills Overview</h3>
              
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-gray-100 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                    <circle className="text-[#5c4dff] stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset="62.8"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-gray-900">{form.complexSkills?.length || 0}</span>
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Skills Added</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-8 text-center">
                <div className="flex flex-col items-center">
                   <span className="text-lg font-bold text-[#5c4dff]">{form.complexSkills?.filter(s => s.category === 'Technical Skills').length || 0}</span>
                   <span className="text-[10px] font-medium text-gray-500">Technical</span>
                </div>
                <div className="flex flex-col items-center border-l border-r border-gray-100">
                   <span className="text-lg font-bold text-[#34d399]">{form.complexSkills?.filter(s => s.category === 'Soft Skills').length || 0}</span>
                   <span className="text-[10px] font-medium text-gray-500">Soft Skills</span>
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-lg font-bold text-orange-400">{form.complexSkills?.filter(s => s.category === 'Tools & Technologies').length || 0}</span>
                   <span className="text-[10px] font-medium text-gray-500">Tools</span>
                </div>
              </div>

              <h4 className="text-[13px] font-bold text-gray-900 mb-4">Top Skills</h4>
              <div className="space-y-4 mb-8">
                 {[...(form.complexSkills || [])]
                    .sort((a, b) => b.percentage - a.percentage)
                    .slice(0, 5)
                    .map(skill => (
                    <div key={skill.id || skill.name}>
                       <div className="flex justify-between text-[11px] font-bold mb-1.5">
                          <span className="text-gray-700">{skill.name}</span>
                          <span className="text-gray-500">{skill.percentage}%</span>
                       </div>
                       <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#5c4dff] h-1.5 rounded-full transition-all duration-1000" style={{ width: `${skill.percentage}%` }}></div>
                       </div>
                    </div>
                 ))}
                 {(!form.complexSkills || form.complexSkills.length === 0) && (
                    <div className="text-[11px] text-gray-500 italic text-center py-4">No skills added yet.</div>
                 )}
              </div>

              <button 
                onClick={openAddSkillModal}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-[#5c4dff] font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                 <HiOutlinePlus className="w-4 h-4" /> Add New Skill
              </button>
            </div>

            {/* Right Column (Skills Grid) */}
            <div className="flex-1 w-full space-y-6 animate-fade-in">
              
              <div className="bg-[#f3f0ff] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-[#5c4dff]/10">
                 <div>
                    <h3 className="text-[14px] font-bold text-[#5c4dff]">Showcase your skills to connect with peers and opportunities!</h3>
                    <p className="text-[12px] font-medium text-[#5c4dff]/70 mt-0.5">Add relevant skills to highlight your expertise.</p>
                 </div>
                 <button 
                  onClick={() => openEditSkillModal(null)}
                  className="bg-white text-[#5c4dff] px-4 py-2 rounded-xl text-xs font-bold border border-[#5c4dff]/20 hover:bg-[#5c4dff] hover:text-white transition-all whitespace-nowrap flex items-center gap-2"
                 >
                    <HiOutlinePencil className="w-3.5 h-3.5" /> Edit Skills
                 </button>
              </div>

              {/* Technical Skills */}
              <div>
                 <div className="flex items-center justify-between mb-4 px-1">
                    <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-2"><HiOutlineCode className="text-[#5c4dff]" /> Technical Skills</h4>
                    <span className="text-[11px] font-bold text-gray-400">{form.complexSkills?.filter(s => s.category === 'Technical Skills').length || 0} Skills ▾</span>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {form.complexSkills?.filter(s => s.category === 'Technical Skills').map(s => (
                       <div key={s.id} onClick={() => openEditSkillModal(s)} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 hover:shadow-sm hover:border-gray-200 transition-all cursor-pointer group">
                          <div className={`w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0`}>
                             <HiOutlineCode className="text-xl" />
                          </div>
                          <div className="min-w-0">
                             <p className="text-[12px] font-bold text-gray-900 truncate group-hover:text-[#5c4dff] transition-colors">{s.name}</p>
                             <p className="text-[10px] font-semibold text-gray-400">{s.level}</p>
                          </div>
                       </div>
                    ))}
                    {(!form.complexSkills || form.complexSkills.filter(s => s.category === 'Technical Skills').length === 0) && (
                      <div className="text-[11px] text-gray-400 italic">No technical skills added.</div>
                    )}
                 </div>
              </div>

              {/* Soft Skills */}
              <div>
                 <div className="flex items-center justify-between mb-4 px-1 mt-8">
                    <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-2"><HiOutlineUserGroup className="text-[#34d399]" /> Soft Skills</h4>
                    <span className="text-[11px] font-bold text-gray-400">{form.complexSkills?.filter(s => s.category === 'Soft Skills').length || 0} Skills ▾</span>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {form.complexSkills?.filter(s => s.category === 'Soft Skills').map(s => (
                       <div key={s.id} onClick={() => openEditSkillModal(s)} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 hover:shadow-sm hover:border-gray-200 transition-all cursor-pointer group">
                          <div className={`w-10 h-10 rounded-lg bg-green-50 text-green-500 flex items-center justify-center shrink-0 text-lg`}>
                             <HiOutlineUserGroup className="text-xl" />
                          </div>
                          <div className="min-w-0">
                             <p className="text-[12px] font-bold text-gray-900 truncate group-hover:text-[#5c4dff] transition-colors">{s.name}</p>
                             <p className="text-[10px] font-semibold text-gray-400">{s.level}</p>
                          </div>
                       </div>
                    ))}
                    {(!form.complexSkills || form.complexSkills.filter(s => s.category === 'Soft Skills').length === 0) && (
                      <div className="text-[11px] text-gray-400 italic">No soft skills added.</div>
                    )}
                 </div>
              </div>

              {/* Tools & Technologies */}
              <div>
                 <div className="flex items-center justify-between mb-4 px-1 mt-8">
                    <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-2"><HiOutlineTerminal className="text-orange-400" /> Tools & Technologies</h4>
                    <span className="text-[11px] font-bold text-gray-400">{form.complexSkills?.filter(s => s.category === 'Tools & Technologies').length || 0} Tools ▾</span>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-8">
                    {form.complexSkills?.filter(s => s.category === 'Tools & Technologies').map(s => (
                       <div key={s.id} onClick={() => openEditSkillModal(s)} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 hover:shadow-sm hover:border-gray-200 transition-all cursor-pointer group">
                          <div className={`w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 text-lg`}>
                             <HiOutlineTerminal className="text-xl" />
                          </div>
                          <div className="min-w-0">
                             <p className="text-[12px] font-bold text-gray-900 truncate group-hover:text-[#5c4dff] transition-colors">{s.name}</p>
                             <p className="text-[10px] font-semibold text-gray-400">{s.level}</p>
                          </div>
                       </div>
                    ))}
                    {(!form.complexSkills || form.complexSkills.filter(s => s.category === 'Tools & Technologies').length === 0) && (
                      <div className="text-[11px] text-gray-400 italic">No tools added.</div>
                    )}
                 </div>
              </div>

            </div>
          </div>
        )}

        {/* ── Projects Tab ── */}
        {activeTab === 'Projects' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Left Column (Overview Widget) */}
            <div className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:p-6 animate-fade-in">
              <h3 className="text-[14px] font-bold text-gray-900 mb-6">Projects Overview</h3>
              
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-gray-100 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                    <circle className="text-[#5c4dff] stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset="251.2"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-gray-900">3</span>
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Projects</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-8 text-center bg-gray-50 rounded-xl py-3 border border-gray-100">
                <div className="flex flex-col items-center">
                   <span className="text-lg font-bold text-green-500">3</span>
                   <span className="text-[9px] font-bold text-gray-500">Completed</span>
                </div>
                <div className="flex flex-col items-center border-l border-r border-gray-200/60">
                   <span className="text-lg font-bold text-[#5c4dff]">0</span>
                   <span className="text-[9px] font-bold text-gray-500">In Progress</span>
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-lg font-bold text-orange-400">0</span>
                   <span className="text-[9px] font-bold text-gray-500">Planned</span>
                </div>
              </div>

              <h4 className="text-[13px] font-bold text-gray-900 mb-4">Tech Stack</h4>
              <div className="flex flex-wrap gap-2 mb-8">
                 {['Python', 'React.js', 'Node.js', 'MongoDB', 'Flask', 'NLP', 'Machine Learning'].map(tech => (
                    <span key={tech} className="bg-[#f3f0ff] text-[#5c4dff] text-[10px] font-bold px-2.5 py-1 rounded-md">
                       {tech}
                    </span>
                 ))}
              </div>

              <button onClick={openAddProjectModal} className="w-full py-2.5 rounded-xl border border-gray-200 text-[#5c4dff] font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                 <HiOutlinePlus className="w-4 h-4" /> Add New Project
              </button>
            </div>

            {/* Right Column (Projects List) */}
            <div className="flex-1 w-full space-y-6 animate-fade-in">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <div>
                    <h3 className="text-[16px] font-bold text-gray-900">My Projects</h3>
                    <p className="text-[12px] font-medium text-gray-500 mt-0.5">Showcase the projects you've built and your contributions.</p>
                 </div>
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                       <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input type="text" placeholder="Search projects..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5c4dff] focus:ring-1 focus:ring-[#5c4dff] transition-all" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                       All Projects <HiOutlineChevronDown className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              <div className="space-y-4">
                 {/* Project mapping */}
                 {profileData?.projectsList?.map((proj, idx) => (
                    <div key={proj._id || idx} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row gap-5 hover:shadow-md transition-shadow">
                       <div className="w-full md:w-64 h-40 rounded-xl bg-slate-900 border border-slate-800 shrink-0 relative overflow-hidden flex flex-col justify-between p-4">
                          <div>
                             <h4 className="text-white font-bold text-sm">{proj.title}</h4>
                             <p className="text-slate-400 text-[8px] mt-1 max-w-[150px]">{proj.subtitle}</p>
                          </div>
                       </div>
                       <div className="flex-1 flex flex-col justify-between">
                          <div>
                             <div className="flex items-start justify-between mb-1">
                                <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-1.5">
                                   {proj.title} {proj.status === 'Completed' && <HiCheckCircle className="text-[#5c4dff] w-4 h-4" />}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-400">
                                   {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="hover:text-[#5c4dff]"><HiOutlineExternalLink className="w-4 h-4" /></a>}
                                   {proj.github && <a href={proj.github} target="_blank" rel="noreferrer" className="hover:text-gray-900"><svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>}
                                   <button onClick={() => openEditProjectModal(proj)} className="hover:text-gray-900"><HiOutlineDotsHorizontal className="w-5 h-5" /></button>
                                </div>
                             </div>
                             <p className="text-[12px] font-medium text-gray-500 leading-relaxed mb-4 max-w-2xl">
                                {proj.description}
                             </p>
                             <div className="flex flex-wrap gap-2 mb-4">
                                {proj.techStack?.map(t => (
                                   <span key={t} className="bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{t}</span>
                                ))}
                             </div>
                          </div>
                          <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400">
                             {proj.startDate && <span className="flex items-center gap-1.5"><HiOutlineAcademicCap /> {new Date(proj.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>}
                             <span className="text-green-500 flex items-center gap-1"><HiOutlineCheck /> {proj.status}</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

            </div>
          </div>
        )}

        {/* ── Experience Tab ── */}
        {activeTab === 'Experience' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/50">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f3f0ff] flex items-center justify-center text-[#5c4dff] shadow-sm shrink-0">
                     <HiOutlineBriefcase className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-[16px] font-bold text-gray-900">Experience</h3>
                     <p className="text-[12px] font-medium text-gray-500 mt-0.5">Your professional journey and work history.</p>
                  </div>
               </div>
               <button onClick={openAddExperienceModal} className="bg-[#5c4dff] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#5c4dff]/20 hover:bg-[#4a3ddf] transition-all flex items-center gap-2 whitespace-nowrap">
                  <HiOutlinePlus className="w-4 h-4" /> Add Experience
               </button>
            </div>

            {/* Timeline */}
            <div className="p-6 sm:p-10 relative">
               
               {/* Continuous Vertical Line */}
               <div className="absolute left-[39px] sm:left-[147px] top-10 bottom-10 w-0.5 bg-[#5c4dff]/20 rounded-full"></div>

               <div className="space-y-12 relative">
                  
                  {/* Experience mapping */}
                  {profileData?.experiences?.map((exp, idx) => (
                     <div key={exp._id || idx} className="flex flex-col sm:flex-row gap-6 sm:gap-10 relative group">
                        {/* Timeline Node */}
                        <div className="absolute left-[11px] sm:left-[119px] top-1 w-4 h-4 rounded-full bg-[#5c4dff] border-4 border-white shadow-sm z-10 group-hover:scale-125 transition-transform"></div>
                        
                        {/* Date */}
                        <div className="w-full sm:w-[90px] pt-0.5 pl-8 sm:pl-0 sm:text-right shrink-0">
                           <p className="text-[11px] font-bold text-gray-900">{new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} –</p>
                           <p className="text-[11px] font-bold text-gray-500">{exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present')}</p>
                        </div>
                        
                        {/* Card */}
                        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition-all ml-8 sm:ml-0">
                           <div className="flex items-start justify-between mb-3 gap-2">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 text-purple-500">
                                    <HiOutlineBriefcase className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <h4 className="text-[15px] font-bold text-gray-900">{exp.company}</h4>
                                    <p className="text-[13px] font-bold text-gray-600 mt-0.5">{exp.role}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0 pt-1">
                                 {exp.type === 'Current Role' ? (
                                    <span className="hidden sm:flex items-center gap-1.5 bg-green-50 text-green-600 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                                       <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {exp.type}
                                    </span>
                                 ) : (
                                    <span className="hidden sm:flex items-center bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                       {exp.type}
                                    </span>
                                 )}
                                 <button onClick={() => openEditExperienceModal(exp)} className="text-gray-400 hover:text-gray-900"><HiOutlineDotsHorizontal className="w-5 h-5" /></button>
                              </div>
                           </div>
                           <p className="text-[12px] font-medium text-gray-500 leading-relaxed mb-4 max-w-3xl">
                              {exp.description}
                           </p>
                           <div className="flex flex-wrap gap-2">
                              {exp.techStack?.map(t => (
                                 <span key={t} className="bg-[#f3f0ff] text-[#5c4dff] text-[10px] font-bold px-2.5 py-1 rounded-md">{t}</span>
                              ))}
                           </div>
                        </div>
                     </div>
                  ))}

               </div>
            </div>
          </div>
        )}

        {/* ── Achievements Tab ── */}
        {activeTab === 'Achievements' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in overflow-hidden p-6 sm:p-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm shrink-0">
                     <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M21 2h-1v2H4V2H3v6c0 2.206 1.794 4 4 4v2c0 2.206 1.794 4 4 4v4h-2v2h6v-2h-2v-4c2.206 0 4-1.794 4-4v-2c2.206 0 4-1.794 4-4V2zm-4 4v2c0 1.103-.897 2-2 2h-1v-4h3v-2h-3V2h3v4zM5 8V4h3v4h-3v-2H5v2zM5 10c0-1.103.897-2 2-2h1v4H7c-1.103 0-2-.897-2-2zM15 12V8h-6v4c0 1.654 1.346 3 3 3s3-1.346 3-3z"/></svg>
                  </div>
                  <div>
                     <h3 className="text-[16px] font-bold text-gray-900">Achievements</h3>
                     <p className="text-[12px] font-medium text-gray-500 mt-0.5">Milestones and recognitions that showcase your journey.</p>
                  </div>
               </div>
               <button className="bg-[#5c4dff] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#5c4dff]/20 hover:bg-[#4a3ddf] transition-all flex items-center gap-2 whitespace-nowrap">
                  <HiOutlinePlus className="w-4 h-4" /> Add Achievement
               </button>
            </div>

            {/* Achievement Cards Grid (Horizontal scroll on mobile, wrap on large screens) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
               
               {profileData?.achievements?.map((ach, i) => (
                  <div key={ach._id || i} className={`bg-white border border-purple-100 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between`}>
                     <div>
                        <div className="flex gap-4 mb-4">
                           <div className={`w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 text-2xl`}>
                              🏆
                           </div>
                           <div className="flex-1">
                              <h4 className="text-[13px] font-bold text-gray-900 leading-tight">{ach.title}</h4>
                              <p className="text-[11px] font-bold text-gray-500 mt-1">{ach.event}</p>
                              <p className="text-[10px] font-semibold text-gray-400">{ach.date && new Date(ach.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                           </div>
                        </div>
                        <p className="text-[11px] font-medium text-gray-600 leading-relaxed mb-6">
                           {ach.description}
                        </p>
                     </div>
                     <span className={`self-start text-[10px] font-bold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700`}>
                        {ach.category}
                     </span>
                  </div>
               ))}
               
            </div>
          </div>
        )}

        {/* ── Activity Tab ── */}
        {activeTab === 'Activity' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in p-6 sm:p-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f3f0ff] flex items-center justify-center text-[#5c4dff] shadow-sm shrink-0">
                     <HiOutlineChartBar className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="text-[16px] font-bold text-gray-900">Recent Activity</h3>
                     <p className="text-[12px] font-medium text-gray-500 mt-0.5">Your latest actions and contributions on UniVoid.</p>
                  </div>
               </div>
               <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                  <HiOutlineSearch className="w-4 h-4" /> All Activity <HiOutlineChevronDown className="w-4 h-4" />
               </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
               
               {/* Left Column (Activity Feed) */}
               <div className="flex-1">
                  <div className="space-y-6">
                     
                     {profileData?.activities?.map((item, i) => (
                        <div key={item._id || i} className="flex items-start justify-between gap-4 border-b border-gray-50 pb-4 last:border-0">
                           <div className="flex gap-4">
                              <div className={`w-10 h-10 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center shrink-0`}>
                                 {item.icon === 'document' ? <HiOutlineDocumentText /> : (item.icon === 'group' ? <HiOutlineUserGroup /> : <HiOutlinePencil />)}
                              </div>
                              <div>
                                 <p className="text-[13px] font-bold text-gray-900 leading-tight">{item.action}</p>
                                 {item.context && <p className="text-[11px] font-semibold text-gray-400 mt-1">{item.context}</p>}
                              </div>
                           </div>
                           <span className="text-[10px] font-bold text-gray-400 shrink-0 mt-1">{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                     ))}
                     
                  </div>
                  
                  <button className="w-full mt-4 py-3 rounded-xl border border-gray-100 text-gray-500 font-bold text-[12px] hover:bg-gray-50 hover:text-gray-900 transition-colors">
                     View More Activity +
                  </button>
               </div>

               {/* Right Column (Highlights Widget) */}
               <div className="w-full lg:w-72 shrink-0">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                     <h4 className="text-[14px] font-bold text-gray-900 mb-6">Activity Highlights</h4>
                     
                     <div className="space-y-5">
                        {[
                           { icon: <HiOutlineDocumentText className="w-5 h-5" />, label: "Notes Created", value: "24", color: "text-[#5c4dff]" },
                           { icon: <HiOutlineUserGroup className="w-5 h-5" />, label: "Communities Joined", value: "8", color: "text-green-500" },
                           { icon: <HiOutlineChat className="w-5 h-5" />, label: "Posts & Replies", value: "15", color: "text-blue-500" },
                           { icon: <HiOutlineEye className="w-5 h-5" />, label: "Profile Views", value: "156", color: "text-orange-500" },
                           { icon: <HiOutlineHeart className="w-5 h-5" />, label: "Reactions Received", value: "62", color: "text-rose-500" },
                        ].map((stat, i) => (
                           <div key={i} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className={`${stat.color}`}>{stat.icon}</div>
                                 <span className="text-[12px] font-bold text-gray-700">{stat.label}</span>
                              </div>
                              <span className="text-[14px] font-bold text-gray-900">{stat.value}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

            </div>
          </div>
        )}

        {/* Placeholder for other tabs (if any exist in future) */}
        {activeTab !== 'About' && activeTab !== 'Skills' && activeTab !== 'Projects' && activeTab !== 'Experience' && activeTab !== 'Achievements' && activeTab !== 'Activity' && (
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <h2 className="text-lg font-bold text-gray-900 mb-2">{activeTab} Section</h2>
              <p className="text-sm text-gray-500">This section is currently under development.</p>
           </div>
        )}

      </div>
      
      {/* Lightbox for viewing photo */}
      {photoOpen && user?.avatar && createPortal(
        <div
          onClick={() => setPhotoOpen(false)}
          className="fixed inset-0 z-[99999] bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-fade-in"
        >
          <img
            src={user.avatar}
            alt={user.name}
            onClick={(e) => e.stopPropagation()}
            className="w-56 h-56 md:w-72 md:h-72 rounded-full shadow-2xl object-cover cursor-default ring-8 ring-white/10"
          />
          <p className="text-white font-bold text-lg mt-5 tracking-wide">{user.name}</p>
          <p className="text-white/40 text-sm mt-1">Tap outside to close · Esc</p>
        </div>,
        document.body
      )}

      {/* File Preview Card */}
      {filePreviewOpen && selectedFile && createPortal(
        <div
          onClick={() => setFilePreviewOpen(false)}
          className="fixed inset-0 z-[99999] bg-gray-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 truncate pr-4 text-sm">{selectedFile.name}</h3>
              <button onClick={() => setFilePreviewOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-50">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex items-center justify-center bg-gray-50 min-h-[300px]">
              {selectedFile.type.startsWith('image/') ? (
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt={selectedFile.name} 
                  className="max-w-full max-h-[50vh] rounded-xl shadow-sm object-contain"
                />
              ) : selectedFile.type.startsWith('video/') ? (
                <video 
                  src={URL.createObjectURL(selectedFile)} 
                  controls
                  className="max-w-full max-h-[50vh] rounded-xl shadow-sm"
                />
              ) : (
                <div className="flex flex-col items-center text-center">
                  <HiOutlineDocumentText className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium text-sm">Preview not available for this file type.</p>
                  <a href={URL.createObjectURL(selectedFile)} download={selectedFile.name} className="mt-4 bg-[#5c4dff] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-[#5c4dff]/20 hover:bg-[#4a3ddf]">
                    Download to View
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {/* Drawers */}
      {drawer === 'connections' && profileData && (
        <PeopleDrawer title="Connections" items={profileData.connections} type="connections" onClose={() => setDrawer(null)} />
      )}
      {drawer === 'communities' && profileData && (
        <PeopleDrawer title="Communities" items={profileData.joinedCommunities} type="communities" onClose={() => setDrawer(null)} />
      )}

      {/* Webcam Capture Modal */}
      {isCameraOpen && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-2xl flex flex-col">
             <div className="p-4 border-b border-gray-100 flex items-center justify-between">
               <h3 className="font-bold text-gray-900">Capture Photo</h3>
               <button onClick={stopCamera} className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-50">
                 <HiOutlineX className="w-6 h-6" />
               </button>
             </div>
             <div className="bg-black relative flex items-center justify-center aspect-video w-full">
               <video ref={videoRef} autoPlay playsInline style={{ transform: 'scaleX(-1)' }} className="w-full h-full object-cover" />
             </div>
             <div className="p-6 flex items-center justify-center bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={capturePhoto} 
                  className="bg-[#5c4dff] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-[#5c4dff]/40 hover:scale-105 transition-transform"
                >
                  <HiOutlineCamera className="w-8 h-8" />
                </button>
             </div>
          </div>
        </div>,
        document.body
      )}

      {showCameraPermissionModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCameraPermissionModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center animate-zoom-in">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HiOutlineVideoCamera className="text-blue-500 w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Camera Permission</h2>
            <p className="text-sm text-gray-500 mb-6">Univoid needs access to your camera to take a profile picture. Would you like to allow camera access?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowCameraPermissionModal(false); toast.error('Camera access denied'); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
              >
                Deny
              </button>
              <button 
                onClick={confirmCameraPermission}
                className="flex-1 py-2.5 rounded-xl bg-[#5c4dff] text-white font-bold shadow-md shadow-[#5c4dff]/20 hover:bg-[#4a3ddf] transition-all"
              >
                Allow
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <SkillModal 
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        onSave={handleSaveSkill}
        mode={skillModalMode}
        initialData={editingSkillInitialData}
        skillsList={form.complexSkills || []}
      />
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        initialData={editingProjectInitialData}
      />
      <ExperienceModal
        isOpen={isExperienceModalOpen}
        onClose={() => setIsExperienceModalOpen(false)}
        onSave={handleSaveExperience}
        initialData={editingExperienceInitialData}
      />
    </div>
  );
};

export default Profile;
