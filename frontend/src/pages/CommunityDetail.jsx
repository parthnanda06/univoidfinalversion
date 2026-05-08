import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getCommunity, getCommunityPosts, createPost,
  likePost, commentOnPost, likeComment, replyToComment, likeReply,
} from '../services/api';
import {
  HiOutlineHeart, HiHeart, HiOutlineChatAlt, HiOutlineArrowLeft,
} from 'react-icons/hi';
import { HiArrowUturnLeft } from 'react-icons/hi2';
import toast from 'react-hot-toast';

/* ─── helpers ─────────────────────────────────────── */
const Avatar = ({ name, size = 'sm' }) => {
  const s = size === 'xs' ? 'w-5 h-5 text-[9px]' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-xs';
  return (
    <div className={`${s} rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shrink-0`}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
};

/* ─── Reply row ────────────────────────────────────── */
const ReplyRow = ({ reply, postId, commentId, currentUserId, onLike }) => {
  const liked = reply.likes?.some(l => (l._id || l) === currentUserId);
  return (
    <div className="flex items-start gap-2 pl-2 border-l-2 border-primary-500/20">
      <Avatar name={reply.author?.name} size="xs" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-semibold text-white">{reply.author?.name || 'User'}</span>
          <span className="text-[9px] text-surface-700">
            {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
          </span>
        </div>
        <p className="text-xs text-surface-200 whitespace-pre-wrap">{reply.text}</p>
        {/* Like button on reply */}
        <button
          onClick={() => onLike(reply._id)}
          className={`mt-1 flex items-center gap-1 text-[10px] transition-colors ${liked ? 'text-red-400' : 'text-surface-700 hover:text-red-400'}`}
        >
          {liked ? <HiHeart className="w-3 h-3" /> : <HiOutlineHeart className="w-3 h-3" />}
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
    <div className="space-y-2">
      {/* Comment body */}
      <div className="flex items-start gap-2">
        <Avatar name={comment.author?.name} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-semibold text-white">{comment.author?.name || 'User'}</span>
            <span className="text-[9px] text-surface-700">
              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
            </span>
          </div>
          <p className="text-xs text-surface-200 whitespace-pre-wrap">{comment.text}</p>

          {/* Actions: like + reply */}
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={() => onCommentLike(comment._id)}
              className={`flex items-center gap-1 text-[10px] transition-colors ${liked ? 'text-red-400' : 'text-surface-700 hover:text-red-400'}`}
            >
              {liked ? <HiHeart className="w-3.5 h-3.5" /> : <HiOutlineHeart className="w-3.5 h-3.5" />}
              {comment.likeCount || 0}
            </button>
            <button
              onClick={() => setShowReplyInput(r => !r)}
              className="flex items-center gap-1 text-[10px] text-surface-700 hover:text-primary-400 transition-colors"
            >
              <HiArrowUturnLeft className="w-3 h-3" />
              Reply
            </button>
            {replyCount > 0 && (
              <button
                onClick={() => setShowReplies(r => !r)}
                className="flex items-center gap-1 text-[10px] text-surface-700 hover:text-accent-400 transition-colors"
              >
                <HiOutlineChatAlt className="w-3 h-3" />
                {showReplies ? 'Hide' : `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReplyInput && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                className="input-field text-xs py-1.5 flex-1"
                placeholder={`Reply to ${comment.author?.name || 'comment'}…`}
                value={replyText}
                autoFocus
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReplySubmit()}
              />
              <button
                onClick={handleReplySubmit}
                disabled={submitting || !replyText.trim()}
                className="btn-primary text-[10px] py-1.5 px-3 shrink-0"
              >
                {submitting ? '…' : 'Send'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {showReplies && replyCount > 0 && (
        <div className="ml-9 space-y-2">
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
    return <div className="p-6 lg:p-8"><div className="animate-pulse space-y-4"><div className="h-20 bg-surface-800 rounded-2xl"></div><div className="h-40 bg-surface-800 rounded-2xl"></div></div></div>;
  }
  if (!community) {
    return <div className="p-6 lg:p-8 text-center py-20"><p className="text-surface-200">Community not found.</p><Link to="/communities" className="text-primary-400 text-sm mt-2 inline-block">← Back</Link></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto animate-fade-in">
      {/* Back */}
      <Link to="/communities" className="inline-flex items-center gap-1 text-xs text-surface-700 hover:text-primary-400 mb-6 transition-colors">
        <HiOutlineArrowLeft className="w-3.5 h-3.5" /> Back to communities
      </Link>

      {/* Community header */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{community.icon}</span>
          <div>
            <h1 className="text-xl font-bold text-white">{community.name}</h1>
            <p className="text-sm text-surface-200">{community.description}</p>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-surface-700">
              <span>{community.memberCount} members</span>
              <span>•</span>
              <span>{community.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Post form */}
      {isMember && (
        <form onSubmit={handlePost} className="glass-card rounded-2xl p-5 mb-6">
          <textarea
            className="input-field mb-3" rows="3"
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
          <div className="flex justify-end">
            <button type="submit" disabled={submitting || !postContent.trim()} className="btn-primary text-xs">
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">🫙</p>
            <p className="text-sm text-surface-200">No posts yet. {isMember ? 'Start the conversation!' : 'Join to post.'}</p>
          </div>
        ) : posts.map((post) => (
          <div key={post._id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Avatar name={post.author?.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{post.author?.name}</span>
                  <span className="text-[10px] text-surface-700">
                    {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-sm text-surface-200 whitespace-pre-wrap mb-3">{post.content}</p>

                {/* Post actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePostLike(post._id)}
                    className={`flex items-center gap-1 text-xs transition-colors ${isPostLiked(post) ? 'text-red-400' : 'text-surface-700 hover:text-red-400'}`}
                  >
                    {isPostLiked(post) ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
                    {post.likeCount || 0}
                  </button>
                  <button
                    onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })}
                    className="flex items-center gap-1 text-xs text-surface-700 hover:text-primary-400 transition-colors"
                  >
                    <HiOutlineChatAlt className="w-4 h-4" />
                    {post.comments?.length || 0}
                  </button>
                </div>

                {/* Comments section */}
                {showComments[post._id] && (
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-4">
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
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text" className="input-field text-xs py-2"
                          placeholder="Write a comment…"
                          value={commentText[post._id] || ''}
                          onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                        />
                        <button onClick={() => handleAddComment(post._id)} className="btn-secondary text-[10px] py-1.5 px-3 shrink-0">Send</button>
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
  );
};

export default CommunityDetail;
