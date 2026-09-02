import React, { useState } from 'react';
import { 
  HiOutlineLocationMarker, HiOutlineCurrencyRupee, HiOutlineX, 
  HiOutlineDocumentText, HiOutlineCheck, HiLockClosed, HiArrowRight, HiArrowLeft 
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const ApplyJobModal = ({ isOpen, onClose, job }) => {
  const [activeTab, setActiveTab] = useState('About');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form State
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [experience, setExperience] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');

  if (!isOpen || !job) return null;

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep < 3) {
      handleNext();
    } else {
      // Final Submit
      toast.success('Application submitted successfully!');
      onClose();
      setTimeout(() => setCurrentStep(1), 300); // reset after close
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-6xl h-[90vh] sm:h-[85vh] rounded-[24px] shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose} 
          className="md:hidden absolute top-4 right-4 z-10 p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900"
        >
          <HiOutlineX className="w-5 h-5" />
        </button>

        {/* Left Pane - Job Details */}
        <div className="w-full md:w-1/2 h-auto md:h-full bg-white flex flex-col border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto no-scrollbar shrink-0 md:shrink">
          <div className="p-6 md:p-8 lg:p-10 flex-1">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                {job.logo || 'T'}
              </div>
              <h2 className="text-[18px] font-black text-gray-900">Apply for this opportunity</h2>
            </div>

            {/* Job Title & Match */}
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-2xl font-black text-gray-900">{job.role}</h1>
              {job.match && (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase">
                  {job.match}
                </span>
              )}
            </div>

            {/* Location & Salary */}
            <div className="space-y-2 mb-6 text-sm font-semibold text-gray-500">
              <p className="flex items-center gap-2"><HiOutlineLocationMarker className="w-4 h-4 text-gray-400" /> {job.type}</p>
              <p className="flex items-center gap-2"><HiOutlineCurrencyRupee className="w-4 h-4 text-gray-400" /> {job.salary}</p>
            </div>

            {/* Skill Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {job.tags?.map(tag => (
                <span key={tag} className="bg-[#5c4dff]/5 text-[#5c4dff] text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[#5c4dff]/10">
                  {tag}
                </span>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-6 w-full">
              {['About', 'Requirements', 'Benefits', 'Company'].map(tab => (
                <button 
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 pb-3 text-[13px] font-bold text-center transition-all ${
                    activeTab === tab 
                      ? 'text-[#5c4dff] border-b-2 border-[#5c4dff]' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="text-sm font-medium text-gray-600 leading-relaxed space-y-6 pb-6">
              {activeTab === 'About' && (
                <>
                  <p>
                    Join our team to work on real-world projects. You will collaborate with engineers and researchers to build intelligent products.
                  </p>
                  
                  <div>
                    <h3 className="text-gray-900 font-bold mb-3">What you'll do</h3>
                    <ul className="space-y-2 list-disc pl-4 text-gray-600">
                      <li>Work on machine learning models and data analysis</li>
                      <li>Build and train models using Python and ML libraries</li>
                      <li>Collaborate with the team to ship impactful features</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-gray-900 font-bold mb-4">What we offer</h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[11px] font-semibold text-gray-500">
                      <div className="flex items-center gap-2"><span className="text-lg">👨‍🏫</span> Mentorship from experienced team</div>
                      <div className="flex items-center gap-2"><span className="text-lg">🏖️</span> Flexible remote work culture</div>
                      <div className="flex items-center gap-2"><span className="text-lg">🚀</span> Real-world projects & learning</div>
                      <div className="flex items-center gap-2"><span className="text-lg">📜</span> Certificate & PPO opportunity</div>
                    </div>
                  </div>
                </>
              )}
              {activeTab !== 'About' && (
                <div className="text-center py-10 text-gray-400">
                  Content for {activeTab} will appear here.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Pane - Form & Stepper */}
        <div className="w-full md:w-1/2 h-auto md:h-full bg-white flex flex-col relative overflow-y-auto no-scrollbar">
          
          {/* Desktop Close Button */}
          <button 
            type="button"
            onClick={onClose} 
            className="hidden md:flex absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>

          <div className="p-6 md:p-8 lg:p-10 flex-1 flex flex-col">
            
            {/* Stepper */}
            <div className="flex items-center gap-4 mb-10 text-[11px] font-bold">
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-[#5c4dff]' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-[#5c4dff] text-white' : 'border border-gray-200'}`}>1</div>
                Apply
              </div>
              <div className={`h-px w-8 ${currentStep >= 2 ? 'bg-[#5c4dff]' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-[#5c4dff]' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-[#5c4dff] text-white' : 'border border-gray-200'}`}>2</div>
                Additional Info
              </div>
              <div className={`h-px w-8 ${currentStep >= 3 ? 'bg-[#5c4dff]' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-[#5c4dff]' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-[#5c4dff] text-white' : 'border border-gray-200'}`}>3</div>
                Review
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              
              {currentStep === 1 && (
                <div className="animate-fade-in flex flex-col flex-1">
                  {/* Resume Upload */}
                  <div className="mb-6">
                    <label className="block text-[13px] font-bold text-gray-900 mb-2">Resume / CV <span className="text-red-500">*</span></label>
                    <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                          <HiOutlineDocumentText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-gray-900">Parth_Bhanushali_Resume.pdf</p>
                          <p className="text-[10px] font-medium text-gray-500">(245 KB)</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <HiOutlineCheck className="w-4 h-4 text-emerald-500" />
                        <button type="button" className="text-[10px] font-bold text-[#5c4dff] hover:underline">Change File</button>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="mb-6">
                    <label className="block text-[13px] font-bold text-gray-900 mb-2">Cover Letter <span className="text-gray-400 font-medium">(Optional)</span></label>
                    <div className="relative">
                      <textarea 
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Write a short cover letter..."
                        className="w-full bg-white border border-gray-200 rounded-xl p-4 text-[13px] font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none min-h-[120px] resize-none shadow-sm"
                        maxLength={500}
                      ></textarea>
                      <span className="absolute bottom-3 right-4 text-[10px] font-bold text-gray-400">
                        {coverLetter.length}/500
                      </span>
                    </div>
                  </div>

                  {/* Portfolio Link */}
                  <div className="mb-8">
                    <label className="block text-[13px] font-bold text-gray-900 mb-2">Link to Portfolio / Projects <span className="text-gray-400 font-medium">(Optional)</span></label>
                    <input 
                      type="url"
                      value={portfolioLink}
                      onChange={(e) => setPortfolioLink(e.target.value)}
                      placeholder="https://your-portfolio.com"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none shadow-sm mb-2"
                    />
                    <p className="text-[11px] font-medium text-gray-500">Helps us learn more about you</p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="animate-fade-in flex flex-col flex-1">
                  <h3 className="text-[15px] font-bold text-gray-900 mb-6">Additional Information</h3>
                  
                  <div className="mb-6">
                    <label className="block text-[13px] font-bold text-gray-900 mb-2">Years of Experience <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      required
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. 1 year, Fresher"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none shadow-sm"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-[13px] font-bold text-gray-900 mb-2">Notice Period <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      required
                      value={noticePeriod}
                      onChange={(e) => setNoticePeriod(e.target.value)}
                      placeholder="e.g. Immediate, 15 days"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none shadow-sm"
                    />
                  </div>

                  <div className="mb-8">
                    <label className="block text-[13px] font-bold text-gray-900 mb-2">Expected Salary <span className="text-gray-400 font-medium">(Optional)</span></label>
                    <input 
                      type="text"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      placeholder="e.g. ₹20,000/month"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] outline-none shadow-sm"
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="animate-fade-in flex flex-col flex-1">
                  <h3 className="text-[15px] font-bold text-gray-900 mb-6">Review your Application</h3>
                  
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6 space-y-4">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Resume Attached</p>
                      <p className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
                        <HiOutlineCheck className="w-4 h-4 text-emerald-500" /> Parth_Bhanushali_Resume.pdf
                      </p>
                    </div>
                    {coverLetter && (
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cover Letter</p>
                        <p className="text-[13px] font-medium text-gray-700 italic border-l-2 border-gray-200 pl-2">"{coverLetter.substring(0, 100)}{coverLetter.length > 100 ? '...' : ''}"</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Experience</p>
                        <p className="text-[13px] font-bold text-gray-900">{experience || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Notice Period</p>
                        <p className="text-[13px] font-bold text-gray-900">{noticePeriod || 'Not provided'}</p>
                      </div>
                      {expectedSalary && (
                        <div className="col-span-2">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expected Salary</p>
                          <p className="text-[13px] font-bold text-gray-900">{expectedSalary}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-[12px] font-medium text-blue-800">
                    By submitting this application, you agree that your profile details and provided information will be shared with the recruiter.
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-auto pt-6">
                {currentStep > 1 ? (
                  <button 
                    type="button" 
                    onClick={handleBack}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <HiArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div></div>
                )}
                
                {currentStep < 3 ? (
                  <button 
                    type="submit"
                    className="px-8 py-2.5 rounded-xl bg-[#5c4dff] hover:bg-[#4a3ddf] text-white font-bold text-[13px] flex items-center gap-2 shadow-md shadow-[#5c4dff]/20 transition-all ml-auto"
                  >
                    Next <HiArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    type="submit"
                    className="px-8 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[13px] flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all ml-auto"
                  >
                    Submit Application
                  </button>
                )}
              </div>

            </form>
            
            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-2 text-[11px] font-bold text-gray-400">
              <HiLockClosed className="w-3.5 h-3.5" /> Your application is secure and private.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyJobModal;
