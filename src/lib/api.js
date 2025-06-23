import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api"

// Create axios instance with credentials support
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for session cookies
})

// Handle token expiration and session issues
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if we're not already on the login page
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      // Clear any stored auth data and redirect to login
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
}

// Chat API
export const chatAPI = {
  getChats: () => api.get("/chats"),
  getChat: (chatId) => api.get(`/chats/${chatId}`),
  createChat: (title) => api.post("/chats", { title }),
  updateChat: (chatId, data) => api.put(`/chats/${chatId}`, data),
  deleteChat: (chatId) => api.delete(`/chats/${chatId}`),
}

// Message API
export const messageAPI = {
  getMessages: (chatId) => api.get(`/messages/${chatId}`),
  sendMessage: (chatId, content) => api.post(`/messages/${chatId}`, { content }),
}

// Helper function to get the correct backend URL
export const getBackendUrl = () => {
  // In development, always use localhost:5000
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5000"
  }

  // In production, you might want to use environment variables
  return process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"
}

export default api
