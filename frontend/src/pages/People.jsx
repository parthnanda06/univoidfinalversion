import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers, sendConnectionRequest, cancelConnectionRequest, getConnectionRequests, removeConnection } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch, HiOutlineUserAdd, HiOutlineUserRemove, HiOutlineClock,
  HiOutlineAcademicCap, HiOutlineLocationMarker, HiOutlineRefresh,
  HiOutlineChatAlt2,
} from 'react-icons/hi';

/* ─── User Card ─────────────────────────────────────── */
const UserCard = ({ person, currentUser, onConnect, pendingOutIds, onPendingChange }) => {
  const [loading, setLoading] = useState(false);
  const { openChat } = useChat();
  const isConnected = currentUser?.connections?.map(String)?.includes(person._id);
  const isPending = pendingOutIds.includes(person._id);

  const handleConnect = async (e) => {
    e.preventDefault(); e.stopPropagation();
    setLoading(true);
    try {
      if (isPending) {
        await cancelConnectionRequest(person._id);
        onPendingChange(person._id, false);
        toast.success('Request cancelled');
      } else {
        await sendConnectionRequest(person._id);
        onPendingChange(person._id, true);
        toast.success('Connection request sent!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not process request');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (e) => {
    e.preventDefault(); e.stopPropagation();
    setLoading(true);
    try {
      await removeConnection(person._id);
      onConnect(person._id, false); // update parent list
      toast.success('Connection removed');
    } catch {
      toast.error('Could not remove connection');
    } finally {
      setLoading(false);
    }
  };

  const initials = person.name?.charAt(0).toUpperCase();

  return (
    <Link
      to={`/people/${person._id}`}
      className="glass-card rounded-2xl p-5 flex flex-col gap-4 hover:ring-1 hover:ring-primary-500/30 hover:bg-surface-800/30 transition-all duration-300 group animate-fade-in cursor-pointer block"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        {person.avatar ? (
          <img src={person.avatar} alt={person.name} className="w-14 h-14 rounded-xl object-cover ring-2 ring-primary-500/20 shrink-0 group-hover:ring-primary-500/40 transition-all" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-white group-hover:text-primary-300 transition-colors truncate">
            {person.name}
          </p>
          {person.headline ? (
            <p className="text-xs text-accent-300 mt-0.5 line-clamp-2">{person.headline}</p>
          ) : (
            <p className="text-xs text-surface-400 mt-0.5 italic">No headline</p>
          )}
        </div>
        {person.openToWork && (
          <span className="shrink-0 text-[9px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Open
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="space-y-1.5">
        {(person.college || person.branch || person.year) && (
          <div className="flex items-start gap-1.5 text-xs text-surface-300">
            <HiOutlineAcademicCap className="w-3.5 h-3.5 text-primary-400 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{[person.college, person.branch, person.year].filter(Boolean).join(' · ')}</span>
          </div>
        )}
        {person.location && (
          <div className="flex items-center gap-1.5 text-xs text-surface-300">
            <HiOutlineLocationMarker className="w-3.5 h-3.5 text-accent-400 shrink-0" />
            <span>{person.location}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {person.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {person.skills.slice(0, 4).map(s => (
            <span key={s} className="text-[10px] bg-primary-500/10 text-primary-300 border border-primary-500/15 px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
          {person.skills.length > 4 && (
            <span className="text-[10px] text-surface-500">+{person.skills.length - 4} more</span>
          )}
        </div>
      )}

      {/* Stats + action */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex gap-4 text-xs text-surface-400">
          <span><strong className="text-white">{person.connections?.length ?? 0}</strong> connections</span>
          <span><strong className="text-white">{person.followers?.length ?? 0}</strong> followers</span>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-2">
            {/* Message button */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openChat(person); }}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 bg-primary-500/20 text-primary-300 border border-primary-500/30 hover:bg-primary-500/30"
            >
              <HiOutlineChatAlt2 className="w-3.5 h-3.5" /> Message
            </button>
            {/* Remove connection */}
            <button
              onClick={handleRemove}
              disabled={loading}
              className="group/rm flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/25"
            >
              {loading
                ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <>
                    <span className="group-hover/rm:hidden">✓ Connected</span>
                    <span className="hidden group-hover/rm:inline">✕ Remove</span>
                  </>
              }
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
              isPending
                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                : 'bg-primary-500/20 text-primary-300 border border-primary-500/30 hover:bg-primary-500/30'
            }`}
          >
            {loading ? (
              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPending ? (
              <><HiOutlineClock className="w-3.5 h-3.5" /> Pending · Cancel</>
            ) : (
              <><HiOutlineUserAdd className="w-3.5 h-3.5" /> Connect</>
            )}
          </button>
        )}
      </div>
    </Link>
  );
};

/* ─── Main Page ─────────────────────────────────────── */
const People = () => {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pendingOutIds, setPendingOutIds] = useState([]); // IDs of users we sent a request to
  const debounceRef = useRef(null);

  // Load outgoing pending requests once
  useEffect(() => {
    getConnectionRequests().then(({ data }) => {
      setPendingOutIds((data.outgoing || []).map(r => String(r.to._id || r.to)));
    }).catch(() => {});
  }, []);

  const fetchUsers = useCallback(async (q, pg = 1) => {
    setLoading(true);
    try {
      const { data } = await searchUsers(q, pg);
      setUsers(pg === 1 ? data.users : prev => [...prev, ...data.users]);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load people');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers(query, 1);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchUsers]);

  const handleConnect = (id, connected) => {
    setUsers(prev => prev.map(u => {
      if (u._id !== id) return u;
      const myId = currentUser._id;
      const connections = connected
        ? [...(u.connections || []), myId]
        : (u.connections || []).filter(c => String(c) !== String(myId));
      return { ...u, connections };
    }));
  };

  const handlePendingChange = (id, isPending) => {
    setPendingOutIds(prev => isPending ? [...prev, id] : prev.filter(x => x !== id));
  };

  const loadMore = () => { if (page < pages && !loading) fetchUsers(query, page + 1); };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">🔍 Find People</h1>
        <p className="text-surface-400 text-sm">Discover students, collaborators, and fellow learners across UniVoid.</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 pointer-events-none" />
        <input
          id="people-search-input"
          type="search"
          placeholder="Search by name, college, branch, skill, or location…"
          className="input-field pl-12 pr-4 py-3.5 text-base w-full rounded-2xl"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-surface-400">
          {loading && users.length === 0 ? 'Searching…' : `${total} people found`}
          {query && <span className="text-primary-400 ml-1">for "{query}"</span>}
        </p>
        {query && (
          <button onClick={() => setQuery('')} className="text-xs text-surface-400 hover:text-white flex items-center gap-1 transition-colors">
            <HiOutlineRefresh className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {users.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {users.map(person => (
              <UserCard
                key={person._id}
                person={person}
                currentUser={currentUser}
                onConnect={handleConnect}
                pendingOutIds={pendingOutIds}
                onPendingChange={handlePendingChange}
              />
            ))}
          </div>

          {/* Load more */}
          {page < pages && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="btn-secondary flex items-center gap-2 px-6 py-2.5"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : !loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🧑‍🎓</div>
          <p className="text-lg font-semibold text-white mb-2">No people found</p>
          <p className="text-sm text-surface-400">
            {query ? `Try searching something different` : 'No other users yet. Invite your friends!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse space-y-3">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-surface-800" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-surface-800 rounded w-3/4" />
                  <div className="h-2 bg-surface-800 rounded w-1/2" />
                </div>
              </div>
              <div className="h-2 bg-surface-800 rounded w-full" />
              <div className="h-2 bg-surface-800 rounded w-5/6" />
              <div className="flex gap-2">
                {[1, 2, 3].map(j => <div key={j} className="h-5 bg-surface-800 rounded-full w-16" />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default People;
