import axios from 'axios';

// Determinar a URL da API baseada no ambiente
const API_URL = process.env.NODE_ENV === 'production'
  ? '/api' // Na Vercel, usaremos caminhos relativos
  : 'http://localhost:5000/api';

// Cria uma instância do axios com baseURL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir userId em todas as requisições
api.interceptors.request.use((config) => {
  const userStr = sessionStorage.getItem('currentUser');
  
  if (userStr) {
    const user = JSON.parse(userStr);
    
    // Somente adiciona userId se ainda não estiver presente
    // Adiciona userId à URL para requisições GET/DELETE
    if (config.method === 'get' || config.method === 'delete') {
      if (!config.params) {
        config.params = {};
      }
      
      // Somente adiciona userId se já não estiver presente na requisição
      if (!config.params.userId) {
        config.params.userId = user.id;
      }
    } 
    // Adiciona userId ao corpo para requisições POST/PUT/PATCH
    else if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
      if (!config.data) {
        config.data = {};
      }
      
      // Adiciona userId ao corpo da requisição apenas se não estiver presente
      if (!config.data.userId) {
        config.data.userId = user.id;
      }
    }
  }
  
  return config;
});

export default api; 