import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMenu, HiX, HiSparkles, HiChevronDown, HiOutlineSearch, HiOutlineClock, HiOutlineUser, HiOutlineUserGroup, HiOutlineCalendar, HiOutlineDocumentText } from 'react-icons/hi';
import { useState, useRef, useEffect } from 'react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  console.log("Navbar Render -> showSuggestions:", showSuggestions, "searchQuery:", searchQuery);
  const searchRef = useRef(null);

  // Check if we are on login or register pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Notes', path: '/notes' },
    { name: 'Communities', path: '/communities' },
    { name: 'Events', path: '/events' },
    { name: 'Find People', path: '/people' },
  ];

  // Removed click outside to prevent instant close bug

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors ${isAuthPage ? 'bg-transparent text-white' : 'bg-white border-b border-surface-200'}`}>
      <div className="w-full px-4 sm:px-8">
        <div className="flex items-center justify-between h-[72px]">
          
          {/* Left: Logo + Search */}
          <div className="flex items-center gap-6 flex-1 lg:flex-none">
             <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group shrink-0">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5c4dff] to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                 U
               </div>
               <span className={`text-xl font-bold tracking-tight ${isAuthPage ? 'text-white' : 'text-gray-900'} hidden sm:block`}>
                 Uni<span className={isAuthPage ? 'text-[#a8a1ff]' : 'text-[#5c4dff]'}>Void</span>
               </span>
             </Link>
             
             {/* Global Search Bar */}
             {user && (
               <div className="relative flex-1 max-w-[280px] hidden md:block" ref={searchRef}>
                 <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                       <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input 
                          type="text" 
                          placeholder="Search..." 
                          className="w-full bg-gray-50 border border-gray-100 rounded-full py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] focus:bg-white transition-all"
                          value={searchQuery}
                          onChange={(e) => {
                             const val = e.target.value;
                             setSearchQuery(val);
                             if (val.trim().length > 0) {
                                setShowSuggestions(true);
                             } else {
                                setShowSuggestions(false);
                             }
                          }}
                       />
                    </div>
                 </form>
                 
                 {/* Auto-suggest Popover */}
                 {showSuggestions && (
                    <div className="absolute top-full mt-2 w-full sm:w-[360px] bg-white rounded-xl shadow-2xl border-4 border-red-500 py-2 z-[9999]" style={{ minHeight: '100px', display: 'block' }}>
                       {!searchQuery.trim() ? (
                          /* EMPTY STATE: Recent Searches */
                          <>
                             <div className="flex items-center justify-between px-4 py-1">
                                <h3 className="text-sm font-bold text-gray-900">Recent</h3>
                                <button className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">Show all</button>
                             </div>
                             
                             {/* Recent Profiles (Horizontal Scroll) */}
                             <div className="flex gap-4 overflow-x-auto px-4 py-3 no-scrollbar border-b border-gray-50 mb-2">
                                {[1, 2, 3, 4].map(i => (
                                   <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
                                      <img src={`https://i.pravatar.cc/150?img=${i+10}`} className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#5c4dff]/30 transition-all" alt="recent" />
                                      <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 w-16 text-center truncate">User {i}</span>
                                   </div>
                                ))}
                             </div>

                             {/* Recent Text Searches */}
                             <h3 className="text-sm font-bold text-gray-900 px-4 py-1 mb-1 mt-2">Try searching for</h3>
                             <button onClick={() => handleSearchSubmit({preventDefault:()=>{}})} className="w-full flex items-center gap-4 px-4 py-2 hover:bg-gray-100 transition-colors text-left group">
                                <HiOutlineSearch className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">python developers</span>
                             </button>
                             <button onClick={() => handleSearchSubmit({preventDefault:()=>{}})} className="w-full flex items-center gap-4 px-4 py-2 hover:bg-gray-100 transition-colors text-left group">
                                <HiOutlineSearch className="w-4 h-4 text-gray-500 group-hover:text-gray-900" />
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">machine learning</span>
                             </button>
                          </>
                       ) : (
                          /* TYPING STATE: Suggestions (from Mockup) */
                          <div className="flex flex-col">
                             {/* People Section */}
                             <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-gray-500">
                                   <HiOutlineUser className="w-4 h-4" />
                                   <span className="text-xs font-bold uppercase tracking-wider">People</span>
                                </div>
                                <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all people →</button>
                             </div>
                             
                             <div className="flex flex-col">
                                {[
                                   { name: 'Parth Bhanushali', verified: true, role: 'AI/ML Enthusiast • Python • React', edu: 'Parul University • 4th Year CSE (AI)', img: 'https://i.pravatar.cc/150?img=11' },
                                   { name: 'parth bhanushali', verified: false, role: 'Python Developer at 3iwebexperts', edu: 'Ahmedabad, Gujarat, India', img: 'https://i.pravatar.cc/150?img=12' },
                                   { name: 'Parth Bhanushali', verified: false, role: 'Data Science • ML • Python', edu: 'Parul University • 3rd Year CSE', img: null }
                                ].map((person, i) => (
                                   <div key={i} className="flex items-start justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer group">
                                      <div className="flex items-start gap-3 min-w-0">
                                         {person.img ? (
                                            <img src={person.img} className="w-10 h-10 rounded-full object-cover shrink-0" alt={person.name} />
                                         ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#5c4dff]/10 text-[#5c4dff] font-bold flex items-center justify-center shrink-0">PB</div>
                                         )}
                                         <div className="min-w-0">
                                            <p className="text-[13px] font-bold text-gray-900 flex items-center gap-1 truncate">
                                               {person.name}
                                               {person.verified && <span className="w-3.5 h-3.5 bg-[#5c4dff] text-white rounded-full flex items-center justify-center text-[8px]">✓</span>}
                                            </p>
                                            <p className="text-[11px] font-medium text-gray-600 truncate">{person.role}</p>
                                            <p className="text-[10px] text-gray-400 truncate">{person.edu}</p>
                                         </div>
                                      </div>
                                      <button className="bg-[#5c4dff]/10 text-[#5c4dff] hover:bg-[#5c4dff]/20 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap shrink-0">
                                         View Profile
                                      </button>
                                   </div>
                                ))}
                             </div>

                             {/* Posts Section */}
                             <div className="px-4 pt-4 pb-2 flex items-center justify-between border-t border-gray-100 mt-1">
                                <div className="flex items-center gap-1.5 text-gray-500">
                                   <HiOutlineDocumentText className="w-4 h-4" />
                                   <span className="text-xs font-bold uppercase tracking-wider">Posts</span>
                                </div>
                                <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all posts →</button>
                             </div>
                             
                             <div className="flex items-start justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="flex items-start gap-3 min-w-0">
                                   <img src="https://i.pravatar.cc/150?img=11" className="w-10 h-10 rounded-full object-cover shrink-0" alt="post author" />
                                   <div className="min-w-0">
                                      <p className="text-[12px] font-medium text-gray-600 truncate">
                                         <strong className="text-gray-900 font-bold">Parth Bhanushali</strong> in <span className="text-[#5c4dff] font-bold">AI/ML Students</span>
                                      </p>
                                      <p className="text-[10px] text-gray-400 mb-1">2 days ago</p>
                                      <p className="text-[11px] font-medium text-gray-700 line-clamp-1">
                                         Just completed my Python project for image classification using CNN...
                                      </p>
                                   </div>
                                </div>
                                <div className="w-12 h-10 bg-gray-900 rounded-lg ml-3 shrink-0 flex items-center justify-center overflow-hidden">
                                   <span className="text-yellow-400 text-2xl font-bold">{'</>'}</span>
                                </div>
                             </div>

                             {/* Communities Section */}
                             <div className="px-4 pt-4 pb-2 flex items-center justify-between border-t border-gray-100 mt-1">
                                <div className="flex items-center gap-1.5 text-gray-500">
                                   <HiOutlineUserGroup className="w-4 h-4" />
                                   <span className="text-xs font-bold uppercase tracking-wider">Communities</span>
                                </div>
                                <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all communities →</button>
                             </div>
                             
                             <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 font-bold text-xl border border-blue-100 shrink-0">
                                   P
                                </div>
                                <div className="min-w-0">
                                   <p className="text-[13px] font-bold text-gray-900 truncate">Python Developers</p>
                                   <p className="text-[11px] text-gray-500 truncate">2.4K members • 156 online</p>
                                </div>
                             </div>

                             <div className="mt-2 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                                <button onClick={() => handleSearchSubmit({preventDefault:()=>{}})} className="w-full text-left px-4 py-3 text-xs font-bold text-[#5c4dff] hover:bg-gray-100 transition-colors rounded-b-xl">
                                   See all results for "{searchQuery}" →
                                </button>
                             </div>
                          </div>
                       )}
                    </div>
                 )}
               </div>
             )}
          </div>

          {/* Center: Desktop Nav */}
          {user && (
            <div className="hidden lg:flex flex-1 items-center justify-center gap-8 h-full">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path === '/search' && location.pathname === '/search');
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative flex items-center h-full px-2 text-[14px] font-semibold transition-colors ${
                      isActive ? 'text-[#5c4dff]' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#5c4dff] rounded-t-full"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-4 lg:gap-5 justify-end">
            {user ? (
              <>
                <Link to="/ai-study-buddy" className="hidden lg:flex items-center gap-2 text-sm font-bold text-[#5c4dff] hover:text-[#4a3ddf] transition-all px-4 py-2 bg-[#5c4dff]/5 rounded-xl border border-[#5c4dff]/10 hover:border-[#5c4dff]/30 shadow-sm">
                  <HiSparkles className="animate-pulse w-4 h-4" />
                  AI Study Buddy
                </Link>
                <div className="relative flex items-center justify-center">
                  <NotificationBell />
                </div>
                
                <div className="relative hidden md:block">
                  <button 
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 pl-2 pr-2 py-1.5 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5c4dff] to-[#8b80ff] flex items-center justify-center text-sm font-bold text-white shadow-sm">
                        {user?.name ? user.name.charAt(0)?.toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="text-sm font-bold text-gray-700 hidden xl:block">{user?.name ? user.name.split(' ')[0] : 'User'}</span>
                    <HiChevronDown className="w-4 h-4 text-gray-400 hidden xl:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                      <div className="px-4 py-2 border-b border-gray-50 mb-2">
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#5c4dff]" onClick={() => setProfileDropdownOpen(false)}>My Profile</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={`text-[15px] font-semibold transition-colors px-4 py-2 ${isAuthPage ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Login</Link>
                <Link to="/register" className="bg-[#5c4dff] hover:bg-[#4a3ddf] text-white px-6 py-2.5 rounded-xl text-[15px] font-bold shadow-md hover:shadow-lg transition-all">Get Started</Link>
              </>
            )}

            {/* Mobile menu button */}
            <button className="lg:hidden text-gray-600 hover:text-gray-900 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <HiX size={26} /> : <HiOutlineMenu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            {user ? (
              <>
                <div className="relative mb-4">
                   <form onSubmit={handleSearchSubmit}>
                      <div className="relative">
                         <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                         <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#5c4dff]"
                            value={searchQuery}
                            onChange={(e) => {
                               const val = e.target.value;
                               setSearchQuery(val);
                               if (val.trim().length > 0) {
                                  setShowSuggestions(true);
                               } else {
                                  setShowSuggestions(false);
                               }
                            }}
                         />
                      </div>
                   </form>
                   
                   {showSuggestions && (
                      <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border-4 border-red-500 py-2 z-[9999]" style={{ minHeight: '100px', display: 'block' }}>
                         {!searchQuery.trim() ? (
                            null
                         ) : (
                            <div className="flex flex-col max-h-[60vh] overflow-y-auto">
                               {/* People Section */}
                               <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-gray-500">
                                     <HiOutlineUser className="w-4 h-4" />
                                     <span className="text-xs font-bold uppercase tracking-wider">People</span>
                                  </div>
                               </div>
                               
                               <div className="flex flex-col">
                                  {[
                                     { name: 'Parth Bhanushali', verified: true, role: 'AI/ML Enthusiast • Python • React', edu: 'Parul University • 4th Year CSE (AI)', img: 'https://i.pravatar.cc/150?img=11' }
                                  ].map((person, i) => (
                                     <div key={i} className="flex items-start justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer group">
                                        <div className="flex items-start gap-3 min-w-0">
                                           {person.img ? (
                                              <img src={person.img} className="w-10 h-10 rounded-full object-cover shrink-0" alt={person.name} />
                                           ) : (
                                              <div className="w-10 h-10 rounded-full bg-[#5c4dff]/10 text-[#5c4dff] font-bold flex items-center justify-center shrink-0">PB</div>
                                           )}
                                           <div className="min-w-0">
                                              <p className="text-[13px] font-bold text-gray-900 flex items-center gap-1 truncate">
                                                 {person.name}
                                                 {person.verified && <span className="w-3.5 h-3.5 bg-[#5c4dff] text-white rounded-full flex items-center justify-center text-[8px]">✓</span>}
                                              </p>
                                              <p className="text-[11px] font-medium text-gray-600 truncate">{person.role}</p>
                                           </div>
                                        </div>
                                     </div>
                                  ))}
                               </div>
  
                               <div className="mt-2 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                                  <button onClick={() => handleSearchSubmit({preventDefault:()=>{}})} className="w-full text-left px-4 py-3 text-xs font-bold text-[#5c4dff] hover:bg-gray-100 transition-colors rounded-b-xl">
                                     See all results for "{searchQuery}" →
                                  </button>
                               </div>
                            </div>
                         )}
                      </div>
                   )}
                </div>
                
                {navLinks.map((link) => (
                  <Link key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)} className={`block text-[15px] font-semibold py-3 px-4 rounded-xl ${location.pathname === link.path ? 'bg-[#5c4dff]/10 text-[#5c4dff]' : 'text-gray-600 hover:bg-gray-50'}`}>{link.name}</Link>
                ))}
                <Link to="/ai-study-buddy" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-[15px] font-bold text-[#5c4dff] py-3 px-4 rounded-xl bg-[#5c4dff]/5 border border-[#5c4dff]/10 mb-2 mt-4">
                  <HiSparkles className="animate-pulse" />
                  AI Study Buddy
                </Link>
                <div className="h-px bg-gray-100 my-2"></div>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-[15px] font-medium text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50">Profile</Link>
                <button onClick={handleLogout} className="w-full text-left text-[15px] font-bold text-red-500 hover:text-red-600 py-3 px-4 rounded-xl hover:bg-red-50">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-[15px] font-semibold text-gray-600 hover:text-gray-900 py-3 px-4 rounded-xl hover:bg-gray-50">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-[#5c4dff] text-white py-3 rounded-xl font-bold mt-2">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
