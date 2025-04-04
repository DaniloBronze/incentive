console.log('Iniciando API Incentive...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado (URL escondida por segurança)' : 'NÃO CONFIGURADO');
console.log('PORT:', process.env.PORT || 5000);

// Importações necessárias
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Verificar ambiente Prisma
try {
  console.log('Verificando ambiente Prisma...');
  console.log('__dirname:', __dirname);
  console.log('node_modules path:', path.join(__dirname, '..', 'node_modules', '@prisma'));
  console.log('Prisma client files:', 
    fs.existsSync(path.join(__dirname, '..', 'node_modules', '@prisma', 'client')) ? 
    'Encontrado' : 'NÃO ENCONTRADO');
  
  // Verificar se schema.prisma existe
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  console.log('schema.prisma path:', schemaPath);
  console.log('schema.prisma exists:', fs.existsSync(schemaPath) ? 'Sim' : 'Não');
  
  if (fs.existsSync(schemaPath)) {
    console.log('schema.prisma content:');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    console.log(schemaContent.substring(0, 500) + '...'); // Mostrar primeiros 500 caracteres
  }
  
  // Verificar .env
  const envPath = path.join(__dirname, '..', '.env');
  console.log('.env path:', envPath);
  console.log('.env exists:', fs.existsSync(envPath) ? 'Sim' : 'Não');
  
  if (fs.existsSync(envPath)) {
    console.log('.env content (sem mostrar valores):');
    const envContent = fs.readFileSync(envPath, 'utf8');
    // Mostrar apenas nomes das variáveis, não os valores
    const envVars = envContent.split('\n').map(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        return parts[0] + '=[valor escondido]';
      }
      return line;
    }).join('\n');
    console.log(envVars);
  }
} catch (error) {
  console.error('Erro ao verificar ambiente Prisma:', error);
}

// Inicializar Prisma Client com tratamento de erro
let prisma;
try {
  console.log('Tentando importar PrismaClient...');
  const { PrismaClient } = require('@prisma/client');
  console.log('PrismaClient importado com sucesso');
  
  console.log('Tentando instanciar PrismaClient...');
  prisma = new PrismaClient();
  console.log('PrismaClient instanciado com sucesso');
} catch (error) {
  console.error('ERRO AO INICIALIZAR PRISMA CLIENT:', error);
  console.error('Detalhes:', {
    code: error.code,
    clientVersion: error.clientVersion,
    message: error.message,
    stack: error.stack
  });
  
  console.log('Criando um mock do PrismaClient para permitir operações básicas...');
  // Mock do PrismaClient para permitir que a aplicação continue funcionando
  prisma = {
    $queryRaw: async () => {
      throw new Error('Banco de dados indisponível');
    },
    $disconnect: async () => {
      console.log('Mock disconnect chamado');
    },
    user: {
      findUnique: async () => null,
      count: async () => 0,
      create: async () => ({})
    }
  };
  
  console.log('Mock do PrismaClient criado');
}

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
const PORT = process.env.PORT || 5000;

// Middleware
// Configurar CORS para permitir requisições de qualquer origem na Vercel
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://incentive-kappa.vercel.app', 'https://incentive.vercel.app', /\.vercel\.app$/]
    : 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Verificar conexão com o banco de dados
app.use(async (req, res, next) => {
  try {
    // Verifica se o banco de dados está acessível
    console.log('Tentando conectar ao banco de dados...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('Conexão com o banco de dados estabelecida com sucesso');
    // Adiciona prisma à requisição
    req.prisma = prisma;
    next();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    console.error('Detalhes do erro:', error.message);
    if (error.code) {
      console.error('Código do erro:', error.code);
    }
    if (error.meta) {
      console.error('Meta do erro:', error.meta);
    }
    
    // Se a rota for de login, podemos continuar (nessa rota temos fallback para o usuário admin)
    if (req.path === '/api/auth/login') {
      console.log('Login request detectado, continuando com fallback...');
      req.prisma = prisma;
      next();
    } else {
      // Outras rotas retornam erro
      res.status(500).json({
        success: false,
        message: 'Erro de conexão com o banco de dados',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erro de banco de dados',
        userMessage: 'O banco de dados está indisponível no momento. Tente fazer login com admin@example.com / admin123.'
      });
    }
  }
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
    environment: process.env.NODE_ENV,
    prismaStatus: prisma.hasOwnProperty('$queryRaw') ? 'Configurado' : 'Não disponível',
    databaseStatus: req.dbConnected ? 'Conectado' : 'Desconectado (usando fallback)',
    adminFallback: true,
    adminUser: 'admin@example.com',
    adminPassword: 'admin123',
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
    
    // Configurar tipos MIME específicos para garantir que os arquivos sejam servidos corretamente
    express.static.mime.define({'application/javascript': ['js']});
    express.static.mime.define({'text/css': ['css']});
    
    // Usar express.static com configurações adicionais
    app.use(express.static(buildPath, {
      maxAge: '1y',
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, max-age=0');
        } else if (path.endsWith('.js') || path.endsWith('.css')) {
          res.setHeader('Content-Type', path.endsWith('.js') ? 'application/javascript' : 'text/css');
          res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
      }
    }));
    
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
    console.log('Não foi possível criar o usuário padrão. Use admin@example.com / admin123 para login de fallback.');
  }
});

// Lidar com o encerramento
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Conexão com o banco de dados fechada');
  process.exit(0);
}); 