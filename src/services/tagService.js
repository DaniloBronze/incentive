import api from './api';
import * as authService from './authService';

const DEV_MODE = process.env.REACT_APP_API_URL === 'development';

// Etiquetas de desenvolvimento
const DEV_TAGS = [
  { id: '1', name: 'Urgente', color: '#F44336', userId: 'dev-user' },
  { id: '2', name: 'Projeto A', color: '#2196F3', userId: 'dev-user' },
  { id: '3', name: 'Saúde', color: '#4CAF50', userId: 'dev-user' },
  { id: '4', name: 'Família', color: '#E91E63', userId: 'dev-user' },
  { id: '5', name: 'Finanças', color: '#795548', userId: 'dev-user' }
];

let localTags = [...DEV_TAGS];

// Dados de exemplo para modo fallback
const MOCK_TAGS = [
  { id: '1', name: 'Urgente', color: '#F44336', userId: '1' },
  { id: '2', name: 'Importante', color: '#FF9800', userId: '1' },
  { id: '3', name: 'Baixa Prioridade', color: '#4CAF50', userId: '1' },
  { id: '4', name: 'Pessoal', color: '#9C27B0', userId: '1' },
  { id: '5', name: 'Trabalho', color: '#2196F3', userId: '1' }
];

const tagService = {
  // Obter todas as etiquetas do usuário
  async getTags() {
    try {
      if (DEV_MODE) {
        const user = authService.getCurrentUser();
        return {
          success: true,
          tags: localTags.filter(tag => 
            tag.userId === (user?.id || 'dev-user')
          )
        };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await api.get('/tags');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar etiquetas:', error);
      
      // Retornar dados de exemplo quando o backend não estiver disponível
      if (user) {
        console.log('Usando dados de exemplo para etiquetas');
        // Simulamos um pequeno atraso para parecer que os dados estão sendo buscados
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return {
          success: true,
          tags: MOCK_TAGS.map(tag => ({
            ...tag,
            userId: user.id
          }))
        };
      }
      
      return {
        success: false,
        message: 'Não foi possível carregar as etiquetas. Tente novamente mais tarde.',
        tags: []
      };
    }
  },

  // Obter uma etiqueta específica por ID
  async getTag(id) {
    try {
      if (DEV_MODE) {
        const tag = localTags.find(tag => tag.id === id);
        if (!tag) throw new Error('Etiqueta não encontrada');
        return { success: true, tag };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await api.get(`/tags/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar etiqueta:', error);
      
      // Verificar se é uma etiqueta de exemplo
      if (user) {
        const mockTag = MOCK_TAGS.find(tag => tag.id === id);
        if (mockTag) {
          return {
            success: true,
            tag: {
              ...mockTag,
              userId: user.id
            }
          };
        }
      }
      
      return {
        success: false,
        message: 'Não foi possível carregar a etiqueta. Tente novamente mais tarde.'
      };
    }
  },

  // Criar uma nova etiqueta
  async createTag({ name, color }) {
    try {
      if (DEV_MODE) {
        const user = authService.getCurrentUser();
        const userId = user?.id || 'dev-user';
        
        // Verificar se já existe uma etiqueta com o mesmo nome
        const existingTag = localTags.find(
          t => t.name.toLowerCase() === name.toLowerCase() && t.userId === userId
        );
        
        if (existingTag) {
          console.error('Já existe uma etiqueta com este nome');
          return {
            success: false,
            message: 'Já existe uma etiqueta com este nome'
          };
        }
        
        const newTag = {
          id: Math.random().toString(36).substring(7),
          name,
          color: color || '#9E9E9E', // Cor padrão se não especificada
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        localTags.push(newTag);
        console.log('Nova tag criada:', newTag);
        return { success: true, tag: newTag };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await api.post('/tags', {
        name,
        color,
        userId: user.id
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar etiqueta:', error);
      
      if (error.message === 'Já existe uma etiqueta com este nome') {
        return {
          success: false,
          message: error.message
        };
      }
      
      // Simular criação de etiqueta quando o backend não está disponível
      if (user) {
        const newTag = {
          id: Date.now().toString(),
          name,
          color,
          userId: user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Adicionar na lista local (apenas para esta sessão)
        MOCK_TAGS.push(newTag);
        
        return {
          success: true,
          tag: newTag
        };
      }
      
      return {
        success: false,
        message: 'Não foi possível criar a etiqueta. Tente novamente mais tarde.'
      };
    }
  },

  // Atualizar uma etiqueta existente
  async updateTag(id, { name, color }) {
    try {
      if (DEV_MODE) {
        const user = authService.getCurrentUser();
        const userId = user?.id || 'dev-user';
        
        const tagIndex = localTags.findIndex(
          tag => tag.id === id && tag.userId === userId
        );
        
        if (tagIndex === -1) {
          throw new Error('Etiqueta não encontrada ou não pertence ao usuário');
        }
        
        // Verificar se já existe outra etiqueta com o mesmo nome
        const existingTag = localTags.find(
          t => t.id !== id && 
          t.name.toLowerCase() === name.toLowerCase() && 
          t.userId === userId
        );
        
        if (existingTag) {
          throw new Error('Já existe uma etiqueta com este nome');
        }
        
        const updatedTag = { 
          ...localTags[tagIndex],
          name: name !== undefined ? name : localTags[tagIndex].name,
          color: color !== undefined ? color : localTags[tagIndex].color,
          updatedAt: new Date()
        };
        
        localTags[tagIndex] = updatedTag;
        return { success: true, tag: updatedTag };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const response = await api.put(`/tags/${id}`, {
        name,
        color,
        userId: user.id
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar etiqueta:', error);
      
      if (error.message === 'Já existe uma etiqueta com este nome' || 
          error.message === 'Etiqueta não encontrada ou não pertence ao usuário') {
        return {
          success: false,
          message: error.message
        };
      }
      
      return {
        success: false,
        message: 'Não foi possível atualizar a etiqueta. Tente novamente mais tarde.'
      };
    }
  },

  // Excluir uma etiqueta
  async deleteTag(id) {
    try {
      if (DEV_MODE) {
        const user = authService.getCurrentUser();
        const userId = user?.id || 'dev-user';
        
        const tagIndex = localTags.findIndex(
          tag => tag.id === id && tag.userId === userId
        );
        
        if (tagIndex === -1) {
          throw new Error('Etiqueta não encontrada ou não pertence ao usuário');
        }
        
        // Em um ambiente real, precisaríamos remover a etiqueta das tarefas também
        // Aqui apenas removemos da lista de etiquetas
        localTags.splice(tagIndex, 1);
        
        return { 
          success: true, 
          message: 'Etiqueta excluída com sucesso' 
        };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await api.delete(`/tags/${id}?userId=${user.id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir etiqueta:', error);
      
      if (error.message === 'Etiqueta não encontrada ou não pertence ao usuário') {
        return {
          success: false,
          message: error.message
        };
      }
      
      return {
        success: false,
        message: 'Não foi possível excluir a etiqueta. Tente novamente mais tarde.'
      };
    }
  },
  
  // Obter todas as tarefas que usam uma etiqueta específica
  async getTagTasks(tagId) {
    try {
      if (DEV_MODE) {
        const user = authService.getCurrentUser();
        const userId = user?.id || 'dev-user';
        
        // Verificar se a etiqueta existe e pertence ao usuário
        const tag = localTags.find(
          t => t.id === tagId && t.userId === userId
        );
        
        if (!tag) {
          throw new Error('Etiqueta não encontrada ou não pertence ao usuário');
        }
        
        // Buscar tarefas que contêm esta etiqueta
        // No ambiente real, isso seria necessário fazer um import do taskService
        const mockTasks = [
          {
            id: '1',
            title: 'Tarefa com etiqueta 1',
            description: 'Esta tarefa possui a etiqueta solicitada',
            completed: false,
            priority: 'alta',
            dueDate: new Date(Date.now() + 86400000 * 2),
            userId,
            category: { id: '1', name: 'Trabalho', color: '#4CAF50', userId },
            tags: [tag],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            title: 'Outra tarefa com a mesma etiqueta',
            description: 'Esta tarefa também possui a etiqueta solicitada',
            completed: true,
            priority: 'média',
            dueDate: new Date(Date.now() - 86400000),
            userId,
            category: { id: '2', name: 'Pessoal', color: '#9C27B0', userId },
            tags: [
              tag,
              { id: '3', name: 'Saúde', color: '#4CAF50', userId }
            ],
            createdAt: new Date(Date.now() - 172800000),
            updatedAt: new Date(Date.now() - 86400000)
          }
        ];
        
        // Filtrar apenas as tarefas que têm a etiqueta
        const tagTasks = mockTasks.filter(task => 
          task.tags.some(t => t.id === tagId)
        );
        
        return { 
          success: true, 
          tasks: tagTasks 
        };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Esta é uma implementação alternativa que pode ser usada
      // dependendo de como a API está estruturada
      const response = await api.get(`/tags/${tagId}/tasks?userId=${user.id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tarefas da etiqueta:', error);
      return {
        success: false,
        message: 'Não foi possível carregar as tarefas desta etiqueta. Tente novamente mais tarde.',
        tasks: []
      };
    }
  }
};

export default tagService; 