const express = require('express');
const router = express.Router();

// Obter todas as tarefas do usuário
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do usuário é obrigatório' 
      });
    }
    
    // Garantir que userId seja uma string, não um array
    const userIdString = Array.isArray(userId) ? userId[0] : userId;
    
    console.log('Buscando tarefas para o usuário:', userIdString);
    
    const tasks = await req.prisma.task.findMany({
      where: { userId: userIdString },
      include: {
        category: true,
        tags: true
      },
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { updatedAt: 'desc' }
      ]
    });
    
    console.log('Tarefas encontradas:', tasks.length);
    
    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Erro detalhado ao obter tarefas:', error);
    
    // Enviar resposta mais informativa
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter tarefas',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Obter uma tarefa específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do usuário é obrigatório' 
      });
    }
    
    // Garantir que userId seja uma string, não um array
    const userIdString = Array.isArray(userId) ? userId[0] : userId;
    
    const task = await req.prisma.task.findFirst({
      where: { 
        id,
        userId: userIdString
      },
      include: {
        category: true,
        tags: true
      }
    });
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tarefa não encontrada' 
      });
    }
    
    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Erro ao obter tarefa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter tarefa' 
    });
  }
});

// Criar uma nova tarefa
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, priority, categoryId, tagIds = [], userId } = req.body;
    
    console.log('Dados recebidos para criar tarefa:', {
      title, description, dueDate, priority, categoryId, 
      tagIds: JSON.stringify(tagIds),
      userId
    });
    
    if (!title || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Título e ID do usuário são obrigatórios' 
      });
    }
    
    // Garantir que userId seja uma string, não um array
    const userIdString = Array.isArray(userId) ? userId[0] : userId;
    console.log('userId processado:', userIdString);
    
    // Verificar se a categoria existe e pertence ao usuário
    if (categoryId) {
      console.log('Verificando categoria:', categoryId);
      const categoryExists = await req.prisma.category.findFirst({
        where: { id: categoryId, userId: userIdString }
      });
      
      if (!categoryExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Categoria não encontrada ou não pertence ao usuário' 
        });
      }
      console.log('Categoria verificada com sucesso');
    }
    
    // Verificar se as etiquetas existem e pertencem ao usuário
    if (tagIds && tagIds.length > 0) {
      console.log('Verificando etiquetas:', tagIds);
      const userTags = await req.prisma.tag.findMany({
        where: { id: { in: tagIds }, userId: userIdString }
      });
      
      console.log('Etiquetas encontradas:', userTags.length);
      
      if (userTags.length !== tagIds.length) {
        return res.status(400).json({ 
          success: false, 
          message: 'Uma ou mais etiquetas não foram encontradas ou não pertencem ao usuário' 
        });
      }
      console.log('Etiquetas verificadas com sucesso');
    }
    
    // Criar a tarefa com as relações apropriadas
    const createData = {
      title,
      description: description || '',
      priority: priority || 'média',
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: userIdString
    };
    
    // Adicionar categoria se especificada
    if (categoryId) {
      createData.categoryId = categoryId;
    }
    
    // Adicionar etiquetas se especificadas
    if (tagIds && tagIds.length > 0) {
      createData.tags = {
        connect: tagIds.map(id => ({ id }))
      };
    }
    
    console.log('Dados para criação da tarefa:', JSON.stringify(createData, null, 2));
    
    const newTask = await req.prisma.task.create({
      data: createData,
      include: {
        category: true,
        tags: true
      }
    });
    
    console.log('Tarefa criada com sucesso:', newTask.id);
    
    res.status(201).json({
      success: true,
      task: newTask
    });
  } catch (error) {
    console.error('Erro detalhado ao criar tarefa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar tarefa',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Atualizar uma tarefa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, dueDate, priority, categoryId, tagIds, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do usuário é obrigatório' 
      });
    }
    
    // Garantir que userId seja uma string, não um array
    const userIdString = Array.isArray(userId) ? userId[0] : userId;
    
    // Verificar se a tarefa existe e pertence ao usuário
    const taskExists = await req.prisma.task.findFirst({
      where: { 
        id,
        userId: userIdString
      },
      include: {
        tags: true
      }
    });
    
    if (!taskExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tarefa não encontrada ou não pertence ao usuário' 
      });
    }
    
    // Verificar se a categoria existe e pertence ao usuário
    if (categoryId) {
      const categoryExists = await req.prisma.category.findFirst({
        where: { id: categoryId, userId }
      });
      
      if (!categoryExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Categoria não encontrada ou não pertence ao usuário' 
        });
      }
    }
    
    // Verificar se as etiquetas existem e pertencem ao usuário
    if (tagIds && tagIds.length > 0) {
      const userTags = await req.prisma.tag.findMany({
        where: { id: { in: tagIds }, userId }
      });
      
      if (userTags.length !== tagIds.length) {
        return res.status(400).json({ 
          success: false, 
          message: 'Uma ou mais etiquetas não foram encontradas ou não pertencem ao usuário' 
        });
      }
    }
    
    // Montar os dados para atualização
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (completed !== undefined) updateData.completed = completed;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    
    // Atualizar relação de categoria
    if (categoryId !== undefined) {
      if (categoryId === null) {
        updateData.category = { disconnect: true };
      } else {
        updateData.category = { connect: { id: categoryId } };
      }
    }
    
    // Atualizar relação de etiquetas
    if (tagIds) {
      // Primeiro, desconectar todas as etiquetas atuais
      updateData.tags = { 
        set: [] // Limpar todas as etiquetas
      };
      
      // Depois conectar as novas etiquetas
      if (tagIds.length > 0) {
        updateData.tags.connect = tagIds.map(id => ({ id }));
      }
    }
    
    // Atualizar tarefa
    const updatedTask = await req.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        tags: true
      }
    });
    
    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar tarefa' 
    });
  }
});

