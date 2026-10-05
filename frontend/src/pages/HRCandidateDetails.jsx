import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineDocumentText, HiOutlineCalendar, HiOutlineExternalLink, HiOutlineLocationMarker, HiDotsVertical, HiDownload } from 'react-icons/hi';
import { getApplication, updateAppStatus } from '../services/api';

const HRCandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Profile');
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApplication(id).then(res => {
      setAppData(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  const handleAction = async (newStatus) => {
    try {
      await updateAppStatus(appData.job.id, appData.id, newStatus);
      setAppData({ ...appData, status: newStatus });
    } catch(err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!appData) return <div className="p-8">Candidate not found.</div>;

  const { applicant, job, status, coverLetter, resumeLink, createdAt } = appData;

  const statusMap = {
    'pending': 'Applied',
    'reviewed': 'Screening',
    'shortlisted': 'Shortlisted',
    'rejected': 'Rejected',
    'offer': 'Offer',
    'hired': 'Hired'
  };

  const currentStatusDisplay = statusMap[status] || status;

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 lg:p-8 font-sans">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-xs font-bold text-gray-500 hover:text-gray-900 mb-4 inline-flex items-center gap-1">
          ← Back to Candidates
        </button>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <img src={applicant?.avatar || `https://ui-avatars.com/api/?name=${applicant?.name}`} className="w-16 h-16 rounded-full object-cover shadow-sm" alt="" />
              <div>
                 <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                   {applicant?.name}
                   <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{currentStatusDisplay}</span>
                 </h1>
                 <p className="text-sm text-[#5c4dff] font-bold mt-1">{job?.title}</p>
                 <p className="text-xs text-gray-500 font-medium">Applied on {new Date(createdAt).toLocaleDateString()}</p>
              </div>
           </div>
           
           <div className="flex gap-2">
              <button onClick={() => handleAction('reviewed')} className="bg-[#5c4dff] text-white hover:bg-[#4a3ddf] px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors">
                Move to Screening
              </button>
              <button onClick={() => handleAction('rejected')} className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors">
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
             onClick={() => setActiveTab(tab)}
             className={`px-4 py-3 text-sm font-bold capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'text-[#5c4dff] border-[#5c4dff]' : 'text-gray-500 border-transparent hover:text-gray-900'}`}
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
                     <HiOutlineMail className="w-4 h-4" /> {applicant?.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                     <HiOutlinePhone className="w-4 h-4" /> {applicant?.phone || 'Not provided'}
                  </div>
               </div>
               
               <h3 className="font-bold text-gray-900 mb-4 text-sm">Education</h3>
               <div className="mb-6">
                 <p className="font-bold text-gray-900 text-sm">{applicant?.college || 'Not provided'}</p>
                 <p className="text-xs text-gray-500 font-medium mt-1">{applicant?.branch || 'Branch not provided'}</p>
                 <p className="text-xs text-gray-500 font-medium">{applicant?.year ? applicant.year + ' Year' : ''}</p>
               </div>

               <h3 className="font-bold text-gray-900 mb-4 text-sm">Skills</h3>
               <div className="flex gap-2 mb-6 flex-wrap">
                  {(applicant?.skills || []).map(s => (
                     <span key={s} className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-blue-100">{s}</span>
                  ))}
                  {(!applicant?.skills || applicant.skills.length === 0) && <span className="text-xs text-gray-500">No skills provided</span>}
               </div>

               <h3 className="font-bold text-gray-900 mb-4 text-sm">Links</h3>
               <div className="flex gap-4">
                  {(applicant?.links || []).map(l => (
                     <a key={l} href={l} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-bold text-gray-700 hover:text-[#5c4dff] transition-colors"><HiOutlineExternalLink /> {new URL(l).hostname}</a>
                  ))}
                  {(!applicant?.links || applicant.links.length === 0) && <span className="text-xs text-gray-500">No links provided</span>}
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
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{new Date(createdAt).toLocaleString()}</p>
                     </div>
                  </div>
                  {['reviewed', 'shortlisted', 'offer', 'hired'].map((stepStatus, idx) => {
                     // Check if current status is past or at this step
                     const stages = ['pending', 'reviewed', 'shortlisted', 'offer', 'hired'];
                     const currentIndex = stages.indexOf(status === 'rejected' ? 'pending' : status);
                     const stepIndex = stages.indexOf(stepStatus);
                     const isPast = currentIndex >= stepIndex;
                     
                     return (
                     <div key={stepStatus} className="relative">
                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ${isPast ? 'bg-[#5c4dff] border-none' : 'bg-white border-2 border-gray-300'} ring-4 ring-white`}></div>
                        <div className="pl-4">
                           <p className={`text-sm font-bold ${isPast ? 'text-gray-900' : 'text-gray-400'}`}>{statusMap[stepStatus]}</p>
                        </div>
                     </div>
                  )})}
               </div>
            </div>
         </div>

         {/* Right Column */}
         <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-4 text-sm">Resume & Documents</h3>
               <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <HiOutlineDocumentText className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="font-bold text-gray-900 text-xs truncate max-w-[150px]">{resumeLink || 'Resume Attached'}</p>
                        <p className="text-[10px] text-gray-500 font-medium">Uploaded Document</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors text-center">View</button>
                     <button className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors text-center">Download</button>
                  </div>
               </div>
               
               {coverLetter && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm mt-6">Cover Letter</h3>
                    <p className="text-xs text-gray-600 font-medium whitespace-pre-wrap">{coverLetter}</p>
                  </div>
               )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-4 text-sm">Quick Actions</h3>
               <div className="space-y-3">
                  <button onClick={() => handleAction('shortlisted')} className="w-full bg-[#5c4dff] text-white hover:bg-[#4a3ddf] py-2.5 rounded-lg font-bold text-xs shadow-sm transition-colors text-center">
                     Shortlist Candidate
                  </button>
                  <button onClick={() => handleAction('rejected')} className="w-full bg-white text-red-600 border border-red-200 hover:bg-red-50 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-colors text-center">
                     Reject Candidate
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default HRCandidateDetails;
