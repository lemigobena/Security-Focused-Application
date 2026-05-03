export const MOCK_DELAY = 500;

let failedAttempts = 0;
let lockUntil = null;
let currentRole = 'Guest'; // 'Guest', 'User', 'Admin'

const DEFAULT_POSTS = [
  { id: 1, title: "Introduction to STRIDE", body: "STRIDE is a threat modeling framework...", author: "Admin" },
  { id: 2, title: "XSS Demo Post", body: "This post shouldn't execute: <script>alert('XSS Exploit!');</script>", author: "User" },
];

const DEFAULT_LOGS = [
  { id: 1, action: "LOGIN_FAILURE", entity: "Account", ip: "192.168.1.55", timestamp: new Date().toISOString() },
  { id: 2, action: "Post Created", entity: "Post::1", userId: "admin", timestamp: new Date().toISOString() },
];

const DEFAULT_USERS = [
  { username: 'admin', password: 'P@ssw0rd123!', role: 'Admin' },
  { username: 'user', password: 'Us3rP@ss!', role: 'User' }
];

// Load from LocalStorage or use defaults
let mockPosts = JSON.parse(localStorage.getItem('gp6_posts')) || DEFAULT_POSTS;
let mockLogs = JSON.parse(localStorage.getItem('gp6_logs')) || DEFAULT_LOGS;
let mockUsers = JSON.parse(localStorage.getItem('gp6_users')) || DEFAULT_USERS;

const syncLogs = () => localStorage.setItem('gp6_logs', JSON.stringify(mockLogs));
const syncUsers = () => localStorage.setItem('gp6_users', JSON.stringify(mockUsers));
const syncPosts = () => localStorage.setItem('gp6_posts', JSON.stringify(mockPosts));

const wait = (ms) => new Promise(res => setTimeout(res, ms));

export const mockApi = {
  // --- Auth ---
  login: async (username, password) => {
    await wait(MOCK_DELAY);
    const now = new Date().getTime();

    // Check if account is locked
    if (lockUntil && now < lockUntil) {
      throw new Error(`Account locked. Try again in 15 minutes.`);
    }

    // Mock successful login against the mockUsers array
    const userMatch = mockUsers.find(u => u.username === username && u.password === password);
    
    if (userMatch) {
      failedAttempts = 0;
      currentRole = userMatch.role;
      return { success: true, role: currentRole, token: "mock-session-cookie" };
    } 

    // Fail case
    failedAttempts++;
    if (failedAttempts >= 5) {
      lockUntil = now + 15 * 60 * 1000; // 15 mins
      mockLogs.push({ id: Date.now(), action: "LOGIN_FAILURE", entity: username, ip: "127.0.0.1", timestamp: new Date().toISOString() });
      syncLogs();
      throw new Error(`Account locked. Try again in 15 minutes.`);
    }

    throw new Error('Invalid credentials');
  },
  
  register: async (username, email, password) => {
    await wait(MOCK_DELAY);
    
    // Check if user already exists
    if (mockUsers.some(u => u.username === username)) {
      throw new Error("Username already taken.");
    }
    
    // Save to memory array so they can immediately log in
    mockUsers.push({ username, password, role: 'User' });
    syncUsers();
    
    mockLogs.push({ id: Date.now(), action: "User Registered", entity: username, ip: "127.0.0.1", timestamp: new Date().toISOString() });
    syncLogs();
    return { success: true, message: "Registration successful" };
  },

  logout: async () => {
    await wait(MOCK_DELAY);
    currentRole = 'Guest';
    return { success: true };
  },

  getCurrentRole: () => currentRole,

  // --- Posts ---
  getPosts: async (searchQuery = "") => {
    await wait(MOCK_DELAY);
    // Simulate SQLi block
    if (searchQuery.includes("'") || searchQuery.includes("--") || searchQuery.includes("=")) {
      // Return empty array to represent parameterized query blocking the payload from returning weird results
      return []; 
    }
    
    if (searchQuery) {
      return mockPosts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.body.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return [...mockPosts];
  },

  createPost: async (title, body, author) => {
    await wait(MOCK_DELAY);
    if (currentRole === 'Guest') throw new Error("Unauthorized");
    const newPost = { id: Date.now(), title, body, author };
    mockPosts.push(newPost);
    syncPosts();
    
    mockLogs.push({ id: Date.now(), action: "Post Created", entity: `Post::${title}`, userId: author, timestamp: new Date().toISOString() });
    syncLogs();
    
    return newPost;
  },

  deletePost: async (title) => {
    await wait(MOCK_DELAY);
    if (currentRole !== 'Admin') throw new Error("Unauthorized restriction: Only Admins can delete data.");
    
    // Remove the post matching the title
    mockPosts = mockPosts.filter(p => p.title !== title);
    syncPosts();
    
    // Log the deletion action
    mockLogs.push({ id: Date.now(), action: "Post Deleted", entity: `Post::${title}`, userId: 'Admin', timestamp: new Date().toISOString() });
    syncLogs();
    
    return { success: true };
  },

  // --- Admin ---
  getLogs: async () => {
    await wait(MOCK_DELAY);
    if (currentRole !== 'Admin') throw new Error("Forbidden");
    return [...mockLogs].reverse(); // newest first
  }
};
