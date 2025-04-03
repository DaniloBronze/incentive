// Script para configurar o banco de dados
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define cores para o terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const print = {
  step: (message) => console.log(`${colors.blue}[ETAPA]${colors.reset} ${message}`),
  success: (message) => console.log(`${colors.green}[SUCESSO]${colors.reset} ${message}`),
  error: (message) => console.log(`${colors.red}[ERRO]${colors.reset} ${message}`),
  warning: (message) => console.log(`${colors.yellow}[AVISO]${colors.reset} ${message}`),
  info: (message) => console.log(`${colors.cyan}[INFO]${colors.reset} ${message}`),
};

// Função para executar comandos
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`${colors.red}${stderr}${colors.reset}`);
        reject(error);
        return;
      }
      
      if (stdout.trim()) {
        console.log(stdout);
      }
      
      resolve(stdout);
    });
  });
};

async function setupDatabase() {
  print.info('Iniciando configuração do banco de dados');
  
  try {
    // Verificar se o arquivo .env existe
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      print.error('Arquivo .env não encontrado!');
      print.info(`Crie um arquivo .env na raiz do projeto com a seguinte variável:
${colors.yellow}DATABASE_URL="postgresql://usuario:senha@ep-XXXXXXXX.region.aws.neon.tech/nomedobanco?sslmode=require"${colors.reset}

Substitua com suas credenciais do Neon. Você pode obter a string de conexão no painel do Neon.`);
      return;
    }
    
    // Verificar se a URL do banco de dados ainda é o padrão
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('postgresql://usuario:senha@ep-XXXXXXXX')) {
      print.error('A URL do banco de dados no arquivo .env ainda é o modelo padrão!');
      print.info(`Atualize o arquivo .env com suas credenciais do Neon. Exemplo:
${colors.yellow}DATABASE_URL="postgresql://usuario_real:senha_real@ep-abcdefg.us-east-2.aws.neon.tech/meudb?sslmode=require"${colors.reset}`);
      return;
    }
    
    print.step('Gerando migração do Prisma');
    await execCommand('npx prisma migrate dev --name initial_migration');
    print.success('Migração criada com sucesso!');
    
    print.step('Gerando cliente Prisma');
    await execCommand('npx prisma generate');
    print.success('Cliente Prisma gerado com sucesso!');
    
    print.info('Configuração do banco de dados finalizada com sucesso!');
    print.info(`Você pode agora iniciar o aplicativo com ${colors.yellow}npm start${colors.reset}`);
  } catch (error) {
    print.error(`Ocorreu um erro na configuração: ${error.message}`);
  }
}

setupDatabase(); 