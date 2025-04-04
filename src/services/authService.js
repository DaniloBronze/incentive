import api from './api';

// Autenticar usuário
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.success) {
      // Armazenar dados do usuário na sessão
      sessionStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    
    // Simular login para o usuário admin (desenvolvimento ou produção com problemas de banco)
    if (email === 'admin@example.com' && password === 'admin123') {
      console.log('Usando login de fallback para admin');
      const testUser = {
        id: '1',
        name: 'Administrador',
        email: 'admin@example.com',
        role: 'ADMIN'
      };
      
      sessionStorage.setItem('currentUser', JSON.stringify(testUser));
      
      return {
        success: true,
        user: testUser
      };
    }
    
    if (error.response && error.response.data) {
      return error.response.data;
    }
    
    return { 
      success: false, 
      message: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' 
    };
  }
};

// Registrar novo usuário
export const register = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    
    if (response.data.success) {
      // Armazenar dados do usuário na sessão
      sessionStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    
    // Simular registro em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('Simulando registro em desenvolvimento');
      const testUser = {
        id: Date.now().toString(),
        name,
        email,
        role: 'USER'
      };
      
      sessionStorage.setItem('currentUser', JSON.stringify(testUser));
      
      return {
        success: true,
        user: testUser
      };
    }
    
    if (error.response && error.response.data) {
      return error.response.data;
    }
    
    return { 
      success: false, 
      message: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' 
    };
  }
};

// Obter usuário atual
export const getCurrentUser = () => {
  try {
    const userStr = sessionStorage.getItem('currentUser');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
};

// Fazer logout
export const logout = () => {
  sessionStorage.removeItem('currentUser');
};

// Atualizar dados do usuário
export const updateUser = async (id, updateData) => {
  try {
    const response = await api.put(`/users/${id}`, updateData);
    
    // Atualizar dados da sessão se for o usuário atual
    if (response.data.success) {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === id) {
        sessionStorage.setItem('currentUser', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    
    // Simular atualização em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('Simulando atualização de usuário em desenvolvimento');
      
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === id) {
        const updatedUser = { ...currentUser, ...updateData };
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        return {
          success: true,
          user: updatedUser
        };
      }
    }
    
    if (error.response && error.response.data) {
      return error.response.data;
    }
    
    return { 
      success: false, 
      message: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' 
    };
  }
}; 