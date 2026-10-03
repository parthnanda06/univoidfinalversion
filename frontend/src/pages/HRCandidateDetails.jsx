import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineDocumentText, HiOutlineCalendar, HiOutlineExternalLink, HiOutlineLocationMarker, HiDotsVertical, HiDownload } from 'react-icons/hi';

const HRCandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Applied'); // Applied, Screening, Shortlisted, Interview, Offer, Hired

  const handleAction = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === 'Interview') {
      alert('This would open the Schedule Interview screen.');
    } else if (newStatus === 'Offer') {
      alert('This would open the Offer creation screen.');
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 lg:p-8 font-sans">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-xs font-bold text-gray-500 hover:text-gray-900 mb-4 inline-flex items-center gap-1">
          ← Back to Candidates
        </button>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <img src="https://i.pravatar.cc/150?u=10" className="w-16 h-16 rounded-full object-cover shadow-sm" alt="Aarav Mehta" />
              <div>
                 <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                   Aarav Mehta
                   <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">New</span>
                 </h1>
                 <p className="text-sm text-[#5c4dff] font-bold mt-1">Frontend Developer Intern</p>
                 <p className="text-xs text-gray-500 font-medium">Applied on 30 Sep 2026</p>
              </div>
           </div>
           
           <div className="flex gap-2">
              <button className="bg-[#5c4dff] text-white hover:bg-[#4a3ddf] px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors">
                Move to Screening
              </button>
              <button className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors">
                Reject
              </button>
              <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 p-2 rounded-lg font-bold text-xs shadow-sm transition-colors">
                <HiDotsVertical className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {['Profile', 'Application', 'Resume', 'Interviews', 'Notes'].map(tab => (
           <button 
             key={tab} 
             className={`px-4 py-3 text-sm font-bold capitalize transition-colors border-b-2 -mb-px ${tab === 'Profile' ? 'text-[#5c4dff] border-[#5c4dff]' : 'text-gray-500 border-transparent hover:text-gray-900'}`}
           >
             {tab}
           </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Column */}
         <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-4 text-sm">Personal Information</h3>
               <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                     <HiOutlineMail className="w-4 h-4" /> aarav.mehta@example.com
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                     <HiOutlinePhone className="w-4 h-4" /> +91 98765 43210
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                     <HiOutlineLocationMarker className="w-4 h-4" /> Vadodara, Gujarat
                  </div>
               </div>
               
               <h3 className="font-bold text-gray-900 mb-4 text-sm">Education</h3>
               <div className="mb-6">
                 <p className="font-bold text-gray-900 text-sm">Parul University</p>
                 <p className="text-xs text-gray-500 font-medium mt-1">B.Tech in Computer Science</p>
                 <p className="text-xs text-gray-500 font-medium">3rd Year • CGPA: 8.2</p>
               </div>

               <h3 className="font-bold text-gray-900 mb-4 text-sm">Skills</h3>
               <div className="flex gap-2 mb-6 flex-wrap">
                  {['React', 'JavaScript', 'Tailwind CSS', 'HTML', 'CSS', 'Git'].map(s => (
                     <span key={s} className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-blue-100">{s}</span>
                  ))}
               </div>

               <h3 className="font-bold text-gray-900 mb-4 text-sm">Links</h3>
               <div className="flex gap-4">
                  <a href="#" className="flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-[#5c4dff] transition-colors"><HiOutlineExternalLink /> GitHub</a>
                  <a href="#" className="flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-[#5c4dff] transition-colors"><HiOutlineExternalLink /> Portfolio</a>
                  <a href="#" className="flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-[#5c4dff] transition-colors"><HiOutlineExternalLink /> LinkedIn</a>
               </div>
            </div>
         </div>
         
         {/* Middle Column */}
         <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-6 text-sm">Application Status</h3>
               <div className="relative border-l border-gray-200 ml-3 space-y-8 pb-2">
                  <div className="relative">
                     <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#5c4dff] ring-4 ring-white"></div>
                     <div className="pl-4">
                        <p className="text-sm font-bold text-gray-900">Applied</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">30 Sep 2026, 10:24 AM</p>
                     </div>
                  </div>
                  {['Screening', 'Shortlisted', 'Interview', 'Offer', 'Hired'].map(step => (
                     <div key={step} className="relative">
                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-white border-2 border-gray-300 ring-4 ring-white"></div>
                        <div className="pl-4">
                           <p className="text-sm font-bold text-gray-400">{step}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Right Column */}
         <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-4 text-sm">Resume</h3>
               <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <HiOutlineDocumentText className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="font-bold text-gray-900 text-xs">Aarav_Mehta_Resume.pdf</p>
                        <p className="text-[10px] text-gray-500 font-medium">2.4 MB</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors text-center">View</button>
                     <button className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors text-center">Download</button>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-4 text-sm">Quick Actions</h3>
               <div className="space-y-3">
                  <button className="w-full bg-[#5c4dff] text-white hover:bg-[#4a3ddf] py-2.5 rounded-lg font-bold text-xs shadow-sm transition-colors text-center">
                     Move to Screening
                  </button>
                  <button className="w-full bg-white text-red-600 border border-red-200 hover:bg-red-50 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-colors text-center">
                     Reject
                  </button>
                  <button className="w-full bg-white text-[#5c4dff] border border-gray-200 hover:bg-gray-50 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-colors text-center">
                     Add Note
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default HRCandidateDetails;
