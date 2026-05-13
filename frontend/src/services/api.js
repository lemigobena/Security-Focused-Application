import axios from "axios";

// Configure Axios instance
const apiClient = axios.create({
  baseURL: "/api", // Using Vite proxy
  withCredentials: true, // Crucial for sending/receiving cookies (JWT)
  timeout: 15000, // Increased timeout for stability with new adapter
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to handle global errors (like 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we want to automatically clear state on 401, we could dispatch an event here.
    // For now, we'll just reject the promise so the component can handle it.
    return Promise.reject(error.response?.data?.error || error.response?.data?.message || error.message);
  },
);

export const api = {
  // --- Auth ---
  login: async (email, password, agreedToTerms) => {
    const response = await apiClient.post("/auth/login", { email, password, agreedToTerms });
    return response.data;
  },

  register: async (username, email, password, agreedToTerms) => {
    const response = await apiClient.post("/auth/register", {
      username,
      email,
      password,
      agreedToTerms,
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data; // { user: { id, username, email, role, ... } }
  },

  // --- Posts ---
  getPosts: async (search = "", fileType = "") => {
    const response = await apiClient.get("/posts", {
      params: { search, fileType },
    });
    return response.data;
  },

  getActiveUsers: async () => {
    const response = await apiClient.get("/posts/active-users");
    return response.data;
  },

  createPost: async (title, body, fileId) => {
    const response = await apiClient.post("/posts", { title, body, fileId });
    return response.data;
  },

  // --- Files ---
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data; // { file: { id, path, ... } }
  },

  // --- Profiles & Settings ---
  getProfile: async (username) => {
    const response = await apiClient.get(`/profiles/${username}`);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.patch("/profiles/me", data);
    return response.data;
  },

  updateSettings: async (data) => {
    const response = await apiClient.patch("/profiles/settings", data);
    return response.data;
  },

  updatePassword: async (data) => {
    const response = await apiClient.patch("/profiles/password", data);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await apiClient.delete("/profiles/me");
    return response.data;
  },

  // --- Bookmarks ---
  toggleBookmark: async (postId) => {
    const response = await apiClient.post("/bookmarks/toggle", { postId });
    return response.data;
  },

  getBookmarks: async () => {
    const response = await apiClient.get("/bookmarks/my-bookmarks");
    return response.data;
  },

  // --- Admin ---
  getUsers: async () => {
    const response = await apiClient.get("/admin/users");
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get("/admin/stats");
    return response.data;
  },

  getLogs: async (category = "") => {
    const response = await apiClient.get("/admin/logs", {
      params: { category },
    });
    return response.data;
  },

  suspendUser: async (id, suspended) => {
    const response = await apiClient.patch(`/admin/users/${id}/suspend`, {
      suspended,
    });
    return response.data;
  },

  suspendPost: async (id, suspended) => {
    const response = await apiClient.patch(`/admin/posts/${id}/suspend`, {
      suspended,
    });
    return response.data;
  },
};
