const express = require('express');
const router = express.Router();

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Tentativa de login:', { email });
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email e senha são obrigatórios' 
      });
    }
    
    // Verificar conexão com o banco
    try {
      await req.prisma.$queryRaw`SELECT 1`;
      console.log('Conexão com o banco de dados OK');
    } catch (dbError) {
      console.error('Erro na conexão com o banco de dados:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Erro na conexão com o banco de dados',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
    
    const user = await req.prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email não encontrado' 
      });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Senha incorreta' 
      });
    }
    
    // Não enviar a senha para o cliente
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    console.error('Stack trace:', error.stack);
    console.error('Prisma error code:', error.code);
    
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao fazer login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      errorCode: error.code
    });
  }
});

// Rota de registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome, email e senha são obrigatórios' 
      });
    }
    
    // Verificar se o email já está em uso
    const existingUser = await req.prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Este email já está em uso' 
      });
    }
    
    const newUser = await req.prisma.user.create({
      data: {
        name,
        email,
        password,
        role: 'USER'
      }
    });
    
    // Não enviar a senha para o cliente
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao registrar usuário' 
    });
  }
});

// Verificar se a autenticação está funcionando
router.get('/me', async (req, res) => {
  try {
    // Aqui você normalmente verificaria um token JWT
    // Por enquanto, vamos assumir que o usuário envia seu ID
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Não autenticado' 
      });
    }
    
    const user = await req.prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    // Não enviar a senha para o cliente
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar usuário' 
    });
  }
});

module.exports = router; 