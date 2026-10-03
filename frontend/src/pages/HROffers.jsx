import React, { useState } from 'react';
import { 
  HiOutlineSearch, HiOutlineCalendar, HiOutlineFilter, HiDotsVertical,
  HiOutlineMail, HiOutlinePhone, HiOutlineExternalLink, HiOutlineDocumentText
} from 'react-icons/hi';

const HROffers = () => {
  const [selectedOffer, setSelectedOffer] = useState(101);

  const offers = [
    { id: 101, name: 'Aarav Mehta', role: 'Frontend Developer Intern', offerDate: '23 Sep 2026', joiningDate: '1 Nov 2026', salary: '₹25,000', status: 'Accepted', email: 'aarav.mehta@example.com', phone: '+91 98765 43210', type: 'Internship', location: 'Vadodara (Hybrid)', responseDate: '28 Sep 2026', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: 102, name: 'Neha Desai', role: 'UI/UX Designer', offerDate: '22 Sep 2026', joiningDate: '1 Nov 2026', salary: '₹20,000', status: 'Pending', email: 'neha@example.com', phone: '+91 98765 43211', type: 'Internship', location: 'Vadodara (Hybrid)', responseDate: '-', statusColor: 'bg-amber-50 text-amber-600 border-amber-100' },
    { id: 103, name: 'Rohan Patel', role: 'Process Associate', offerDate: '20 Sep 2026', joiningDate: '15 Oct 2026', salary: '₹3,50,000', status: 'Accepted', email: 'rohan@example.com', phone: '+91 98765 43212', type: 'Full Time', location: 'Vadodara (On-site)', responseDate: '25 Sep 2026', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: 104, name: 'Priya Sharma', role: 'Data Analyst', offerDate: '18 Sep 2026', joiningDate: '1 Nov 2026', salary: '₹4,00,000', status: 'Declined', email: 'priya@example.com', phone: '+91 98765 43213', type: 'Full Time', location: 'Remote', responseDate: '20 Sep 2026', statusColor: 'bg-red-50 text-red-600 border-red-100' },
    { id: 105, name: 'Dev Shah', role: 'Backend Developer', offerDate: '15 Sep 2026', joiningDate: '1 Nov 2026', salary: '₹25,000', status: 'Accepted', email: 'dev@example.com', phone: '+91 98765 43214', type: 'Internship', location: 'Vadodara (On-site)', responseDate: '20 Sep 2026', statusColor: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: 106, name: 'Kavya Singh', role: 'AI/ML Engineer', offerDate: '12 Sep 2026', joiningDate: '1 Nov 2026', salary: '₹6,00,000', status: 'Pending', email: 'kavya@example.com', phone: '+91 98765 43215', type: 'Full Time', location: 'Remote', responseDate: '-', statusColor: 'bg-amber-50 text-amber-600 border-amber-100' },
  ];

  const currentOffer = offers.find(o => o.id === selectedOffer);

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 lg:p-8 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Offers (All Jobs)</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
         {/* Left Side: Table */}
         <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                 <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <input type="text" placeholder="Search candidate..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#5c4dff]" />
              </div>
              <div className="flex items-center gap-3">
                 <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white font-medium outline-none"><option>All Jobs</option></select>
                 <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white font-medium outline-none"><option>All Status</option></select>
                 <div className="relative">
                   <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                   <input type="text" placeholder="Select Date" className="w-32 pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white outline-none cursor-pointer" readOnly />
                 </div>
                 <button className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                   <HiOutlineFilter className="w-4 h-4" /> Filter
                 </button>
              </div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300 text-[#5c4dff] focus:ring-[#5c4dff]" /></th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-500">Candidate</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-500">Job</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-500">Offer Date</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-500">Joining Date</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-500">Salary / Stipend</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-500">Status</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer, i) => (
                  <tr 
                    key={offer.id} 
                    onClick={() => setSelectedOffer(offer.id)}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedOffer === offer.id ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300 text-[#5c4dff] focus:ring-[#5c4dff]" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={`https://i.pravatar.cc/150?u=${offer.id}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                        <span className="font-bold text-gray-900 text-sm">{offer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-medium">{offer.role}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-medium">{offer.offerDate}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-medium">{offer.joiningDate}</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">{offer.salary}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${offer.statusColor}`}>{offer.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                        <HiDotsVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium mt-auto">
              <span>Showing 1-6 of 8 offers</span>
              <div className="flex gap-1 items-center">
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">&lt;</button>
                <button className="w-7 h-7 flex items-center justify-center rounded bg-[#5c4dff] text-white font-bold shadow-sm">1</button>
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">&gt;</button>
              </div>
            </div>
         </div>

         {/* Right Side: Details Panel */}
         {currentOffer && (
         <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
               <h3 className="font-bold text-gray-900 mb-6 text-sm">Offer Details</h3>
               
               <div className="flex flex-col items-center text-center mb-6">
                  <img src={`https://i.pravatar.cc/150?u=${currentOffer.id}`} className="w-16 h-16 rounded-full object-cover mb-3 shadow-sm" alt="" />
                  <h4 className="font-bold text-gray-900 text-lg">{currentOffer.name}</h4>
                  <p className="text-sm font-bold text-[#5c4dff] mt-0.5">{currentOffer.role}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{currentOffer.email}</p>
                  <p className="text-xs text-gray-500 font-medium">{currentOffer.phone}</p>
               </div>

               <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500 font-medium">Offer Date</span>
                     <span className="font-bold text-gray-900 text-right">{currentOffer.offerDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500 font-medium">Joining Date</span>
                     <span className="font-bold text-gray-900 text-right">{currentOffer.joiningDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500 font-medium">Salary / Stipend</span>
                     <span className="font-bold text-gray-900 text-right">{currentOffer.salary}/month</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500 font-medium">Employment Type</span>
                     <span className="font-bold text-gray-900 text-right">{currentOffer.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500 font-medium">Location</span>
                     <span className="font-bold text-gray-900 text-right">{currentOffer.location}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                     <span className="text-gray-500 font-medium">Status</span>
                     <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${currentOffer.statusColor}`}>{currentOffer.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500 font-medium">Response Date</span>
                     <span className="font-bold text-gray-900 text-right">{currentOffer.responseDate}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                     <span className="text-gray-500 font-medium">Offer Letter</span>
                     <button className="flex items-center gap-1 text-[#5c4dff] font-bold text-xs hover:underline">
                        View Offer <HiOutlineExternalLink className="w-3.5 h-3.5" />
                     </button>
                  </div>
               </div>

               <div className="flex gap-3">
                  <button className="flex-1 bg-white text-[#5c4dff] border border-blue-200 hover:bg-blue-50 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-colors text-center">
                     Send Reminder
                  </button>
                  <button className="flex-1 bg-white text-red-600 border border-red-200 hover:bg-red-50 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-colors text-center">
                     Withdraw Offer
                  </button>
               </div>
            </div>
         </div>
         )}
      </div>
    </div>
  );
};

export default HROffers;
