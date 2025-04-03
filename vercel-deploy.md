# Instruções para deploy na Vercel

## Pré-requisitos

1. Ter uma conta na Vercel: https://vercel.com/signup
2. Ter o Vercel CLI instalado: `npm i -g vercel`
3. Banco de dados PostgreSQL (sugerimos usar Neon.tech, Railway.app ou Supabase)

## Configuração do ambiente

1. Crie um banco de dados PostgreSQL em um provedor como Neon.tech, Railway ou Supabase
2. Obtenha a string de conexão do banco de dados

## Configuração na Vercel

### Opção 1: Deploy pela CLI

1. Faça login na CLI: `vercel login`
2. No diretório do projeto, execute: `vercel`
3. Siga as instruções e responda às perguntas
4. Quando solicitado a definir variáveis de ambiente, adicione:
   - `DATABASE_URL`: Sua string de conexão com o banco de dados
   - `NODE_ENV`: `production`

### Opção 2: Deploy pelo GitHub

1. Faça push do projeto para um repositório GitHub
2. Faça login na Vercel: https://vercel.com
3. Importe o repositório do GitHub
4. Configure as variáveis de ambiente:
   - `DATABASE_URL`: Sua string de conexão com o banco de dados
   - `NODE_ENV`: `production`
5. Clique em "Deploy"

## Após o deploy

1. Execute as migrações do Prisma na Vercel:
   - Vá para "Settings" > "Functions" > "Console" e execute:
   ```
   npx prisma migrate deploy
   ```

2. Verifique se o aplicativo está funcionando no domínio fornecido pela Vercel

## Observações

- Se você tiver problemas com CORS, verifique se o arquivo `api/server.js` está configurado para permitir solicitações do seu domínio da Vercel
- As variáveis de ambiente podem ser atualizadas em "Settings" > "Environment Variables" no dashboard da Vercel
- O banco de dados deve ser acessível pela Vercel (certifique-se de que o IP esteja na lista de permissões, se necessário) 