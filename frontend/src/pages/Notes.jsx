import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotes, createNote, deleteNote, trackDownload } from '../services/api';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineDownload, HiOutlineTrash, HiOutlineExternalLink, HiX } from 'react-icons/hi';
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
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">📚 Study Notes</h1>
          <p className="text-sm text-surface-200">Browse and share study materials with your peers</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><HiOutlinePlus className="w-4 h-4" /> Upload Note</button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-700" />
          <input
            type="text" className="input-field pl-10" placeholder="Search notes by title, subject, or college..."
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <select className="input-field w-full sm:w-48" value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setTimeout(fetchNotes, 0); }}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-surface-800/50 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-surface-200">No notes found. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note, i) => (
            <div key={note._id} className="glass-card rounded-2xl p-5 flex flex-col animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-300 bg-primary-500/15 px-2 py-0.5 rounded-full">{note.subject}</span>
                <span className="text-[10px] font-medium text-surface-700 bg-surface-800/50 px-2 py-0.5 rounded-full">{note.fileType?.toUpperCase()}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2">{note.title}</h3>
              <p className="text-xs text-surface-200 line-clamp-3 mb-3 flex-1">{note.description || 'No description provided.'}</p>
              {note.college && <p className="text-[10px] text-surface-700 mb-3">🏫 {note.college}</p>}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="text-[10px] text-surface-700">
                  <span>By {note.uploadedBy?.name}</span>
                  <span className="mx-1">·</span>
                  <span>{note.downloads} ↓</span>
                </div>
                <div className="flex items-center gap-1">
                  {note.fileUrl && (
                    <button onClick={() => handleDownload(note)} className="p-1.5 rounded-lg hover:bg-surface-800/50 text-surface-200 hover:text-accent-400 transition-colors" title="Download/Open">
                      {note.fileType === 'link' ? <HiOutlineExternalLink className="w-4 h-4" /> : <HiOutlineDownload className="w-4 h-4" />}
                    </button>
                  )}
                  {(note.uploadedBy?._id === user?._id || user?.role === 'admin') && (
                    <button onClick={() => handleDelete(note._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-surface-700 hover:text-red-400 transition-colors" title="Delete">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-6 sm:p-8 w-full max-w-lg relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-surface-700 hover:text-white"><HiX className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold text-white mb-6">Upload Study Note</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-surface-200 mb-1.5">Title *</label>
                <input type="text" className="input-field" placeholder="e.g., DSA Complete Notes" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-surface-200 mb-1.5">Subject *</label>
                  <input type="text" className="input-field" placeholder="e.g., DSA" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-200 mb-1.5">College</label>
                  <input type="text" className="input-field" placeholder="e.g., IIT Delhi" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-200 mb-1.5">Description</label>
                <textarea className="input-field" rows="3" placeholder="Brief description of the content..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-surface-200 mb-1.5">File URL / Link</label>
                  <input type="url" className="input-field" placeholder="https://..." value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-200 mb-1.5">Type</label>
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
