import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineCalendar, HiOutlineChartBar, HiOutlineLocationMarker, HiOutlineClock, HiOutlinePencil, HiOutlinePause, HiOutlineXCircle, HiOutlineSearch, HiDotsVertical, HiOutlineFilter } from 'react-icons/hi';
import { getJob, updateAppStatus } from '../services/api';

const HRJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [pipelineStage, setPipelineStage] = useState('pending'); // For Candidates tab
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = () => {
    getJob(id).then(res => {
      setJob(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateAppStatus(id, appId, newStatus);
      fetchJob();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!job) return <div className="p-8">Job not found.</div>;

  const applications = job.applications || [];
  
  // Group candidates by status (backend status: 'pending', 'reviewed', 'shortlisted', 'rejected')
  // We map 'Applied' -> 'pending', 'Screening' -> 'reviewed', 'Shortlisted' -> 'shortlisted', 'Rejected' -> 'rejected'
  
  const pipeline = [
    { name: 'Applied', status: 'pending', activeColor: 'bg-indigo-50 border-indigo-200 text-indigo-700', inactiveColor: 'bg-white border-gray-100', numColor: 'text-indigo-600' },
    { name: 'Screening', status: 'reviewed', activeColor: 'bg-blue-50 border-blue-200 text-blue-700', inactiveColor: 'bg-white border-gray-100', numColor: 'text-gray-900' },
    { name: 'Shortlisted', status: 'shortlisted', activeColor: 'bg-emerald-50 border-emerald-200 text-emerald-700', inactiveColor: 'bg-white border-gray-100', numColor: 'text-gray-900' },
    { name: 'Rejected', status: 'rejected', activeColor: 'bg-red-50 border-red-200 text-red-700', inactiveColor: 'bg-white border-gray-100', numColor: 'text-red-500' }
  ];

  const currentCandidates = applications.filter(app => app.status === pipelineStage);

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 lg:p-8 font-sans">
      <div className="mb-6">
        <button onClick={() => navigate('/jobs')} className="text-xs font-bold text-gray-500 hover:text-gray-900 mb-4 inline-flex items-center gap-1">
          ← Back to Jobs
        </button>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold font-mono text-sm shadow-sm">{job.title[0]}</div>
               <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {job.title}
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{job.isActive ? 'Active' : 'Closed'}</span>
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-medium mt-1">
                     <span className="flex items-center gap-1"><HiOutlineBriefcase className="w-4 h-4"/> {job.company}</span>
                     <span className="flex items-center gap-1"><HiOutlineClock className="w-4 h-4"/> {job.type}</span>
                     <span className="flex items-center gap-1"><HiOutlineLocationMarker className="w-4 h-4"/> {job.location}</span>
                     <span className="flex items-center gap-1"><HiOutlineCalendar className="w-4 h-4"/> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
              </div>
           </div>
           <div className="flex gap-2">
              <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors">
                <HiOutlinePencil className="w-4 h-4"/> Edit Job
              </button>
              <button className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-4 py-2 rounded-lg font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors">
                <HiOutlinePause className="w-4 h-4"/> Pause Job
              </button>
              <button className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-4 py-2 rounded-lg font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors">
                <HiOutlineXCircle className="w-4 h-4"/> Close Job
              </button>
           </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {['overview', 'candidates', 'interviews'].map(tab => (
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab)}
               className={`px-4 py-3 text-sm font-bold capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'text-[#5c4dff] border-[#5c4dff]' : 'text-gray-500 border-transparent hover:text-gray-900'}`}
             >
               {tab} {tab === 'candidates' && `(${applications.length})`} {tab === 'interviews' && '(0)'}
             </button>
          ))}
        </div>
        {activeTab === 'interviews' && (
           <button className="bg-[#5c4dff] hover:bg-[#4a3ddf] text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm mb-1 transition-colors">
             + Schedule Interview
           </button>
        )}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-2">Job Description</h3>
                 <p className="text-sm text-gray-700 mb-6 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                 
                 <h4 className="font-bold text-gray-900 mb-2 text-sm">Full Description</h4>
                 <p className="text-sm text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
                   {job.description}
                 </p>

                 <h4 className="font-bold text-gray-900 mb-3 text-sm">Key Responsibilities</h4>
                 <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 marker:text-gray-400">
                    <li>Develop responsive and interactive user interfaces</li>
                    <li>Work with React.js and modern frontend tools</li>
                    <li>Collaborate with backend and design teams</li>
                    <li>Improve performance and user experience</li>
                    <li>Contribute to product features</li>
                 </ul>
              </div>
           </div>
           <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-4">Job Details</h3>
                 <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500 font-medium">Department</span>
                       <span className="font-bold text-gray-900 text-right">Engineering</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500 font-medium">Job Type</span>
                       <span className="font-bold text-gray-900 text-right">Internship</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500 font-medium">Location</span>
                       <span className="font-bold text-gray-900 text-right">Vadodara (Hybrid)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500 font-medium">No. of Openings</span>
                       <span className="font-bold text-gray-900 text-right">4</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500 font-medium">Expected Start Date</span>
                       <span className="font-bold text-gray-900 text-right">1 Nov 2026</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500 font-medium">Application Deadline</span>
                       <span className="font-bold text-gray-900 text-right">30 Oct 2026</span>
                    </div>
                 </div>

                 <div className="border-t border-gray-100 pt-6 mb-6">
                   <h3 className="font-bold text-gray-900 mb-4">Requirements</h3>
                   <div className="mb-4">
                     <h4 className="text-xs font-bold text-gray-900 mb-2">Required Skills</h4>
                     <div className="flex flex-wrap gap-2">
                       {['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'].map(skill => (
                         <span key={skill} className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100">{skill}</span>
                       ))}
                     </div>
                   </div>
                   <div>
                     <h4 className="text-xs font-bold text-gray-900 mb-2">Good to Have</h4>
                     <div className="flex flex-wrap gap-2">
                       {['Git', 'TypeScript', 'REST API', 'UI/UX'].map(skill => (
                         <span key={skill} className="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md text-xs font-bold border border-gray-200">{skill}</span>
                       ))}
                     </div>
                   </div>
                 </div>

                 <div className="border-t border-gray-100 pt-6 flex gap-6 mb-6">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-gray-900 mb-1">Education</h4>
                      <p className="text-xs text-gray-600 font-medium">B.Tech / B.E. (CSE, IT) or related</p>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-gray-900 mb-1">Experience</h4>
                      <p className="text-xs text-gray-600 font-medium">Fresher (0 - 1 Year)</p>
                    </div>
                 </div>

                 <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-xs font-bold text-gray-900 mb-2">Other Requirements</h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-gray-600 font-medium marker:text-gray-400">
                      <li>Good problem solving skills</li>
                      <li>Understanding of modern workflows</li>
                      <li>Willingness to learn and work in a team</li>
                    </ul>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="flex flex-col gap-6">
           {/* Pipeline bar */}
           <div className="flex gap-4 overflow-x-auto pb-2">
             {pipeline.map(stage => {
               const count = applications.filter(a => a.status === stage.status).length;
               return (
               <button 
                 key={stage.name} 
                 onClick={() => setPipelineStage(stage.status)}
                 className={`flex-1 min-w-[100px] p-4 rounded-2xl border flex flex-col items-center justify-center transition-all ${pipelineStage === stage.status ? stage.activeColor : `${stage.inactiveColor} hover:border-gray-300 shadow-sm`}`}
               >
                 <span className={`text-2xl font-black mb-1 ${pipelineStage === stage.status ? '' : stage.numColor}`}>{count}</span>
                 <span className={`text-xs font-bold ${pipelineStage === stage.status ? '' : 'text-gray-500'}`}>{stage.name}</span>
               </button>
             )})}
           </div>
           
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             {/* Filters */}
             <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
               <div className="relative flex-1 max-w-sm">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" placeholder="Search candidates..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#5c4dff]" />
               </div>
               <div className="flex items-center gap-3">
                  <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white font-medium outline-none"><option>All Status</option></select>
                  <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white font-medium outline-none"><option>All Colleges</option></select>
                  <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white font-medium outline-none"><option>Applied Date</option></select>
                  <button className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50">
                    <HiOutlineFilter className="w-4 h-4" /> Filter
                  </button>
               </div>
             </div>

             {/* Table */}
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-gray-100 bg-gray-50/50">
                   <th className="px-6 py-3 text-[11px] uppercase font-bold text-gray-500">Candidate</th>
                   <th className="px-6 py-3 text-[11px] uppercase font-bold text-gray-500">College</th>
                   <th className="px-6 py-3 text-[11px] uppercase font-bold text-gray-500">Skills</th>
                   <th className="px-6 py-3 text-[11px] uppercase font-bold text-gray-500">Applied On</th>
                   <th className="px-6 py-3 text-[11px] uppercase font-bold text-gray-500">Status</th>
                   <th className="px-6 py-3 text-[11px] uppercase font-bold text-gray-500 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {currentCandidates.map((c, i) => (
                   <tr key={c.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors" onClick={() => navigate(`/candidates/${c.id}`)}>
                     <td className="px-6 py-3">
                       <div className="flex items-center gap-3">
                         <img src={c.applicant?.avatar || `https://i.pravatar.cc/150?u=${c.id}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                         <span className="font-bold text-gray-900 text-sm">{c.applicant?.name}</span>
                       </div>
                     </td>
                     <td className="px-6 py-3 text-xs text-gray-600 font-medium">{c.applicant?.college || 'Not provided'}</td>
                     <td className="px-6 py-3 text-xs text-gray-600 font-medium">{(c.applicant?.skills || []).join(', ') || 'None'}</td>
                     <td className="px-6 py-3 text-xs text-gray-600 font-medium">{new Date(c.createdAt).toLocaleDateString()}</td>
                     <td className="px-6 py-3">
                       <select 
                          value={c.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold border-none outline-none ${
                            c.status === 'pending' ? 'bg-indigo-50 text-indigo-700' :
                            c.status === 'reviewed' ? 'bg-blue-50 text-blue-700' :
                            c.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-700' :
                            'bg-red-50 text-red-700'
                          }`}
                       >
                         <option value="pending">Applied</option>
                         <option value="reviewed">Screening</option>
                         <option value="shortlisted">Shortlisted</option>
                         <option value="rejected">Rejected</option>
                       </select>
                     </td>
                     <td className="px-6 py-3 text-right">
                       <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg" onClick={(e) => e.stopPropagation()}>
                         <HiDotsVertical className="w-4 h-4" />
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             
             {/* Pagination */}
             <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
               <span>Showing {currentCandidates.length} candidates</span>
               <div className="flex gap-1 items-center">
                 <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">&lt;</button>
                 <button className="w-7 h-7 flex items-center justify-center rounded bg-[#5c4dff] text-white font-bold shadow-sm">1</button>
                 <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 font-bold">2</button>
                 <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 font-bold">3</button>
                 <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 font-bold">4</button>
                 <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 font-bold">5</button>
                 <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">&gt;</button>
               </div>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'interviews' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
           {/* Filters */}
           <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
             <div className="relative flex-1 max-w-sm">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search candidate, interviewer..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#5c4dff]" />
             </div>
             <div className="flex items-center gap-3">
                <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white font-medium outline-none"><option>All Rounds</option></select>
                <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white font-medium outline-none"><option>All Status</option></select>
                <div className="relative">
                  <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" placeholder="Select Date" className="w-32 pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white outline-none cursor-pointer" readOnly />
                </div>
             </div>
           </div>

           {/* Table */}
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="border-b border-gray-100 bg-gray-50/50">
                 <th className="px-6 py-3 text-[11px] uppercase font-bold text-gray-500">Candidate</th>
                 <th className="px-6 py-3 text-[11px] uppercase font-bold text-gray-500">Round</th>
                 <th className="px-6 py-3 text-[11px] uppercase font-bold text-gray-500">Date & Time</th>
                 <th className="px-6 py-3 text-[11px] uppercase font-bold text-gray-500">Interviewer</th>
                 <th className="px-6 py-3 text-[11px] uppercase font-bold text-gray-500">Mode</th>
                 <th className="px-6 py-3 text-[11px] uppercase font-bold text-gray-500">Status</th>
                 <th className="px-6 py-3 text-[11px] uppercase font-bold text-gray-500 text-right">Actions</th>
               </tr>
             </thead>
             <tbody>
               {[
                 { name: 'Tanvi Shah', round: 'Technical', date: '2 Oct 2026', time: '10:00 AM', interviewer: 'Rohit Sharma', mode: 'Online', status: 'Upcoming', statusColor: 'bg-purple-50 text-purple-600 border-purple-200', modeColor: 'bg-blue-50 text-blue-600' },
                 { name: 'Priya Sharma', round: 'HR Round', date: '3 Oct 2026', time: '11:00 AM', interviewer: 'Neha Patel', mode: 'On-site', status: 'Upcoming', statusColor: 'bg-purple-50 text-purple-600 border-purple-200', modeColor: 'bg-indigo-50 text-indigo-600' },
                 { name: 'Rohan Patel', round: 'Technical', date: '3 Oct 2026', time: '2:00 PM', interviewer: 'Karan Desai', mode: 'Online', status: 'Upcoming', statusColor: 'bg-purple-50 text-purple-600 border-purple-200', modeColor: 'bg-blue-50 text-blue-600' },
                 { name: 'Neha Desai', round: 'Design', date: '3 Oct 2026', time: '4:00 PM', interviewer: 'Isha Verma', mode: 'Online', status: 'Upcoming', statusColor: 'bg-purple-50 text-purple-600 border-purple-200', modeColor: 'bg-blue-50 text-blue-600' },
                 { name: 'Dev Shah', round: 'HR Round', date: '5 Oct 2026', time: '11:00 AM', interviewer: 'Rohit Sharma', mode: 'Online', status: 'Completed', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-200', modeColor: 'bg-blue-50 text-blue-600' },
                 { name: 'Kavya Singh', round: 'Technical', date: '6 Oct 2026', time: '10:00 AM', interviewer: 'Karan Desai', mode: 'Online', status: 'Completed', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-200', modeColor: 'bg-blue-50 text-blue-600' },
               ].map((intv, i) => (
                 <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                   <td className="px-6 py-3">
                     <div className="flex items-center gap-3">
                       <img src={`https://i.pravatar.cc/150?u=${i + 20}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                       <span className="font-bold text-gray-900 text-sm">{intv.name}</span>
                     </div>
                   </td>
                   <td className="px-6 py-3 text-xs text-gray-600 font-medium">{intv.round}</td>
                   <td className="px-6 py-3 text-xs font-medium text-gray-600">
                     <div className="font-bold text-gray-900">{intv.date}</div>
                     {intv.time}
                   </td>
                   <td className="px-6 py-3 text-xs text-gray-600 font-medium">{intv.interviewer}</td>
                   <td className="px-6 py-3">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold ${intv.modeColor}`}>{intv.mode}</span>
                   </td>
                   <td className="px-6 py-3">
                     <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${intv.statusColor}`}>{intv.status}</span>
                   </td>
                   <td className="px-6 py-3 text-right">
                     <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                       <HiDotsVertical className="w-4 h-4" />
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>

           {/* Pagination */}
           <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
             <span>Showing 1-6 of 8 interviews</span>
             <div className="flex gap-1 items-center">
               <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">&lt;</button>
               <button className="w-7 h-7 flex items-center justify-center rounded bg-[#5c4dff] text-white font-bold shadow-sm">1</button>
               <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-700 font-bold">2</button>
               <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">&gt;</button>
             </div>
           </div>
        </div>
      )}



    </div>
  );
};

export default HRJobDetails;
