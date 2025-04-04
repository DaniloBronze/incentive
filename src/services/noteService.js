import api from './api';
import * as authService from './authService';

// Dados de exemplo para fallback quando o backend não está disponível
const MOCK_NOTES = [
  {
    id: '1',
    title: 'Anotação de exemplo',
    content: '# Bem-vindo ao Incentive!\n\nEste é um exemplo de nota com formatação Markdown.\n\n## Recursos disponíveis:\n\n- Listas com marcadores\n- **Texto em negrito**\n- *Texto em itálico*\n- [Links](https://exemplo.com)\n\nTente criar suas próprias notas!',
    pinned: true,
    userId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Lista de compras',
    content: '## Compras da semana\n\n- Frutas\n  - Maçãs\n  - Bananas\n  - Uvas\n- Vegetais\n  - Cenoura\n  - Brócolis\n- Produtos de limpeza\n- Pão',
    pinned: false,
    userId: '1',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    title: 'Ideias para projetos',
    content: '1. Aplicativo de gerenciamento de tarefas ✅\n2. Website portfólio\n3. Blog pessoal\n4. Aplicativo de receitas\n\n> A criatividade é a inteligência se divertindo - Albert Einstein',
    pinned: false,
    userId: '1',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás 
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

// Obter todas as notas
export const getNotes = async () => {
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const response = await api.get('/notes');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    
    // Retornar dados de exemplo quando o backend não estiver disponível
    const user = authService.getCurrentUser();
    if (user) {
      console.log('Usando dados de exemplo para notas');
      // Simulamos um pequeno atraso para parecer que os dados estão sendo buscados
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        success: true,
        notes: MOCK_NOTES.map(note => ({
          ...note,
          userId: user.id
        }))
      };
    }
    
    return {
      success: false,
      message: 'Não foi possível carregar as notas. Tente novamente mais tarde.',
      notes: []
    };
  }
};

// Obter uma nota específica
export const getNote = async (id) => {
  try {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar nota:', error);
    
    // Verificar se é uma nota de exemplo
    const user = authService.getCurrentUser();
    if (user) {
      const mockNote = MOCK_NOTES.find(note => note.id === id);
      if (mockNote) {
        return {
          success: true,
          note: {
            ...mockNote,
            userId: user.id
          }
        };
      }
    }
    
    return {
      success: false,
      message: 'Não foi possível carregar a nota. Tente novamente mais tarde.'
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
    
    // Simular criação de nota quando o backend não está disponível
    const user = authService.getCurrentUser();
    if (user) {
      const newNote = {
        id: Date.now().toString(),
        ...noteData,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Adicionar na lista local (apenas para esta sessão)
      MOCK_NOTES.unshift(newNote);
      
      return {
        success: true,
        note: newNote
      };
    }
    
    return {
      success: false,
      message: 'Não foi possível criar a nota. Tente novamente mais tarde.'
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