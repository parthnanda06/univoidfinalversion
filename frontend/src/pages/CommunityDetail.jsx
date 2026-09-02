import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getCommunity, getCommunityPosts, createPost,
  likePost, commentOnPost, likeComment, replyToComment, likeReply,
} from '../services/api';
import {
  HiOutlineHeart, HiHeart, HiOutlineChatAlt, HiOutlineArrowLeft, HiOutlineBell, HiDotsHorizontal, HiOutlinePhotograph, HiOutlineCalendar, HiOutlineDocumentText, HiOutlineChartBar, HiCheckCircle, HiOutlineBookmark, HiOutlineBadgeCheck, HiOutlineUserGroup, HiOutlineStatusOnline, HiOutlineChatAlt2
} from 'react-icons/hi';
import { HiArrowUturnLeft } from 'react-icons/hi2';
import toast from 'react-hot-toast';

/* ─── helpers ─────────────────────────────────────── */
const Avatar = ({ name, size = 'sm' }) => {
  const s = size === 'xs' ? 'w-5 h-5 text-[9px]' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${s} rounded-full bg-gradient-to-br from-[#5c4dff] to-blue-500 flex items-center justify-center text-white font-bold shrink-0 shadow-sm`}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

/* ─── Reply row ────────────────────────────────────── */
const ReplyRow = ({ reply, postId, commentId, currentUserId, onLike }) => {
  const liked = reply.likes?.some(l => (l._id || l) === currentUserId);
  return (
    <div className="flex items-start gap-3 pl-3 border-l-2 border-gray-100 mt-3">
      <Avatar name={reply.author?.name} size="xs" />
      <div className="flex-1 min-w-0 bg-gray-50 p-3 rounded-2xl rounded-tl-none">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-gray-900">{reply.author?.name || 'User'}</span>
          <span className="text-[10px] font-medium text-gray-400">
            {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
          </span>
        </div>
        <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{reply.text}</p>
        {/* Like button on reply */}
        <button
          onClick={() => onLike(reply._id)}
          className={`mt-2 flex items-center gap-1.5 text-[10px] font-bold transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
        >
          {liked ? <HiHeart className="w-3.5 h-3.5" /> : <HiOutlineHeart className="w-3.5 h-3.5" />}
          {reply.likeCount || 0}
        </button>
      </div>
    </div>
  );
};

/* ─── Comment row ──────────────────────────────────── */
const CommentRow = ({ comment, postId, currentUserId, onCommentLike, onReplyAdded, onReplyLike }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const liked = comment.likes?.some(l => (l._id || l) === currentUserId);
  const replyCount = comment.replies?.length || 0;

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await replyToComment(postId, comment._id, { text: replyText });
      onReplyAdded(comment._id, data);
      setReplyText('');
      setShowReplyInput(false);
      setShowReplies(true);
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 pt-4 first:pt-0">
      {/* Comment body */}
      <div className="flex items-start gap-3">
        <Avatar name={comment.author?.name} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none">
             <div className="flex items-center justify-between mb-1.5">
               <span className="text-sm font-bold text-gray-900">{comment.author?.name || 'User'}</span>
               <span className="text-[10px] font-medium text-gray-400">
                 {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
               </span>
             </div>
             <p className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed">{comment.text}</p>
          </div>

          {/* Actions: like + reply */}
          <div className="flex items-center gap-4 mt-2 px-2">
            <button
              onClick={() => onCommentLike(comment._id)}
              className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              {liked ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
              {comment.likeCount || 0}
            </button>
            <button
              onClick={() => setShowReplyInput(r => !r)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-[#5c4dff] transition-colors"
            >
              <HiArrowUturnLeft className="w-3.5 h-3.5" />
              Reply
            </button>
            {replyCount > 0 && (
              <button
                onClick={() => setShowReplies(r => !r)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf] transition-colors ml-auto"
              >
                <HiOutlineChatAlt className="w-4 h-4" />
                {showReplies ? 'Hide replies' : `View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReplyInput && (
            <div className="flex gap-2 mt-3 pl-2 border-l-2 border-gray-100">
              <input
                type="text"
                className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all"
                placeholder={`Reply to ${comment.author?.name || 'comment'}…`}
                value={replyText}
                autoFocus
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReplySubmit()}
              />
              <button
                onClick={handleReplySubmit}
                disabled={submitting || !replyText.trim()}
                className="bg-[#5c4dff] hover:bg-[#4a3ddf] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition-all shrink-0 disabled:opacity-50"
              >
                {submitting ? '…' : 'Send'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {showReplies && replyCount > 0 && (
        <div className="ml-11 space-y-1">
          {comment.replies.map((reply) => (
            <ReplyRow
              key={reply._id}
              reply={reply}
              postId={postId}
              commentId={comment._id}
              currentUserId={currentUserId}
              onLike={(replyId) => onReplyLike(comment._id, replyId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Main page ────────────────────────────────────── */
const CommunityDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    Promise.all([getCommunity(id), getCommunityPosts(id)])
      .then(([cRes, pRes]) => { setCommunity(cRes.data); setPosts(pRes.data); })
      .catch(() => toast.error('Failed to load community'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await createPost(id, { content: postContent });
      setPosts([data, ...posts]);
      setPostContent('');
      toast.success('Post created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostLike = async (postId) => {
    try {
      const { data } = await likePost(postId);
      setPosts(posts.map(p => p._id === postId ? {
        ...p,
        likeCount: data.likeCount,
        likes: data.liked ? [...(p.likes || []), user._id] : (p.likes || []).filter(l => l !== user._id),
      } : p));
    } catch { toast.error('Failed to like'); }
  };

  const handleAddComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    try {
      const { data } = await commentOnPost(postId, { text });
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: [...(p.comments || []), data] } : p));
      setCommentText({ ...commentText, [postId]: '' });
      toast.success('Comment added');
    } catch { toast.error('Failed to comment'); }
  };

  const handleCommentLike = async (postId, commentId) => {
    try {
      const { data } = await likeComment(postId, commentId);
      setPosts(posts.map(p => {
        if (p._id !== postId) return p;
        return {
          ...p,
          comments: p.comments.map(c => {
            if (c._id !== commentId) return c;
            return {
              ...c,
              likeCount: data.likeCount,
              likes: data.liked ? [...(c.likes || []), user._id] : (c.likes || []).filter(l => (l._id || l) !== user._id),
            };
          }),
        };
      }));
    } catch { toast.error('Failed to like comment'); }
  };

  const handleReplyAdded = (postId, commentId, newReply) => {
    setPosts(posts.map(p => {
      if (p._id !== postId) return p;
      return {
        ...p,
        comments: p.comments.map(c => {
          if (c._id !== commentId) return c;
          return { ...c, replies: [...(c.replies || []), newReply] };
        }),
      };
    }));
  };

  const handleReplyLike = async (postId, commentId, replyId) => {
    try {
      const { data } = await likeReply(postId, commentId, replyId);
      setPosts(posts.map(p => {
        if (p._id !== postId) return p;
        return {
          ...p,
          comments: p.comments.map(c => {
            if (c._id !== commentId) return c;
            return {
              ...c,
              replies: c.replies.map(r => {
                if (r._id !== replyId) return r;
                return {
                  ...r,
                  likeCount: data.likeCount,
                  likes: data.liked ? [...(r.likes || []), user._id] : (r.likes || []).filter(l => (l._id || l) !== user._id),
                };
              }),
            };
          }),
        };
      }));
    } catch { toast.error('Failed to like reply'); }
  };

  const isPostLiked = (post) => post.likes?.some(l => (l._id || l) === user?._id);
  const isMember = community?.members?.some(m => (m._id || m) === user?._id);

  if (loading) {
    return <div className="p-6 lg:p-10 max-w-[1400px] mx-auto bg-[#fdfdfd] min-h-screen"><div className="animate-pulse space-y-6"><div className="h-48 bg-gray-100 rounded-3xl"></div><div className="grid grid-cols-3 gap-6"><div className="col-span-2 h-96 bg-gray-100 rounded-3xl"></div><div className="h-96 bg-gray-100 rounded-3xl"></div></div></div></div>;
  }
  if (!community) {
    return <div className="p-6 lg:p-10 text-center py-20"><p className="text-gray-500 font-medium">Community not found.</p><Link to="/communities" className="text-[#5c4dff] font-bold text-sm mt-4 inline-block hover:underline">← Back to Communities</Link></div>;
  }

  const tabs = ['Overview', 'Discussions', 'Resources', 'Events', 'Members', 'About'];

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto animate-fade-in bg-[#fdfdfd] min-h-screen">
      {/* Back Link */}
      <Link to="/communities" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5c4dff] hover:text-[#4a3ddf] mb-6 transition-colors">
        <HiOutlineArrowLeft className="w-3.5 h-3.5" /> Back to Communities
      </Link>

      {/* Hero Banner Card */}
      <div className="bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] rounded-[32px] mb-8 overflow-hidden">
         <div className="p-8 relative">
            {/* Abstract bg graphics */}
            <div className="absolute top-0 right-0 w-64 h-full overflow-hidden pointer-events-none opacity-40">
               <div className="absolute top-[-50px] right-[-20px] w-48 h-48 bg-purple-100 rounded-full blur-3xl"></div>
               <div className="absolute bottom-[-20px] right-20 w-32 h-32 bg-blue-100 rounded-full blur-2xl"></div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
               <div className="flex gap-6 items-center md:items-start">
                  <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-indigo-900 to-[#5c4dff] flex items-center justify-center text-4xl text-white shadow-lg shrink-0">
                     {community.icon}
                  </div>
                  <div>
                     <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-black text-gray-900">{community.name}</h1>
                        <HiCheckCircle className="w-6 h-6 text-blue-500" />
                     </div>
                     <p className="text-[13px] font-medium text-gray-500 mb-4 max-w-lg leading-relaxed">
                        {community.description || 'A community for students to learn, build and grow together.'}
                     </p>
                     <div className="flex items-center gap-4 text-[11px] font-bold">
                        <span className="flex items-center gap-1.5 text-gray-600">
                           <HiOutlineUserGroup className="w-4 h-4" /> {(community.memberCount || 0).toLocaleString()} Members
                        </span>
                        <span className="flex items-center gap-1.5 text-emerald-500">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> 156 Online
                        </span>
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-3 self-start">
                  {isMember ? (
                     <button className="flex items-center gap-1.5 bg-[#5c4dff]/5 text-[#5c4dff] border border-[#5c4dff]/20 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#5c4dff]/10 transition-colors">
                        <HiCheckCircle className="w-4 h-4" /> Joined
                     </button>
                  ) : (
                     <button className="bg-[#5c4dff] hover:bg-[#4a3ddf] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">
                        Join Community
                     </button>
                  )}
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                     <HiOutlineBell className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                     <HiDotsHorizontal className="w-5 h-5" />
                  </button>
               </div>
            </div>
         </div>
         
         {/* Tabs */}
         <div className="flex items-center gap-8 px-8 border-t border-gray-100 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
               <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-[13px] font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === tab ? 'border-[#5c4dff] text-[#5c4dff]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
               >
                  {tab}
               </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* LEFT COLUMN: Main Content */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Post Composer */}
            {isMember && (
               <div className="bg-white border border-gray-100 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.02)] rounded-3xl p-5">
                  <form onSubmit={handlePost}>
                     <div className="flex gap-4 mb-4">
                        <Avatar name={user?.name} size="md" />
                        <input
                           type="text"
                           className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-4 text-[13px] font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all"
                           placeholder="Share something with the community..."
                           value={postContent}
                           onChange={(e) => setPostContent(e.target.value)}
                        />
                     </div>
                     <div className="flex items-center gap-3">
                        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                           <HiOutlineChatAlt2 className="w-4 h-4 text-blue-500" /> Discussion
                        </button>
                        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                           <HiOutlineDocumentText className="w-4 h-4 text-emerald-500" /> Resource
                        </button>
                        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                           <HiOutlineChartBar className="w-4 h-4 text-purple-500" /> Poll
                        </button>
                        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                           <HiOutlineCalendar className="w-4 h-4 text-rose-500" /> Event
                        </button>
                        <button type="submit" disabled={submitting || !postContent.trim()} className="hidden" />
                     </div>
                  </form>
               </div>
            )}

            {/* Pinned Post (Static representation matching mockup) */}
            <div>
               <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📌 Pinned Posts
               </h3>
               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -mt-10 -mr-10"></div>
                  <div className="flex items-start justify-between relative z-10">
                     <div className="flex items-center gap-3 mb-4">
                        <Avatar name="Admin" size="sm" />
                        <div>
                           <p className="text-[13px] font-bold text-gray-900 flex items-center gap-2">Rohit Verma <span className="text-[9px] text-[#5c4dff] bg-[#5c4dff]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Admin</span></p>
                           <p className="text-[10px] font-medium text-gray-500">2 days ago</p>
                        </div>
                     </div>
                     <HiOutlineBookmark className="w-5 h-5 text-[#5c4dff]" />
                  </div>
                  <h4 className="text-[15px] font-bold text-gray-900 mb-2 relative z-10">Welcome to {community.name} Community! 👋</h4>
                  <p className="text-xs font-medium text-gray-600 relative z-10 mb-4">
                     Introduce yourself, share your stack, and let's build an amazing community together.
                  </p>
                  <div className="flex items-center gap-6 relative z-10">
                     <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500"><HiOutlineHeart className="w-4 h-4"/> 56</div>
                     <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500"><HiOutlineChatAlt className="w-4 h-4"/> 24</div>
                  </div>
               </div>
            </div>

            {/* Recent Discussions */}
            <div>
               <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Discussions</h3>
               <div className="space-y-4">
                 {posts.length === 0 ? (
                   <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center">
                     <p className="text-4xl mb-3">🫙</p>
                     <p className="text-[13px] font-medium text-gray-500">No discussions yet. Start one!</p>
                   </div>
                 ) : posts.map((post) => (
                   <div key={post._id} className="bg-white border border-gray-100 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.02)] hover:shadow-md rounded-3xl p-6 transition-all">
                     <div className="flex items-start gap-4">
                       <Avatar name={post.author?.name} size="md" />
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between mb-2">
                           <div>
                              <span className="text-[13px] font-bold text-gray-900 block">{post.author?.name}</span>
                              <span className="text-[10px] font-medium text-gray-400">
                                {new Date(post.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} • {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                           </div>
                           <button className="text-gray-400 hover:text-gray-600"><HiDotsHorizontal className="w-5 h-5"/></button>
                         </div>
                         
                         <p className="text-[13px] text-gray-700 font-medium whitespace-pre-wrap leading-relaxed mb-4">{post.content}</p>

                         {/* Mockup shows small tag pills on posts */}
                         <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] font-bold text-[#5c4dff] bg-[#5c4dff]/5 px-2.5 py-1 rounded-md border border-[#5c4dff]/10">React.js</span>
                         </div>

                         {/* Post actions */}
                         <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                           <button
                             onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })}
                             className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf] transition-colors"
                           >
                             View all discussions →
                           </button>
                           
                           <div className="flex items-center gap-4">
                             <button
                               onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })}
                               className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
                             >
                               <HiOutlineChatAlt className="w-4 h-4" />
                               {post.comments?.length || 0}
                             </button>
                             <button
                               onClick={() => handlePostLike(post._id)}
                               className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${isPostLiked(post) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                             >
                               {isPostLiked(post) ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
                               {post.likeCount || 0}
                             </button>
                           </div>
                         </div>

                         {/* Comments section */}
                         {showComments[post._id] && (
                           <div className="mt-4 space-y-4">
                             {post.comments?.map((comment) => (
                               <CommentRow
                                 key={comment._id}
                                 comment={comment}
                                 postId={post._id}
                                 currentUserId={user?._id}
                                 onCommentLike={(commentId) => handleCommentLike(post._id, commentId)}
                                 onReplyAdded={(commentId, reply) => handleReplyAdded(post._id, commentId, reply)}
                                 onReplyLike={(commentId, replyId) => handleReplyLike(post._id, commentId, replyId)}
                               />
                             ))}

                             {/* New comment input */}
                             {isMember && (
                               <div className="flex gap-3 pt-2">
                                 <Avatar name={user?.name} size="sm" />
                                 <div className="flex-1 flex gap-2">
                                    <input
                                      type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5c4dff]/20 focus:border-[#5c4dff] transition-all"
                                      placeholder="Write a comment…"
                                      value={commentText[post._id] || ''}
                                      onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                    />
                                    <button onClick={() => handleAddComment(post._id)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold py-2 px-4 rounded-xl transition-all shrink-0">Send</button>
                                 </div>
                               </div>
                             )}
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
         </div>

         {/* RIGHT COLUMN: Sidebar */}
         <div className="space-y-6">
            
            {/* About Community */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
               <h3 className="text-[15px] font-bold text-gray-900 mb-3">About Community</h3>
               <p className="text-xs font-medium text-gray-600 leading-relaxed mb-6">
                  A place for developers to discuss, learn, share resources, and collaborate on exciting projects.
               </p>
               
               <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                     <span className="text-gray-500 font-medium">Created by</span>
                     <span className="font-bold text-gray-900 flex items-center gap-1.5"><Avatar name="Rohit" size="xs"/> Rohit Verma</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-gray-500 font-medium">Created on</span>
                     <span className="font-bold text-gray-900">15 Jan 2024</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-gray-500 font-medium">Category</span>
                     <span className="font-bold text-[#5c4dff] bg-[#5c4dff]/5 px-2 py-0.5 rounded border border-[#5c4dff]/10">Technology</span>
                  </div>
                  <div className="flex justify-between items-start">
                     <span className="text-gray-500 font-medium pt-1">Tags</span>
                     <div className="flex gap-1.5 flex-wrap justify-end">
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Web Development</span>
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Coding</span>
                     </div>
                  </div>
               </div>
               
               <div className="mt-6 pt-4 border-t border-gray-100">
                  <button className="text-[11px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View community info →</button>
               </div>
            </div>

            {/* Stats */}
            <div>
               <h3 className="text-sm font-bold text-gray-900 mb-4">Community Stats</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0"><HiOutlineUserGroup className="w-5 h-5"/></div>
                     <div>
                        <p className="text-sm font-black text-gray-900">2.4k</p>
                        <p className="text-[10px] font-medium text-gray-500">Members</p>
                     </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0"><HiOutlineStatusOnline className="w-5 h-5"/></div>
                     <div>
                        <p className="text-sm font-black text-gray-900">156</p>
                        <p className="text-[10px] font-medium text-gray-500">Online</p>
                     </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0"><HiOutlineChatAlt2 className="w-5 h-5"/></div>
                     <div>
                        <p className="text-sm font-black text-gray-900">87</p>
                        <p className="text-[10px] font-medium text-gray-500">Discussions</p>
                     </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0"><HiOutlineDocumentText className="w-5 h-5"/></div>
                     <div>
                        <p className="text-sm font-black text-gray-900">142</p>
                        <p className="text-[10px] font-medium text-gray-500">Resources</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Top Contributors */}
            <div>
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Top Contributors</h3>
                  <button className="text-[10px] font-bold text-[#5c4dff] hover:text-[#4a3ddf]">View all</button>
               </div>
               <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Avatar name="Rohit" size="sm" />
                        <div>
                           <p className="text-xs font-bold text-gray-900 flex items-center gap-2">Rohit Verma <span className="text-[9px] text-[#5c4dff] bg-[#5c4dff]/10 px-1.5 rounded-sm">Admin</span></p>
                        </div>
                     </div>
                     <span className="text-lg">👑</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Avatar name="Ananya" size="sm" />
                        <p className="text-xs font-bold text-gray-900">Ananya Gupta</p>
                     </div>
                     <span className="text-lg">🥈</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Avatar name="Siddharth" size="sm" />
                        <p className="text-xs font-bold text-gray-900">Siddharth Jain</p>
                     </div>
                     <span className="text-lg">🥉</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
