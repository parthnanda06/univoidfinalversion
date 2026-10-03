import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineCalendar, HiOutlineChartBar, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';

const HRJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [pipelineStage, setPipelineStage] = useState('Applied'); // For Candidates tab

  // Mock data for Candidates tab pipeline
  const pipeline = [
    { name: 'Applied', count: 86, color: 'bg-gray-100 text-gray-700' },
    { name: 'Screening', count: 28, color: 'bg-blue-100 text-blue-700' },
    { name: 'Shortlisted', count: 18, color: 'bg-indigo-100 text-indigo-700' },
    { name: 'Interview', count: 8, color: 'bg-amber-100 text-amber-700' },
    { name: 'Offer', count: 4, color: 'bg-emerald-100 text-emerald-700' },
    { name: 'Hired', count: 1, color: 'bg-emerald-200 text-emerald-800' },
  ];

  const candidatesData = {
    'Applied': [
      { id: 101, name: 'Aarav Mehta', role: 'Frontend Developer Intern', status: 'Applied', date: '20 Sep 2026' },
      { id: 102, name: 'Ishita Verma', role: 'Frontend Developer Intern', status: 'Applied', date: '21 Sep 2026' }
    ],
    'Screening': [
      { id: 103, name: 'Dev Shah', role: 'Frontend Developer Intern', status: 'Screening', date: '19 Sep 2026' }
    ],
    'Shortlisted': [
      { id: 104, name: 'Sneha Iyer', role: 'Frontend Developer Intern', status: 'Shortlisted', date: '18 Sep 2026' }
    ],
    'Interview': [
      { id: 105, name: 'Tanvi Shah', role: 'Frontend Developer Intern', status: 'Interview', date: '15 Sep 2026' }
    ],
    'Offer': [
      { id: 106, name: 'Rahul Patel', role: 'Frontend Developer Intern', status: 'Offer', date: '10 Sep 2026' }
    ],
    'Hired': [
      { id: 107, name: 'Neha Desai', role: 'Frontend Developer Intern', status: 'Hired', date: '5 Sep 2026' }
    ]
  };

  const currentCandidates = candidatesData[pipelineStage] || [];

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 lg:p-8 font-sans">
      <div className="mb-6">
        <button onClick={() => navigate('/jobs')} className="text-xs font-bold text-gray-500 hover:text-gray-900 mb-4 inline-flex items-center gap-1">
          ← Back to Jobs
        </button>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold font-mono text-sm shadow-sm">&lt;/&gt;</div>
              <div>
                 <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                   Frontend Developer Intern
                   <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">Active</span>
                 </h1>
                 <p className="text-sm text-gray-500 font-medium">Engineering • Internship • Vadodara / Hybrid • Posted 28 Sep 2026</p>
              </div>
           </div>
           <div className="flex gap-2">
              <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-bold text-xs shadow-sm">Edit Job</button>
              <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-bold text-xs shadow-sm">Pause</button>
              <button className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-4 py-2 rounded-lg font-bold text-xs shadow-sm">Close Job</button>
           </div>
        </div>
      </div>

      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {['overview', 'candidates', 'interviews', 'analytics'].map(tab => (
           <button 
             key={tab} 
             onClick={() => setActiveTab(tab)}
             className={`px-4 py-3 text-sm font-bold capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'text-[#5c4dff] border-[#5c4dff]' : 'text-gray-500 border-transparent hover:text-gray-900'}`}
           >
             {tab} {tab === 'candidates' && '(86)'} {tab === 'interviews' && '(8)'} {tab === 'offers' && '(4)'}
           </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-4">Job Overview</h3>
                 <p className="text-sm text-gray-700 mb-6">Looking for a passionate Frontend Developer Intern to join our team and work on building modern web applications using React and Tailwind CSS.</p>
                 <h4 className="font-bold text-gray-900 mb-2 text-sm">Full Description</h4>
                 <p className="text-sm text-gray-700 leading-relaxed">
                   We are looking for a passionate Frontend Developer Intern...
                   <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Develop responsive UI</li>
                      <li>Work with React.js</li>
                      <li>Collaborate with backend</li>
                   </ul>
                 </p>
              </div>
           </div>
           <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-4">Job Details</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500 font-medium">Department</span>
                       <span className="font-bold text-gray-900">Engineering</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500 font-medium">Job Type</span>
                       <span className="font-bold text-gray-900">Internship</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500 font-medium">Location</span>
                       <span className="font-bold text-gray-900">Vadodara (Hybrid)</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
           {/* Pipeline bar */}
           <div className="flex border-b border-gray-100 p-2 overflow-x-auto bg-gray-50/50">
             {pipeline.map(stage => (
               <button 
                 key={stage.name} 
                 onClick={() => setPipelineStage(stage.name)}
                 className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl border text-center transition-all ${pipelineStage === stage.name ? 'border-[#5c4dff] bg-white shadow-sm ring-1 ring-[#5c4dff]' : 'border-transparent hover:bg-white/60'}`}
               >
                 <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{stage.name}</div>
                 <div className="text-2xl font-black text-gray-900">{stage.count}</div>
               </button>
             ))}
           </div>
           
           <div className="p-4 bg-white">
              <h3 className="font-bold text-gray-900 mb-4">{currentCandidates.length} Candidates in {pipelineStage}</h3>
              <div className="space-y-3">
                 {currentCandidates.map(c => (
                   <div 
                     key={c.id} 
                     onClick={() => navigate(`/candidates/${c.id}`)}
                     className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#5c4dff]/30 hover:shadow-sm cursor-pointer transition-all group"
                   >
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div>
                           <h4 className="font-bold text-gray-900 group-hover:text-[#5c4dff]">{c.name}</h4>
                           <p className="text-xs text-gray-500">Applied on {c.date}</p>
                        </div>
                     </div>
                     <span className={`px-3 py-1 rounded text-xs font-bold ${
                        c.status === 'Applied' ? 'bg-gray-100 text-gray-700' :
                        c.status === 'Screening' ? 'bg-blue-100 text-blue-700' :
                        c.status === 'Shortlisted' ? 'bg-indigo-100 text-indigo-700' :
                        c.status === 'Interview' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                     }`}>
                        {c.status}
                     </span>
                   </div>
                 ))}
                 {currentCandidates.length === 0 && (
                   <p className="text-sm text-gray-500 text-center py-10">No candidates currently in this stage.</p>
                 )}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'interviews' && (
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-500 py-20">
            Interviews related to this job will appear here.
         </div>
      )}

      {activeTab === 'analytics' && (
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-500 py-20">
            Job specific analytics will appear here.
         </div>
      )}

    </div>
  );
};

export default HRJobDetails;
