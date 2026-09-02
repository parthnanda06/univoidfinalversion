import { useState, useRef, useEffect } from 'react';
import { askAI, getAIHistory, clearAIHistory, getAISessions, updateAISession } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  HiSparkles, HiPaperAirplane, HiTrash, HiOutlinePlus, 
  HiOutlineDotsHorizontal, HiOutlineClipboardCopy, HiOutlineThumbUp, 
  HiOutlineThumbDown, HiOutlineVolumeUp, HiOutlinePaperClip, 
  HiOutlineCode, HiOutlineCloudUpload, HiOutlineCalculator,
  HiMenu, HiX, HiOutlineStar, HiStar, HiOutlinePencil
} from 'react-icons/hi';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const AIStudyBuddy = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  const [activeSession, setActiveSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const handlePinChat = async (id, isPinned) => {
    try {
      setSessions(prev => prev.map(s => s._id === id ? { ...s, isPinned: !isPinned } : s));
      await updateAISession(id, { isPinned: !isPinned });
    } catch (e) {
      toast.error('Failed to pin chat');
      setSessions(prev => prev.map(s => s._id === id ? { ...s, isPinned: isPinned } : s));
    }
    setOpenDropdownId(null);
  };

  const handleRenameChat = async (id, currentTitle) => {
    const newTitle = window.prompt('Rename chat:', currentTitle);
    if (!newTitle || newTitle === currentTitle) return;
    try {
      setSessions(prev => prev.map(s => s._id === id ? { ...s, title: newTitle } : s));
      await updateAISession(id, { title: newTitle });
    } catch (e) {
      toast.error('Failed to rename chat');
      setSessions(prev => prev.map(s => s._id === id ? { ...s, title: currentTitle } : s));
    }
    setOpenDropdownId(null);
  };

  const handleDeleteChat = async (id) => {
    if (!window.confirm('Are you sure you want to delete this chat session?')) return;
    try {
      await clearAIHistory(id);
      setSessions(prev => prev.filter(s => s._id !== id));
      if (activeSession === id) {
        setActiveSession(null);
        setMessages([]);
      }
      toast.success('Session deleted');
    } catch (error) {
      toast.error('Failed to delete session');
    }
    setOpenDropdownId(null);
  };

  const formatSessionTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return 'Older';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: sessionData } = await getAISessions();
        setSessions(sessionData || []);
        if (sessionData && sessionData.length > 0) {
          setActiveSession(sessionData[0]._id);
        } else {
          setInitialLoading(false);
        }
      } catch (error) {
        console.error('Fetch sessions error:', error);
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const { data } = await getAIHistory(activeSession);
        setMessages(data.messages || []);
      } catch (error) {
        console.error('History fetch error:', error);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };
    fetchHistory();
  }, [activeSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const payload = { prompt: input };
      if (activeSession) payload.sessionId = activeSession;
      
      const { data } = await askAI(payload);
      
      const aiMessage = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, aiMessage]);
      
      if (!activeSession && data.sessionId) {
        setActiveSession(data.sessionId);
        setSessions(prev => [{ _id: data.sessionId, title: data.title, updatedAt: new Date().toISOString() }, ...prev]);
      } else if (activeSession && data.title) {
        setSessions(prev => prev.map(s => 
          s._id === activeSession ? { ...s, title: data.title, updatedAt: new Date().toISOString() } : s
        ));
      }
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('AI Study Buddy is having some trouble. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100dvh-72px)] bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#5c4dff] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 h-[calc(100dvh-72px)] p-2 md:p-6 flex flex-col">
      <div className="w-full max-w-[1400px] mx-auto h-full flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              className="lg:hidden p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              onClick={() => setShowSidebar(true)}
            >
              <HiMenu className="text-xl" />
            </button>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
              <HiSparkles className="text-[#5c4dff] text-xl md:text-2xl" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl flex items-center gap-1.5">
                <span className="font-bold text-gray-900">AI</span>
                <span className="font-semibold text-[#5c4dff]">Buddy</span>
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5 hidden sm:block">Your personal AI tutor.</p>
            </div>
          </div>

        </div>

        {/* 2-Column Layout */}
        <div className="flex-1 flex gap-6 min-h-0 relative">
          
          {/* Mobile Sidebar Overlay */}
          {showSidebar && (
            <div 
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* Left Sidebar: Chat History */}
          <div className={`
            absolute lg:static inset-y-0 left-0 z-50
            w-[280px] md:w-[320px] bg-white rounded-r-3xl lg:rounded-3xl shadow-xl lg:shadow-sm border border-gray-100 flex flex-col overflow-hidden flex-shrink-0 transition-transform duration-300
            ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-4 md:p-5 border-b border-gray-50 flex items-center justify-between">
              <button 
                onClick={() => { setActiveSession(null); setMessages([]); setShowSidebar(false); }}
                className="flex-1 flex items-center justify-between font-bold text-gray-900 hover:text-[#5c4dff] transition-colors group"
              >
                <span className="text-[15px]">New Chat</span>
                <div className="w-8 h-8 rounded-full bg-[#f3f0ff] text-[#5c4dff] flex items-center justify-center group-hover:bg-[#5c4dff] group-hover:text-white transition-all">
                  <HiOutlinePlus className="text-lg" />
                </div>
              </button>
              <button 
                className="lg:hidden ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl"
                onClick={() => setShowSidebar(false)}
              >
                <HiX className="text-xl" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar" onClick={() => setOpenDropdownId(null)}>
              {['Pinned', 'Today', 'Yesterday', 'Older'].map(group => {
                const groupSessions = sessions.filter(s => {
                  if (group === 'Pinned') return s.isPinned;
                  if (s.isPinned) return false;
                  return formatSessionTime(s.updatedAt) === group;
                });
                if (groupSessions.length === 0) return null;
                
                return (
                  <div key={group}>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
                      {group === 'Pinned' && <HiStar className="text-[#5c4dff] text-sm" />}
                      {group}
                    </h3>
                    <div className="space-y-1">
                      {groupSessions.map(session => {
                        const isActive = session._id === activeSession;
                        const timeString = new Date(session.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        return (
                          <div key={session._id} className="relative">
                            <button
                              onClick={() => { setActiveSession(session._id); setShowSidebar(false); }}
                              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                                isActive ? 'bg-[#f3f0ff] text-[#5c4dff]' : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <span className="text-[13px] font-semibold truncate pr-2 flex items-center gap-1.5">
                                {session.isPinned && <HiStar className="text-xs flex-shrink-0" />}
                                <span className="truncate">{session.title}</span>
                              </span>
                              <div className="flex items-center gap-1">
                                {isActive && (
                                  <div
                                    className="p-1.5 hover:bg-[#e2dcff] rounded-lg transition-colors cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdownId(openDropdownId === session._id ? null : session._id);
                                    }}
                                  >
                                    <HiOutlineDotsHorizontal className="text-[#5c4dff] flex-shrink-0" />
                                  </div>
                                )}
                                {!isActive && <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap flex-shrink-0">{timeString}</span>}
                              </div>
                            </button>
                            
                            {/* Dropdown Menu */}
                            {openDropdownId === session._id && (
                              <div className="absolute right-0 top-12 z-[60] w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handlePinChat(session._id, session.isPinned); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                >
                                  {session.isPinned ? <HiOutlineStar className="text-sm" /> : <HiStar className="text-sm text-[#5c4dff]" />}
                                  {session.isPinned ? 'Unpin Chat' : 'Pin Chat'}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleRenameChat(session._id, session.title); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-[#5c4dff] hover:bg-[#f3f0ff] transition-colors"
                                >
                                  <HiOutlinePencil className="text-sm" />
                                  Rename
                                </button>
                                <div className="h-px bg-gray-100 my-1"></div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteChat(session._id); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  <HiTrash className="text-sm" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-4 border-t border-gray-50">
              <button className="text-xs font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all chats →</button>
            </div>
          </div>

          {/* Right Area: Active Chat */}
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <div className="w-16 h-16 rounded-full bg-[#f3f0ff] flex items-center justify-center mb-4">
                    <HiSparkles className="text-3xl text-[#5c4dff]" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">How can I help you today?</h2>
                </div>
              ) : (
                <div className="space-y-8 max-w-4xl mx-auto pb-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      
                      {msg.role === 'assistant' && (
                        <div className="w-9 h-9 rounded-full bg-[#f3f0ff] flex items-center justify-center text-[#5c4dff] flex-shrink-0 mr-4 shadow-sm mt-1">
                          <HiSparkles className="text-lg" />
                        </div>
                      )}

                      <div className={`max-w-[80%] ${msg.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                        <div className={`p-5 text-[14px] leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-[#f3f0ff] text-gray-900 rounded-2xl rounded-tr-sm' 
                            : 'bg-gray-50 text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100'
                        }`}>
                          <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:bg-gray-900 prose-pre:text-gray-100">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                        
                        {msg.role === 'user' && (
                          <div className="flex items-center gap-2 mt-2 mr-1">
                             <span className="text-[11px] font-semibold text-gray-400">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        )}

                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-4 mt-2 ml-2">
                            <button className="text-gray-400 hover:text-[#5c4dff] transition-colors"><HiOutlineClipboardCopy className="w-[18px] h-[18px]" /></button>
                            <button className="text-gray-400 hover:text-[#5c4dff] transition-colors"><HiOutlineThumbUp className="w-[18px] h-[18px]" /></button>
                            <button className="text-gray-400 hover:text-[#5c4dff] transition-colors"><HiOutlineThumbDown className="w-[18px] h-[18px]" /></button>
                            <button className="text-gray-400 hover:text-[#5c4dff] transition-colors"><HiOutlineVolumeUp className="w-[18px] h-[18px]" /></button>
                          </div>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-9 h-9 rounded-full bg-[#5c4dff] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ml-4 shadow-sm mt-1">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="w-9 h-9 rounded-full bg-[#f3f0ff] flex items-center justify-center text-[#5c4dff] flex-shrink-0 mr-4 shadow-sm mt-1">
                        <HiSparkles className="text-lg animate-spin" />
                      </div>
                      <div className="p-5 text-[14px] bg-gray-50 text-gray-500 rounded-2xl rounded-tl-sm border border-gray-100 italic flex items-center gap-3">
                        Thinking <span className="flex gap-1"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Form Area */}
            <div className="p-4 md:p-6 bg-white border-t border-gray-50">
              <div className="max-w-4xl mx-auto relative">
                <form 
                  onSubmit={handleSubmit}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-[#5c4dff]/20 focus-within:border-[#5c4dff] transition-all flex flex-col"
                >
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Ask me anything..."
                    className="w-full bg-transparent p-3 md:p-4 text-[14px] md:text-[15px] text-gray-900 placeholder-gray-400 resize-none min-h-[50px] md:min-h-[60px] max-h-[150px] overflow-y-auto focus:outline-none custom-scrollbar"
                    rows="1"
                  />
                  <div className="flex items-center justify-between px-2 md:px-3 pb-2 md:pb-3 mt-auto">
                    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto custom-scrollbar">
                      <button type="button" className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors text-[11px] md:text-xs font-semibold whitespace-nowrap">
                        <HiOutlinePaperClip className="text-base md:text-lg" /> <span className="hidden sm:inline">Attach</span>
                      </button>
                      <button type="button" className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors text-[11px] md:text-xs font-semibold whitespace-nowrap hidden sm:flex">
                        <HiOutlineCalculator className="text-base md:text-lg" /> Math
                      </button>
                      <button type="button" className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors text-[11px] md:text-xs font-semibold whitespace-nowrap hidden md:flex">
                        <HiOutlineCode className="text-base md:text-lg" /> Code
                      </button>
                      <button type="button" className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors text-[11px] md:text-xs font-semibold whitespace-nowrap hidden md:flex">
                        <HiOutlineCloudUpload className="text-base md:text-lg" /> Upload
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#5c4dff] flex items-center justify-center text-white hover:bg-[#4a3ddf] disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-md shadow-[#5c4dff]/20 ml-2 flex-shrink-0"
                    >
                      <HiPaperAirplane className="rotate-90 ml-0.5 md:ml-1 text-sm md:text-base" />
                    </button>
                  </div>
                </form>
                <p className="text-center text-[11px] font-medium text-gray-400 mt-3 pb-1">
                  AI can make mistakes. Please verify important information.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStudyBuddy;
