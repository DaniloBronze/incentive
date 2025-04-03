const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Verificar se os arquivos de rotas existem
console.log('Verificando arquivos de rotas...');
const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(file => {
  console.log(`Arquivo de rota encontrado: ${file}`);
});

// Importar rotas
console.log('Importando rotas...');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const noteRoutes = require('./routes/notes');
const taskRoutes = require('./routes/tasks');

let categoryRoutes;
try {
  console.log('Tentando importar rotas de categorias...');
  categoryRoutes = require('./routes/categories');
  console.log('Rotas de categorias importadas com sucesso!');
} catch (error) {
  console.error('Erro ao importar rotas de categorias:', error);
}

let tagRoutes;
try {
  console.log('Tentando importar rotas de etiquetas...');
  tagRoutes = require('./routes/tags');
  console.log('Rotas de etiquetas importadas com sucesso!');
} catch (error) {
  console.error('Erro ao importar rotas de etiquetas:', error);
}

// Inicializar app
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Adicionar prisma ao request
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Query params:`, req.query);
  next();
});

// Definir rotas da API
console.log('Configurando rotas...');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tasks', taskRoutes);

// Definir rotas adicionais se disponíveis
if (categoryRoutes) {
  console.log('Registrando rotas de categorias...');
  app.use('/api/categories', categoryRoutes);
}

if (tagRoutes) {
  console.log('Registrando rotas de etiquetas...');
  app.use('/api/tags', tagRoutes);
}

// Rota para verificar se a API está funcionando
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API Incentive funcionando!',
    routes: [
      '/api/auth',
      '/api/users',
      '/api/notes',
      '/api/tasks',
      categoryRoutes ? '/api/categories' : null,
      tagRoutes ? '/api/tags' : null
    ].filter(Boolean)
  });
});

// Em produção, servir arquivos estáticos da pasta build
if (process.env.NODE_ENV === 'production') {
  // Verificar se a pasta build existe
  const buildPath = path.join(__dirname, '..', 'build');
  if (fs.existsSync(buildPath)) {
    console.log('Servindo arquivos estáticos da pasta build...');
    app.use(express.static(buildPath));
    
    // Todas as outras rotas devem retornar o index.html para SPA
    app.get('*', (req, res) => {
      // Verificar se a rota começa com /api - se sim, não enviamos o index.html
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(buildPath, 'index.html'));
      } else {
        res.status(404).json({ message: 'API endpoint não encontrado' });
      }
    });
  } else {
    console.warn('Pasta build não encontrada. Arquivos estáticos não serão servidos.');
  }
}

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API acessível em: http://localhost:${PORT}`);
  
  try {
    // Verificar se existe pelo menos um usuário no banco
    const userCount = await prisma.user.count();
    
    // Se não existir nenhum usuário, criar o usuário padrão
    if (userCount === 0) {
      await prisma.user.create({
        data: {
          name: 'Administrador',
          email: 'admin@example.com',
          password: 'admin123', // Em produção, você deve hashear a senha
          role: 'ADMIN'
        }
      });
      console.log('Usuário padrão criado com sucesso');
    }
  } catch (error) {
    console.error('Erro ao verificar/criar usuário padrão:', error);
  }
});

// Lidar com o encerramento
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Conexão com o banco de dados fechada');
  process.exit(0);
}); 