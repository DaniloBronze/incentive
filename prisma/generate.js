const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Iniciando geração do Prisma Client...');

// Verificar ambiente
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado (valor escondido)' : 'NÃO CONFIGURADO');

// Verificar existência do schema.prisma
const schemaPath = path.join(__dirname, 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error('Erro: schema.prisma não encontrado em', schemaPath);
  process.exit(1);
}

// Verificar conteúdo do schema.prisma
const schemaContent = fs.readFileSync(schemaPath, 'utf8');
console.log('schema.prisma encontrado com', schemaContent.split('\n').length, 'linhas');

// Verificar se DATABASE_URL está no ambiente
if (!process.env.DATABASE_URL) {
  console.log('DATABASE_URL não encontrada no ambiente, tentando obter de .env');
  
  // Verificar se .env existe
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    console.log('.env encontrado, adicionando variáveis ao ambiente');
    
    // Ler .env e adicionar DATABASE_URL ao ambiente
    const envContent = fs.readFileSync(envPath, 'utf8');
    const databaseUrlMatch = envContent.match(/DATABASE_URL="([^"]*)"/);
    
    if (databaseUrlMatch && databaseUrlMatch[1]) {
      process.env.DATABASE_URL = databaseUrlMatch[1];
      console.log('DATABASE_URL obtido do arquivo .env');
    } else {
      console.log('DATABASE_URL não encontrado no arquivo .env');
    }
  } else {
    console.log('Arquivo .env não encontrado');
  }
}

try {
  console.log('Executando prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma Client gerado com sucesso!');
} catch (error) {
  console.error('Erro ao gerar Prisma Client:', error);
  process.exit(1);
} 