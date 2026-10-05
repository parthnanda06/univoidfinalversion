import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCheck, HiOutlineCheckCircle } from 'react-icons/hi';
import { createJob } from '../services/api';

const HRAddJob = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: 'Frontend Developer Intern',
    company: 'TechNova',
    location: 'Remote',
    type: 'internship',
    description: 'Looking for a passionate Frontend Developer...',
    skills: 'React, JavaScript',
    salary: '₹15k - ₹25k / month'
  });

  const handlePublish = async () => {
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim());
      await createJob({ ...formData, skills: skillsArray });
      setStep(5);
    } catch (err) {
      console.error(err);
      alert('Error creating job');
    }
  };

  const steps = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Job Details' },
    { num: 3, label: 'Requirements' },
    { num: 4, label: 'Review & Publish' },
  ];

  if (step === 5) {
    return (
      <div className="bg-[#f8fafc] min-h-screen p-6 lg:p-8 font-sans flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
             <HiCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Job Published Successfully!</h2>
          <p className="text-sm font-medium text-gray-500 mb-8">Your job post is now live and visible to candidates.</p>
          
          <div className="flex gap-4 justify-center mb-8">
             <button onClick={() => navigate('/jobs/1')} className="bg-[#5c4dff] hover:bg-[#4a3ddf] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors">
               View Job
             </button>
             <button onClick={() => setStep(1)} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
               Add Another Job
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 lg:p-8 font-sans">
      <div className="mb-8">
        <button onClick={() => navigate('/jobs')} className="text-xs font-bold text-gray-500 hover:text-gray-900 mb-4 inline-flex items-center gap-1">
          ← Back to Jobs
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Job</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new job posting to hire the right talent.</p>
      </div>

      <div className="flex items-center gap-4 mb-8 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-4 whitespace-nowrap">
            <div className={`flex items-center gap-2 ${step === s.num ? 'text-[#5c4dff]' : step > s.num ? 'text-emerald-500' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s.num ? 'bg-[#5c4dff] text-white' : step > s.num ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}>
                {step > s.num ? <HiOutlineCheckCircle className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-xs font-bold">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="w-10 h-px bg-gray-200"></div>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">{steps[step-1].label}</h2>
        
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Job Title *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#5c4dff] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Company *</label>
                <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#5c4dff] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Location *</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#5c4dff] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Salary *</label>
                <input type="text" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#5c4dff] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Department *</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#5c4dff] outline-none"><option>Engineering</option></select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Job Type *</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#5c4dff] outline-none">
                  <option value="internship">Internship</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-6">
             <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Short Description *</label>
                <textarea rows={3} defaultValue="Looking for a passionate Frontend Developer..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#5c4dff] outline-none"></textarea>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Description *</label>
                <textarea rows={6} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#5c4dff] outline-none"></textarea>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 gap-6">
             <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Required Skills (comma separated) *</label>
                <input type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="e.g. React, JavaScript" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#5c4dff] outline-none" />
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
             <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-2">Basic Information</h3>
                <p className="text-sm text-gray-600">Frontend Developer Intern • Engineering • Internship</p>
             </div>
             <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-2">Job Details</h3>
                <p className="text-sm text-gray-600">Looking for a passionate Frontend Developer...</p>
             </div>
             <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-2">Requirements</h3>
                <p className="text-sm text-gray-600">React, JavaScript, HTML, CSS, Tailwind CSS</p>
             </div>
          </div>
        )}

      </div>

      <div className="flex justify-end gap-3">
        {step > 1 && <button onClick={() => setStep(step-1)} className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-sm text-gray-700 hover:bg-gray-50">← Back</button>}
        {step < 4 ? (
          <button onClick={() => setStep(step+1)} className="bg-[#5c4dff] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#4a3ddf]">Next →</button>
        ) : (
          <button onClick={handlePublish} className="bg-[#5c4dff] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#4a3ddf]">Publish Job</button>
        )}
      </div>
    </div>
  );
};

export default HRAddJob;
