const fs = require('fs');
const path = require('path');

console.log('Iniciando script vercel-build.js...');

// Verificar se o arquivo .env existe
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('Criando arquivo .env para o build...');
  
  // Verificar se DATABASE_URL está disponível no ambiente
  if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL encontrada no ambiente!');
  } else {
    console.log('ATENÇÃO: DATABASE_URL não encontrada no ambiente, usando valor padrão');
  }
  
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_F3gnYpSbL8IM@ep-bold-mud-a5u9db4p-pooler.us-east-2.aws.neon.tech/tarefas?sslmode=require';
  
  console.log('Escrevendo arquivo .env com DATABASE_URL...');
  
  fs.writeFileSync(
    path.join(__dirname, '.env'),
    `NODE_ENV=production\n` +
    `PUBLIC_URL=/\n` +
    `DATABASE_URL="${databaseUrl}"\n`
  );
  
  console.log('Arquivo .env criado com sucesso');
} else {
  console.log('Arquivo .env já existe, verificando conteúdo...');
  
  // Lê o arquivo .env existente
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  
  // Verifica se DATABASE_URL está presente
  if (!envContent.includes('DATABASE_URL=')) {
    console.log('DATABASE_URL não encontrada no arquivo .env existente, adicionando...');
    
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_F3gnYpSbL8IM@ep-bold-mud-a5u9db4p-pooler.us-east-2.aws.neon.tech/tarefas?sslmode=require';
    
    // Adiciona DATABASE_URL ao arquivo .env
    fs.appendFileSync(
      path.join(__dirname, '.env'),
      `\nDATABASE_URL="${databaseUrl}"\n`
    );
    
    console.log('DATABASE_URL adicionada ao arquivo .env');
  } else {
    console.log('DATABASE_URL já existe no arquivo .env');
  }
}

// Verifica se o prisma.schema está em ordem
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  console.log('schema.prisma encontrado, verificando conteúdo...');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  console.log('schema.prisma está ok');
} else {
  console.log('ALERTA: schema.prisma não encontrado em', schemaPath);
}

// Verificar se o build folder existe
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  console.log('Criando diretório build...');
  fs.mkdirSync(buildDir, { recursive: true });
}

console.log('Configuração do build concluída com sucesso!'); 