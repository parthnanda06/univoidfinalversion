import { useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { 
  HiOutlinePhoneMissedCall, 
  HiOutlinePhone, 
  HiOutlineVideoCamera,
  HiOutlineMicrophone,
  HiOutlinePhoneIncoming
} from 'react-icons/hi';
import { MdOutlineMicOff, MdOutlineVideocamOff } from 'react-icons/md';

const CallOverlay = () => {
  const {
    incomingCall,
    activeCall,
    localStream,
    remoteStream,
    callAccepted,
    callStartTime,
    acceptCall,
    rejectCall,
    endCall
  } = useChat();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Robust Timer logic
  useEffect(() => {
    let interval = null;
    if (callAccepted && callStartTime) {
      interval = setInterval(() => {
        setNow(Date.now());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callAccepted, callStartTime]);

  const callDuration = callStartTime && callAccepted ? Math.floor((now - callStartTime) / 1000) : 0;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Play streams when refs and streams are available
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, activeCall]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callAccepted]);

  // Handle toggles
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  // Reset toggles when call ends
  useEffect(() => {
    if (!activeCall) {
      setIsMuted(false);
      setIsVideoOff(false);
    }
  }, [activeCall]);

  if (!incomingCall && !activeCall) return null;

  return (
    <div className="fixed top-24 right-8 z-[9999] animate-fade-in shadow-2xl rounded-2xl overflow-hidden border border-gray-200 bg-white" style={{ width: '360px' }}>
      
      {/* ── INCOMING CALL VIEW ── */}
      {incomingCall && !callAccepted && (
        <div className="bg-white p-6 text-center w-full">
          <div className="w-20 h-20 mx-auto bg-[#00a884] rounded-full flex items-center justify-center shadow-md mb-4 relative">
            {incomingCall.avatar ? (
              <img src={incomingCall.avatar} alt={incomingCall.name} className="w-full h-full rounded-full object-cover p-0.5 bg-white" />
            ) : (
              <span className="text-3xl font-bold text-white">{incomingCall.name?.charAt(0)?.toUpperCase()}</span>
            )}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center shadow-sm animate-pulse border-2 border-white">
              {incomingCall.isVideo ? <HiOutlineVideoCamera className="text-white w-4 h-4" /> : <HiOutlinePhoneIncoming className="text-white w-4 h-4" />}
            </div>
          </div>
          
          <h2 className="text-lg font-bold text-gray-900 mb-1">{incomingCall.name}</h2>
          <p className="text-gray-500 text-sm mb-6">WhatsApp {incomingCall.isVideo ? 'video' : 'voice'} call</p>
          
          <div className="flex justify-center gap-8">
            <button 
              onClick={rejectCall}
              className="w-12 h-12 bg-[#ef4444] hover:bg-[#dc2626] rounded-full flex items-center justify-center text-white shadow-md transition-transform"
            >
              <HiOutlinePhoneMissedCall className="w-6 h-6" />
            </button>
            <button 
              onClick={acceptCall}
              className="w-12 h-12 bg-[#00a884] hover:bg-[#008f6f] rounded-full flex items-center justify-center text-white shadow-md transition-transform"
            >
              {incomingCall.isVideo ? <HiOutlineVideoCamera className="w-6 h-6" /> : <HiOutlinePhone className="w-6 h-6" />}
            </button>
          </div>
        </div>
      )}

      {/* ── ACTIVE CALL VIEW ── */}
      {(activeCall || callAccepted) && (
        <div className="relative w-full bg-white flex flex-col" style={{ height: activeCall?.isVideo ? '480px' : '360px' }}>
          
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-white/90 to-white/0 z-30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shadow-sm">
                {activeCall?.avatar ? (
                  <img src={activeCall.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold">{activeCall?.name?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
              <div>
                <h2 className="text-gray-900 font-bold text-sm drop-shadow-sm">{activeCall?.name}</h2>
                <p className="text-gray-500 text-xs font-medium">
                  {!callAccepted && activeCall?.isCaller ? 'Calling...' : formatTime(callDuration)}
                </p>
              </div>
            </div>
            <button onClick={() => {/* Minimize logic could go here */}} className="text-gray-900">
              <HiOutlinePhoneMissedCall className="w-5 h-5 opacity-0" /> {/* Spacer to align */}
            </button>
          </div>

          {/* Main Remote Video (or avatar if audio-only) */}
          <div className="flex-1 flex items-center justify-center bg-gray-50 relative">
            {activeCall?.isVideo ? (
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover bg-black" 
              />
            ) : (
               <div className="flex flex-col items-center">
                 <div className="w-28 h-28 rounded-full bg-[#00a884] flex items-center justify-center mb-4 shadow-md">
                   {activeCall?.avatar ? (
                     <img src={activeCall.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover p-1 bg-white" />
                   ) : (
                     <span className="text-4xl font-bold text-white">{activeCall?.name?.charAt(0)?.toUpperCase()}</span>
                   )}
                 </div>
                 {!callAccepted && activeCall?.isCaller && (
                    <p className="text-gray-500 text-sm animate-pulse font-medium">Ringing...</p>
                 )}
                 {/* Hidden audio element for voice calls to actually play the sound */}
                 <audio ref={remoteVideoRef} autoPlay playsInline className="hidden" />
               </div>
            )}
          </div>

          {/* Picture-in-Picture Local Video */}
          {activeCall?.isVideo && (
            <div className="absolute bottom-20 right-4 w-24 h-36 bg-gray-200 rounded-xl overflow-hidden shadow-lg border-2 border-white z-20">
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]" 
              />
            </div>
          )}

          {/* Call Controls Toolbar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex items-center justify-center gap-6 z-30">
            <button 
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all ${isMuted ? 'bg-[#ef4444] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MdOutlineMicOff className="w-6 h-6" /> : <HiOutlineMicrophone className="w-6 h-6" />}
            </button>
            
            {activeCall?.isVideo && (
              <button 
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all ${isVideoOff ? 'bg-[#ef4444] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                title={isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                {isVideoOff ? <MdOutlineVideocamOff className="w-6 h-6" /> : <HiOutlineVideoCamera className="w-6 h-6" />}
              </button>
            )}
            
            <button 
              onClick={endCall}
              className="w-12 h-12 bg-[#ef4444] hover:bg-[#dc2626] rounded-full flex items-center justify-center text-white shadow-md transition-transform"
              title="End Call"
            >
              <HiOutlinePhoneMissedCall className="w-6 h-6" />
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default CallOverlay;
