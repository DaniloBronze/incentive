const express = require('express');
const router = express.Router();

// Rota de teste - responde a GET em /api/categories/test
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API de categorias está funcionando'
  });
});

// Obter todas as categorias do usuário
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
    
    console.log('Buscando categorias para o usuário:', userIdString);
    
    const categories = await req.prisma.category.findMany({
      where: { userId: userIdString },
      orderBy: [
        { name: 'asc' }
      ]
    });
    
    console.log('Categorias encontradas:', categories.length);
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Erro detalhado ao obter categorias:', error);
    
    // Enviar resposta mais informativa
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter categorias',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Obter uma categoria específica
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
    
    const category = await req.prisma.category.findFirst({
      where: { 
        id,
        userId: userIdString
      }
    });
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Categoria não encontrada' 
      });
    }
    
    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Erro ao obter categoria:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter categoria' 
    });
  }
});

// Criar uma nova categoria
router.post('/', async (req, res) => {
  try {
    const { name, color, userId } = req.body;
    
    if (!name || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome e ID do usuário são obrigatórios' 
      });
    }
    
    const newCategory = await req.prisma.category.create({
      data: {
        name,
        color: color || '#6200ee',
        userId
      }
    });
    
    res.status(201).json({
      success: true,
      category: newCategory
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar categoria' 
    });
  }
});

// Atualizar uma categoria
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do usuário é obrigatório' 
      });
    }
    
    // Garantir que userId seja uma string, não um array
    const userIdString = Array.isArray(userId) ? userId[0] : userId;
    
    // Verificar se a categoria existe e pertence ao usuário
    const categoryExists = await req.prisma.category.findFirst({
      where: { 
        id,
        userId: userIdString
      }
    });
    
    if (!categoryExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Categoria não encontrada ou não pertence ao usuário' 
      });
    }
    
    // Montar os dados para atualização
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    
    // Atualizar categoria
    const updatedCategory = await req.prisma.category.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      success: true,
      category: updatedCategory
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar categoria' 
    });
  }
});

// Excluir uma categoria
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
    
    // Verificar se a categoria existe e pertence ao usuário
    const categoryExists = await req.prisma.category.findFirst({
      where: { 
        id,
        userId: userIdString
      }
    });
    
    if (!categoryExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Categoria não encontrada ou não pertence ao usuário' 
      });
    }
    
    // Remover a categoria das tarefas
    await req.prisma.task.updateMany({
      where: { categoryId: id },
      data: { categoryId: null }
    });
    
    // Excluir categoria
    await req.prisma.category.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Categoria excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir categoria' 
    });
  }
});

module.exports = router; 