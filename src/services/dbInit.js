import { createDefaultUserIfNotExists } from './userService';

// Função para inicializar o armazenamento local
export const initializeDatabase = async () => {
  try {
    // Cria o usuário padrão se necessário
    await createDefaultUserIfNotExists();
    
    console.log('Inicialização do armazenamento local concluída com sucesso!');
    return { success: true };
  } catch (error) {
    console.error('Erro ao inicializar o armazenamento local:', error);
    return { success: false, error };
  }
}; 