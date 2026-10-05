import React, { useState, useEffect } from 'react';
import { HiOutlineX, HiOutlineSearch, HiStar } from 'react-icons/hi';

const SkillModal = ({ isOpen, onClose, onSave, initialSkills = [] }) => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const popularSkills = [
    'Frontend', 'React', 'JavaScript', 'Python', 'UI/UX Design', 
    'Figma', 'Node.js', 'Data Analysis', 'Communication', 'Leadership'
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedSkills(initialSkills);
      setSearchQuery('');
    }
  }, [isOpen, initialSkills]);

  if (!isOpen) return null;

  const handleAddSkill = (skill) => {
    if (selectedSkills.length >= 15) return;
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRemoveSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleSearchAdd = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      handleAddSkill(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const handleSubmit = () => {
    onSave(selectedSkills);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[500px] bg-white rounded-3xl shadow-2xl animate-fade-in flex flex-col overflow-hidden border border-gray-100">
        <button onClick={onClose} className="absolute top-6 right-6 p-1 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full">
          <HiOutlineX className="w-5 h-5" />
        </button>

        <div className="p-8 pb-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#5c4dff] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#5c4dff]/20">
            <HiStar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add your skills</h2>
            <p className="text-[13px] font-medium text-gray-500 mt-1">Show others what you're good at and what you're learning.</p>
          </div>
        </div>

        <div className="px-8 space-y-6 flex-1 overflow-y-auto pb-4">
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">Search or add a skill</label>
            <div className="relative">
              <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchAdd}
                placeholder="e.g. React, UI/UX Design, Python"
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">POPULAR SKILLS</label>
            <div className="flex flex-wrap gap-2">
              {popularSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => handleAddSkill(skill)}
                  className="bg-gray-50 border border-gray-100 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-full text-xs font-bold transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">YOUR SELECTED SKILLS</label>
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {selectedSkills.length === 0 && <span className="text-xs text-gray-400 font-medium">No skills selected yet.</span>}
              {selectedSkills.map(skill => (
                <div key={skill} className="bg-[#5c4dff] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                    <HiOutlineX className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[9px] font-bold">i</span>
            Add up to 15 skills to personalize your profile.
          </p>
          <div className="flex gap-3 shrink-0">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-white transition-colors bg-white shadow-sm">
              Cancel
            </button>
            <button onClick={handleSubmit} className="bg-[#5c4dff] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#5c4dff]/20 hover:bg-[#4a3ddf] transition-all">
              Save skills
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillModal;
