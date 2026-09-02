import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HiArrowRight,
  HiPlay,
  HiStar,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineChat,
  HiOutlineCalendar,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiHeart,
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineUsers
} from 'react-icons/hi';

const Home = () => {
  return (
    <div className="bg-white min-h-screen font-sans overflow-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-8 h-8 opacity-20">
          <svg viewBox="0 0 24 24" fill="none" stroke="#5c4dff" strokeWidth="2"><path d="M12 2L2 22h20L12 2z"/></svg>
        </div>
        <div className="absolute top-40 right-20 w-8 h-8 opacity-20">
          <svg viewBox="0 0 24 24" fill="none" stroke="#5c4dff" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center">
          
          {/* Left content */}
          <div className="w-full lg:w-5/12 z-10 relative">
            <div className="inline-flex items-center gap-2 bg-[#f0f3ff] text-[#5c4dff] px-4 py-1.5 rounded-full text-sm font-bold mb-8 border border-blue-100 shadow-sm">
               <HiStar className="w-4 h-4"/> The all-in-one platform for students
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-extrabold text-[#111827] leading-[1.05] tracking-tight mb-6">
              Your student life,<br/>
              <span className="text-[#5c4dff]">connected.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 mb-10 leading-relaxed font-medium max-w-lg">
              Join thousands of students using UniVoid to connect, explore opportunities, learn together, and grow beyond the classroom.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/register" className="bg-[#5c4dff] hover:bg-[#4b3de0] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-[#5c4dff]/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                Get Started <HiArrowRight/>
              </Link>
              <Link to="#explore" className="bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-800 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-sm transition-all">
                 <HiPlay className="text-[#5c4dff] w-5 h-5"/> Explore UniVoid
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                 <img className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" src="https://i.pravatar.cc/150?img=32" alt="Student"/>
                 <img className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" src="https://i.pravatar.cc/150?img=12" alt="Student"/>
                 <img className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" src="https://i.pravatar.cc/150?img=47" alt="Student"/>
                 <img className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" src="https://i.pravatar.cc/150?img=68" alt="Student"/>
              </div>
              <div>
                <div className="flex text-amber-400 text-sm mb-0.5">
                   <HiStar/><HiStar/><HiStar/><HiStar/><HiStar/>
                </div>
                <p className="text-sm text-gray-600 font-medium">Loved by 10,000+ students</p>
              </div>
            </div>
          </div>
          
          {/* Right Mockup (3D CSS Dashboard) */}
          <div className="w-full lg:w-7/12 relative mt-20 lg:mt-0 lg:ml-10">
             {/* Glow behind dashboard */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-[#5c4dff]/20 to-purple-400/20 rounded-full blur-[100px] z-0"></div>
             
             {/* The 3D Mockup Container */}
             <div className="relative z-10 w-[900px] max-w-[200%] md:max-w-none transform perspective-[2000px] lg:rotate-y-[-12deg] lg:rotate-x-[4deg] lg:rotate-z-[2deg] shadow-2xl rounded-2xl bg-white border border-gray-100 overflow-hidden flex h-[600px] transition-transform duration-700 hover:rotate-y-0 hover:rotate-x-0 hover:rotate-z-0">
               
               {/* Dashboard Sidebar */}
               <div className="w-64 bg-gray-50 border-r border-gray-100 p-6 flex flex-col hidden sm:flex">
                  <div className="flex items-center gap-2 mb-10">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5c4dff] to-blue-500 flex items-center justify-center text-white font-bold text-sm">U</div>
                    <span className="text-xl font-bold text-gray-900">Uni<span className="text-[#5c4dff]">Void</span></span>
                  </div>
                  
                  <div className="space-y-2 flex-1">
                     <div className="flex items-center gap-3 bg-white shadow-sm border border-gray-100 text-[#5c4dff] px-4 py-3 rounded-xl font-medium"><HiOutlineAcademicCap className="w-5 h-5"/> Home</div>
                     <div className="flex items-center gap-3 text-gray-500 hover:text-gray-900 px-4 py-3 rounded-xl font-medium transition-colors"><HiOutlineUserGroup className="w-5 h-5"/> Communities</div>
                     <div className="flex items-center gap-3 text-gray-500 hover:text-gray-900 px-4 py-3 rounded-xl font-medium transition-colors"><HiOutlineCalendar className="w-5 h-5"/> Events</div>
                     <div className="flex items-center gap-3 text-gray-500 hover:text-gray-900 px-4 py-3 rounded-xl font-medium transition-colors"><HiOutlineBriefcase className="w-5 h-5"/> Opportunities</div>
                     <div className="flex items-center gap-3 text-gray-500 hover:text-gray-900 px-4 py-3 rounded-xl font-medium transition-colors"><HiOutlineDocumentText className="w-5 h-5"/> Study Materials</div>
                  </div>
                  
                  <div className="mt-auto flex items-center gap-3 border-t border-gray-200 pt-6">
                     <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden"><img src="https://i.pravatar.cc/150?img=11" alt="Me" /></div>
                     <div>
                       <p className="text-sm font-bold text-gray-900">Parth N.</p>
                       <p className="text-xs text-gray-500">View Profile</p>
                     </div>
                  </div>
               </div>
               
               {/* Dashboard Main Content */}
               <div className="flex-1 bg-white p-8 overflow-hidden flex flex-col">
                  {/* Top nav */}
                  <div className="flex justify-between items-center mb-10">
                     <div className="relative w-96">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" placeholder="Search for communities, alumni, notes..." className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none" disabled/>
                     </div>
                     <div className="flex items-center gap-4">
                        <HiOutlineBell className="w-6 h-6 text-gray-400"/>
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden"><img src="https://i.pravatar.cc/150?img=11" alt="Me" /></div>
                     </div>
                  </div>
                  
                  {/* Greeting */}
                  <div className="flex justify-between items-end mb-8">
                     <div>
                       <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Parth! 👋</h2>
                       <p className="text-gray-500">Let's make today productive.</p>
                     </div>
                     <div className="flex gap-4">
                        <div className="bg-purple-50 text-purple-700 px-4 py-3 rounded-xl flex items-center gap-3">
                           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm"><HiOutlineUserGroup className="w-5 h-5"/></div>
                           <div><p className="text-xl font-bold">120</p><p className="text-xs opacity-70">Online Peers</p></div>
                        </div>
                        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3">
                           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm"><HiOutlineDocumentText className="w-5 h-5"/></div>
                           <div><p className="text-xl font-bold">24</p><p className="text-xs opacity-70">Saved Items</p></div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Communities */}
                  <div className="mb-8">
                     <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-gray-900 text-lg">Communities You Might Like</h3>
                       <span className="text-[#5c4dff] text-sm font-bold">See All</span>
                     </div>
                     <div className="grid grid-cols-4 gap-4">
                        <div className="border border-gray-100 rounded-xl p-4 text-center hover:border-[#5c4dff] transition-colors">
                           <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">AI</div>
                           <p className="font-bold text-sm text-gray-900 truncate">AI/ML Club</p>
                           <p className="text-xs text-gray-500">1.2k members</p>
                        </div>
                        <div className="border border-gray-100 rounded-xl p-4 text-center hover:border-[#5c4dff] transition-colors">
                           <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">&lt;/&gt;</div>
                           <p className="font-bold text-sm text-gray-900 truncate">Web Developers</p>
                           <p className="text-xs text-gray-500">850 members</p>
                        </div>
                        <div className="border border-gray-100 rounded-xl p-4 text-center hover:border-[#5c4dff] transition-colors">
                           <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">DS</div>
                           <p className="font-bold text-sm text-gray-900 truncate">Design Society</p>
                           <p className="text-xs text-gray-500">92 members</p>
                        </div>
                        <div className="border border-gray-100 rounded-xl p-4 text-center hover:border-[#5c4dff] transition-colors">
                           <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">🏆</div>
                           <p className="font-bold text-sm text-gray-900 truncate">Hackathons</p>
                           <p className="text-xs text-gray-500">3.4k members</p>
                        </div>
                     </div>
                  </div>
                  
                  {/* Bottom row (Events & Opps) */}
                  <div className="grid grid-cols-2 gap-8 flex-1">
                     <div>
                       <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-gray-900 text-lg">Upcoming Events</h3>
                         <span className="text-[#5c4dff] text-sm font-bold">See All</span>
                       </div>
                       <div className="space-y-3">
                          <div className="flex gap-4 p-3 border border-gray-100 rounded-xl">
                            <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden"><img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=80" alt="event" className="w-full h-full object-cover"/></div>
                            <div>
                               <p className="font-bold text-sm text-gray-900">Code Relay 2024</p>
                               <p className="text-xs text-gray-500 mb-1">24 May, 9:00 AM</p>
                               <p className="text-[10px] text-[#5c4dff] font-bold bg-[#f0f3ff] px-2 py-0.5 rounded inline-block">Online</p>
                            </div>
                          </div>
                          <div className="flex gap-4 p-3 border border-gray-100 rounded-xl">
                            <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden"><img src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=100&q=80" alt="event" className="w-full h-full object-cover"/></div>
                            <div>
                               <p className="font-bold text-sm text-gray-900">Web Dev Workshop</p>
                               <p className="text-xs text-gray-500 mb-1">27 May, 2:00 PM</p>
                               <p className="text-[10px] text-gray-600 font-bold bg-gray-100 px-2 py-0.5 rounded inline-block">A Block, Room 101</p>
                            </div>
                          </div>
                       </div>
                     </div>
                     <div>
                       <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-gray-900 text-lg">Top Opportunities</h3>
                         <span className="text-[#5c4dff] text-sm font-bold">See All</span>
                       </div>
                       <div className="space-y-3">
                          <div className="flex gap-4 p-3 border border-gray-100 rounded-xl">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">A</div>
                            <div>
                               <p className="font-bold text-sm text-gray-900">Frontend Dev Intern</p>
                               <p className="text-xs text-gray-500">Acme Corp • Remote</p>
                            </div>
                          </div>
                          <div className="flex gap-4 p-3 border border-gray-100 rounded-xl">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold">I</div>
                            <div>
                               <p className="font-bold text-sm text-gray-900">ML Research Intern</p>
                               <p className="text-xs text-gray-500">Innovate • On-site</p>
                            </div>
                          </div>
                       </div>
                     </div>
                  </div>
                  
               </div>
             </div>
          </div>
          
        </div>
      </section>

      {/* 2. Features Section */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Everything you need, all in one place</h2>
          <p className="text-gray-600 mb-16 text-lg max-w-2xl mx-auto">UniVoid brings together all the essential parts of student life.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-left shadow-sm hover:shadow-lg hover:border-blue-100 transition-all group flex flex-col justify-between h-[280px]">
               <div>
                 <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-6">
                   <HiOutlineChat className="w-6 h-6"/>
                 </div>
                 <h3 className="font-bold text-gray-900 text-lg mb-2">Connect</h3>
                 <p className="text-gray-500 text-sm leading-relaxed">Find and connect with students who share your interests.</p>
               </div>
               <HiArrowRight className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 w-5 h-5"/>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-left shadow-sm hover:shadow-lg hover:border-green-100 transition-all group flex flex-col justify-between h-[280px]">
               <div>
                 <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-6">
                   <HiOutlineUserGroup className="w-6 h-6"/>
                 </div>
                 <h3 className="font-bold text-gray-900 text-lg mb-2">Communities</h3>
                 <p className="text-gray-500 text-sm leading-relaxed">Join communities, clubs, and groups or create your own.</p>
               </div>
               <HiArrowRight className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 w-5 h-5"/>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-left shadow-sm hover:shadow-lg hover:border-red-100 transition-all group flex flex-col justify-between h-[280px]">
               <div>
                 <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-6">
                   <HiOutlineCalendar className="w-6 h-6"/>
                 </div>
                 <h3 className="font-bold text-gray-900 text-lg mb-2">Events</h3>
                 <p className="text-gray-500 text-sm leading-relaxed">Discover exciting events, workshops, and competitions.</p>
               </div>
               <HiArrowRight className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 w-5 h-5"/>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-left shadow-sm hover:shadow-lg hover:border-amber-100 transition-all group flex flex-col justify-between h-[280px]">
               <div>
                 <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-6">
                   <HiOutlineBriefcase className="w-6 h-6"/>
                 </div>
                 <h3 className="font-bold text-gray-900 text-lg mb-2">Opportunities</h3>
                 <p className="text-gray-500 text-sm leading-relaxed">Find internships, projects, part-time jobs and more.</p>
               </div>
               <HiArrowRight className="text-amber-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 w-5 h-5"/>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-left shadow-sm hover:shadow-lg hover:border-purple-100 transition-all group flex flex-col justify-between h-[280px]">
               <div>
                 <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-6">
                   <HiOutlineAcademicCap className="w-6 h-6"/>
                 </div>
                 <h3 className="font-bold text-gray-900 text-lg mb-2">Study & Grow</h3>
                 <p className="text-gray-500 text-sm leading-relaxed">Access notes, resources and tools to learn and grow together.</p>
               </div>
               <HiArrowRight className="text-purple-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 w-5 h-5"/>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Empower Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
           <div className="bg-[#f0f3ff] rounded-[40px] p-10 lg:p-16 flex flex-col lg:flex-row items-center gap-16 overflow-hidden">
              
              {/* Left side text */}
              <div className="w-full lg:w-1/3">
                 <div className="inline-flex items-center gap-2 bg-white text-[#5c4dff] px-4 py-1.5 rounded-full text-sm font-bold mb-8 shadow-sm">
                   <HiHeart className="w-4 h-4"/> Made for students, by students
                 </div>
                 <h2 className="text-4xl lg:text-[44px] font-extrabold text-gray-900 mb-6 tracking-tight leading-[1.1]">
                   Built to <span className="text-[#5c4dff]">empower</span> every student
                 </h2>
                 <p className="text-gray-600 text-lg leading-relaxed font-medium">
                   UniVoid is more than a platform — it's a movement to build a better, more connected student community.
                 </p>
              </div>
              
              {/* Right side mockups (4 vertical cards) */}
              <div className="w-full lg:w-2/3 flex gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x">
                 
                 {/* Card 1 */}
                 <div className="min-w-[280px] bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 border border-white snap-center">
                   <div className="flex justify-between items-center mb-6">
                     <h4 className="font-bold text-gray-900 text-sm">Communities</h4>
                     <span className="text-[10px] text-gray-400 font-bold">Discover</span>
                   </div>
                   <div className="space-y-5">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">AI</div>
                         <div className="flex-1"><p className="font-bold text-sm text-gray-900">AI/ML Club</p><p className="text-[11px] text-gray-400">1.2k members</p></div>
                         <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-xs">&lt;/&gt;</div>
                         <div className="flex-1"><p className="font-bold text-sm text-gray-900">Web Developers</p><p className="text-[11px] text-gray-400">850 members</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">🎨</div>
                         <div className="flex-1"><p className="font-bold text-sm text-gray-900">Design Society</p><p className="text-[11px] text-gray-400">92 members</p></div>
                      </div>
                   </div>
                   <div className="mt-8 text-center text-xs font-bold text-[#5c4dff]">View All</div>
                 </div>

                 {/* Card 2 */}
                 <div className="min-w-[280px] bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 border border-white snap-center">
                   <div className="flex justify-between items-center mb-6">
                     <h4 className="font-bold text-gray-900 text-sm">Upcoming Events</h4>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-start gap-3">
                         <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"><img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=80" alt="event" className="w-full h-full object-cover"/></div>
                         <div><p className="font-bold text-xs text-gray-900 mb-1">Code Relay 2024 Hackathon</p><p className="text-[10px] text-gray-400">24 May, 9:00 AM</p><p className="text-[10px] text-[#5c4dff] font-bold">Online</p></div>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"><img src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=100&q=80" alt="event" className="w-full h-full object-cover"/></div>
                         <div><p className="font-bold text-xs text-gray-900 mb-1">Web Dev Workshop</p><p className="text-[10px] text-gray-400">27 May, 2:00 PM</p><p className="text-[10px] text-gray-500 font-bold">A Block, Room 101</p></div>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"><img src="https://images.unsplash.com/photo-1492501553945-15c136348c89?w=100&q=80" alt="event" className="w-full h-full object-cover"/></div>
                         <div><p className="font-bold text-xs text-gray-900 mb-1">Tech Fest '24</p><p className="text-[10px] text-gray-400">30 May, 10:00 AM</p><p className="text-[10px] text-gray-500 font-bold">Main Auditorium</p></div>
                      </div>
                   </div>
                   <div className="mt-6 text-center text-xs font-bold text-[#5c4dff]">View All</div>
                 </div>

                 {/* Card 3 */}
                 <div className="min-w-[280px] bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 border border-white snap-center">
                   <div className="flex justify-between items-center mb-6">
                     <h4 className="font-bold text-gray-900 text-sm">Opportunities</h4>
                   </div>
                   <div className="space-y-5">
                      <div className="flex items-start gap-3">
                         <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center font-bold text-xs">A</div>
                         <div><p className="font-bold text-xs text-gray-900 mb-0.5">Frontend Dev Intern</p><p className="text-[10px] text-gray-500 mb-1">Acme Corp • Remote</p><p className="text-[9px] text-gray-400">Apply by 15 May</p></div>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-md flex items-center justify-center font-bold text-xs">I</div>
                         <div><p className="font-bold text-xs text-gray-900 mb-0.5">ML Research Intern</p><p className="text-[10px] text-gray-500 mb-1">Innovate • On-site</p><p className="text-[9px] text-gray-400">Apply by 20 May</p></div>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-md flex items-center justify-center font-bold text-xs">C</div>
                         <div><p className="font-bold text-xs text-gray-900 mb-0.5">Campus Ambassador</p><p className="text-[10px] text-gray-500 mb-1">TechNet • Remote</p><p className="text-[9px] text-gray-400">Apply by 30 May</p></div>
                      </div>
                   </div>
                   <div className="mt-8 text-center text-xs font-bold text-[#5c4dff]">View All</div>
                 </div>

                 {/* Card 4 */}
                 <div className="min-w-[280px] bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 border border-white snap-center">
                   <div className="flex justify-between items-center mb-6">
                     <HiArrowRight className="rotate-180 text-gray-400 w-4 h-4"/>
                   </div>
                   <div className="text-center mb-6">
                      <div className="w-20 h-20 rounded-full border-4 border-[#f0f3ff] overflow-hidden mx-auto mb-3">
                         <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover"/>
                      </div>
                      <h4 className="font-bold text-gray-900">Parth N.</h4>
                      <p className="text-[11px] text-gray-500">Computer Science, 3rd Year</p>
                   </div>
                   
                   <div className="flex justify-between text-center px-4 mb-6">
                      <div><p className="text-xs font-bold text-gray-900">125</p><p className="text-[9px] text-gray-400">Connections</p></div>
                      <div><p className="text-xs font-bold text-gray-900">24</p><p className="text-[9px] text-gray-400">Saved</p></div>
                      <div><p className="text-xs font-bold text-gray-900">6</p><p className="text-[9px] text-gray-400">Communities</p></div>
                   </div>
                   
                   <button className="w-full py-2 bg-gray-50 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors mb-6">Edit Profile</button>
                   
                   <div>
                     <p className="text-xs font-bold text-gray-900 mb-3">Interests</p>
                     <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-600">AI/ML</span>
                        <span className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-600">Web Dev</span>
                        <span className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-600">Design</span>
                        <span className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-600">Hackathons</span>
                     </div>
                   </div>
                 </div>

              </div>
           </div>
        </div>
      </section>

      {/* 4. Stats Banner */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
         <div className="bg-[#24254a] rounded-3xl p-8 lg:p-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-white shadow-2xl">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <HiOutlineUsers className="w-6 h-6 text-blue-300"/>
               </div>
               <div>
                  <h3 className="text-3xl font-extrabold tracking-tight">10K+</h3>
                  <p className="text-sm text-white/60 font-medium mt-1">Active Students</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <HiOutlineUserGroup className="w-6 h-6 text-purple-300"/>
               </div>
               <div>
                  <h3 className="text-3xl font-extrabold tracking-tight">500+</h3>
                  <p className="text-sm text-white/60 font-medium mt-1">Communities</p>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <HiOutlineCalendar className="w-6 h-6 text-pink-300"/>
               </div>
               <div>
                  <h3 className="text-3xl font-extrabold tracking-tight">1K+</h3>
                  <p className="text-sm text-white/60 font-medium mt-1">Events Hosted</p>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <HiOutlineBriefcase className="w-6 h-6 text-amber-300"/>
               </div>
               <div>
                  <h3 className="text-3xl font-extrabold tracking-tight">2K+</h3>
                  <p className="text-sm text-white/60 font-medium mt-1">Opportunities Posted</p>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5c4dff] to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  U
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Uni<span className="text-[#5c4dff]">Void</span>
                </span>
              </Link>
              <p className="text-gray-500 font-medium leading-relaxed mb-6">
                Your student life, connected.<br />
                Discover, connect and grow together.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Product</h4>
              <ul className="space-y-4">
                <li><Link to="/#features" className="text-gray-500 hover:text-[#5c4dff] font-medium transition-colors">Features</Link></li>
                <li><Link to="/communities" className="text-gray-500 hover:text-[#5c4dff] font-medium transition-colors">Communities</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">Opportunities</h4>
              <ul className="space-y-4">
                <li><Link to="/events" className="text-gray-500 hover:text-[#5c4dff] font-medium transition-colors">Events</Link></li>
                <li><Link to="/jobs" className="text-gray-500 hover:text-[#5c4dff] font-medium transition-colors">Internships</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-sm tracking-wider">About</h4>
              <ul className="space-y-4">
                <li><Link to="/about" className="text-gray-500 hover:text-[#5c4dff] font-medium transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-500 hover:text-[#5c4dff] font-medium transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm font-medium">© 2026 UniVoid. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/login" className="text-gray-500 hover:text-[#5c4dff] font-medium text-sm transition-colors">Login</Link>
              <Link to="/register" className="text-gray-500 hover:text-[#5c4dff] font-medium text-sm transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
