import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

api.interceptors.response.use(res => res, err => {
  if (err.response && err.response.status === 401) {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('token'); // Limpar token legado
    window.location.hash = '#/login';
  }
  return Promise.reject(err);
});

export default api;
