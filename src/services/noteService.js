import api from './api';

// Obter todas as notas do usuário
export const getAllNotes = async () => {
  try {
    const response = await api.get('/notes');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    
    // Criar algumas notas de teste para desenvolvimento caso a API falhe
    if (process.env.NODE_ENV === 'development') {
      console.log('Usando dados de teste para notas');
      return { 
        success: true, 
        notes: [
          { 
            id: '1', 
            title: 'Nota de teste 1', 
            content: 'Conteúdo da nota de teste 1',
            pinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          { 
            id: '2', 
            title: 'Nota de teste 2', 
            content: 'Conteúdo da nota de teste 2',
            pinned: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ] 
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

// Obter uma nota específica
export const getNoteById = async (id) => {
  try {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar nota ${id}:`, error);
    
    if (error.response && error.response.data) {
      return error.response.data;
    }
    
    return { 
      success: false, 
      message: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' 
    };
  }
};

// Criar uma nova nota
export const createNote = async (noteData) => {
  try {
    const response = await api.post('/notes', noteData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    
    // Simular criação de nota em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('Simulando criação de nota no ambiente de desenvolvimento');
      return { 
        success: true, 
        note: {
          id: Date.now().toString(),
          title: noteData.title,
          content: noteData.content || '',
          pinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
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

// Atualizar uma nota
export const updateNote = async (id, noteData) => {
  try {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar nota ${id}:`, error);
    
    // Simular atualização de nota em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('Simulando atualização de nota no ambiente de desenvolvimento');
      return { 
        success: true, 
        note: {
          id,
          ...noteData,
          updatedAt: new Date().toISOString()
        }
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

// Excluir uma nota
export const deleteNote = async (id) => {
  try {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao excluir nota ${id}:`, error);
    
    // Simular exclusão de nota em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('Simulando exclusão de nota no ambiente de desenvolvimento');
      return { success: true, message: 'Nota excluída com sucesso' };
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