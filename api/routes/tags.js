const express = require('express');
const router = express.Router();

// Rota de teste - responde a GET em /api/tags/test
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'API de etiquetas está funcionando'
  });
});

// Obter todas as etiquetas do usuário
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
    
    console.log('Buscando etiquetas para o usuário:', userIdString);
    
    const tags = await req.prisma.tag.findMany({
      where: { userId: userIdString },
      orderBy: [
        { name: 'asc' }
      ]
    });
    
    console.log('Etiquetas encontradas:', tags.length);
    
    res.json({
      success: true,
      tags
    });
  } catch (error) {
    console.error('Erro detalhado ao obter etiquetas:', error);
    
    // Enviar resposta mais informativa
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter etiquetas',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Obter uma etiqueta específica
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
    
    const tag = await req.prisma.tag.findFirst({
      where: { 
        id,
        userId: userIdString
      }
    });
    
    if (!tag) {
      return res.status(404).json({ 
        success: false, 
        message: 'Etiqueta não encontrada' 
      });
    }
    
    res.json({
      success: true,
      tag
    });
  } catch (error) {
    console.error('Erro ao obter etiqueta:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter etiqueta' 
    });
  }
});

// Criar uma nova etiqueta
router.post('/', async (req, res) => {
  try {
    const { name, color, userId } = req.body;
    
    if (!name || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome e ID do usuário são obrigatórios' 
      });
    }
    
    const newTag = await req.prisma.tag.create({
      data: {
        name,
        color: color || '#03DAC5',
        userId
      }
    });
    
    res.status(201).json({
      success: true,
      tag: newTag
    });
  } catch (error) {
    console.error('Erro ao criar etiqueta:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar etiqueta' 
    });
  }
});

// Atualizar uma etiqueta
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
    
    // Verificar se a etiqueta existe e pertence ao usuário
    const tagExists = await req.prisma.tag.findFirst({
      where: { 
        id,
        userId: userIdString
      }
    });
    
    if (!tagExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Etiqueta não encontrada ou não pertence ao usuário' 
      });
    }
    
    // Montar os dados para atualização
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    
    // Atualizar etiqueta
    const updatedTag = await req.prisma.tag.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      success: true,
      tag: updatedTag
    });
  } catch (error) {
    console.error('Erro ao atualizar etiqueta:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar etiqueta' 
    });
  }
});

// Excluir uma etiqueta
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
    
    // Verificar se a etiqueta existe e pertence ao usuário
    const tagExists = await req.prisma.tag.findFirst({
      where: { 
        id,
        userId: userIdString
      }
    });
    
    if (!tagExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Etiqueta não encontrada ou não pertence ao usuário' 
      });
    }
    
    // Remover a associação entre tags e tarefas
    await req.prisma.task.update({
      where: { tags: { some: { id } } },
      data: { tags: { disconnect: { id } } }
    });
    
    // Excluir etiqueta
    await req.prisma.tag.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Etiqueta excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir etiqueta:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir etiqueta' 
    });
  }
});

module.exports = router; 