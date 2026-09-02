import React, { useState, useEffect } from 'react';
import { HiOutlineX, HiOutlineCode, HiOutlineLink } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ProjectModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    techStack: '',
    startDate: '',
    status: 'Completed',
    link: '',
    github: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          subtitle: initialData.subtitle || '',
          description: initialData.description || '',
          techStack: Array.isArray(initialData.techStack) ? initialData.techStack.join(', ') : '',
          startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
          status: initialData.status || 'Completed',
          link: initialData.link || '',
          github: initialData.github || ''
        });
      } else {
        setFormData({
          title: '', subtitle: '', description: '', techStack: '', startDate: '', status: 'Completed', link: '', github: ''
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }
    
    const payload = {
      ...formData,
      techStack: formData.techStack.split(',').map(s => s.trim()).filter(s => s),
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#5c4dff]/10 text-[#5c4dff] flex items-center justify-center">
              <HiOutlineCode className="w-5 h-5" />
            </div>
            {initialData ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto no-scrollbar">
          <form id="project-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-2">Project Title *</label>
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none" placeholder="e.g. E-Commerce App" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-2">Subtitle (Optional)</label>
                <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none" placeholder="e.g. Hackathon Winner" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-900 mb-2">Description *</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none resize-none" placeholder="What did you build?"></textarea>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-900 mb-2">Tech Stack (comma separated)</label>
              <input type="text" name="techStack" value={formData.techStack} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none" placeholder="React, Node.js, MongoDB" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-2">Start Date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none">
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Planned">Planned</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-2 flex items-center gap-1"><HiOutlineLink /> Live Link</label>
                <input type="url" name="link" value={formData.link} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none" placeholder="https://" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-2 flex items-center gap-1"><HiOutlineCode /> GitHub Link</label>
                <input type="url" name="github" value={formData.github} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none" placeholder="https://github.com/" />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 mt-auto">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-[13px] hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button type="submit" form="project-form" className="px-6 py-2.5 rounded-xl bg-[#5c4dff] hover:bg-[#4a3ddf] text-white font-bold text-[13px] shadow-md shadow-[#5c4dff]/20 transition-all">
            Save Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
