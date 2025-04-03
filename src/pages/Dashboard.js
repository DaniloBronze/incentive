import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Task as TaskIcon,
  Notes as NotesIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import taskService from '../services/taskService';
import * as noteService from '../services/noteService';
import * as authService from '../services/authService';

function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obter tarefas
        const tasksResult = await taskService.getTasks();
        if (tasksResult && tasksResult.success) {
          setTasks(tasksResult.tasks || []);
        } else {
          console.error('Erro ao buscar tarefas:', tasksResult?.message);
          setTasks([]);
        }
        
        // Obter notas
        const notesResult = await noteService.getAllNotes();
        if (notesResult && notesResult.success) {
          setNotes(notesResult.notes || []);
        } else {
          console.error('Erro ao buscar notas:', notesResult?.message);
          setNotes([]);
        }
        
        setError(null);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        setError('Falha ao carregar dados. Por favor, tente novamente.');
        setTasks([]);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Garantir que tasks seja sempre um array
  const safeTasksArray = Array.isArray(tasks) ? tasks : [];
  
  // Estatísticas
  const completedTasksCount = safeTasksArray.filter(task => task.completed).length;
  const pendingTasksCount = safeTasksArray.length - completedTasksCount;
  const pinnedNotesCount = Array.isArray(notes) ? notes.filter(note => note.pinned).length : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4 }}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="600" sx={{ mb: 1 }}>
          {user ? `Bem-vindo, ${user.name.split(' ')[0]}!` : 'Bem-vindo!'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aqui está um resumo das suas tarefas e notas.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Cards de estatísticas */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Paper
            sx={{
              p: isMobile ? 2 : 3,
              borderRadius: 3,
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              height: '100%',
            }}
          >
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
              {safeTasksArray.length}
            </Typography>
            <Typography variant="body2">Tarefas totais</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Paper
            sx={{
              p: isMobile ? 2 : 3,
              borderRadius: 3,
              bgcolor: 'success.light',
              color: 'success.contrastText',
              height: '100%',
            }}
          >
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
              {completedTasksCount}
            </Typography>
            <Typography variant="body2">Tarefas concluídas</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Paper
            sx={{
              p: isMobile ? 2 : 3,
              borderRadius: 3,
              bgcolor: 'warning.light',
              color: 'warning.contrastText',
              height: '100%',
            }}
          >
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
              {pendingTasksCount}
            </Typography>
            <Typography variant="body2">Tarefas pendentes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Paper
            sx={{
              p: isMobile ? 2 : 3,
              borderRadius: 3,
              bgcolor: 'info.light',
              color: 'info.contrastText',
              height: '100%',
            }}
          >
            <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" sx={{ mb: 1 }}>
              {Array.isArray(notes) ? notes.length : 0}
            </Typography>
            <Typography variant="body2">Notas totais</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Conteúdo principal */}
      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Tarefas Recentes */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TaskIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" fontWeight="500">
                  Tarefas Recentes
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {safeTasksArray.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Você não tem tarefas ainda.
                </Typography>
              ) : (
                <>
                  <List sx={{ py: 0 }}>
                    {safeTasksArray.slice(0, 5).map((task) => (
                      <ListItem
                        key={task.id}
                        sx={{
                          py: 1,
                          px: 0,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: isMobile ? 30 : 36 }}>
                          <CheckCircleIcon
                            color={task.completed ? 'success' : 'disabled'}
                            fontSize="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: task.completed ? 'text.secondary' : 'text.primary',
                              }}
                            >
                              {task.title}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Button
                      component={Link}
                      to="/tasks"
                      color="primary"
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                    >
                      Ver todas
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Notas Recentes */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotesIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" fontWeight="500">
                  Notas Recentes
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {!Array.isArray(notes) || notes.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Você não tem notas ainda.
                </Typography>
              ) : (
                <>
                  <List sx={{ py: 0 }}>
                    {notes.slice(0, 5).map((note) => (
                      <ListItem
                        key={note.id}
                        sx={{
                          py: 1,
                          px: 0,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              fontWeight={note.pinned ? 500 : 400}
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center' 
                              }}
                            >
                              {note.pinned && (
                                <Box
                                  component="span"
                                  sx={{
                                    display: 'inline-block',
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'warning.main',
                                    mr: 1,
                                  }}
                                />
                              )}
                              {note.title}
                            </Typography>
                          }
                          secondary={
                            note.content && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  mt: 0.5,
                                }}
                              >
                                {note.content}
                              </Typography>
                            )
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Button
                      component={Link}
                      to="/notes"
                      color="primary"
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                    >
                      Ver todas
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 