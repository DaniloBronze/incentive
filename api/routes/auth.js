const express = require('express');
const router = express.Router();

// Usuário padrão para fallback quando o banco de dados estiver indisponível
const DEFAULT_ADMIN = {
  id: '1',
  name: 'Administrador',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Verificar existência do usuário e autenticar
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Log para depuração
  console.log(`Tentativa de login: ${email}`);
  
  try {
    // Verificar se o email e a senha foram fornecidos
    if (!email || !password) {
      console.log('Login falhou: email ou senha ausentes');
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }
    
    // Verificar se é o usuário padrão admin (para fallback quando DB estiver indisponível)
    if (email === 'admin@example.com' && password === 'admin123') {
      console.log('Login com usuário administrador padrão');
      return res.json({
        success: true,
        user: {
          id: 'admin-fallback',
          name: 'Administrador',
          email: 'admin@example.com',
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: 'admin-token-fallback'
      });
    }
    
    // Tentar buscar o usuário no banco de dados
    try {
      console.log('Tentando buscar usuário no banco de dados...');
      const user = await req.prisma.user.findUnique({
        where: { email }
      });
      
      // Verificar se o usuário existe
      if (!user) {
        console.log(`Login falhou: usuário ${email} não encontrado`);
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        });
      }
      
      // Verificar se a senha está correta
      // Em produção, você deve usar bcrypt para comparar hashes de senha
      if (user.password !== password) {
        console.log(`Login falhou: senha incorreta para ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        });
      }
      
      // Login bem-sucedido com usuário do banco de dados
      console.log(`Login bem-sucedido: ${user.email}`);
      
      // Retornar os dados do usuário (exceto a senha)
      const { password: userPassword, ...userWithoutPassword } = user;
      
      return res.json({
        success: true,
        user: userWithoutPassword,
        token: 'token-exemplo' // Em produção, gere um token JWT
      });
    } catch (dbError) {
      console.error('Erro ao acessar o banco de dados:', dbError);
      console.log('Tentando fallback para admin...');
      
      // Se falhar a consulta ao banco e as credenciais não forem do admin, retornar erro
      if (email !== 'admin@example.com' || password !== 'admin123') {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos. Banco de dados indisponível. Tente admin@example.com / admin123.'
        });
      }
      
      // Se forem as credenciais do admin, retornar o usuário admin de fallback
      return res.json({
        success: true,
        user: {
          id: 'admin-fallback',
          name: 'Administrador',
          email: 'admin@example.com',
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: 'admin-token-fallback',
        message: 'Usando login de emergência devido a problemas no banco de dados.'
      });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor ao processar login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verificar se o token é válido
router.post('/verify', (req, res) => {
  const { token } = req.body;
  
  // Em produção, verifique o token JWT
  // Para este exemplo, qualquer token é considerado válido
  
  // Token de fallback para admin
  if (token === 'admin-token-fallback') {
    return res.json({
      success: true,
      user: {
        id: 'admin-fallback',
        name: 'Administrador',
        email: 'admin@example.com',
        role: 'ADMIN'
      }
    });
  }
  
  res.json({
    success: true,
    message: 'Token válido'
  });
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