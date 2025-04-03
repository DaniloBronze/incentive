// Serviço de armazenamento baseado em localStorage
// Isso é uma solução temporária para desenvolvimento sem um backend

// Prefixo para as chaves do localStorage
const PREFIX = 'notion_pro_';

// Dados iniciais de usuários
const initialUsers = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@exemplo.com',
    password: 'admin123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Dados iniciais de tarefas
const initialTasks = [
  {
    id: '1',
    text: 'Preparar apresentação para reunião',
    completed: true,
    priority: 'alta',
    userId: '1', // Associado ao usuário Admin
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: '2',
    text: 'Responder emails pendentes',
    completed: false,
    priority: 'média',
    userId: '1', // Associado ao usuário Admin
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: '3',
    text: 'Finalizar relatório mensal',
    completed: false,
    priority: 'alta',
    userId: '1', // Associado ao usuário Admin
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: '4',
    text: 'Revisar documentação do projeto',
    completed: false,
    priority: 'baixa',
    userId: '1', // Associado ao usuário Admin
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Dados iniciais de notas
const initialNotes = [
  {
    id: '1',
    text: 'Ideias para o novo projeto:\n- Implementar design responsivo\n- Adicionar tema escuro\n- Melhorar performance',
    pinned: true,
    userId: '1', // Associado ao usuário Admin
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: '2',
    text: 'Pontos para a reunião de amanhã:\n1. Discutir timeline do projeto\n2. Apresentar novos recursos\n3. Coletar feedback da equipe',
    pinned: false,
    userId: '1', // Associado ao usuário Admin
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: '3',
    text: 'Não esquecer de atualizar as dependências do projeto antes da reunião de sprint.',
    pinned: true,
    userId: '1', // Associado ao usuário Admin
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

// Inicializar o armazenamento com dados padrão se necessário
export const initializeStorage = () => {
  // Inicializar usuários se não existirem
  if (!localStorage.getItem(`${PREFIX}users`)) {
    localStorage.setItem(`${PREFIX}users`, JSON.stringify(initialUsers));
    console.log('Usuários iniciais criados com sucesso!');
  }
  
  // Inicializar tarefas se não existirem
  if (!localStorage.getItem(`${PREFIX}tasks`)) {
    localStorage.setItem(`${PREFIX}tasks`, JSON.stringify(initialTasks));
    console.log('Tarefas iniciais criadas com sucesso!');
  }
  
  // Inicializar notas se não existirem
  if (!localStorage.getItem(`${PREFIX}notes`)) {
    localStorage.setItem(`${PREFIX}notes`, JSON.stringify(initialNotes));
    console.log('Notas iniciais criadas com sucesso!');
  }
  
  return { success: true };
};

// Funções genéricas de armazenamento
export const getAll = (collection) => {
  const key = `${PREFIX}${collection}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
};

export const getById = (collection, id) => {
  const items = getAll(collection);
  return items.find(item => item.id === id);
};

export const create = (collection, data) => {
  const items = getAll(collection);
  const now = new Date().toISOString();
  
  const newItem = {
    ...data,
    id: Date.now().toString(), // Simulação de UUID
    createdAt: now,
    updatedAt: now
  };
  
  items.push(newItem);
  localStorage.setItem(`${PREFIX}${collection}`, JSON.stringify(items));
  
  return newItem;
};

export const update = (collection, id, data) => {
  const items = getAll(collection);
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) {
    throw new Error(`Item com ID ${id} não encontrado na coleção ${collection}`);
  }
  
  const updatedItem = {
    ...items[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  items[index] = updatedItem;
  localStorage.setItem(`${PREFIX}${collection}`, JSON.stringify(items));
  
  return updatedItem;
};

export const remove = (collection, id) => {
  const items = getAll(collection);
  const filteredItems = items.filter(item => item.id !== id);
  
  localStorage.setItem(`${PREFIX}${collection}`, JSON.stringify(filteredItems));
  
  return { success: true };
}; 