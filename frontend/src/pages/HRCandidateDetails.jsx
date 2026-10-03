import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineDocumentText, HiOutlineCalendar, HiOutlineExternalLink } from 'react-icons/hi';

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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-[#5c4dff] flex items-center justify-center text-white font-black text-2xl shadow-sm">
                 A
              </div>
              <div>
                 <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                   Aarav Mehta
                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                     status === 'Applied' ? 'bg-gray-100 text-gray-700' :
                     status === 'Screening' ? 'bg-blue-100 text-blue-700' :
                     status === 'Shortlisted' ? 'bg-indigo-100 text-indigo-700' :
                     status === 'Interview' ? 'bg-amber-100 text-amber-700' :
                     status === 'Offer' ? 'bg-emerald-100 text-emerald-700' :
                     status === 'Hired' ? 'bg-emerald-200 text-emerald-800' :
                     'bg-red-100 text-red-700'
                   }`}>{status}</span>
                 </h1>
                 <p className="text-sm text-gray-500 font-medium">Applied for: <span className="font-bold text-gray-900">Frontend Developer Intern</span></p>
              </div>
           </div>
           
           <div className="flex gap-2">
              <button onClick={() => setStatus('Rejected')} className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors">
                Reject
              </button>
              
              {status === 'Applied' && (
                <button onClick={() => handleAction('Screening')} className="bg-[#5c4dff] text-white hover:bg-[#4a3ddf] px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors">
                  Move to Screening
                </button>
              )}
              {status === 'Screening' && (
                <button onClick={() => handleAction('Shortlisted')} className="bg-[#5c4dff] text-white hover:bg-[#4a3ddf] px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors">
                  Shortlist Candidate
                </button>
              )}
              {status === 'Shortlisted' && (
                <button onClick={() => handleAction('Interview')} className="bg-[#5c4dff] text-white hover:bg-[#4a3ddf] px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors">
                  Schedule Interview
                </button>
              )}
              {status === 'Interview' && (
                <button onClick={() => handleAction('Offer')} className="bg-[#5c4dff] text-white hover:bg-[#4a3ddf] px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors">
                  Move to Offer
                </button>
              )}
              {status === 'Offer' && (
                <button onClick={() => handleAction('Hired')} className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors">
                  Mark as Hired
                </button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-4">Candidate Profile</h3>
               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                     <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><HiOutlineMail /> Email</p>
                     <p className="text-sm font-bold text-gray-900">aarav.mehta@example.com</p>
                  </div>
                  <div>
                     <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><HiOutlinePhone /> Phone</p>
                     <p className="text-sm font-bold text-gray-900">+91 98765 43210</p>
                  </div>
                  <div>
                     <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><HiOutlineExternalLink /> Portfolio</p>
                     <a href="#" className="text-sm font-bold text-[#5c4dff] hover:underline">github.com/aaravm</a>
                  </div>
               </div>
               
               <h4 className="font-bold text-gray-900 mb-2 text-sm">Skills</h4>
               <div className="flex gap-2 mb-6 flex-wrap">
                  {['React', 'JavaScript', 'HTML/CSS', 'Tailwind', 'Git'].map(s => (
                     <span key={s} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs font-bold">{s}</span>
                  ))}
               </div>
               
               <h4 className="font-bold text-gray-900 mb-2 text-sm">Resume</h4>
               <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center">
                        <HiOutlineDocumentText className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="font-bold text-gray-900 text-sm">Aarav_Mehta_Resume.pdf</p>
                        <p className="text-xs text-gray-500 font-medium">1.2 MB • Uploaded 20 Sep 2026</p>
                     </div>
                  </div>
                  <button className="text-sm font-bold text-[#5c4dff] hover:underline">View</button>
               </div>
            </div>
         </div>
         
         <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-4">Application History</h3>
               <div className="relative border-l border-gray-200 ml-3 space-y-6 pb-2">
                  <div className="relative">
                     <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-[#5c4dff] ring-4 ring-white"></div>
                     <div className="pl-4">
                        <p className="text-sm font-bold text-gray-900">Applied</p>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5"><HiOutlineCalendar className="w-3.5 h-3.5" /> 20 Sep 2026</p>
                     </div>
                  </div>
                  {status !== 'Applied' && (
                  <div className="relative">
                     <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-[#5c4dff] ring-4 ring-white"></div>
                     <div className="pl-4">
                        <p className="text-sm font-bold text-gray-900">Moved to Screening</p>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5"><HiOutlineCalendar className="w-3.5 h-3.5" /> 21 Sep 2026</p>
                     </div>
                  </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default HRCandidateDetails;
