import api from './api';
import * as authService from './authService';

const DEV_MODE = process.env.REACT_APP_API_URL === 'development';

// Categorias de desenvolvimento
const DEV_CATEGORIES = [
  { id: '1', name: 'Trabalho', color: '#4CAF50', userId: 'dev-user' },
  { id: '2', name: 'Pessoal', color: '#9C27B0', userId: 'dev-user' },
  { id: '3', name: 'Estudos', color: '#2196F3', userId: 'dev-user' },
  { id: '4', name: 'Projetos', color: '#FF9800', userId: 'dev-user' }
];

let localCategories = [...DEV_CATEGORIES];

const categoryService = {
  // Obter todas as categorias do usuário
  async getCategories() {
    try {
      if (DEV_MODE) {
        const user = authService.getCurrentUser();
        return {
          success: true,
          categories: localCategories.filter(category => 
            category.userId === (user?.id || 'dev-user')
          )
        };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Certificar-se de passar o userId apenas uma vez
      const response = await api.get('/categories', {
        params: { userId: user.id }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return {
        success: false,
        message: 'Não foi possível carregar as categorias. Tente novamente mais tarde.',
        categories: []
      };
    }
  },

  // Obter uma categoria específica por ID
  async getCategory(id) {
    try {
      if (DEV_MODE) {
        const category = localCategories.find(category => category.id === id);
        if (!category) throw new Error('Categoria não encontrada');
        return { success: true, category };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await api.get(`/categories/${id}?userId=${user.id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      return {
        success: false,
        message: 'Não foi possível carregar a categoria solicitada. Tente novamente mais tarde.'
      };
    }
  },

  // Criar uma nova categoria
  async createCategory({ name, color }) {
    try {
      if (DEV_MODE) {
        const user = authService.getCurrentUser();
        const userId = user?.id || 'dev-user';
        
        // Verificar se já existe uma categoria com o mesmo nome
        const existingCategory = localCategories.find(
          c => c.name.toLowerCase() === name.toLowerCase() && c.userId === userId
        );
        
        if (existingCategory) {
          console.error('Já existe uma categoria com este nome');
          return {
            success: false,
            message: 'Já existe uma categoria com este nome'
          };
        }
        
        const newCategory = {
          id: Math.random().toString(36).substring(7),
          name,
          color: color || '#607D8B', // Cor padrão se não especificada
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        localCategories.push(newCategory);
        console.log('Nova categoria criada:', newCategory);
        return { success: true, category: newCategory };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await api.post('/categories', {
        name,
        color,
        userId: user.id
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      
      if (error.message === 'Já existe uma categoria com este nome') {
        return {
          success: false,
          message: error.message
        };
      }
      
      return {
        success: false,
        message: 'Não foi possível criar a categoria. Tente novamente mais tarde.'
      };
    }
  },

  // Atualizar uma categoria existente
  async updateCategory(id, { name, color }) {
    try {
      if (DEV_MODE) {
        const user = authService.getCurrentUser();
        const userId = user?.id || 'dev-user';
        
        const categoryIndex = localCategories.findIndex(
          category => category.id === id && category.userId === userId
        );
        
        if (categoryIndex === -1) {
          throw new Error('Categoria não encontrada ou não pertence ao usuário');
        }
        
        // Verificar se já existe outra categoria com o mesmo nome
        const existingCategory = localCategories.find(
          c => c.id !== id && 
          c.name.toLowerCase() === name.toLowerCase() && 
          c.userId === userId
        );
        
        if (existingCategory) {
          throw new Error('Já existe uma categoria com este nome');
        }
        
        const updatedCategory = { 
          ...localCategories[categoryIndex],
          name: name !== undefined ? name : localCategories[categoryIndex].name,
          color: color !== undefined ? color : localCategories[categoryIndex].color,
          updatedAt: new Date()
        };
        
        localCategories[categoryIndex] = updatedCategory;
        return { success: true, category: updatedCategory };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const response = await api.put(`/categories/${id}`, {
        name,
        color,
        userId: user.id
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      
      if (error.message === 'Já existe uma categoria com este nome' || 
          error.message === 'Categoria não encontrada ou não pertence ao usuário') {
        return {
          success: false,
          message: error.message
        };
      }
      
      return {
        success: false,
        message: 'Não foi possível atualizar a categoria. Tente novamente mais tarde.'
      };
    }
  },

  // Excluir uma categoria
  async deleteCategory(id) {
    try {
      if (DEV_MODE) {
        const user = authService.getCurrentUser();
        const userId = user?.id || 'dev-user';
        
        const categoryIndex = localCategories.findIndex(
          category => category.id === id && category.userId === userId
        );
        
        if (categoryIndex === -1) {
          throw new Error('Categoria não encontrada ou não pertence ao usuário');
        }
        
        // Em um ambiente real, precisaríamos remover a categoria das tarefas também
        // Aqui apenas removemos da lista de categorias
        localCategories.splice(categoryIndex, 1);
        
        return { 
          success: true, 
          message: 'Categoria excluída com sucesso' 
        };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      const response = await api.delete(`/categories/${id}?userId=${user.id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      
      if (error.message === 'Categoria não encontrada ou não pertence ao usuário') {
        return {
          success: false,
          message: error.message
        };
      }
      
      return {
        success: false,
        message: 'Não foi possível excluir a categoria. Tente novamente mais tarde.'
      };
    }
  },
  
  // Obter todas as tarefas de uma categoria
  async getCategoryTasks(categoryId) {
    try {
      if (DEV_MODE) {
        const user = authService.getCurrentUser();
        const userId = user?.id || 'dev-user';
        
        // Verificar se a categoria existe e pertence ao usuário
        const category = localCategories.find(
          c => c.id === categoryId && c.userId === userId
        );
        
        if (!category) {
          throw new Error('Categoria não encontrada ou não pertence ao usuário');
        }
        
        // Buscar no taskService importado do escopo local
        // No ambiente real, isso seria necessário fazer um import
        const mockTasks = [
          {
            id: '1',
            title: 'Tarefa de exemplo 1',
            description: 'Esta é uma tarefa de exemplo para desenvolvimento',
            completed: false,
            priority: 'alta',
            dueDate: new Date(Date.now() + 86400000 * 2),
            userId,
            category,
            tags: [
              { id: '1', name: 'Urgente', color: '#F44336', userId },
              { id: '2', name: 'Projeto A', color: '#2196F3', userId }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            title: 'Tarefa de exemplo 2',
            description: 'Outra tarefa de exemplo para desenvolvimento',
            completed: true,
            priority: 'média',
            dueDate: new Date(Date.now() - 86400000),
            userId,
            category,
            tags: [
              { id: '3', name: 'Saúde', color: '#4CAF50', userId }
            ],
            createdAt: new Date(Date.now() - 172800000),
            updatedAt: new Date(Date.now() - 86400000)
          }
        ];
        
        // Filtrar apenas as tarefas da categoria
        const categoryTasks = mockTasks.filter(task => 
          task.category && task.category.id === categoryId
        );
        
        return { 
          success: true, 
          tasks: categoryTasks 
        };
      }

      const user = authService.getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Esta é uma implementação alternativa que pode ser usada
      // dependendo de como a API está estruturada
      const response = await api.get(`/categories/${categoryId}/tasks?userId=${user.id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tarefas da categoria:', error);
      return {
        success: false,
        message: 'Não foi possível carregar as tarefas desta categoria. Tente novamente mais tarde.',
        tasks: []
      };
    }
  }
};

export default categoryService; 