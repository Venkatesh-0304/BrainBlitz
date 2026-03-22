import axios from 'axios';

const API = axios.create({
  baseURL: 'https://brainblitz-server.onrender.com/api', // ✅ your render URL
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;