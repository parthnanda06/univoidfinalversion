import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('univoid_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('univoid_token');
      localStorage.removeItem('univoid_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// Users
export const getProfile = () => API.get('/users/profile');
export const updateProfile = (data) => API.put('/users/profile', data);
export const searchUsers = (q, page = 1) => API.get('/users/search', { params: { q, page, limit: 20 } });
export const getUserById = (id) => API.get(`/users/${id}`);
// Connection requests
export const getConnectionRequests = () => API.get('/users/connection-requests');
export const sendConnectionRequest = (id) => API.post(`/users/${id}/request`);
export const cancelConnectionRequest = (id) => API.delete(`/users/${id}/request`);
export const acceptConnectionRequest = (id) => API.post(`/users/${id}/accept`);
export const declineConnectionRequest = (id) => API.post(`/users/${id}/decline`);
export const removeConnection = (id) => API.delete(`/users/${id}/connection`);
// Legacy toggle (keep for backwards compat)
export const connectUser = (id) => API.post(`/users/${id}/connect`);


// Notes
export const getNotes = (params) => API.get('/notes', { params });
export const getNote = (id) => API.get(`/notes/${id}`);
export const createNote = (data) => API.post('/notes', data);
export const deleteNote = (id) => API.delete(`/notes/${id}`);
export const trackDownload = (id) => API.put(`/notes/${id}/download`);

// Communities
export const getCommunities = () => API.get('/communities');
export const getCommunity = (id) => API.get(`/communities/${id}`);
export const createCommunity = (data) => API.post('/communities', data);
export const joinCommunity = (id) => API.post(`/communities/${id}/join`);
export const leaveCommunity = (id) => API.post(`/communities/${id}/leave`);
export const getCommunityPosts = (id) => API.get(`/communities/${id}/posts`);
export const createPost = (id, data) => API.post(`/communities/${id}/posts`, data);
export const likePost = (postId) => API.post(`/communities/posts/${postId}/like`);
export const commentOnPost = (postId, data) => API.post(`/communities/posts/${postId}/comment`, data);
export const likeComment = (postId, commentId) => API.post(`/communities/posts/${postId}/comments/${commentId}/like`);
export const replyToComment = (postId, commentId, data) => API.post(`/communities/posts/${postId}/comments/${commentId}/reply`, data);
export const likeReply = (postId, commentId, replyId) => API.post(`/communities/posts/${postId}/comments/${commentId}/replies/${replyId}/like`);

// Events
export const getEvents = (params) => API.get('/events', { params });
export const getEvent = (id) => API.get(`/events/${id}`);
export const createEvent = (data) => API.post('/events', data);
export const registerForEvent = (id) => API.post(`/events/${id}/register`);

// Jobs
export const getJobs            = (params) => API.get('/jobs', { params });
export const getJob             = (id)     => API.get(`/jobs/${id}`);
export const applyToJob         = (id, data) => API.post(`/jobs/${id}/apply`, data);
export const withdrawApplication= (id)     => API.delete(`/jobs/${id}/apply`);
// HR
export const getHRJobs          = ()       => API.get('/jobs/hr/posted');
export const createJob          = (data)   => API.post('/jobs', data);
export const updateJob          = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteJob          = (id)     => API.delete(`/jobs/${id}`);
export const getApplicants      = (id)     => API.get(`/jobs/${id}/applicants`);
export const updateAppStatus    = (jobId, appId, status) => API.patch(`/jobs/${jobId}/applicants/${appId}`, { status });

// Dashboard
export const getDashboard = () => API.get('/dashboard');

// Chat
export const getConversations = () => API.get('/chat/conversations');
export const getChatMessages = (userId, page = 1) => API.get(`/chat/${userId}`, { params: { page } });
export const sendChatMessage = (userId, text) => API.post(`/chat/${userId}`, { text });

export default API;

