const express = require('express');
const router = express.Router();

// Obter todos os usuários (apenas para administradores)
router.get('/', async (req, res) => {
  try {
    // Aqui você normalmente verificaria se o usuário é admin
    const users = await req.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter usuários' 
    });
  }
});

// Obter um usuário pelo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await req.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter usuário' 
    });
  }
});

// Atualizar um usuário
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    // Verificar se o usuário existe
    const userExists = await req.prisma.user.findUnique({
      where: { id }
    });
    
    if (!userExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    // Montar os dados para atualização
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    
    // Atualizar usuário
    const updatedUser = await req.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar usuário' 
    });
  }
});

// Excluir um usuário
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o usuário existe
    const userExists = await req.prisma.user.findUnique({
      where: { id }
    });
    
    if (!userExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    // Excluir usuário
    await req.prisma.user.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir usuário' 
    });
  }
});

module.exports = router; 