// Excluir uma tarefa
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do usuário é obrigatório' 
      });
    }
    
    // Garantir que userId seja uma string, não um array
    const userIdString = Array.isArray(userId) ? userId[0] : userId;
    
    // Verificar se a tarefa existe e pertence ao usuário
    const taskExists = await req.prisma.task.findFirst({
      where: { 
        id,
        userId: userIdString
      }
    });
    
    if (!taskExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tarefa não encontrada ou não pertence ao usuário' 
      });
    }
    
    // Excluir tarefa
    await req.prisma.task.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Tarefa excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir tarefa' 
    });
  }
});

// Marcar tarefa como concluída ou não concluída
router.patch('/:id/toggle-complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do usuário é obrigatório' 
      });
    }
    
    // Garantir que userId seja uma string, não um array
    const userIdString = Array.isArray(userId) ? userId[0] : userId;
    
    // Buscar a tarefa atual
    const task = await req.prisma.task.findFirst({
      where: { 
        id,
        userId: userIdString
      }
    });
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tarefa não encontrada ou não pertence ao usuário' 
      });
    }
    
    // Atualizar status de conclusão
    const updatedTask = await req.prisma.task.update({
      where: { id },
      data: { completed: !task.completed },
      include: {
        category: true,
        tags: true
      }
    });
    
    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error('Erro ao alternar status da tarefa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao alternar status da tarefa' 
    });
  }
});

// Adicionar uma etiqueta a uma tarefa
router.post('/:id/tags/:tagId', async (req, res) => {
  try {
    const { id, tagId } = req.params;
    const { userId } = req.body;
    
    console.log('Adicionando tag à tarefa:', { taskId: id, tagId, userId });
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do usuário é obrigatório' 
      });
    }
    
    // Garantir que userId seja uma string, não um array
    const userIdString = Array.isArray(userId) ? userId[0] : userId;
    
    // Verificar se a tarefa existe e pertence ao usuário
    const task = await req.prisma.task.findFirst({
      where: { 
        id,
        userId: userIdString
      },
      include: {
        tags: true
      }
    });
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tarefa não encontrada ou não pertence ao usuário' 
      });
    }
    
    // Verificar se a tag existe e pertence ao usuário
    const tag = await req.prisma.tag.findFirst({
      where: { 
        id: tagId,
        userId: userIdString
      }
    });
    
    if (!tag) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tag não encontrada ou não pertence ao usuário' 
      });
    }
    
    // Verificar se a tag já está associada à tarefa
    const tagAlreadyAdded = task.tags.some(t => t.id === tagId);
    if (tagAlreadyAdded) {
      return res.json({
        success: true,
        message: 'Tag já está associada a esta tarefa',
        task
      });
    }
    
    // Adicionar tag à tarefa
    const updatedTask = await req.prisma.task.update({
      where: { id },
      data: {
        tags: {
          connect: { id: tagId }
        }
      },
      include: {
        category: true,
        tags: true
      }
    });
    
    console.log('Tag adicionada com sucesso à tarefa');
    
    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error('Erro detalhado ao adicionar tag à tarefa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao adicionar tag à tarefa',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Remover uma etiqueta de uma tarefa
router.delete('/:id/tags/:tagId', async (req, res) => {
  try {
    const { id, tagId } = req.params;
    const { userId } = req.query;
    
    console.log('Removendo tag da tarefa:', { taskId: id, tagId, userId });
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do usuário é obrigatório' 
      });
    }
    
    // Garantir que userId seja uma string, não um array
    const userIdString = Array.isArray(userId) ? userId[0] : userId;
    
    // Verificar se a tarefa existe e pertence ao usuário
    const task = await req.prisma.task.findFirst({
      where: { 
        id,
        userId: userIdString
      },
      include: {
        tags: true
      }
    });
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tarefa não encontrada ou não pertence ao usuário' 
      });
    }
    
    // Verificar se a tag existe e está associada à tarefa
    const tagExists = task.tags.some(t => t.id === tagId);
    if (!tagExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tag não está associada a esta tarefa' 
      });
    }
    
    // Remover tag da tarefa
    const updatedTask = await req.prisma.task.update({
      where: { id },
      data: {
        tags: {
          disconnect: { id: tagId }
        }
      },
      include: {
        category: true,
        tags: true
      }
    });
    
    console.log('Tag removida com sucesso da tarefa');
    
    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error('Erro detalhado ao remover tag da tarefa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao remover tag da tarefa',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 