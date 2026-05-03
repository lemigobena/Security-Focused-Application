import axios from 'axios';

// Configure Axios instance
const apiClient = axios.create({
  baseURL: '/api', // Using Vite proxy
  withCredentials: true, // Crucial for sending/receiving cookies (JWT)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to handle global errors (like 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we want to automatically clear state on 401, we could dispatch an event here.
    // For now, we'll just reject the promise so the component can handle it.
    return Promise.reject(error.response?.data?.message || error.message);
  }
);

export const api = {
  // --- Auth ---
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data; // { message, user: { id, username, role } }
  },
  
  register: async (username, email, password) => {
    const response = await apiClient.post('/auth/register', { username, email, password });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data; // { user: { id, username, role } }
  },

  // --- Posts ---
  getPosts: async (searchQuery = "") => {
    // Let's pass the search query as a param if backend supported it, else just fetch all.
    // Our backend route is simple, but we can filter it locally or send as query.
    const response = await apiClient.get('/posts', { params: { search: searchQuery } });
    
    // Filter locally if backend doesn't support search param
    let posts = response.data;
    if (searchQuery) {
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.body.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return posts;
  },

  createPost: async (title, body, author) => {
    // Since we use the auth token, the backend knows the author, but we can still pass it if schema requires
    const response = await apiClient.post('/posts', { title, body });
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await apiClient.delete(`/admin/posts/${postId}`);
    return response.data;
  },

  // --- Admin ---
  getLogs: async () => {
    const response = await apiClient.get('/admin/logs');
    return response.data; // Array of logs
  }
};
