# Incentive

Um gerenciador de tarefas e anotações inspirado no Notion, com visual moderno e funcionalidades essenciais para organização pessoal.

## Recursos

- **Dashboard**: Visão geral de tarefas e notas recentes
- **Notas**: Crie, edite e organize suas anotações importantes com formatação Markdown
- **Tarefas**: Gerencie suas tarefas com prioridades, categorias, etiquetas e status

## Tecnologias Utilizadas

- React com Material UI para uma interface moderna
- Prisma ORM para acesso ao banco de dados PostgreSQL
- Express para o backend API
- Editor de Markdown personalizado para formatação de texto

## Requisitos

- Node.js 14+ e npm
- Banco de dados PostgreSQL (recomendamos Neon.tech, Railway ou Supabase)

## Começando

1. Clone o repositório
2. Instale as dependências com `npm install`
3. Configure o arquivo `.env` com suas variáveis de ambiente (veja `.env.example`)
4. Execute as migrações do banco de dados com `npx prisma migrate dev`
5. Inicie o aplicativo com `npm run dev`

## Scripts Disponíveis

- `npm run dev` - Inicia o aplicativo em modo de desenvolvimento (frontend e backend)
- `npm start` - Inicia apenas o frontend
- `npm run api` - Inicia apenas o backend API
- `npm run build` - Cria a versão de produção do frontend
- `npm run vercel-build` - Script de build para deploy na Vercel

## Deploy na Vercel

Este projeto está configurado para deploy na Vercel. Para mais detalhes, consulte o arquivo [vercel-deploy.md](vercel-deploy.md).

## Estrutura do Projeto

- `/api` - Backend API Express
  - `/routes` - Rotas da API
- `/prisma` - Configuração e migrações do Prisma
- `/public` - Arquivos estáticos públicos
- `/src` - Código fonte do frontend
  - `/components` - Componentes reutilizáveis
  - `/contexts` - Contextos React
  - `/pages` - Páginas principais da aplicação
  - `/services` - Serviços para comunicação com a API

## Funcionalidades

### Notas
- Criar, editar e excluir notas
- Formatação em Markdown com editor visual 
- Fixar notas importantes
- Pesquisar por texto

### Tarefas
- Adicionar, editar e excluir tarefas
- Marcar tarefas como concluídas
- Definir prioridade (baixa, média, alta)
- Organizar por categorias e etiquetas
- Filtrar por status
- Pesquisar por texto

### Dashboard
- Visualizar progresso das tarefas
- Ver tarefas pendentes
- Acessar notas recentes
