import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  Paper,
  Divider,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Card,
  Tooltip,
  Tab,
  Tabs,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  TaskAlt,
  Close as CloseIcon,
  FilterAlt as FilterAltIcon,
  CalendarMonth as CalendarIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Folder as FolderIcon,
  LocalOffer as TagIcon,
  AddCircleOutline,
} from '@mui/icons-material';
import taskService from '../services/taskService';
import categoryService from '../services/categoryService';
import tagService from '../services/tagService';
import * as notificationService from '../services/notificationService';
import NotificationBanner from '../components/NotificationBanner';
import TaskFormWithDate from '../components/TaskFormWithDate';

function Tasks() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(null);
  const [newTaskCategoryId, setNewTaskCategoryId] = useState(null);
  const [newTaskTags, setNewTaskTags] = useState([]);
  const [sendReminder, setSendReminder] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('todas');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#4CAF50');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#03DAC5');
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);

  // Carregar tarefas do banco de dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Carregar tarefas, categorias e etiquetas em paralelo
        const [tasksResult, categoriesResult, tagsResult] = await Promise.all([
          taskService.getTasks(),
          categoryService.getCategories(),
          tagService.getTags()
        ]);
        
        if (tasksResult.success) {
          setTasks(tasksResult.tasks);
        } else {
          setError(tasksResult.message || 'Erro ao carregar tarefas');
        }
        
        if (categoriesResult.success) {
          setCategories(categoriesResult.categories);
        }
        
        if (tagsResult.success) {
          setTags(tagsResult.tags);
        }
        
        setError(null);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Falha ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Iniciar serviço de notificações se permitido
  useEffect(() => {
    if (notificationService.areNotificationsEnabled()) {
      notificationService.startNotificationService();
    }

    return () => {
      notificationService.stopNotificationService();
    };
  }, []);

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      try {
        if (editingTask !== null) {
          // Atualizar tarefa existente
          const taskData = { 
            title: newTaskTitle,
            description: newTaskDescription,
            dueDate: newTaskDueDate,
            categoryId: newTaskCategoryId,
            tagIds: newTaskTags.map(tag => tag.id)
          };
          
          const result = await taskService.updateTask(editingTask, taskData);
          
          if (result.success) {
            // Atualizar a lista local de tarefas
            setTasks(tasks.map((task) => (task.id === editingTask ? result.task : task)));
            setNotification({ open: true, message: 'Tarefa atualizada com sucesso!', severity: 'success' });
            resetForm();
          } else {
            throw new Error(result.message || 'Erro ao atualizar tarefa');
          }
        } else {
          // Criar nova tarefa
          const taskData = {
            title: newTaskTitle,
            description: newTaskDescription,
            dueDate: newTaskDueDate,
            categoryId: newTaskCategoryId,
            tagIds: newTaskTags.map(tag => tag.id)
          };
          
          const result = await taskService.createTask(taskData);
          
          if (result.success) {
            setTasks([...tasks, result.task]);
            setNotification({ open: true, message: 'Tarefa criada com sucesso!', severity: 'success' });
            
            // Se habilitado, enviar uma notificação sobre a nova tarefa
            if (sendReminder && newTaskDueDate && notificationService.areNotificationsEnabled()) {
              notificationService.sendNotification('Nova tarefa com prazo criada', {
                body: `"${newTaskTitle}" - vence em ${formatDueDate(newTaskDueDate)}`,
                tag: 'new-task'
              });
            }
            
            resetForm();
          } else {
            throw new Error(result.message || 'Erro ao criar tarefa');
          }
        }
      } catch (error) {
        console.error('Erro ao salvar tarefa:', error);
        setNotification({ open: true, message: 'Erro ao salvar tarefa. Tente novamente.', severity: 'error' });
      }
    }
  };

  const resetForm = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate(null);
    setNewTaskCategoryId(null);
    setNewTaskTags([]);
    setSendReminder(true);
    setEditingTask(null);
  };

  const handleDeleteTask = async (id) => {
    try {
      const result = await taskService.deleteTask(id);
      
      if (result.success) {
        const updatedTasks = tasks.filter((task) => task.id !== id);
        setTasks(updatedTasks);
        setNotification({ open: true, message: 'Tarefa excluída com sucesso!', severity: 'success' });
        handleCloseMenu();
      } else {
        throw new Error(result.message || 'Erro ao excluir tarefa');
      }
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      setNotification({ open: true, message: 'Erro ao excluir tarefa. Tente novamente.', severity: 'error' });
    }
  };

  const handleEditTask = (task) => {
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || '');
    setNewTaskDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setNewTaskCategoryId(task.categoryId || null);
    setNewTaskTags(task.tags || []);
    setEditingTask(task.id);
    handleCloseMenu();
  };

  const handleToggleComplete = async (id) => {
    try {
      // Atualizar localmente para dar feedback imediato
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
      
      // Chamar API para atualizar no servidor
      const result = await taskService.toggleTaskComplete(id);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar tarefa');
      }
    } catch (error) {
      console.error('Erro ao alternar status da tarefa:', error);
      setError('Erro ao atualizar tarefa. Tente novamente.');
      
      // Reverter mudança em caso de erro
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    }
  };

  const handleChangePriority = async (id, priority) => {
    try {
      // Atualizar localmente para feedback imediato
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === id ? { ...task, priority } : task
      ));
      
      // Enviar para API
      const result = await taskService.updateTask(id, { priority });
      
      if (result.success) {
        setNotification({ open: true, message: `Prioridade alterada para ${priority}!`, severity: 'success' });
      } else {
        throw new Error(result.message || 'Erro ao atualizar prioridade');
      }
      
      handleCloseMenu();
    } catch (error) {
      console.error('Erro ao alterar prioridade da tarefa:', error);
      
      // Reverter a alteração local em caso de erro
      setTasks(prevTasks => {
        // Buscar a task antes da atualização (se existir na lista)
        const originalTask = prevTasks.find(t => t.id === id);
        // Se encontrou, restaurar a prioridade original
        return prevTasks.map(task => 
          task.id === id ? { ...task, priority: originalTask?.priority || 'média' } : task
        );
      });
      
      setNotification({ open: true, message: 'Erro ao alterar prioridade. Tente novamente.', severity: 'error' });
    }
  };

  const handleChangeCategory = async (id, categoryId) => {
    try {
      // Atualizar localmente para feedback imediato
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === id ? { 
          ...task, 
          categoryId,
          category: categoryId ? categories.find(c => c.id === categoryId) : null
        } : task
      ));
      
      // Enviar para API
      const result = await taskService.assignTaskToCategory(id, categoryId);
      
      if (result.success) {
        const categoryName = categoryId ? categories.find(c => c.id === categoryId)?.name || 'nova categoria' : 'nenhuma';
        setNotification({ open: true, message: `Tarefa movida para ${categoryName}!`, severity: 'success' });
      } else {
        throw new Error(result.message || 'Erro ao atualizar categoria');
      }
      
      handleCloseMenu();
    } catch (error) {
      console.error('Erro ao alterar categoria da tarefa:', error);
      
      // Reverter a alteração local em caso de erro
      setTasks(prevTasks => {
        const originalTask = prevTasks.find(t => t.id === id);
        return prevTasks.map(task => 
          task.id === id ? { 
            ...task, 
            categoryId: originalTask?.categoryId || null,
            category: originalTask?.category || null
          } : task
        );
      });
      
      setNotification({ open: true, message: 'Erro ao alterar categoria. Tente novamente.', severity: 'error' });
    }
  };

  const handleAddTag = async (taskId, tagId) => {
    try {
      const tag = tags.find(t => t.id === tagId);
      if (!tag) return;
      
      // Atualizar localmente para feedback imediato
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
          // Verificar se a tarefa já tem esta etiqueta
          const hasTag = task.tags && task.tags.some(t => t.id === tagId);
          if (hasTag) return task;
          
          // Adicionar etiqueta à tarefa
          return {
            ...task,
            tags: [...(task.tags || []), tag]
          };
        }
        return task;
      }));
      
      // Enviar para API
      const result = await taskService.addTagToTask(taskId, tagId);
      
      if (result.success) {
        setNotification({ open: true, message: `Etiqueta adicionada à tarefa!`, severity: 'success' });
      } else {
        throw new Error(result.message || 'Erro ao adicionar etiqueta');
      }
      
      handleCloseMenu();
    } catch (error) {
      console.error('Erro ao adicionar etiqueta à tarefa:', error);
      
      // Reverter a alteração local em caso de erro
      setTasks(prevTasks => {
        const originalTask = prevTasks.find(t => t.id === taskId);
        return prevTasks.map(task => 
          task.id === taskId ? { ...task, tags: originalTask?.tags || [] } : task
        );
      });
      
      setNotification({ open: true, message: 'Erro ao adicionar etiqueta. Tente novamente.', severity: 'error' });
    }
  };

  const handleRemoveTag = async (taskId, tagId) => {
    try {
      // Atualizar localmente para feedback imediato
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            tags: (task.tags || []).filter(t => t.id !== tagId)
          };
        }
        return task;
      }));
      
      // Enviar para API
      const result = await taskService.removeTagFromTask(taskId, tagId);
      
      if (result.success) {
        setNotification({ open: true, message: `Etiqueta removida da tarefa!`, severity: 'success' });
      } else {
        throw new Error(result.message || 'Erro ao remover etiqueta');
      }
    } catch (error) {
      console.error('Erro ao remover etiqueta da tarefa:', error);
      
      // Reverter a alteração local em caso de erro
      setTasks(prevTasks => {
        const originalTask = prevTasks.find(t => t.id === taskId);
        return prevTasks.map(task => 
          task.id === taskId ? { ...task, tags: originalTask?.tags || [] } : task
        );
      });
      
      setNotification({ open: true, message: 'Erro ao remover etiqueta. Tente novamente.', severity: 'error' });
    }
  };

  const handleOpenMenu = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedTaskId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedTaskId(null);
  };

  const handleChangeFilter = (event, newFilter) => {
    setFilter(newFilter);
    if (isMobile) {
      setFilterDrawerOpen(false);
    }
  };

  const handleChangeCategoryFilter = (categoryId) => {
    setCategoryFilter(categoryId === categoryFilter ? null : categoryId);
    if (isMobile) {
      setFilterDrawerOpen(false);
    }
  };

  const handleChangeTagFilter = (tagId) => {
    setTagFilter(tagId === tagFilter ? null : tagId);
    if (isMobile) {
      setFilterDrawerOpen(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const formatDueDate = (date) => {
    if (!date) return '';
    
    try {
      const dueDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (dueDate.getDate() === today.getDate() && 
          dueDate.getMonth() === today.getMonth() &&
          dueDate.getFullYear() === today.getFullYear()) {
        return 'Hoje';
      } else if (dueDate.getDate() === tomorrow.getDate() && 
                dueDate.getMonth() === tomorrow.getMonth() &&
                dueDate.getFullYear() === tomorrow.getFullYear()) {
        return 'Amanhã';
      } else {
        // Formatar a data no estilo brasileiro (dia/mês/ano)
        return dueDate.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    } catch (e) {
      console.error('Erro ao formatar data:', e);
      return '';
    }
  };

  const getDueDateColor = (dueDate) => {
    if (!dueDate) return theme.palette.text.secondary;
    
    try {
      const date = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);
      
      if (date < today) {
        return theme.palette.error.main; // Vencida
      } else if (date.getDate() === today.getDate() && 
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()) {
        return theme.palette.warning.main; // Hoje
      } else if (date < threeDaysFromNow) {
        return theme.palette.warning.light; // Próximos 3 dias
      } else {
        return theme.palette.success.main; // Futuro
      }
    } catch (e) {
      return theme.palette.text.secondary;
    }
  };

  const isToday = (date) => {
    const today = new Date();
    const taskDate = new Date(date);
    return taskDate.getDate() === today.getDate() &&
           taskDate.getMonth() === today.getMonth() &&
           taskDate.getFullYear() === today.getFullYear();
  };

  const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDate = new Date(date);
    return taskDate.getDate() === tomorrow.getDate() &&
           taskDate.getMonth() === tomorrow.getMonth() &&
           taskDate.getFullYear() === tomorrow.getFullYear();
  };

  const filteredTasks = tasks.filter((task) => {
    // Filtro de pesquisa
    const titleMatches = task && task.title 
      ? task.title.toLowerCase().includes(searchTerm.toLowerCase()) 
      : false;
    
    // Filtro de status
    if (filter === 'concluídas' && !task.completed) return false;
    if (filter === 'pendentes' && task.completed) return false;
    if (filter === 'hoje' && (!task.dueDate || !isToday(task.dueDate))) return false;
    if (filter === 'amanhã' && (!task.dueDate || !isTomorrow(task.dueDate))) return false;
    
    // Filtro de categoria
    if (categoryFilter && task.categoryId !== categoryFilter) return false;
    
    // Filtro de etiqueta
    if (tagFilter && (!task.tags || !task.tags.some(tag => tag.id === tagFilter))) return false;
    
    return titleMatches;
  });

  const getPriorityColor = (priority = 'média') => {
    switch (priority) {
      case 'alta':
        return '#FF5E5B';
      case 'média':
        return '#FFA726';
      case 'baixa':
        return '#66BB6A';
      default:
        return '#FFA726';
    }
  };

  const getCategoryById = (categoryId) => {
    if (!categoryId) return null;
    return categories.find(category => category.id === categoryId) || null;
  };

  const pendingTasksCount = tasks.filter(task => !task.completed).length;
  const todayTasksCount = tasks.filter(task => 
    task.dueDate && isToday(task.dueDate) && !task.completed
  ).length;

  // Adicionar handlers para deletar categorias e tags
  const handleDeleteCategory = async (categoryId) => {
    try {
      const result = await categoryService.deleteCategory(categoryId);
      
      if (result.success) {
        // Atualizar a lista local de categorias
        setCategories(categories.filter(cat => cat.id !== categoryId));
        
        // Remover o filtro de categoria se estiver selecionado
        if (categoryFilter === categoryId) {
          setCategoryFilter(null);
        }
        
        // Atualizar tarefas que usavam esta categoria
        setTasks(tasks.map(task => 
          task.categoryId === categoryId ? { ...task, categoryId: null, category: null } : task
        ));
        
        setNotification({ open: true, message: 'Categoria excluída com sucesso!', severity: 'success' });
      } else {
        throw new Error(result.message || 'Erro ao excluir categoria');
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      setNotification({ open: true, message: 'Erro ao excluir categoria. Tente novamente.', severity: 'error' });
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      const result = await tagService.deleteTag(tagId);
      
      if (result.success) {
        // Atualizar a lista local de tags
        setTags(tags.filter(tag => tag.id !== tagId));
        
        // Remover o filtro de tag se estiver selecionado
        if (tagFilter === tagId) {
          setTagFilter(null);
        }
        
        // Atualizar tarefas que usavam esta tag
        setTasks(tasks.map(task => ({
          ...task,
          tags: task.tags ? task.tags.filter(t => t.id !== tagId) : []
        })));
        
        setNotification({ open: true, message: 'Etiqueta excluída com sucesso!', severity: 'success' });
      } else {
        throw new Error(result.message || 'Erro ao excluir etiqueta');
      }
    } catch (error) {
      console.error('Erro ao excluir etiqueta:', error);
      setNotification({ open: true, message: 'Erro ao excluir etiqueta. Tente novamente.', severity: 'error' });
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      console.log('Tentando criar categoria:', { name: newCategoryName.trim(), color: newCategoryColor });
      
      const result = await categoryService.createCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor
      });
      
      console.log('Resultado da criação da categoria:', result);
      
      if (result.success) {
        setCategories([...categories, result.category]);
        setNewCategoryName('');
        setNewCategoryColor('#4CAF50');
        setCategoryDialogOpen(false);
        setNotification({ open: true, message: 'Categoria criada com sucesso!', severity: 'success' });
      } else {
        // Mostra o erro mas mantém o diálogo aberto
        setNotification({ 
          open: true, 
          message: result.message || 'Erro ao criar categoria. Tente outro nome.', 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      setNotification({ 
        open: true, 
        message: error.message || 'Erro ao criar categoria. Tente novamente.', 
        severity: 'error' 
      });
    }
  };
  
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      console.log('Tentando criar tag:', { name: newTagName.trim(), color: newTagColor });
      
      const result = await tagService.createTag({
        name: newTagName.trim(),
        color: newTagColor
      });
      
      console.log('Resultado da criação da tag:', result);
      
      if (result.success) {
        setTags([...tags, result.tag]);
        setNewTagName('');
        setNewTagColor('#03DAC5');
        setTagDialogOpen(false);
        setNotification({ open: true, message: 'Etiqueta criada com sucesso!', severity: 'success' });
      } else {
        // Mostra o erro mas mantém o diálogo aberto
        setNotification({ 
          open: true, 
          message: result.message || 'Erro ao criar etiqueta. Tente outro nome.', 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('Erro ao criar etiqueta:', error);
      setNotification({ 
        open: true, 
        message: error.message || 'Erro ao criar etiqueta. Tente novamente.', 
        severity: 'error' 
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Banner de notificações */}
      <NotificationBanner />

      {/* Cabeçalho responsivo */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, mb: isMobile ? 1 : 0 }}>
          <TaskAlt sx={{ fontSize: isMobile ? 24 : 28, color: 'primary.main', mr: 1 }} />
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="600">
            Tarefas
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`${pendingTasksCount} pendentes`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ mb: isMobile ? 1 : 0 }}
          />
          {todayTasksCount > 0 && (
            <Chip
              icon={<CalendarIcon fontSize="small" />}
              label={`${todayTasksCount} hoje`}
              color="warning"
              variant="outlined"
              size="small"
              sx={{ mb: isMobile ? 1 : 0 }}
            />
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Formulário de tarefa responsivo */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 4,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TaskFormWithDate
          editingTask={editingTask}
          title={newTaskTitle}
          description={newTaskDescription}
          dueDate={newTaskDueDate}
          categoryId={newTaskCategoryId}
          tags={newTaskTags}
          setTitle={setNewTaskTitle}
          setDescription={setNewTaskDescription}
          setDueDate={setNewTaskDueDate}
          setCategoryId={setNewTaskCategoryId}
          setTags={setNewTaskTags}
          handleSubmit={handleAddTask}
          sendReminder={sendReminder}
          setSendReminder={setSendReminder}
        />
      </Paper>

      {/* Barra de pesquisa e filtros responsivos */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          mb: 2 
        }}>
          <Typography variant="h6" fontWeight="500" sx={{ mb: isMobile ? 2 : 0 }}>
            Suas Tarefas
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            width: isMobile ? '100%' : 'auto',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <TextField
              size="small"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth={isMobile}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                width: isMobile ? '100%' : 200, 
                mr: isMobile ? 0 : 2,
                mb: isMobile ? 2 : 0
              }}
            />
            
            {isMobile ? (
              <Button 
                variant="outlined" 
                startIcon={<FilterAltIcon />}
                onClick={() => setFilterDrawerOpen(true)}
                fullWidth
              >
                Filtrar: {
                  filter === 'todas' ? 'Todas' : 
                  filter === 'pendentes' ? 'Pendentes' : 
                  filter === 'concluídas' ? 'Concluídas' :
                  filter === 'hoje' ? 'Hoje' : 
                  filter === 'amanhã' ? 'Amanhã' : 'Filtro'
                }
              </Button>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterListIcon sx={{ mr: 1, color: 'action.active' }} />
                <Tabs value={filter} onChange={handleChangeFilter} sx={{ minHeight: 0 }}>
                  <Tab 
                    label="Todas" 
                    value="todas" 
                    sx={{ 
                      textTransform: 'none', 
                      minHeight: 0,
                      py: 1,
                      px: 2
                    }} 
                  />
                  <Tab 
                    label="Pendentes" 
                    value="pendentes" 
                    sx={{ 
                      textTransform: 'none', 
                      minHeight: 0,
                      py: 1,
                      px: 2
                    }} 
                  />
                  <Tab 
                    label="Hoje" 
                    value="hoje" 
                    sx={{ 
                      textTransform: 'none', 
                      minHeight: 0,
                      py: 1,
                      px: 2
                    }} 
                  />
                  <Tab 
                    label="Amanhã" 
                    value="amanhã" 
                    sx={{ 
                      textTransform: 'none', 
                      minHeight: 0,
                      py: 1,
                      px: 2
                    }} 
                  />
                  <Tab 
                    label="Concluídas" 
                    value="concluídas" 
                    sx={{ 
                      textTransform: 'none', 
                      minHeight: 0,
                      py: 1,
                      px: 2
                    }} 
                  />
                </Tabs>
              </Box>
            )}
          </Box>
        </Box>

        {/* Filtros ativos */}
        {(categoryFilter || tagFilter) && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {categoryFilter && (
              <Chip
                icon={<FolderIcon fontSize="small" />}
                label={`Categoria: ${getCategoryById(categoryFilter)?.name || 'Desconhecida'}`}
                onDelete={() => setCategoryFilter(null)}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {tagFilter && (
              <Chip
                icon={<TagIcon fontSize="small" />}
                label={`Etiqueta: ${tags.find(t => t.id === tagFilter)?.name || 'Desconhecida'}`}
                onDelete={() => setTagFilter(null)}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        )}

        {/* Drawer de filtros para dispositivos móveis */}
        <Drawer
          anchor="bottom"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Filtrar Tarefas</Typography>
              <IconButton onClick={() => setFilterDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2" gutterBottom>Status</Typography>
            <List>
              <ListItem 
                button 
                selected={filter === 'todas'} 
                onClick={() => handleChangeFilter(null, 'todas')}
                sx={{ borderRadius: 1 }}
              >
                <ListItemText primary="Todas as tarefas" />
              </ListItem>
              <ListItem 
                button 
                selected={filter === 'pendentes'} 
                onClick={() => handleChangeFilter(null, 'pendentes')}
                sx={{ borderRadius: 1 }}
              >
                <ListItemText primary="Tarefas pendentes" />
              </ListItem>
              <ListItem 
                button 
                selected={filter === 'hoje'} 
                onClick={() => handleChangeFilter(null, 'hoje')}
                sx={{ borderRadius: 1 }}
              >
                <ListItemText primary="Tarefas para hoje" />
              </ListItem>
              <ListItem 
                button 
                selected={filter === 'amanhã'} 
                onClick={() => handleChangeFilter(null, 'amanhã')}
                sx={{ borderRadius: 1 }}
              >
                <ListItemText primary="Tarefas para amanhã" />
              </ListItem>
              <ListItem 
                button 
                selected={filter === 'concluídas'} 
                onClick={() => handleChangeFilter(null, 'concluídas')}
                sx={{ borderRadius: 1 }}
              >
                <ListItemText primary="Tarefas concluídas" />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Sempre mostrar a seção de categorias */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>Categorias</Typography>
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => setCategoryDialogOpen(true)}
                title="Adicionar categoria"
              >
                <AddCircleOutline fontSize="small" />
              </IconButton>
            </Box>
            
            {categories.length > 0 ? (
              <List>
                {categories.map(category => (
                  <ListItem 
                    key={category.id}
                    sx={{ borderRadius: 1, pr: 1 }}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => handleDeleteCategory(category.id)}
                        title="Excluir categoria"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemText 
                      primary={
                        <Box 
                          component="div" 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            py: 0.5
                          }}
                          onClick={() => handleChangeCategoryFilter(category.id)}
                        >
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              bgcolor: category.color,
                              mr: 2
                            }} 
                          />
                          <span>{category.name}</span>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma categoria encontrada. Crie uma nova!
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Sempre mostrar a seção de etiquetas */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>Etiquetas</Typography>
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => setTagDialogOpen(true)}
                title="Adicionar etiqueta"
              >
                <AddCircleOutline fontSize="small" />
              </IconButton>
            </Box>
            
            {tags.length > 0 ? (
              <List>
                {tags.map(tag => (
                  <ListItem 
                    key={tag.id}
                    sx={{ borderRadius: 1, pr: 1 }}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => handleDeleteTag(tag.id)}
                        title="Excluir etiqueta"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemText 
                      primary={
                        <Box 
                          component="div" 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            py: 0.5
                          }}
                          onClick={() => handleChangeTagFilter(tag.id)}
                        >
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              bgcolor: tag.color,
                              mr: 2
                            }} 
                          />
                          <span>{tag.name}</span>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma etiqueta encontrada. Crie uma nova!
                </Typography>
              </Box>
            )}
          </Box>
        </Drawer>

        {/* Dialog para criar nova categoria */}
        <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nome da categoria"
              type="text"
              fullWidth
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel id="category-color-label">Cor</InputLabel>
              <Select
                labelId="category-color-label"
                value={newCategoryColor}
                label="Cor"
                onChange={(e) => setNewCategoryColor(e.target.value)}
                renderValue={(color) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: color,
                        mr: 1
                      }}
                    />
                    {color}
                  </Box>
                )}
              >
                <MenuItem value="#4CAF50">Verde</MenuItem>
                <MenuItem value="#2196F3">Azul</MenuItem>
                <MenuItem value="#F44336">Vermelho</MenuItem>
                <MenuItem value="#FF9800">Laranja</MenuItem>
                <MenuItem value="#9C27B0">Roxo</MenuItem>
                <MenuItem value="#795548">Marrom</MenuItem>
                <MenuItem value="#607D8B">Cinza Azulado</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCategoryDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateCategory} variant="contained" color="primary">
              Criar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para criar nova etiqueta */}
        <Dialog open={tagDialogOpen} onClose={() => setTagDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Nova Etiqueta</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nome da etiqueta"
              type="text"
              fullWidth
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel id="tag-color-label">Cor</InputLabel>
              <Select
                labelId="tag-color-label"
                value={newTagColor}
                label="Cor"
                onChange={(e) => setNewTagColor(e.target.value)}
                renderValue={(color) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: color,
                        mr: 1
                      }}
                    />
                    {color}
                  </Box>
                )}
              >
                <MenuItem value="#03DAC5">Turquesa</MenuItem>
                <MenuItem value="#F44336">Vermelho</MenuItem>
                <MenuItem value="#4CAF50">Verde</MenuItem>
                <MenuItem value="#2196F3">Azul</MenuItem>
                <MenuItem value="#FF9800">Laranja</MenuItem>
                <MenuItem value="#9C27B0">Roxo</MenuItem>
                <MenuItem value="#795548">Marrom</MenuItem>
                <MenuItem value="#607D8B">Cinza Azulado</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTagDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateTag} variant="contained" color="primary">
              Criar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Lista de tarefas responsiva */}
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {filteredTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Nenhuma tarefa encontrada.
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      py: 1.5,
                      px: { xs: 2, sm: 3 },
                      bgcolor: task.completed ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)'
                      },
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'flex-start' : 'center',
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      width: isMobile ? '100%' : 'auto',
                      mr: isMobile ? 0 : 2,
                      mb: isMobile ? 1 : 0,
                    }}>
                      <Checkbox
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task.id)}
                        edge="start"
                        sx={{
                          color: 'action.disabled',
                          '&.Mui-checked': {
                            color: 'primary.main',
                          },
                          padding: isMobile ? '4px' : '8px',
                          marginLeft: isMobile ? '-8px' : 0,
                        }}
                      />
                      
                      <ListItemText
                        primary={
                          <span
                            style={{
                              textDecoration: task.completed ? 'line-through' : 'none',
                              color: task.completed ? 'text.secondary' : 'text.primary',
                              fontWeight: task.completed ? 400 : 500,
                            }}
                          >
                            {task.title}
                          </span>
                        }
                        secondary={
                          <Box component="span" sx={{ display: 'block' }}>
                            {task.description && (
                              <Box
                                component="span"
                                sx={{
                                  textDecoration: task.completed ? 'line-through' : 'none',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  mb: 0.5,
                                }}
                              >
                                {task.description}
                              </Box>
                            )}
                            
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                              {task.dueDate && (
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CalendarIcon 
                                    fontSize="small" 
                                    sx={{ 
                                      mr: 0.5, 
                                      color: getDueDateColor(task.dueDate),
                                      fontSize: '0.875rem'
                                    }} 
                                  />
                                  <Box 
                                    component="span"
                                    sx={{ 
                                      color: getDueDateColor(task.dueDate),
                                      fontWeight: isToday(new Date(task.dueDate)) ? 500 : 400
                                    }}
                                  >
                                    {formatDueDate(task.dueDate)}
                                  </Box>
                                </Box>
                              )}
                              
                              {task.category && (
                                <Box 
                                  component="span" 
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleChangeCategoryFilter(task.category.id);
                                  }}
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center', 
                                    height: 20,
                                    fontSize: '0.75rem',
                                    bgcolor: `${task.category.color}20`,
                                    color: task.category.color,
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    '&:hover': { opacity: 0.9 }
                                  }}
                                >
                                  <FolderIcon style={{ fontSize: '0.75rem', marginRight: '4px' }} />
                                  {task.category.name}
                                </Box>
                              )}
                              
                              {task.tags && task.tags.length > 0 && task.tags.map(tag => (
                                <Box 
                                  key={tag.id}
                                  component="span"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleChangeTagFilter(tag.id);
                                  }}
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center', 
                                    height: 20,
                                    fontSize: '0.75rem',
                                    bgcolor: `${tag.color}20`,
                                    color: tag.color,
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    '&:hover': { opacity: 0.9 }
                                  }}
                                >
                                  <TagIcon style={{ fontSize: '0.75rem', marginRight: '4px' }} />
                                  {tag.name}
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        }
                      />
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: isMobile ? 'space-between' : 'flex-end',
                      width: isMobile ? '100%' : 'auto',
                      mt: isMobile ? 1 : 0,
                    }}>
                      <Box
                        component="span"
                        sx={{
                          mr: 2,
                          px: 1.5,
                          py: 0.5,
                          fontSize: '0.75rem',
                          bgcolor: `${getPriorityColor(task.priority)}20`,
                          color: getPriorityColor(task.priority),
                          fontWeight: 500,
                          borderRadius: 1,
                          display: 'inline-block',
                          lineHeight: '1',
                        }}
                      >
                        {task.priority || 'média'}
                      </Box>
                      
                      <Tooltip title="Mais opções">
                        <IconButton edge="end" onClick={(e) => handleOpenMenu(e, task.id)}>
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Card>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: { minWidth: 180 }
          }}
        >
          <MenuItem onClick={() => handleEditTask(tasks.find(task => task.id === selectedTaskId))}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem onClick={() => handleDeleteTask(selectedTaskId)}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Excluir
          </MenuItem>
          <Divider />
          
          <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
            Prioridade
          </Typography>
          <MenuItem onClick={() => handleChangePriority(selectedTaskId, 'alta')}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5E5B', mr: 1 }} />
            Alta
          </MenuItem>
          <MenuItem onClick={() => handleChangePriority(selectedTaskId, 'média')}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFA726', mr: 1 }} />
            Média
          </MenuItem>
          <MenuItem onClick={() => handleChangePriority(selectedTaskId, 'baixa')}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#66BB6A', mr: 1 }} />
            Baixa
          </MenuItem>
          
          <Divider />
          <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
            Categoria
          </Typography>
          <MenuItem onClick={() => handleChangeCategory(selectedTaskId, null)}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'transparent', border: '1px solid #ccc', mr: 1 }} />
            Nenhuma
          </MenuItem>
          {categories.map(category => (
            <MenuItem key={category.id} onClick={() => handleChangeCategory(selectedTaskId, category.id)}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: category.color, mr: 1 }} />
              {category.name}
            </MenuItem>
          ))}
          
          <Divider />
          <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
            Etiquetas
          </Typography>
          {tags.length > 0 ? (
            <>
              {/* Lista de tags existentes */}
              {tags.map(tag => {
                const selectedTask = tasks.find(task => task.id === selectedTaskId);
                const isTagged = selectedTask?.tags?.some(t => t.id === tag.id);
                
                return (
                  <MenuItem 
                    key={tag.id} 
                    onClick={() => isTagged 
                      ? handleRemoveTag(selectedTaskId, tag.id)
                      : handleAddTag(selectedTaskId, tag.id)
                    }
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      width: '100%', 
                      justifyContent: 'space-between' 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: tag.color, mr: 1 }} />
                        {tag.name}
                      </Box>
                      <Checkbox 
                        edge="end" 
                        size="small" 
                        checked={isTagged}
                        sx={{ p: 0.5 }}
                      />
                    </Box>
                  </MenuItem>
                );
              })}
            </>
          ) : (
            <MenuItem disabled>
              Nenhuma etiqueta disponível
            </MenuItem>
          )}
          <MenuItem onClick={() => setTagDialogOpen(true)}>
            <AddIcon fontSize="small" sx={{ mr: 1 }} />
            Nova etiqueta
          </MenuItem>
        </Menu>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Tasks; 