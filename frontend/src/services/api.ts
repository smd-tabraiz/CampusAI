import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Token expired or invalid
      // localStorage.removeItem('campusai_token');
    }
    return Promise.reject(error);
  }
);

export default api;

// API Service Call wrappers
export const campusApi = {
  // Auth
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),

  // AI Assistant
  chat: (data: { message: string; conversationId?: string }) => api.post('/ai/chat', data),
  classifyIntent: (text: string) => api.post('/ai/classify-intent', { text }),
  getConversations: () => api.get('/ai/conversations'),
  createConversation: (title?: string) => api.post('/ai/conversations', { title }),
  getConversation: (id: string) => api.get(`/ai/conversations/${id}`),

  // Navigation
  getLocations: (params?: { category?: string; search?: string }) => api.get('/locations', { params }),
  getLocationById: (id: string) => api.get(`/locations/${id}`),
  searchLocations: (q: string) => api.get('/locations/search', { params: { q } }),
  getRoute: (originId: string, destinationId: string, accessibleMode?: boolean) =>
    api.get('/navigation/route', { params: { originId, destinationId, accessibleMode: accessibleMode ? 'true' : 'false' } }),
  getBuildings: () => api.get('/buildings'),
  getFacilities: (params?: { category?: string }) => api.get('/facilities', { params }),

  // Lost & Found
  getLostFound: (params?: { type?: string; category?: string; status?: string }) => api.get('/lost-found', { params }),
  reportLost: (data: any) => api.post('/lost-found/lost', data),
  reportFound: (data: any) => api.post('/lost-found/found', data),
  getMatches: () => api.get('/lost-found/matches'),
  updateItemStatus: (type: 'lost' | 'found', id: string, status: string) =>
    api.put(`/lost-found/${type}/${id}/status`, { status }),

  // Cafeteria & Food
  getCafeterias: () => api.get('/cafeterias'),
  getCafeteriaDetails: (id: string) => api.get(`/cafeterias/${id}`),
  getFoodRecommendations: (params?: { maxBudget?: number; diet?: string; category?: string; search?: string }) =>
    api.get('/food/recommendations', { params }),
  getAllFoodItems: () => api.get('/food/items'),

  // Roommate Matcher
  getRoommateProfile: () => api.get('/roommates/profile'),
  saveRoommateProfile: (data: any) => api.post('/roommates/profile', data),
  getRoommateMatches: () => api.get('/roommates/matches'),
  connectRoommate: (targetUserId: string, message?: string) => api.post('/roommates/connect', { targetUserId, message }),
  getRoommateConnections: () => api.get('/roommates/connections'),
  respondRoommateConnection: (id: string, status: 'ACCEPTED' | 'DECLINED') =>
    api.put(`/roommates/connections/${id}`, { status }),

  // Events
  getEvents: (params?: { category?: string; filter?: string; search?: string }) => api.get('/events', { params }),
  getEventById: (id: string) => api.get(`/events/${id}`),
  createEvent: (data: any) => api.post('/events', data),
  rsvpEvent: (id: string) => api.post(`/events/${id}/rsvp`),
  deleteEvent: (id: string) => api.delete(`/events/${id}`),

  // Notifications
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/notifications/read-all'),

  // Admin
  getAdminAnalytics: () => api.get('/admin/analytics'),
  getAdminUsers: () => api.get('/admin/users'),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  getKnowledgeBase: () => api.get('/admin/knowledge-base'),
  createKnowledgeBase: (data: any) => api.post('/admin/knowledge-base', data),
  updateKnowledgeBase: (id: string, data: any) => api.put(`/admin/knowledge-base/${id}`, data),
  deleteKnowledgeBase: (id: string) => api.delete(`/admin/knowledge-base/${id}`)
};
