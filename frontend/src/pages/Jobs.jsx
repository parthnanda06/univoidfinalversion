import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getJobs } from '../services/api';
import { 
  HiOutlineSearch, HiFilter, HiOutlineLocationMarker, HiOutlineBriefcase, 
  HiOutlineCurrencyRupee, HiOutlineBookmark, HiSparkles, HiChevronRight, 
  HiChevronDown, HiOutlineClock, HiOutlineUserGroup, HiOutlineBadgeCheck, HiOutlineDocumentText
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import ApplyJobModal from '../components/ApplyJobModal';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Mock initial data fetch
  useEffect(() => {
    // Ideally this would fetch from backend, but keeping this simple based on mock
    getJobs()
      .then((res) => {
        setJobs(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleApply = (job) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  // Dummy Data for the mockup presentation
  const recommendedJobs = [
    { id: 1, company: 'TechNova', logo: 'T', role: 'AI/ML Intern', type: 'Remote • Internship', salary: '₹15k - ₹25k / month', match: '92% Match', tags: ['Python', 'Machine Learning', 'PyTorch'] },
    { id: 2, company: 'CodeStudio', logo: '</>', role: 'Frontend Developer Intern', type: 'Ahmedabad • Internship', salary: '₹10k - ₹18k / month', match: '88% Match', tags: ['React', 'JavaScript', 'Tailwind CSS'] },
    { id: 3, company: 'DataMinds', logo: 'D', role: 'Data Analyst Intern', type: 'Hybrid • Internship', salary: '₹12k - ₹20k / month', match: '85% Match', tags: ['Python', 'SQL', 'Excel'] },
  ];

  const closingSoon = [
    { id: 1, logo: 'G', color: 'bg-emerald-500', company: 'GrowX', role: 'Marketing Intern', deadline: 'Tomorrow' },
    { id: 2, logo: 'N', color: 'bg-gray-900', company: 'Nexera', role: 'Backend Intern', deadline: '2 days left' },
    { id: 3, logo: 'B', color: 'bg-purple-600', company: 'ByteFlow', role: 'UI/UX Designer Intern', deadline: '3 days left' },
    { id: 4, logo: 'A', color: 'bg-blue-600', company: 'Analytics Vidhya', role: 'ML Research Intern', deadline: '3 days left' },
  ];

  const categories = [
    { name: 'Internships', count: '124 open positions', icon: <HiOutlineBriefcase className="text-[#5c4dff]" />, color: 'bg-[#5c4dff]/10 text-[#5c4dff]' },
    { name: 'Full-time Jobs', count: '86 open positions', icon: <HiOutlineBadgeCheck className="text-emerald-500" />, color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Part-time Jobs', count: '37 open positions', icon: <HiOutlineClock className="text-orange-500" />, color: 'bg-orange-50 text-orange-600' },
    { name: 'Remote Jobs', count: '58 open positions', icon: <HiOutlineLocationMarker className="text-blue-500" />, color: 'bg-blue-50 text-blue-600' },
    { name: 'Research', count: '23 open positions', icon: <HiOutlineDocumentText className="text-purple-500" />, color: 'bg-purple-50 text-purple-600' },
  ];

  const savedJobs = [
    { id: 1, logo: 'D', logoBg: 'bg-blue-600', company: 'DevCraft', role: 'Full Stack Developer Intern', type: 'Remote • Internship', tags: ['MERN', 'JavaScript', 'Node.js'], savedTime: 'Saved 2 days ago' },
    { id: 2, logo: 'P', logoBg: 'bg-orange-500', company: 'Pycube', role: 'Python Developer Intern', type: 'Ahmedabad • Internship', tags: ['Python', 'Django', 'REST API'], savedTime: 'Saved 5 days ago' },
    { id: 3, logo: 'S', logoBg: 'bg-purple-600', company: 'StartupX', role: 'Product Management Intern', type: 'Remote • Internship', tags: ['Product', 'Analytics', 'Research'], savedTime: 'Saved 1 week ago' },
  ];

  return (
    <div style={{ backgroundColor: '#f0f2f5' }} className="min-h-screen w-full pb-20 sm:pb-0">
      <div className="p-4 sm:p-6 lg:p-10 max-w-[1400px] mx-auto animate-fade-in">
      
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 sm:mb-8 gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            Opportunities for you 🎯
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-500">
            Find internships, jobs, and more — all in one place
          </p>
        </div>
        
        {/* Right side illustration (mocked with div) */}
        <div className="hidden md:flex items-center gap-4 relative w-48 h-24">
           {/* Briefcase Icon */}
           <div className="absolute right-12 bottom-0 w-24 h-20 bg-gradient-to-br from-[#5c4dff] to-blue-500 rounded-2xl shadow-xl flex items-center justify-center -rotate-6 z-10">
              <div className="w-8 h-2 bg-white/20 rounded-full absolute top-2"></div>
              <div className="w-24 h-px bg-white/20"></div>
           </div>
           {/* CV Icon */}
           <div className="absolute right-0 bottom-2 w-16 h-22 bg-white rounded-xl shadow-lg border border-gray-100 p-2 rotate-12 z-0 flex flex-col gap-1.5 justify-center">
              <div className="w-10 h-3 bg-gray-100 rounded-sm"></div>
              <div className="w-full h-1 bg-gray-100 rounded-full"></div>
              <div className="w-3/4 h-1 bg-gray-100 rounded-full"></div>
              <div className="w-full h-1 bg-gray-100 rounded-full"></div>
              <div className="text-[10px] font-black text-[#5c4dff] text-center mt-auto">CV</div>
           </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text" 
              className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]" 
              placeholder="Search jobs, skills, companies..."
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="bg-white border border-gray-200 rounded-2xl py-3.5 px-6 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] transition-colors whitespace-nowrap">
             <HiFilter className="w-4 h-4" /> All Filters <HiChevronDown className="w-4 h-4 text-gray-400 ml-1" />
          </button>
        </div>
        
        {/* Skills Pills */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
           {['AI/ML', 'Python', 'React', 'Remote', 'Full-time', 'Internship'].map(skill => (
              <button key={skill} className="px-4 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:border-[#5c4dff] hover:text-[#5c4dff] transition-colors whitespace-nowrap shadow-sm">
                 {skill}
              </button>
           ))}
           <button className="px-4 py-1.5 rounded-full text-[#5c4dff] font-bold text-xs hover:bg-[#5c4dff]/5 transition-colors whitespace-nowrap">
              + Add skills
           </button>
        </div>
      </div>

      {/* Recommended for you */}
      <div className="mb-12">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-[15px] font-bold text-gray-900">Recommended for you</h2>
            <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all →</button>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedJobs.map(job => (
               <div key={job.id} className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all group flex flex-col relative">
                  <button className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors">
                     <HiOutlineBookmark className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-5">
                     <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                        {job.logo}
                     </div>
                     <div>
                        <h3 className="text-sm font-bold text-gray-900">{job.company}</h3>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 tracking-wide uppercase mt-1 inline-block">
                           {job.match}
                        </span>
                     </div>
                  </div>
                  
                  <h4 className="text-[15px] font-bold text-gray-900 mb-2">{job.role}</h4>
                  
                  <div className="space-y-1.5 mb-5">
                     <p className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5">
                        <HiOutlineLocationMarker className="w-3.5 h-3.5 text-gray-400" /> {job.type}
                     </p>
                     <p className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5">
                        <HiOutlineCurrencyRupee className="w-3.5 h-3.5 text-gray-400" /> {job.salary}
                     </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                     {job.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-[#5c4dff] bg-[#5c4dff]/5 px-2.5 py-1 rounded-md border border-[#5c4dff]/10">
                           {tag}
                        </span>
                     ))}
                  </div>
                  
                  <div className="mt-auto grid grid-cols-2 gap-3">
                     <button className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-[11px] hover:bg-gray-50 transition-colors">
                        View Details
                     </button>
                     <button 
                        onClick={() => handleApply(job)}
                        className="w-full py-2.5 rounded-xl bg-[#5c4dff] hover:bg-[#4a3ddf] text-white font-bold text-[11px] shadow-md shadow-[#5c4dff]/20 transition-all"
                     >
                        Apply
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* AI Opportunity Match */}
      <div className="bg-gradient-to-r from-[#f4f3ff] to-[#ebeaff] rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 border border-[#5c4dff]/10 shadow-sm relative overflow-hidden group">
         <div className="absolute right-10 -top-10 w-40 h-40 bg-[#5c4dff]/5 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
         
         <div className="flex items-center gap-5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0 border border-[#5c4dff]/10">
               <HiSparkles className="w-6 h-6 text-[#5c4dff] animate-pulse" />
            </div>
            <div>
               <h3 className="text-sm font-black text-[#5c4dff] mb-1 flex items-center gap-1.5">
                  AI Opportunity Match <HiSparkles className="text-orange-400 w-3 h-3" />
               </h3>
               <p className="text-[11px] font-medium text-gray-600 max-w-sm leading-relaxed">
                  We analyzed your profile and found <strong className="text-gray-900">8 new opportunities</strong> that are a strong match for you.
               </p>
            </div>
         </div>
         
         <button className="relative z-10 w-full sm:w-auto bg-[#5c4dff] hover:bg-[#4a3ddf] text-white py-3 px-6 rounded-xl font-bold text-xs shadow-md shadow-[#5c4dff]/20 transition-all hover:-translate-y-0.5 whitespace-nowrap">
            View Matches →
         </button>
      </div>

      {/* Closing Soon */}
      <div className="mb-12">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-[15px] font-bold text-gray-900">Closing soon</h2>
            <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all →</button>
         </div>
         
         <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {closingSoon.map((job, i) => (
               <div key={job.id} className="min-w-[240px] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm ${job.color}`}>
                     {job.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-[11px] font-bold text-gray-500 mb-0.5 truncate">{job.company}</h4>
                     <h3 className="text-xs font-bold text-gray-900 truncate group-hover:text-[#5c4dff] transition-colors">{job.role}</h3>
                     <p className="text-[9px] font-bold text-red-500 mt-1 flex items-center gap-1">
                        <HiOutlineClock className="w-3 h-3" /> Deadline: {job.deadline}
                     </p>
                  </div>
                  <button className="text-gray-300 hover:text-gray-500 shrink-0">
                     <HiOutlineBookmark className="w-4 h-4" />
                  </button>
               </div>
            ))}
            <button className="min-w-[40px] h-auto bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#5c4dff] hover:shadow-md transition-all">
               <HiChevronRight className="w-5 h-5" />
            </button>
         </div>
      </div>

      {/* Explore by Category */}
      <div className="mb-12">
         <h2 className="text-[15px] font-bold text-gray-900 mb-6">Explore by category</h2>
         <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((cat, i) => (
               <div key={i} className="min-w-[200px] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${cat.color} group-hover:scale-110 transition-transform`}>
                     {cat.icon}
                  </div>
                  <div>
                     <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#5c4dff] transition-colors">{cat.name}</h3>
                     <p className="text-[9px] font-medium text-gray-400 mt-0.5">{cat.count}</p>
                  </div>
               </div>
            ))}
            <button className="min-w-[40px] h-auto bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#5c4dff] hover:shadow-md transition-all">
               <HiChevronRight className="w-5 h-5" />
            </button>
         </div>
      </div>

      {/* From your communities */}
      <div className="mb-12">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-[15px] font-bold text-gray-900">From your communities</h2>
            <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all →</button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['AI/ML Students', 'Web Developers', 'Hackathon Lovers'].map((comm, i) => {
               const counts = [14, 8, 5];
               return (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4 cursor-pointer group">
                     <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center shrink-0">
                        <HiOutlineUserGroup className="w-5 h-5" />
                     </div>
                     <div className="flex-1 min-w-0 border-r border-gray-100 pr-4">
                        <h3 className="text-xs font-bold text-gray-900 truncate group-hover:text-[#5c4dff] transition-colors">{comm}</h3>
                        <p className="text-[9px] font-medium text-gray-400">Community</p>
                     </div>
                     <div className="flex items-center justify-between w-24 shrink-0">
                        <p className="text-[9px] font-medium text-gray-500 leading-tight">
                           <strong className="text-gray-900">{counts[i]} members</strong> saved this opportunity
                        </p>
                        <HiChevronRight className="w-3 h-3 text-gray-400" />
                     </div>
                  </div>
               )
            })}
         </div>
      </div>

      {/* Bottom Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
         
         {/* Left: Saved Opportunities */}
         <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-[15px] font-bold text-gray-900">Saved opportunities</h2>
               <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all →</button>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm divide-y divide-gray-50">
               {savedJobs.map(job => (
                  <div key={job.id} className="p-5 flex flex-col sm:flex-row gap-5 hover:bg-gray-50 transition-colors group">
                     <div className={`w-12 h-12 rounded-xl text-white font-bold text-lg flex items-center justify-center shrink-0 ${job.logoBg}`}>
                        {job.logo}
                     </div>
                     
                     <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-bold text-gray-900 group-hover:text-[#5c4dff] transition-colors">{job.role}</h3>
                        <p className="text-xs font-medium text-gray-500 mb-1">{job.company}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mb-3">
                           <HiOutlineLocationMarker className="w-3 h-3" /> {job.type}
                        </p>
                        <div className="flex gap-2">
                           {job.tags.map(tag => (
                              <span key={tag} className="text-[9px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                 {tag}
                              </span>
                           ))}
                        </div>
                     </div>
                     
                     <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between shrink-0">
                        <p className="text-[10px] font-medium text-gray-400">{job.savedTime}</p>
                        <div className="flex items-center gap-2">
                           <button className="text-[#5c4dff] hover:text-[#4a3ddf] transition-colors"><HiOutlineBookmark className="w-5 h-5 fill-current" /></button>
                           <button className="text-gray-300 hover:text-gray-500">⋮</button>
                        </div>
                     </div>
                  </div>
               ))}
               <div className="p-4 text-center">
                  <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all saved →</button>
               </div>
            </div>
         </div>

         {/* Right: Sidebars */}
         <div className="space-y-6">
            
            {/* Quick Apply Card */}
            <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
               <div className="flex items-start gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#5c4dff]/10 flex items-center justify-center shrink-0">🚀</div>
                  <div>
                     <h3 className="text-[13px] font-black text-gray-900">Quick Apply with <span className="text-[#5c4dff]">UniVoid</span></h3>
                     <p className="text-[10px] font-medium text-gray-500 mt-1">Apply in one click using your UniVoid profile</p>
                  </div>
               </div>
               
               <div className="space-y-3 mb-6">
                  {['Profile', 'Resume', 'Skills', 'Education'].map((item, i) => (
                     <div key={item} className="flex items-center justify-between text-xs font-medium text-gray-700">
                        <span className="flex items-center gap-2">✓ {item}</span>
                        <div className="w-4 h-4 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                           <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        </div>
                     </div>
                  ))}
               </div>
               
               <button className="w-full py-2.5 rounded-xl border border-[#5c4dff]/20 bg-[#5c4dff]/5 text-[#5c4dff] hover:bg-[#5c4dff]/10 font-bold text-[11px] transition-colors">
                  Create / Upload Resume
               </button>
            </div>

            {/* Recruiter Promo */}
            <div className="bg-[#f8f9ff] border border-blue-100 rounded-[24px] p-6 relative overflow-hidden group">
               <h3 className="text-[13px] font-black text-gray-900 mb-2 relative z-10">Are you a recruiter?</h3>
               <p className="text-[10px] font-medium text-gray-600 mb-5 max-w-[140px] leading-relaxed relative z-10">
                  Post jobs and connect with talented students.
               </p>
               <button className="bg-[#5c4dff] hover:bg-[#4a3ddf] text-white py-2 px-5 rounded-xl font-bold text-[11px] shadow-sm transition-colors relative z-10">
                  Post a Job →
               </button>
               
               <div className="absolute right-0 bottom-0 opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className="w-24 h-24 bg-blue-100 rounded-tl-[40px] flex items-end justify-end p-3">
                     <div className="w-12 h-10 bg-[#5c4dff]/20 rounded-lg border-2 border-[#5c4dff]/30"></div>
                  </div>
               </div>
            </div>
            
         </div>
      </div>
      
      {/* Footer Banner */}
      <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-[24px] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#5c4dff]/10 rounded-xl text-[#5c4dff] flex items-center justify-center text-xl shrink-0">
               📄
            </div>
            <div>
               <h3 className="text-[13px] font-black text-gray-900 mb-0.5">Build a better profile, get better opportunities</h3>
               <p className="text-[11px] font-medium text-gray-500">Complete your profile to get matched with the best opportunities.</p>
            </div>
         </div>
         <button className="w-full sm:w-auto bg-white border border-gray-200 text-[#5c4dff] hover:bg-gray-50 py-2.5 px-6 rounded-xl font-bold text-[11px] transition-colors whitespace-nowrap shadow-sm">
            Improve Profile →
         </button>
      </div>

      </div>
      
      {/* Apply Job Modal */}
      <ApplyJobModal 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        job={selectedJob} 
      />
    </div>
  );
};

export default Jobs;
