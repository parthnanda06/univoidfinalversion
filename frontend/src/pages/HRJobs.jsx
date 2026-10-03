import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiOutlineSearch, HiDotsVertical } from 'react-icons/hi';

const HRJobs = () => {
  const navigate = useNavigate();

  const jobs = [
    { id: '1', title: 'Frontend Developer Intern', dept: 'Engineering', type: 'Internship', location: 'Vadodara / Hybrid', apps: 86, status: 'Active', posted: '28 Sep 2026', deadline: '20 Oct 2026' },
    { id: '2', title: 'Process Associate', dept: 'Operations', type: 'Full Time', location: 'Vadodara / On-site', apps: 64, status: 'Active', posted: '25 Sep 2026', deadline: '15 Oct 2026' },
    { id: '3', title: 'AI/ML Engineer', dept: 'Engineering', type: 'Full Time', location: 'Remote', apps: 52, status: 'Active', posted: '20 Sep 2026', deadline: '15 Oct 2026' },
    { id: '4', title: 'UI/UX Designer', dept: 'Design', type: 'Internship', location: 'Vadodara / Hybrid', apps: 48, status: 'Active', posted: '18 Sep 2026', deadline: '10 Oct 2026' },
    { id: '5', title: 'Data Analyst', dept: 'Analytics', type: 'Full Time', location: 'Remote', apps: 42, status: 'Paused', posted: '15 Sep 2026', deadline: '10 Oct 2026' },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 lg:p-8 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage job postings. Click on a job to view details and applications.</p>
        </div>
        <button 
          onClick={() => navigate('/jobs/new')}
          className="bg-[#5c4dff] hover:bg-[#4a3ddf] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md shadow-[#5c4dff]/20 transition-all"
        >
          <HiPlus className="w-5 h-5" /> Add Job
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 p-2 flex gap-4 overflow-x-auto">
           <button className="px-4 py-2 text-sm font-bold text-[#5c4dff] border-b-2 border-[#5c4dff]">All Jobs ({jobs.length})</button>
           <button className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900">Active (4)</button>
           <button className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900">Drafts (2)</button>
           <button className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900">Paused (1)</button>
           <button className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900">Closed (1)</button>
        </div>
        
        <div className="p-4 flex flex-wrap gap-4 items-center justify-between border-b border-gray-50 bg-gray-50/50">
           <div className="relative flex-1 max-w-md">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search jobs..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#5c4dff]" />
           </div>
           <div className="flex gap-3">
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white outline-none"><option>All Departments</option></select>
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white outline-none"><option>All Types</option></select>
           </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/30">
              <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Job Title</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Department</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Type</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Location</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Applications</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Status</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Posted On</th>
              <th className="px-6 py-4 text-xs uppercase font-bold text-gray-500">Deadline</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr 
                key={job.id} 
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold font-mono text-xs shadow-sm">&lt;/&gt;</div>
                    <span className="font-bold text-gray-900 group-hover:text-[#5c4dff] transition-colors">{job.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-medium">{job.dept}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-700">{job.type}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{job.location}</td>
                <td className="px-6 py-4 font-black text-gray-900">{job.apps}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${job.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">{job.posted}</td>
                <td className="px-6 py-4 text-xs text-gray-500">{job.deadline}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={(e) => e.stopPropagation()} className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                    <HiDotsVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HRJobs;
