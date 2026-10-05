import React, { useState, useEffect } from 'react';
import { 
  HiOutlineSearch, HiOutlineCalendar, HiOutlineFilter, HiDotsVertical,
  HiOutlineMail, HiOutlinePhone, HiOutlineExternalLink, HiOutlineDocumentText
} from 'react-icons/hi';
import { getHROffers } from '../services/api';

const HROffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    getHROffers().then(res => {
      setOffers(res.data);
      if (res.data.length > 0) setSelectedOffer(res.data[0].id);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const currentOffer = offers.find(o => o.id === selectedOffer);

  if (loading) return <div className="p-8">Loading Offers...</div>;

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
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-500">Applied Date</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-500">Status</th>
                  <th className="px-4 py-3 text-[11px] uppercase font-bold text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.length === 0 && (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500 font-medium">No candidates in offer stage found.</td></tr>
                )}
                {offers.map((offer) => (
                  <tr 
                    key={offer.id} 
                    onClick={() => setSelectedOffer(offer.id)}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedOffer === offer.id ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300 text-[#5c4dff] focus:ring-[#5c4dff]" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={offer.applicant?.avatar || `https://ui-avatars.com/api/?name=${offer.applicant?.name}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                        <span className="font-bold text-gray-900 text-sm">{offer.applicant?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-medium">{offer.job?.title}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-medium">{new Date(offer.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold border bg-blue-50 text-blue-600 border-blue-100 uppercase">{offer.status}</span>
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
              <span>Showing {offers.length} offers</span>
            </div>
         </div>

         {/* Right Side: Details Panel */}
         {currentOffer && (
         <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
               <h3 className="font-bold text-gray-900 mb-6 text-sm">Candidate Details</h3>
               
               <div className="flex flex-col items-center text-center mb-6">
                  <img src={currentOffer.applicant?.avatar || `https://ui-avatars.com/api/?name=${currentOffer.applicant?.name}`} className="w-16 h-16 rounded-full object-cover mb-3 shadow-sm" alt="" />
                  <h4 className="font-bold text-gray-900 text-lg">{currentOffer.applicant?.name}</h4>
                  <p className="text-sm font-bold text-[#5c4dff] mt-0.5">{currentOffer.job?.title}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{currentOffer.applicant?.email}</p>
                  <p className="text-xs text-gray-500 font-medium">{currentOffer.applicant?.phone || 'No phone'}</p>
               </div>

               <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500 font-medium">Applied Date</span>
                     <span className="font-bold text-gray-900 text-right">{new Date(currentOffer.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500 font-medium">Employment Type</span>
                     <span className="font-bold text-gray-900 text-right">{currentOffer.job?.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500 font-medium">Location</span>
                     <span className="font-bold text-gray-900 text-right">{currentOffer.job?.location}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                     <span className="text-gray-500 font-medium">Status</span>
                     <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold border bg-blue-50 text-blue-700 uppercase">{currentOffer.status}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                     <span className="text-gray-500 font-medium">Application</span>
                     <button className="flex items-center gap-1 text-[#5c4dff] font-bold text-xs hover:underline">
                        View <HiOutlineExternalLink className="w-3.5 h-3.5" />
                     </button>
                  </div>
               </div>

               <div className="flex gap-3">
                  <button className="flex-1 bg-[#5c4dff] text-white hover:bg-[#4a3ddf] py-2.5 rounded-lg font-bold text-xs shadow-sm transition-colors text-center">
                     Generate Offer
                  </button>
                  <button className="flex-1 bg-white text-red-600 border border-red-200 hover:bg-red-50 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-colors text-center">
                     Reject
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
