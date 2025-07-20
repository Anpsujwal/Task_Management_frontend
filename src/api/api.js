import axios from 'axios';

const api = axios.create({
  baseURL: 'https://task-management-server-phi-ten.vercel.app/', 
});

export default api;

