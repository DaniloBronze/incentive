const fs = require('fs');
const path = require('path');

// Verificar se o arquivo .env existe
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('Criando arquivo .env para o build...');
  fs.writeFileSync(
    path.join(__dirname, '.env'),
    'NODE_ENV=production\n' +
    'PUBLIC_URL=/\n'
  );
}

// Verificar se o build folder existe
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  console.log('Criando diretório build...');
  fs.mkdirSync(buildDir, { recursive: true });
}

console.log('Configuração do build concluída com sucesso!'); 