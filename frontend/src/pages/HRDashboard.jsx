import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineUser, 
  HiOutlineCalendar, HiOutlineDocumentText, HiDotsVertical,
  HiOutlineClock
} from 'react-icons/hi';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const trendData = [
  { date: '1 Sep', apps: 10 },
  { date: '5 Sep', apps: 25 },
  { date: '10 Sep', apps: 18 },
  { date: '15 Sep', apps: 27 },
  { date: '20 Sep', apps: 42 },
  { date: '25 Sep', apps: 28 },
  { date: '30 Sep', apps: 35 },
];

const sourceData = [
  { name: 'Career Page', value: 143, color: '#5c4dff' },
  { name: 'LinkedIn', value: 75, color: '#3b82f6' },
  { name: 'Referral', value: 51, color: '#10b981' },
  { name: 'Job Portals', value: 41, color: '#f59e0b' },
  { name: 'Others', value: 32, color: '#ec4899' },
];

const MetricCard = ({ icon: Icon, iconBg, iconColor, value, title, subtitle, trend, trendUp }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className={`px-2 py-1 rounded-md text-xs font-bold ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
        {trendUp ? '↑' : '↓'} {trend}
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-black text-gray-900">{value}</h3>
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  </div>
);

const HRDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 lg:p-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Welcome back, {user?.name || 'HR Team'} 👋
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Here's an overview of your hiring progress.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl px-4 py-2.5 shadow-sm outline-none focus:ring-2 focus:ring-[#5c4dff]/20">
            <option>1 Sep 2026 - 30 Sep 2026</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-6">
        <MetricCard 
          icon={HiOutlineBriefcase} iconBg="bg-blue-50" iconColor="text-blue-600"
          value="12" title="Active Jobs" subtitle="5 Drafts • 2 Paused" trend="20%" trendUp={true}
        />
        <MetricCard 
          icon={HiOutlineUserGroup} iconBg="bg-[#5c4dff]/10" iconColor="text-[#5c4dff]"
          value="342" title="Total Applications" subtitle="This month" trend="18%" trendUp={true}
        />
        <MetricCard 
          icon={HiOutlineUser} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          value="68" title="Shortlisted" subtitle="19.9% of total" trend="25%" trendUp={true}
        />
        <MetricCard 
          icon={HiOutlineCalendar} iconBg="bg-purple-50" iconColor="text-purple-600"
          value="24" title="Interviews" subtitle="12 Upcoming" trend="33%" trendUp={true}
        />
        <MetricCard 
          icon={HiOutlineDocumentText} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          value="6" title="Offers" subtitle="1.8% conversion" trend="50%" trendUp={true}
        />
      </div>

      {/* Second Row: Funnel, Trend, Active Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Hiring Funnel */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Hiring Funnel</h3>
              <p className="text-xs text-gray-500">Overall application progress across all jobs.</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 outline-none">
              <option>All Jobs</option>
            </select>
          </div>
          
          <div className="space-y-5">
            {[
              { label: 'Applied', count: 342, pct: '100%', width: '100%', color: 'bg-[#7f74ff]' },
              { label: 'Screening', count: 186, pct: '54%', width: '54%', color: 'bg-blue-500' },
              { label: 'Shortlisted', count: 68, pct: '19.9%', width: '19.9%', color: 'bg-emerald-400' },
              { label: 'Interview', count: 24, pct: '7%', width: '7%', color: 'bg-yellow-400' },
              { label: 'Offer', count: 6, pct: '1.8%', width: '1.8%', color: 'bg-pink-400' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-20 text-xs font-semibold text-gray-600">{step.label}</div>
                <div className="w-8 text-xs font-bold text-gray-900 text-right">{step.count}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden relative">
                  <div className={`h-full rounded-full ${step.color}`} style={{ width: step.width }}></div>
                </div>
                <div className="w-10 text-xs font-semibold text-gray-500 text-right">{step.pct}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Applications Trend */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Applications Trend</h3>
              <p className="text-xs text-gray-500">Number of applications received over time.</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 outline-none">
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Line type="monotone" dataKey="apps" stroke="#5c4dff" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6, fill: '#5c4dff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Active Jobs</h3>
            <button className="text-xs font-bold text-[#5c4dff] hover:underline">View All →</button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {[
              { title: 'Frontend Developer Intern', dept: 'Engineering', apps: 86, status: 'Active', color: 'bg-emerald-50 text-emerald-600', icon: 'bg-blue-50 text-blue-500' },
              { title: 'Process Associate', dept: 'Operations', apps: 64, status: 'Active', color: 'bg-emerald-50 text-emerald-600', icon: 'bg-purple-50 text-purple-500' },
              { title: 'AI/ML Engineer', dept: 'Engineering', apps: 52, status: 'Active', color: 'bg-emerald-50 text-emerald-600', icon: 'bg-indigo-50 text-indigo-500' },
              { title: 'UI/UX Designer', dept: 'Design', apps: 48, status: 'Active', color: 'bg-emerald-50 text-emerald-600', icon: 'bg-orange-50 text-orange-500' },
              { title: 'Data Analyst', dept: 'Analytics', apps: 42, status: 'Paused', color: 'bg-amber-50 text-amber-600', icon: 'bg-blue-50 text-blue-500' },
            ].map((job, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${job.icon}`}>
                    <HiOutlineBriefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{job.title}</h4>
                    <p className="text-[11px] text-gray-500">{job.dept} • {job.apps} applications</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${job.color}`}>{job.status}</span>
              </div>
            ))}
          </div>
        </div>
        
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Applications by Job */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Applications by Job</h3>
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 outline-none">
              <option>All Jobs</option>
            </select>
          </div>
          <div className="space-y-4 mb-4">
            {[
              { label: 'Frontend Developer Intern', count: 86, width: '100%', color: 'bg-[#7f74ff]' },
              { label: 'Process Associate', count: 64, width: '74%', color: 'bg-blue-500' },
              { label: 'AI/ML Engineer', count: 52, width: '60%', color: 'bg-emerald-400' },
              { label: 'UI/UX Designer', count: 48, width: '55%', color: 'bg-yellow-400' },
              { label: 'Data Analyst', count: 42, width: '48%', color: 'bg-pink-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="w-36 text-xs font-semibold text-gray-600 truncate">{item.label}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }}></div>
                </div>
                <div className="w-6 text-xs font-bold text-gray-900 text-right">{item.count}</div>
              </div>
            ))}
          </div>
          <button className="text-xs font-bold text-[#5c4dff] hover:underline">View All Jobs →</button>
        </div>

        {/* Applications by Source */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-1 flex flex-col justify-between">
          <h3 className="font-bold text-gray-900 mb-2">Applications by Source</h3>
          <div className="flex items-center justify-center flex-1 relative">
             <div className="w-40 h-40">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={sourceData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                     {sourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-gray-900">342</span>
                <span className="text-[10px] text-gray-500 font-semibold uppercase">Applications</span>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-y-2 mt-4">
             {sourceData.map((s, i) => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                 <span className="text-[11px] font-semibold text-gray-600">{s.name}</span>
                 <span className="text-[10px] text-gray-400 ml-auto">{((s.value/342)*100).toFixed(0)}% ({s.value})</span>
               </div>
             ))}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Upcoming Interviews</h3>
            <button className="text-xs font-bold text-[#5c4dff] hover:underline">View All →</button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {[
              { name: 'Aarav Mehta', role: 'Frontend Developer Intern', date: '2 Oct, 10:00 AM', type: 'Online', img: 'https://i.pravatar.cc/150?u=a1' },
              { name: 'Priya Sharma', role: 'Data Analyst', date: '2 Oct, 11:00 AM', type: 'On-site', img: 'https://i.pravatar.cc/150?u=a2' },
              { name: 'Rohan Patel', role: 'Process Associate', date: '3 Oct, 2:00 PM', type: 'Online', img: 'https://i.pravatar.cc/150?u=a3' },
              { name: 'Neha Desai', role: 'UI/UX Designer', date: '3 Oct, 4:00 PM', type: 'Online', img: 'https://i.pravatar.cc/150?u=a4' },
            ].map((intv, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={intv.img} className="w-9 h-9 rounded-full object-cover" alt="" />
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900">{intv.name}</h4>
                    <p className="text-[11px] text-gray-500">{intv.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-[11px] font-semibold text-gray-600 mb-1">
                    <HiOutlineClock className="w-3.5 h-3.5"/> {intv.date}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${intv.type==='Online' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                    {intv.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Fourth Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Applications */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Recent Applications</h3>
            <button className="text-xs font-bold text-[#5c4dff] hover:underline">View All →</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-[10px] uppercase font-bold text-gray-400 pb-2 font-sans">Candidate</th>
                <th className="text-[10px] uppercase font-bold text-gray-400 pb-2 font-sans hidden sm:table-cell">Job</th>
                <th className="text-[10px] uppercase font-bold text-gray-400 pb-2 font-sans">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Karan Joshi', job: 'Frontend Developer', status: 'New', color: 'bg-blue-50 text-blue-600' },
                { name: 'Ishita Verma', job: 'Data Analyst', status: 'Screening', color: 'bg-purple-50 text-purple-600' },
                { name: 'Dev Shah', job: 'Process Associate', status: 'Shortlisted', color: 'bg-emerald-50 text-emerald-600' },
                { name: 'Sneha Iyer', job: 'UI/UX Designer', status: 'In Review', color: 'bg-amber-50 text-amber-600' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                      <span className="text-xs font-bold text-gray-900">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-[11px] text-gray-500 hidden sm:table-cell">{row.job}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-[9px] font-bold ${row.color}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Interviews */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Recent Interviews</h3>
            <button className="text-xs font-bold text-[#5c4dff] hover:underline">View All →</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-[10px] uppercase font-bold text-gray-400 pb-2 font-sans">Candidate</th>
                <th className="text-[10px] uppercase font-bold text-gray-400 pb-2 font-sans hidden sm:table-cell">Job</th>
                <th className="text-[10px] uppercase font-bold text-gray-400 pb-2 font-sans">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Tanvi Shah', job: 'AI/ML Engineer', status: 'Completed', color: 'bg-emerald-50 text-emerald-600' },
                { name: 'Rahul Shah', job: 'Frontend Developer', status: 'In Review', color: 'bg-amber-50 text-amber-600' },
                { name: 'Kavya Singh', job: 'Data Analyst', status: 'Completed', color: 'bg-emerald-50 text-emerald-600' },
                { name: 'Manav Jain', job: 'Process Associate', status: 'Cancelled', color: 'bg-red-50 text-red-600' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                      <span className="text-xs font-bold text-gray-900">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-[11px] text-gray-500 hidden sm:table-cell">{row.job}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-[9px] font-bold ${row.color}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Offers */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Recent Offers</h3>
            <button className="text-xs font-bold text-[#5c4dff] hover:underline">View All →</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-[10px] uppercase font-bold text-gray-400 pb-2 font-sans">Candidate</th>
                <th className="text-[10px] uppercase font-bold text-gray-400 pb-2 font-sans hidden sm:table-cell">Job</th>
                <th className="text-[10px] uppercase font-bold text-gray-400 pb-2 font-sans">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Aarav Mehta', job: 'Frontend Developer', status: 'Accepted', color: 'bg-emerald-50 text-emerald-600' },
                { name: 'Neha Desai', job: 'UI/UX Designer', status: 'Pending', color: 'bg-amber-50 text-amber-600' },
                { name: 'Rohan Patel', job: 'Process Associate', status: 'Accepted', color: 'bg-emerald-50 text-emerald-600' },
                { name: 'Priya Sharma', job: 'Data Analyst', status: 'Accepted', color: 'bg-emerald-50 text-emerald-600' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                      <span className="text-xs font-bold text-gray-900">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-[11px] text-gray-500 hidden sm:table-cell">{row.job}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-[9px] font-bold ${row.color}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default HRDashboard;
