import api from './api';
import * as authService from './authService';

const DEV_MODE = process.env.NODE_ENV === 'development';

// Dados de exemplo para modo offline/fallback
const MOCK_TASKS = [
  {
    id: '1',
    title: 'Tarefa de exemplo 1',
    description: 'Esta é uma tarefa de exemplo para desenvolvimento',
    completed: false,
    priority: 'alta',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 dias a partir de agora
    userId: '1',
    category: { id: '1', name: 'Trabalho', color: '#4CAF50', userId: '1' },
    tags: [
      { id: '1', name: 'Urgente', color: '#F44336', userId: '1' },
      { id: '2', name: 'Projeto A', color: '#2196F3', userId: '1' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Tarefa de exemplo 2',
    description: 'Outra tarefa de exemplo para desenvolvimento',
    completed: true,
    priority: 'média',
    dueDate: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
    userId: '1',
    category: { id: '2', name: 'Pessoal', color: '#9C27B0', userId: '1' },
    tags: [
      { id: '3', name: 'Saúde', color: '#4CAF50', userId: '1' }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
    updatedAt: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
  },
  {
    id: '3',
    title: 'Tarefa de exemplo 3',
    description: 'Mais uma tarefa de exemplo para desenvolvimento',
    completed: false,
    priority: 'baixa',
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 dias a partir de agora
    userId: '1',
    category: null,
    tags: [],
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
    updatedAt: new Date(Date.now() - 259200000).toISOString() // 3 dias atrás
  }
];

// Categorias e tags de desenvolvimento
const DEV_CATEGORIES = [
  { id: '1', name: 'Trabalho', color: '#4CAF50', userId: 'dev-user' },
  { id: '2', name: 'Pessoal', color: '#9C27B0', userId: 'dev-user' },
  { id: '3', name: 'Estudos', color: '#2196F3', userId: 'dev-user' },
  { id: '4', name: 'Projetos', color: '#FF9800', userId: 'dev-user' }
];

const DEV_TAGS = [
  { id: '1', name: 'Urgente', color: '#F44336', userId: 'dev-user' },
  { id: '2', name: 'Projeto A', color: '#2196F3', userId: 'dev-user' },
  { id: '3', name: 'Saúde', color: '#4CAF50', userId: 'dev-user' },
  { id: '4', name: 'Família', color: '#E91E63', userId: 'dev-user' },
  { id: '5', name: 'Finanças', color: '#795548', userId: 'dev-user' }
];

let localTasks = [...MOCK_TASKS];

const taskService = {
  // Obter todas as tarefas do usuário
  async getTasks() {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await api.get('/tasks');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      
      // Retornar dados de exemplo quando o backend não estiver disponível
      const user = authService.getCurrentUser();
      if (user) {
        console.log('Usando dados de exemplo para tarefas');
        // Simulamos um pequeno atraso para parecer que os dados estão sendo buscados
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return {
          success: true,
          tasks: MOCK_TASKS.map(task => ({
            ...task,
            userId: user.id
          }))
        };
      }
      
      return {
        success: false,
        message: 'Não foi possível carregar as tarefas. Tente novamente mais tarde.',
        tasks: []
      };
    }
  },

  // Obter uma tarefa específica por ID
  async getTask(id) {
    try {
      if (DEV_MODE) {
        const task = localTasks.find(task => task.id === id);
        if (!task) throw new Error('Tarefa não encontrada');
        return { success: true, task };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await api.get(`/tasks/${id}?userId=${user.id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tarefa:', error);
      return {
        success: false,
        message: 'Não foi possível carregar a tarefa solicitada. Tente novamente mais tarde.'
      };
    }
  },

  // Criar uma nova tarefa
  async createTask({ title, description, dueDate, priority, categoryId, tagIds }) {
    try {
      if (DEV_MODE) {
        const user = authService.getCurrentUser();
        const userId = user?.id || 'dev-user';
        
        // Encontrar categoria se especificada
        let category = null;
        if (categoryId) {
          category = DEV_CATEGORIES.find(cat => cat.id === categoryId);
        }
        
        // Encontrar tags se especificadas
        let tags = [];
        if (tagIds && tagIds.length > 0) {
          tags = DEV_TAGS.filter(tag => tagIds.includes(tag.id));
        }
        
        const newTask = {
          id: Math.random().toString(36).substring(7),
          title,
          description: description || '',
          completed: false,
          priority: priority || 'média',
          dueDate: dueDate ? new Date(dueDate) : null,
          userId,
          category,
          tags,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        localTasks.push(newTask);
        return { success: true, task: newTask };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await api.post('/tasks', {
        title,
        description,
        dueDate,
        priority,
        categoryId,
        tagIds,
        userId: user.id
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      return {
        success: false,
        message: 'Não foi possível criar a tarefa. Tente novamente mais tarde.'
      };
    }
  },

  // Atualizar uma tarefa existente
  async updateTask(id, { title, description, completed, dueDate, priority, categoryId, tagIds }) {
    try {
      if (DEV_MODE) {
        const taskIndex = localTasks.findIndex(task => task.id === id);
        if (taskIndex === -1) throw new Error('Tarefa não encontrada');

        // Criar uma cópia da tarefa original para fazer modificações
        const updatedTask = { ...localTasks[taskIndex] };
        
        // Atualizar campos simples
        if (title !== undefined) updatedTask.title = title;
        if (description !== undefined) updatedTask.description = description;
        if (completed !== undefined) updatedTask.completed = completed;
        if (priority !== undefined) updatedTask.priority = priority;
        if (dueDate !== undefined) updatedTask.dueDate = dueDate ? new Date(dueDate) : null;
        
        // Atualizar categoria
        if (categoryId !== undefined) {
          if (categoryId === null) {
            updatedTask.category = null;
          } else {
            updatedTask.category = DEV_CATEGORIES.find(cat => cat.id === categoryId) || null;
          }
        }
        
        // Atualizar etiquetas
        if (tagIds !== undefined) {
          updatedTask.tags = tagIds && tagIds.length > 0 
            ? DEV_TAGS.filter(tag => tagIds.includes(tag.id)) 
            : [];
        }
        
        updatedTask.updatedAt = new Date();
        
        // Atualizar tarefa no array local
        localTasks[taskIndex] = updatedTask;
        return { success: true, task: updatedTask };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      // Construir objeto com os campos a serem atualizados
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (completed !== undefined) updateData.completed = completed;
      if (priority !== undefined) updateData.priority = priority;
      if (dueDate !== undefined) updateData.dueDate = dueDate;
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (tagIds !== undefined) updateData.tagIds = tagIds;
      
      const response = await api.put(`/tasks/${id}`, {
        ...updateData,
        userId: user.id
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return {
        success: false,
        message: 'Não foi possível atualizar a tarefa. Tente novamente mais tarde.'
      };
    }
  },

  // Excluir uma tarefa
  async deleteTask(id) {
    try {
      if (DEV_MODE) {
        const taskIndex = localTasks.findIndex(task => task.id === id);
        if (taskIndex === -1) throw new Error('Tarefa não encontrada');
        
        localTasks.splice(taskIndex, 1);
        return { success: true, message: 'Tarefa excluída com sucesso' };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await api.delete(`/tasks/${id}?userId=${user.id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      return {
        success: false,
        message: 'Não foi possível excluir a tarefa. Tente novamente mais tarde.'
      };
    }
  },

  // Alternar status de conclusão de uma tarefa
  async toggleTaskCompletion(id) {
    try {
      if (DEV_MODE) {
        const taskIndex = localTasks.findIndex(task => task.id === id);
        if (taskIndex === -1) throw new Error('Tarefa não encontrada');
        
        // Inverter estado de conclusão
        const updatedTask = { 
          ...localTasks[taskIndex],
          completed: !localTasks[taskIndex].completed,
          updatedAt: new Date()
        };
        
        localTasks[taskIndex] = updatedTask;
        return { success: true, task: updatedTask };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await api.patch(`/tasks/${id}/toggle-complete`, {
        userId: user.id
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao alternar status da tarefa:', error);
      return {
        success: false,
        message: 'Não foi possível atualizar o status da tarefa. Tente novamente mais tarde.'
      };
    }
  },
  
  // Adicionar etiqueta a uma tarefa
  async addTagToTask(taskId, tagId) {
    try {
      if (DEV_MODE) {
        const taskIndex = localTasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) throw new Error('Tarefa não encontrada');
        
        const tag = DEV_TAGS.find(tag => tag.id === tagId);
        if (!tag) throw new Error('Etiqueta não encontrada');
        
        // Verificar se a tarefa já possui essa etiqueta
        if (localTasks[taskIndex].tags.some(t => t.id === tagId)) {
          throw new Error('A tarefa já possui essa etiqueta');
        }
        
        // Adicionar etiqueta à tarefa
        const updatedTask = { 
          ...localTasks[taskIndex],
          tags: [...localTasks[taskIndex].tags, tag],
          updatedAt: new Date()
        };
        
        localTasks[taskIndex] = updatedTask;
        return { success: true, task: updatedTask, tag };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log(`Adicionando tag ${tagId} à tarefa ${taskId}`);
      const response = await api.post(`/tasks/${taskId}/tags/${tagId}`, {
        userId: user.id
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar etiqueta à tarefa:', error);
      return {
        success: false,
        message: 'Não foi possível adicionar a etiqueta à tarefa. Tente novamente mais tarde.'
      };
    }
  },
  
  // Remover etiqueta de uma tarefa
  async removeTagFromTask(taskId, tagId) {
    try {
      if (DEV_MODE) {
        const taskIndex = localTasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) throw new Error('Tarefa não encontrada');
        
        // Verificar se a tarefa possui essa etiqueta
        if (!localTasks[taskIndex].tags.some(t => t.id === tagId)) {
          throw new Error('A tarefa não possui essa etiqueta');
        }
        
        // Remover etiqueta da tarefa
        const updatedTask = { 
          ...localTasks[taskIndex],
          tags: localTasks[taskIndex].tags.filter(t => t.id !== tagId),
          updatedAt: new Date()
        };
        
        localTasks[taskIndex] = updatedTask;
        return { success: true, task: updatedTask };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await api.delete(`/tasks/${taskId}/tags/${tagId}?userId=${user.id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao remover etiqueta da tarefa:', error);
      return {
        success: false,
        message: 'Não foi possível remover a etiqueta da tarefa. Tente novamente mais tarde.'
      };
    }
  },
  
  // Obter categorias de desenvolvimento
  getDevCategories() {
    return [...DEV_CATEGORIES];
  },
  
  // Obter etiquetas de desenvolvimento
  getDevTags() {
    return [...DEV_TAGS];
  }
};

export default taskService; 