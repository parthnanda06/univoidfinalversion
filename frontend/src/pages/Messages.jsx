import { useEffect, useState, useRef, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineSearch, HiOutlineCheckCircle, HiOutlineCheck,
  HiOutlinePencilAlt, HiOutlinePhone, HiOutlineVideoCamera, 
  HiOutlineInformationCircle, HiOutlineDotsVertical, HiOutlinePaperClip, 
  HiOutlineEmojiHappy, HiPaperAirplane, HiOutlineDocumentText, HiOutlinePhotograph
} from 'react-icons/hi';
import EmojiPicker from 'emoji-picker-react';

/* ─── Relative "seen" time helper ───────────────────────── */
const seenLabel = (seenAt) => {
  if (!seenAt) return 'Seen';
  const diff = Math.floor((Date.now() - new Date(seenAt).getTime()) / 1000);
  if (diff < 10)  return 'Seen just now';
  if (diff < 60)  return `Seen ${diff}s ago`;
  if (diff < 3600) return `Seen ${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `Seen ${Math.floor(diff / 3600)}h ago`;
  return `Seen ${new Date(seenAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
};

const LiveSeenLabel = ({ seenAt }) => {
  const [label, setLabel] = useState(() => seenLabel(seenAt));
  useEffect(() => {
    setLabel(seenLabel(seenAt));
    const id = setInterval(() => setLabel(seenLabel(seenAt)), 15_000);
    return () => clearInterval(id);
  }, [seenAt]);
  return <span className="text-[10px] text-[#5c4dff]">{label}</span>;
};

/* ─── Main page ───────────────────────────────────────── */
const Messages = () => {
  const { openChats, openChat, conversations, loadConversations, onlineUsers, sendMessage, emitTyping, emitMarkRead, startCall } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All');
  const [activeChatId, setActiveChatId] = useState(null);
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Load conversations once on mount
  useEffect(() => {
    loadConversations().then(() => {
       // Optionally auto-select the first conversation if none selected
    });
  }, [loadConversations]);

  // Set first conversation as active if none is selected
  useEffect(() => {
    if (!activeChatId && conversations.length > 0) {
      setActiveChatId(String(conversations[0].partner._id));
    }
  }, [conversations, activeChatId]);

  // When activeChatId changes, fetch history using openChat
  useEffect(() => {
    if (activeChatId) {
      const partner = conversations.find(c => String(c.partner._id) === String(activeChatId))?.partner;
      if (partner) openChat(partner);
    }
  }, [activeChatId, conversations, openChat]);

  const activeOpenChat = openChats.find(c => String(c.partner._id) === String(activeChatId));
  const activeConversationMessages = activeOpenChat?.messages || [];
  const activeConversation = activeOpenChat || conversations.find(c => String(c.partner._id) === String(activeChatId));
  
  const activePartner = activeConversation?.partner;
  const isOnline = activePartner ? onlineUsers.includes(String(activePartner._id)) : false;

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationMessages]);

  // Emit mark_read when chat is focused
  useEffect(() => {
    if (activeChatId && activeConversationMessages?.length > 0) {
      emitMarkRead(activeChatId);
    }
  }, [activeChatId, activeConversationMessages, emitMarkRead]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleSend = () => {
    if (!text.trim() || !activeChatId) return;
    sendMessage(activeChatId, text.trim());
    setText('');
    emitTyping(activeChatId, false);
    if (typingTimeout) clearTimeout(typingTimeout);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (activeChatId) {
      emitTyping(activeChatId, true);
      if (typingTimeout) clearTimeout(typingTimeout);
      setTypingTimeout(setTimeout(() => emitTyping(activeChatId, false), 2000));
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
    inputRef.current?.focus();
  };

  const filtered = conversations.filter((c) =>
    c.partner?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = ['All', 'Unread', 'Groups', 'Requests'];

  return (
    <div className="flex h-[calc(100vh-72px)] w-full bg-gray-50 overflow-hidden animate-fade-in">
      
      {/* COLUMN 1: Conversations List */}
      <div className="w-80 md:w-96 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-full z-10 shadow-sm">
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
               <HiOutlineDocumentText className="w-6 h-6 text-gray-700" />
               Messages
            </h1>
            <button className="w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center text-[#5c4dff] hover:bg-[#5c4dff]/5 transition-colors">
               <HiOutlinePencilAlt className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative mb-5">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {tabs.map(tab => (
               <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                     activeTab === tab 
                        ? 'bg-[#5c4dff]/10 text-[#5c4dff]' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
               >
                  {tab}
               </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 no-scrollbar">
          {filtered.length === 0 ? (
             <div className="text-center p-8 text-gray-400 text-sm font-medium">No conversations found</div>
          ) : (
            filtered.map((conv) => {
              const isPartnerOnline = onlineUsers.includes(String(conv.partner?._id));
              const lastMsg = conv.lastMessage;
              const isMe = String(lastMsg?.sender?._id || lastMsg?.sender) === String(user?._id);
              const isActive = String(activeChatId) === String(conv.partner?._id);
              
              return (
                <button
                  key={conv.conversationId}
                  onClick={() => setActiveChatId(String(conv.partner?._id))}
                  className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition-colors ${
                     isActive ? 'bg-[#5c4dff]/5' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {conv.partner?.avatar ? (
                      <img src={conv.partner.avatar} alt={conv.partner.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5c4dff] to-[#34d399] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {conv.partner?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isPartnerOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className="text-sm font-bold text-gray-900 truncate pr-2">{conv.partner?.name}</h4>
                      <span className={`text-[10px] font-bold whitespace-nowrap ${conv.unreadCount > 0 ? 'text-[#5c4dff]' : 'text-gray-400'}`}>
                         {lastMsg?.createdAt ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                       <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
                         {isMe ? 'You: ' : ''}{lastMsg?.text || 'Started a conversation'}
                       </p>
                       {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-[#5c4dff] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                             {conv.unreadCount}
                          </span>
                       )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
        <div className="p-4 border-t border-gray-100 text-center">
           <button className="text-xs font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all conversations →</button>
        </div>
      </div>

      {/* COLUMN 2: Active Chat Area */}
      <div className="flex-1 flex flex-col bg-white/50 relative min-w-0">
        {activeChatId && activePartner ? (
          <>
            {/* Chat Header */}
            <div className="h-[76px] bg-white border-b border-gray-100 px-6 flex items-center justify-between flex-shrink-0 shadow-sm z-10">
               <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/people/${activePartner._id}`)}>
                 <div className="relative">
                    {activePartner.avatar ? (
                      <img src={activePartner.avatar} alt={activePartner.name} className="w-11 h-11 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#5c4dff] to-[#34d399] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {activePartner.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></span>}
                 </div>
                 <div>
                    <h2 className="text-[15px] font-bold text-gray-900">{activePartner.name}</h2>
                    <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                       {activeConversation?.isTyping ? (
                          <span className="text-[#5c4dff]">Typing...</span>
                       ) : isOnline ? (
                          <><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online</>
                       ) : 'Offline'}
                    </p>
                 </div>
               </div>
               
               <div className="flex items-center gap-2">
                  <button onClick={() => startCall(activePartner, false)} className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-[#5c4dff] hover:bg-[#5c4dff]/5 transition-colors" title="Audio Call">
                     <HiOutlinePhone className="w-5 h-5" />
                  </button>
                  <button onClick={() => startCall(activePartner, true)} className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-[#5c4dff] hover:bg-[#5c4dff]/5 transition-colors" title="Video Call">
                     <HiOutlineVideoCamera className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-[#5c4dff] hover:bg-[#5c4dff]/5 transition-colors">
                     <HiOutlineInformationCircle className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors">
                     <HiOutlineDotsVertical className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 no-scrollbar" onFocus={() => emitMarkRead(activeChatId)} onClick={() => emitMarkRead(activeChatId)}>
               
               {activeOpenChat?.isLoading ? (
                  <div className="flex items-center justify-center h-full">
                     <span className="w-8 h-8 border-4 border-[#5c4dff] border-t-transparent rounded-full animate-spin"></span>
                  </div>
               ) : activeConversationMessages.length === 0 ? (
                  <div className="text-center my-8 text-gray-500 text-sm font-medium">Say hi to {activePartner?.name}!</div>
               ) : (
                  <>
                     <div className="text-center my-4">
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Messages</span>
                     </div>
                     {activeConversationMessages.map((msg, i) => {
                        const isMine = String(msg.sender?._id || msg.sender) === String(user?._id);
                        
                        return (
                           <div key={msg._id || i} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
                              {!isMine && (
                                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5c4dff] to-[#34d399] flex items-center justify-center text-white font-bold text-xs shadow-sm mr-3 mt-auto shrink-0 overflow-hidden">
                                    {activePartner.avatar ? <img src={activePartner.avatar} className="w-full h-full object-cover" /> : activePartner.name?.charAt(0).toUpperCase()}
                                 </div>
                              )}
                              <div className="flex flex-col max-w-[65%]">
                                 <div className={`p-3.5 text-[13px] font-medium leading-relaxed shadow-sm ${
                                    isMine 
                                       ? 'bg-[#f3f0ff] text-gray-900 rounded-2xl rounded-br-sm' 
                                       : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-50'
                                 }`}>
                                    {msg.text}
                                 </div>
                                 <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <span className="text-[10px] font-semibold text-gray-400">
                                       {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMine && (
                                       msg.read 
                                          ? <HiOutlineCheckCircle className="w-3.5 h-3.5 text-[#5c4dff]" title="Seen" /> 
                                          : <HiOutlineCheck className="w-3.5 h-3.5 text-gray-300" title="Delivered" />
                                    )}
                                 </div>
                                 {isMine && msg.read && msg.seenAt && i === activeConversationMessages.findLastIndex(m => String(m.sender?._id || m.sender) === String(user?._id) && m.read) && (
                                    <div className="mt-1 flex justify-end">
                                      <LiveSeenLabel seenAt={msg.seenAt || activeOpenChat?.lastSeenAt} />
                                    </div>
                                 )}
                              </div>
                           </div>
                        );
                     })}
                  </>
               )}
               <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white border-t border-gray-100 flex items-center gap-3 relative z-20">
               {showEmojiPicker && (
                 <div className="absolute bottom-full right-16 mb-2 shadow-2xl rounded-2xl overflow-hidden" ref={emojiPickerRef}>
                   <EmojiPicker onEmojiClick={handleEmojiClick} theme="light" width={320} height={400} />
                 </div>
               )}
               <button className="w-10 h-10 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-colors flex-shrink-0">
                  <HiOutlinePaperClip className="w-5 h-5" />
               </button>
               <div className="flex-1 relative">
                  <input
                     ref={inputRef}
                     type="text"
                     value={text}
                     onChange={handleTextChange}
                     onKeyDown={handleKeyDown}
                     placeholder="Type a message..."
                     className="w-full bg-gray-50 border border-gray-100 rounded-full py-3 pl-5 pr-12 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all"
                  />
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-gray-400 hover:text-[#5c4dff] flex items-center justify-center transition-colors">
                     <HiOutlineEmojiHappy className="w-5 h-5" />
                  </button>
               </div>
               <button 
                  onClick={handleSend}
                  disabled={!text.trim()}
                  className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                     text.trim() ? 'bg-[#5c4dff] text-white shadow-lg shadow-[#5c4dff]/30 hover:bg-[#4a3ddf]' : 'bg-gray-100 text-gray-400'
                  }`}
               >
                  <HiPaperAirplane className="w-5 h-5 rotate-90 ml-1" />
               </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/50">
             <div className="w-24 h-24 rounded-full bg-[#5c4dff]/5 flex items-center justify-center text-[#5c4dff] mb-6">
                <HiOutlineDocumentText className="w-10 h-10" />
             </div>
             <h2 className="text-xl font-bold text-gray-900 mb-2">Your Messages</h2>
             <p className="text-gray-500 text-sm max-w-sm">Select a conversation from the left to start chatting with your connections.</p>
          </div>
        )}
      </div>

      {/* COLUMN 3: Profile Sidebar */}
      {activeChatId && activePartner && (
         <div className="w-[340px] flex-shrink-0 bg-white border-l border-gray-100 hidden xl:flex flex-col h-full z-10 shadow-sm overflow-y-auto no-scrollbar">
            <div className="p-6 text-center border-b border-gray-100 pb-8">
               <div className="relative mb-14">
                  <div className="h-24 bg-gradient-to-r from-[#e0e7ff] to-[#f3f0ff] rounded-2xl absolute w-full top-0 left-0"></div>
                  <div className="w-20 h-20 rounded-full border-4 border-white mx-auto relative top-14 shadow-md bg-white">
                     {activePartner.avatar ? (
                        <img src={activePartner.avatar} alt={activePartner.name} className="w-full h-full rounded-full object-cover" />
                     ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#5c4dff] to-[#34d399] flex items-center justify-center text-white font-bold text-2xl">
                           {activePartner.name?.charAt(0).toUpperCase()}
                        </div>
                     )}
                     {isOnline && <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></span>}
                  </div>
               </div>
               
               <h3 className="text-[17px] font-bold text-gray-900 mb-1">{activePartner.name}</h3>
               <p className="text-xs font-semibold text-gray-500 mb-4">@{activePartner.name.toLowerCase().replace(/\s+/g, '')}</p>
               
               <p className="text-[11px] font-bold text-gray-700 leading-relaxed max-w-[220px] mx-auto mb-2">
                  {activePartner.headline || 'Student at UniVoid'}
               </p>
               <p className="text-[10px] font-semibold text-gray-400 mb-5">
                  {[activePartner.college, activePartner.branch].filter(Boolean).join(' • ')}
               </p>
               
               <button onClick={() => navigate(`/people/${activePartner._id}`)} className="w-full py-2.5 rounded-xl border border-[#5c4dff]/20 text-[#5c4dff] font-bold text-xs hover:bg-[#5c4dff]/5 transition-colors">
                  View Profile
               </button>
            </div>
            
            <div className="p-6 border-b border-gray-100">
               <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[13px] font-bold text-gray-900">Shared Files</h4>
                  <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all</button>
               </div>
               
               <div className="space-y-3">
                  {[
                     { name: 'ML_Workshop_Syllabus.pdf', size: '2.4 MB • Today', icon: <HiOutlineDocumentText className="w-5 h-5 text-red-500" />, color: 'bg-red-50' },
                     { name: 'Dataset_Sample.csv', size: '1.1 MB • Yesterday', icon: <HiOutlineDocumentText className="w-5 h-5 text-green-500" />, color: 'bg-green-50' },
                     { name: 'Notes_LinearRegression.pdf', size: '3.2 MB • 3 days ago', icon: <HiOutlineDocumentText className="w-5 h-5 text-red-500" />, color: 'bg-red-50' },
                  ].map((file, i) => (
                     <div key={i} className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className={`w-10 h-10 rounded-xl ${file.color} flex items-center justify-center shrink-0`}>
                           {file.icon}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                           <h5 className="text-[11px] font-bold text-gray-900 truncate group-hover:text-[#5c4dff] transition-colors">{file.name}</h5>
                           <p className="text-[9px] font-semibold text-gray-400 mt-0.5">{file.size}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            
            <div className="p-6">
               <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[13px] font-bold text-gray-900">Media</h4>
                  <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all</button>
               </div>
               
               <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="aspect-square rounded-xl bg-gray-900 overflow-hidden flex items-center justify-center text-white/20">
                     <HiOutlinePhotograph className="w-6 h-6" />
                  </div>
                  <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400">
                     <HiOutlinePhotograph className="w-6 h-6" />
                  </div>
                  <div className="aspect-square rounded-xl bg-[#0f172a] overflow-hidden flex items-center justify-center text-white/20">
                     <HiOutlinePhotograph className="w-6 h-6" />
                  </div>
               </div>
               
               <div>
                  <h4 className="text-[13px] font-bold text-gray-900 mb-1.5">About</h4>
                  <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                     Passionate about AI & Machine Learning. Love building and exploring new things. Always open to collaborate on exciting projects!
                  </p>
               </div>
            </div>
         </div>
      )}
      
    </div>
  );
};

export default Messages;
