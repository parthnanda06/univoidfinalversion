import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotes, createNote, deleteNote, trackDownload } from '../services/api';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineDownload, HiOutlineTrash, HiOutlineExternalLink, HiX, HiOutlineBookOpen, HiChevronDown, HiSparkles, HiOutlineCloudUpload, HiOutlineUserGroup, HiOutlineBookmark } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', description: '', college: '', fileUrl: '', fileType: 'link' });
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = () => {
    const params = {};
    if (search) params.search = search;
    if (subjectFilter) params.subject = subjectFilter;
    getNotes(params)
      .then((res) => setNotes(res.data.notes))
      .catch(() => toast.error('Failed to load notes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchNotes();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject) return toast.error('Title and subject are required');
    setSubmitting(true);
    try {
      const { data } = await createNote(form);
      setNotes([data, ...notes]);
      setShowModal(false);
      setForm({ title: '', subject: '', description: '', college: '', fileUrl: '', fileType: 'link' });
      toast.success('Note uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await deleteNote(id);
      setNotes(notes.filter(n => n._id !== id));
      toast.success('Note deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleDownload = async (note) => {
    if (note.fileUrl) {
      await trackDownload(note._id);
      window.open(note.fileUrl, '_blank');
    }
  };

  const subjects = [...new Set(notes.map(n => n.subject).filter(Boolean))];

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto animate-fade-in bg-[#fdfdfd] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
             <HiOutlineBookOpen className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Study Notes</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Browse and share study materials with your peers</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#5c4dff] hover:bg-[#4a3ddf] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2">
           <HiOutlinePlus className="w-4 h-4" /> Upload Note
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text" 
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]" 
            placeholder="Search notes, subjects, topics..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <div className="relative w-full sm:w-64">
           <select 
             className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all appearance-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]" 
             value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setTimeout(fetchNotes, 0); }}
           >
             <option value="">All Subjects</option>
             {subjects.map(s => <option key={s} value={s}>{s}</option>)}
           </select>
           <HiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Notes Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse border border-gray-200"></div>)}
        </div>
      ) : notes.length === 0 ? (
        <div className="w-full bg-[#f8f9ff] border border-[#eff0ff] rounded-[32px] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden mb-12 min-h-[400px]">
           {/* Background dots pattern */}
           <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
           
           {/* Decorative elements */}
           <HiSparkles className="absolute left-1/4 top-1/4 w-5 h-5 text-indigo-300 opacity-50" />
           <HiSparkles className="absolute right-1/4 bottom-1/4 w-6 h-6 text-indigo-300 opacity-50" />
           
           {/* Floating Box Graphic (CSS) */}
           <div className="relative w-48 h-48 mb-6 z-10 flex items-center justify-center pointer-events-none">
              <div className="absolute bottom-4 w-32 h-16 bg-[#5c4dff] rounded-lg rotate-x-60 -rotate-z-45 shadow-2xl opacity-80"></div>
              <div className="absolute bottom-6 w-32 h-16 bg-blue-500 rounded-lg -rotate-x-60 rotate-z-45 opacity-60"></div>
              
              {/* Floating books */}
              <div className="absolute top-8 left-4 w-12 h-14 bg-purple-400 rounded shadow-lg -rotate-12 flex items-center justify-center animate-bounce" style={{animationDuration: '3s'}}>
                 <div className="w-6 h-1 bg-white/40 rounded-full mb-1"></div>
                 <div className="w-4 h-1 bg-white/40 rounded-full"></div>
              </div>
              <div className="absolute top-4 right-8 w-14 h-16 bg-blue-300 rounded shadow-lg rotate-12 flex flex-col items-center justify-center animate-bounce" style={{animationDuration: '2.5s'}}>
                 <div className="w-8 h-1.5 bg-white/50 rounded-full mb-2"></div>
                 <div className="w-5 h-1 bg-white/50 rounded-full"></div>
              </div>
              <div className="absolute top-16 right-0 w-10 h-12 bg-indigo-400 rounded shadow-lg rotate-45 flex items-center justify-center animate-bounce" style={{animationDuration: '4s'}}>
                 <div className="w-4 h-4 bg-white/30 rounded-full"></div>
              </div>
           </div>

           <h3 className="text-xl font-extrabold text-gray-900 mb-2 relative z-10">No notes found</h3>
           <p className="text-sm font-medium text-gray-500 mb-8 relative z-10 max-w-sm mx-auto">Be the first to share your study materials with others!</p>
           
           <button onClick={() => setShowModal(true)} className="bg-[#5c4dff] hover:bg-[#4a3ddf] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 mb-4 relative z-10">
             <HiOutlinePlus className="w-4 h-4" /> Upload Your First Note
           </button>
           <button onClick={() => { setSearch(''); setSubjectFilter(''); fetchNotes(); }} className="text-[#5c4dff] text-sm font-bold hover:text-[#4a3ddf] transition-colors relative z-10">
             Explore other subjects
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {notes.map((note, i) => (
            <div key={note._id} className="bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg rounded-3xl p-6 flex flex-col animate-fade-in transition-all group" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#5c4dff] bg-[#5c4dff]/5 border border-[#5c4dff]/10 px-2.5 py-1 rounded-full">{note.subject}</span>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">{note.fileType?.toUpperCase()}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#5c4dff] transition-colors">{note.title}</h3>
              <p className="text-[11px] font-medium text-gray-500 line-clamp-3 mb-4 flex-1 leading-relaxed">{note.description || 'No description provided.'}</p>
              
              <div className="flex items-center gap-2 mb-4">
                 {note.college && <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{note.college}</span>}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                     {note.uploadedBy?.name?.charAt(0)}
                   </div>
                   <div className="text-[10px] font-medium text-gray-400 flex flex-col">
                     <span>{note.uploadedBy?.name ? note.uploadedBy.name.split(' ')[0] : 'Unknown'}</span>
                     <span>{note.downloads} downloads</span>
                   </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {note.fileUrl && (
                    <button onClick={() => handleDownload(note)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-[#5c4dff]/10 border border-gray-100 hover:border-[#5c4dff]/20 text-gray-500 hover:text-[#5c4dff] transition-colors" title="Download/Open">
                      {note.fileType === 'link' ? <HiOutlineExternalLink className="w-4 h-4" /> : <HiOutlineDownload className="w-4 h-4" />}
                    </button>
                  )}
                  {(note.uploadedBy?._id === user?._id || user?.role === 'admin') && (
                    <button onClick={() => handleDelete(note._id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-100 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Features Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
         <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 shrink-0">
               <HiOutlineCloudUpload className="w-6 h-6" />
            </div>
            <div>
               <h4 className="text-sm font-bold text-gray-900 mb-1">Upload & Share</h4>
               <p className="text-[11px] font-medium text-gray-500 leading-relaxed max-w-[200px]">Share your notes with the UniVoid community</p>
            </div>
         </div>
         <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
               <HiOutlineUserGroup className="w-6 h-6" />
            </div>
            <div>
               <h4 className="text-sm font-bold text-gray-900 mb-1">Learn Together</h4>
               <p className="text-[11px] font-medium text-gray-500 leading-relaxed max-w-[200px]">Access notes from peers and learn better together</p>
            </div>
         </div>
         <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
               <HiOutlineBookmark className="w-6 h-6" />
            </div>
            <div>
               <h4 className="text-sm font-bold text-gray-900 mb-1">Organize Easily</h4>
               <p className="text-[11px] font-medium text-gray-500 leading-relaxed max-w-[200px]">Save and organize your important notes</p>
            </div>
         </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-surface-200 shadow-sm rounded-2xl p-6 sm:p-8 w-full max-w-lg relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-surface-500 hover:text-surface-900"><HiX className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-surface-900 mb-6">Upload Study Note</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1.5">Title *</label>
                <input type="text" className="input-field" placeholder="e.g., DSA Complete Notes" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1.5">Subject *</label>
                  <input type="text" className="input-field" placeholder="e.g., DSA" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1.5">College</label>
                  <input type="text" className="input-field" placeholder="e.g., IIT Delhi" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1.5">Description</label>
                <textarea className="input-field" rows="3" placeholder="Brief description of the content..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-surface-600 mb-1.5">File URL / Link</label>
                  <input type="url" className="input-field" placeholder="https://..." value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1.5">Type</label>
                  <select className="input-field" value={form.fileType} onChange={(e) => setForm({ ...form, fileType: e.target.value })}>
                    <option value="link">Link</option>
                    <option value="pdf">PDF</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3">
                {submitting ? 'Uploading...' : 'Upload Note'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
