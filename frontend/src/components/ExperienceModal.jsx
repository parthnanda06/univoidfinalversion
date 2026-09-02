import React, { useState, useEffect } from 'react';
import { HiOutlineX, HiOutlineBriefcase } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ExperienceModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    description: '',
    type: 'Full-time',
    techStack: '',
    startDate: '',
    endDate: '',
    current: false
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          company: initialData.company || '',
          role: initialData.role || '',
          description: initialData.description || '',
          type: initialData.type || 'Full-time',
          techStack: Array.isArray(initialData.techStack) ? initialData.techStack.join(', ') : '',
          startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
          endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
          current: initialData.current || false
        });
      } else {
        setFormData({
          company: '', role: '', description: '', type: 'Full-time', techStack: '', startDate: '', endDate: '', current: false
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company || !formData.role || !formData.startDate || !formData.description) {
      toast.error('Company, Role, Start Date, and Description are required');
      return;
    }
    
    const payload = {
      ...formData,
      techStack: formData.techStack.split(',').map(s => s.trim()).filter(s => s),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.current ? null : (formData.endDate ? new Date(formData.endDate).toISOString() : null)
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#5c4dff]/10 text-[#5c4dff] flex items-center justify-center">
              <HiOutlineBriefcase className="w-5 h-5" />
            </div>
            {initialData ? 'Edit Experience' : 'Add Experience'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto no-scrollbar">
          <form id="experience-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-2">Company *</label>
                <input required type="text" name="company" value={formData.company} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none" placeholder="e.g. Google" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-2">Role *</label>
                <input required type="text" name="role" value={formData.role} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none" placeholder="e.g. Software Engineer" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-2">Employment Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-2">Tech Stack (comma separated)</label>
                <input type="text" name="techStack" value={formData.techStack} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none" placeholder="e.g. React, Node, AWS" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-2">Start Date *</label>
                <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[13px] font-bold text-gray-900">End Date</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="current" checked={formData.current} onChange={handleChange} className="w-4 h-4 text-[#5c4dff] rounded border-gray-300 focus:ring-[#5c4dff]" />
                    <span className="text-[12px] font-medium text-gray-600">I currently work here</span>
                  </label>
                </div>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} disabled={formData.current} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none disabled:opacity-50" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-900 mb-2">Description *</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none resize-none" placeholder="Describe your responsibilities and achievements"></textarea>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 mt-auto">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-[13px] hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button type="submit" form="experience-form" className="px-6 py-2.5 rounded-xl bg-[#5c4dff] hover:bg-[#4a3ddf] text-white font-bold text-[13px] shadow-md shadow-[#5c4dff]/20 transition-all">
            Save Experience
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceModal;
