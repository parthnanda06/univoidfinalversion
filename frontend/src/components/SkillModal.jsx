import React, { useState, useEffect } from 'react';
import { HiOutlineX } from 'react-icons/hi';

const SkillModal = ({ isOpen, onClose, onSave, mode, initialData, skillsList }) => {
  const [form, setForm] = useState({
    id: '',
    name: '',
    category: 'Technical Skills',
    level: 'Beginner',
    percentage: 50,
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setForm(initialData);
      } else {
        setForm({
          id: '',
          name: '',
          category: 'Technical Skills',
          level: 'Beginner',
          percentage: 50,
          description: ''
        });
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleSelectSkillToEdit = (e) => {
    const skillId = e.target.value;
    const skill = skillsList.find(s => s.id === skillId);
    if (skill) setForm(skill);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[400px] h-full bg-white shadow-2xl animate-fade-in flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-[18px] font-bold text-gray-900">
            {mode === 'edit' ? 'Edit Skill' : 'Add New Skill'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 flex flex-col">
          {mode === 'edit' && skillsList && (
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2">Select Skill to Edit</label>
              <select 
                value={form.id || ''}
                onChange={handleSelectSkillToEdit}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none appearance-none"
              >
                <option value="" disabled>Select a skill...</option>
                {skillsList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">Skill Name</label>
            <input 
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., TypeScript"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">Category</label>
            <select 
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none"
            >
              <option value="Technical Skills">Technical Skills</option>
              <option value="Soft Skills">Soft Skills</option>
              <option value="Tools & Technologies">Tools & Technologies</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">Proficiency Level</label>
            <div className="flex flex-wrap gap-2">
              {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm({ ...form, level })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    form.level === level 
                      ? 'border-[#5c4dff] text-[#5c4dff] bg-[#f3f0ff]' 
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">Proficiency (%)</label>
            <div className="flex items-center gap-3">
              <input 
                type="number"
                min="0"
                max="100"
                value={form.percentage}
                onChange={e => setForm({ ...form, percentage: parseInt(e.target.value) || 0 })}
                className="w-20 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none"
              />
              <span className="text-sm font-bold text-gray-400">%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={form.percentage}
              onChange={e => setForm({ ...form, percentage: parseInt(e.target.value) || 0 })}
              className="w-full mt-3 accent-[#5c4dff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">Description (Optional)</label>
            <textarea 
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Add a short description about your skill..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none min-h-[100px] resize-none"
              maxLength={200}
            />
            <div className="text-right text-[10px] text-gray-400 font-semibold mt-1">
              {form.description.length}/200
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-auto pt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-[#5c4dff] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#5c4dff]/20 hover:bg-[#4a3ddf] transition-all"
            >
              {mode === 'edit' ? 'Save Changes' : 'Add Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillModal;
