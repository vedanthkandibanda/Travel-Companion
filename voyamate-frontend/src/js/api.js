import axios from 'axios';

const api = axios.create({
  // This is your REAL deployed backend URL from your project file
  baseURL: "https://travel-companion-y8fn.onrender.com/api", 
});

// This part replaces your old manual token logic
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;