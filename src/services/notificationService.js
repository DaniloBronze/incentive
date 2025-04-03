// Serviço para gerenciar notificações e lembretes
import taskService from './taskService';

// Chave para armazenar o estado das notificações
const NOTIFICATION_PERMISSION_KEY = 'notion_pro_notification_permission';
const NOTIFICATION_CHECKED_KEY = 'notion_pro_notification_last_checked';

// Verificar se as notificações estão habilitadas
export const areNotificationsEnabled = () => {
  return localStorage.getItem(NOTIFICATION_PERMISSION_KEY) === 'granted';
};

// Solicitar permissão para enviar notificações
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações');
      return { success: false, message: 'Este navegador não suporta notificações' };
    }
    
    if (Notification.permission === 'granted') {
      localStorage.setItem(NOTIFICATION_PERMISSION_KEY, 'granted');
      return { success: true, permission: 'granted' };
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      localStorage.setItem(NOTIFICATION_PERMISSION_KEY, permission);
      return { success: true, permission };
    }
    
    return { success: false, permission: Notification.permission };
  } catch (error) {
    console.error('Erro ao solicitar permissão para notificações:', error);
    return { success: false, message: 'Erro ao solicitar permissão para notificações' };
  }
};

// Enviar uma notificação
export const sendNotification = (title, options = {}) => {
  try {
    if (!areNotificationsEnabled() || Notification.permission !== 'granted') {
      console.log('Notificações não estão habilitadas');
      return false;
    }
    
    const notification = new Notification(title, {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options
    });
    
    notification.onclick = function() {
      window.focus();
      this.close();
      if (options.onClick) options.onClick();
    };
    
    return notification;
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return false;
  }
};

// Auxiliares para comparação de datas
const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

// Verificar tarefas com prazo próximo e enviar notificações
export const checkDueTasks = async () => {
  try {
    // Evitar verificações muito frequentes (no máximo a cada 5 minutos)
    const lastChecked = localStorage.getItem(NOTIFICATION_CHECKED_KEY);
    const now = new Date().getTime();
    
    if (lastChecked && now - parseInt(lastChecked) < 5 * 60 * 1000) {
      return;
    }
    
    localStorage.setItem(NOTIFICATION_CHECKED_KEY, now.toString());
    
    if (!areNotificationsEnabled()) {
      return;
    }
    
    const result = await taskService.getTasks();
    if (!result.success) return;
    
    const tasks = result.tasks;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Verificar tarefas que vencem hoje
    const tasksForToday = tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return isSameDay(dueDate, today);
    });
    
    // Verificar tarefas que vencem amanhã
    const tasksForTomorrow = tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      return isSameDay(dueDate, tomorrow);
    });
    
    // Enviar notificações para tarefas de hoje
    if (tasksForToday.length > 0) {
      sendNotification(`Você tem ${tasksForToday.length} tarefa(s) para hoje`, {
        body: tasksForToday.map(task => task.title).join(', '),
        tag: 'tasks-today',
        onClick: () => window.location.href = '/tasks'
      });
    }
    
    // Enviar notificações para tarefas de amanhã
    if (tasksForTomorrow.length > 0) {
      sendNotification(`Você tem ${tasksForTomorrow.length} tarefa(s) para amanhã`, {
        body: tasksForTomorrow.map(task => task.title).join(', '),
        tag: 'tasks-tomorrow',
        onClick: () => window.location.href = '/tasks'
      });
    }
    
    return { today: tasksForToday, tomorrow: tasksForTomorrow };
  } catch (error) {
    console.error('Erro ao verificar tarefas próximas:', error);
    return { error: 'Erro ao verificar tarefas próximas' };
  }
};

// Agendar verificação periódica de tarefas
let checkInterval = null;

export const startNotificationService = () => {
  if (!checkInterval) {
    // Verificar tarefas imediatamente e depois a cada 30 minutos
    checkDueTasks();
    checkInterval = setInterval(checkDueTasks, 30 * 60 * 1000);
  }
};

export const stopNotificationService = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}; 