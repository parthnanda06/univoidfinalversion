import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineX, HiOutlineSearch, HiStar } from 'react-icons/hi';

const ALL_SKILLS = [
  'Frontend', 'Backend', 'Full Stack', 'React', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js', 'Svelte',
  'JavaScript', 'TypeScript', 'Node.js', 'Express.js', 'NestJS', 'Python', 'Django', 'Flask', 'FastAPI',
  'Java', 'Spring Boot', 'C++', 'C#', '.NET', 'Go', 'Rust', 'Ruby', 'Ruby on Rails', 'PHP', 'Laravel',
  'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Sass', 'Less',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB', 'Firebase', 'Supabase',
  'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'GitLab CI',
  'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
  'Data Analysis', 'Data Science', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
  'Mobile Development', 'React Native', 'Flutter', 'Swift', 'Kotlin', 'Android', 'iOS',
  'Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Project Management', 'Agile', 'Scrum'
];

const SkillModal = ({ isOpen, onClose, onSave, initialSkills = [] }) => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const popularSkills = [
    'Frontend', 'React', 'JavaScript', 'Python', 'UI/UX Design', 
    'Figma', 'Node.js', 'Data Analysis', 'Communication', 'Leadership'
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedSkills(initialSkills || []);
      setSearchQuery('');
      setShowDropdown(false);
    }
  }, [isOpen]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleAddSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleRemoveSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      handleAddSkill(searchQuery.trim());
    }
  };

  const handleSubmit = () => {
    onSave(selectedSkills);
  };

  const filteredSkills = ALL_SKILLS.filter(skill => 
    skill.toLowerCase().includes(searchQuery.toLowerCase()) && 
    !selectedSkills.includes(skill)
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[500px] bg-white rounded-3xl shadow-2xl animate-fade-in flex flex-col overflow-hidden border border-gray-100 max-h-[90vh]">
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
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-gray-900 mb-2">Search or add a skill</label>
            <div className="relative">
              <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="e.g. React, UI/UX Design, Python"
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none"
              />
            </div>

            {/* Dropdown for search suggestions */}
            {showDropdown && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto animate-fade-in py-2">
                {filteredSkills.length > 0 ? (
                  filteredSkills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => handleAddSkill(skill)}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#5c4dff] transition-colors"
                    >
                      {skill}
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => handleAddSkill(searchQuery.trim())}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#5c4dff] transition-colors flex justify-between items-center"
                  >
                    <span>{searchQuery}</span>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-500">Add custom</span>
                  </button>
                )}
              </div>
            )}
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
            Add skills to personalize your profile.
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
