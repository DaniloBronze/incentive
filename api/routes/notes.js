const express = require('express');
const router = express.Router();

// Obter todas as notas do usuário
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do usuário é obrigatório' 
      });
    }
    
    const notes = await req.prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Erro ao obter notas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter notas' 
    });
  }
});

// Obter uma nota específica
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
    
    const note = await req.prisma.note.findFirst({
      where: { 
        id,
        userId
      }
    });
    
    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: 'Nota não encontrada' 
      });
    }
    
    res.json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Erro ao obter nota:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter nota' 
    });
  }
});

// Criar uma nova nota
router.post('/', async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    
    if (!title || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Título e ID do usuário são obrigatórios' 
      });
    }
    
    const newNote = await req.prisma.note.create({
      data: {
        title,
        content: content || '',
        userId
      }
    });
    
    res.status(201).json({
      success: true,
      note: newNote
    });
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar nota' 
    });
  }
});

// Atualizar uma nota
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do usuário é obrigatório' 
      });
    }
    
    // Verificar se a nota existe e pertence ao usuário
    const noteExists = await req.prisma.note.findFirst({
      where: { 
        id,
        userId
      }
    });
    
    if (!noteExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Nota não encontrada ou não pertence ao usuário' 
      });
    }
    
    // Montar os dados para atualização
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    
    // Atualizar nota
    const updatedNote = await req.prisma.note.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      success: true,
      note: updatedNote
    });
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar nota' 
    });
  }
});

// Excluir uma nota
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
    
    // Verificar se a nota existe e pertence ao usuário
    const noteExists = await req.prisma.note.findFirst({
      where: { 
        id,
        userId
      }
    });
    
    if (!noteExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Nota não encontrada ou não pertence ao usuário' 
      });
    }
    
    // Excluir nota
    await req.prisma.note.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Nota excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir nota:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir nota' 
    });
  }
});

module.exports = router; 