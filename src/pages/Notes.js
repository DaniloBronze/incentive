import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Card,
  CardContent,
  InputAdornment,
  Divider,
  Chip,
  Grid,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  NoteAlt,
  BookmarkBorder,
  Bookmark as BookmarkIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import * as noteService from '../services/noteService';
import MarkdownEditor from '../components/MarkdownEditor';

function Notes() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const editorRef = useRef(null);
  
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [markdownSource, setMarkdownSource] = useState('');
  const [editorMode, setEditorMode] = useState(0); // 0 = editor visual, 1 = markdown
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [viewMode, setViewMode] = useState('html'); // 'html' or 'markdown'

  // Sincronizar markdown e editor visual
  useEffect(() => {
    if (newNoteContent && !markdownSource) {
      setMarkdownSource(newNoteContent);
    }
  }, [newNoteContent, markdownSource]);

  // Carregar notas do banco de dados
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const result = await noteService.getAllNotes();
        if (result.success) {
          setNotes(result.notes);
          setError(null);
        } else {
          setError(result.message || 'Erro ao carregar notas');
        }
      } catch (error) {
        console.error('Erro ao carregar notas:', error);
        setError('Falha ao carregar notas. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleAddNote = async () => {
    if (newNoteTitle.trim()) {
      try {
        if (editingNote !== null) {
          // Atualizar nota existente
          const result = await noteService.updateNote(editingNote, { 
            title: newNoteTitle,
            content: newNoteContent
          });
          
          if (result.success) {
            setNotes(notes.map((note) => (note.id === editingNote ? result.note : note)));
            setNotification({ open: true, message: 'Nota atualizada com sucesso!', severity: 'success' });
            setEditingNote(null);
          } else {
            throw new Error(result.message || 'Erro ao atualizar nota');
          }
        } else {
          // Criar nova nota
          const result = await noteService.createNote({
            title: newNoteTitle,
            content: newNoteContent
          });
          
          if (result.success) {
            setNotes([result.note, ...notes]);
            setNotification({ open: true, message: 'Nota criada com sucesso!', severity: 'success' });
          } else {
            throw new Error(result.message || 'Erro ao criar nota');
          }
        }
        setNewNoteTitle('');
        setNewNoteContent('');
      } catch (error) {
        console.error('Erro ao salvar nota:', error);
        setNotification({ open: true, message: 'Erro ao salvar nota. Tente novamente.', severity: 'error' });
      }
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const result = await noteService.deleteNote(id);
      
      if (result.success) {
        const updatedNotes = notes.filter((note) => note.id !== id);
        setNotes(updatedNotes);
        setNotification({ open: true, message: 'Nota excluída com sucesso!', severity: 'success' });
      } else {
        throw new Error(result.message || 'Erro ao excluir nota');
      }
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
      setNotification({ open: true, message: 'Erro ao excluir nota. Tente novamente.', severity: 'error' });
    }
  };

  const handleEditorModeChange = (event, newValue) => {
    setEditorMode(newValue);
  };

  const handleMarkdownChange = (e) => {
    const value = e.target.value;
    setMarkdownSource(value);
    setNewNoteContent(value);
  };

  const handleEditNote = (note) => {
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content || '');
    setMarkdownSource(note.content || '');
    setEditingNote(note.id);
  };

  const handleTogglePin = async (id) => {
    try {
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? { ...note, pinned: !note.pinned } : note
        )
      );
      
      // Atualizar no banco
      await noteService.updateNote(id, { 
        pinned: notes.find(note => note.id === id)?.pinned ? false : true 
      });
    } catch (error) {
      console.error('Erro ao alternar fixação:', error);
      setError('Erro ao alternar fixação da nota. Tente novamente.');
      
      // Reverter mudança em caso de erro
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? { ...note, pinned: !note.pinned } : note
        )
      );
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderNoteContent = (content) => {
    try {
      // Se o viewMode for 'markdown', força a renderização como Markdown
      if (viewMode === 'markdown') {
        return (
          <div
            style={{
              marginBottom: '16px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              borderRadius: '10px',
            }}
          >
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {content}
            </ReactMarkdown>
          </div>
        );
      }
      
      // Se o conteúdo parecer ser HTML (começa com tag ou tem tag dentro)
      const hasHtmlTags = content && 
        (content.trim().startsWith('<') || 
        content.includes('<div') || 
        content.includes('<p') || 
        content.includes('<h') ||
        content.includes('<ul') ||
        content.includes('<ol') ||
        content.includes('<li'));

      if (hasHtmlTags) {
        // Se o conteúdo tiver HTML, usamos dangerouslySetInnerHTML
        return (
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            style={{
              marginBottom: '16px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              background: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'inherit',
              color: theme.palette.text.primary,
              borderRadius: '10px',
              padding: '10px',
            }}
          />
        );
      } else {
        // Se o conteúdo parecer ser Markdown puro, usamos o ReactMarkdown
        return (
          <div
            style={{
              marginBottom: '16px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              background: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'inherit',
              color: theme.palette.text.primary,
              borderRadius: '10px',
              padding: '10px',
            }}
          >
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {content}
            </ReactMarkdown>
          </div>
        );
      }
    } catch (error) {
      // Em caso de erro na renderização, exibir o conteúdo bruto
      console.error('Erro ao renderizar conteúdo:', error);
      return (
        <div
          style={{
            marginBottom: '16px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            whiteSpace: 'pre-wrap',
          }}
        >
          {content}
        </div>
      );
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
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <NoteAlt sx={{ fontSize: isMobile ? 24 : 28, color: 'primary.main', mr: 1.5 }} />
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="600">
          Notas
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Pesquisar notas..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Paper
        elevation={0}
        sx={{
          p: isMobile ? 2 : 3,
          mb: 4,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight="500" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AddIcon sx={{ mr: 1, color: 'primary.main' }} />
          {editingNote !== null ? 'Editar Nota' : 'Nova Nota'}
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <TextField
          fullWidth
          variant="outlined"
          label="Título"
          placeholder="Digite um título..."
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
          sx={{ mb: 2 }}
          required
        />
        
        <Box sx={{ mb: 2 }}>
          <MarkdownEditor
            value={newNoteContent}
            onChange={setNewNoteContent}
            placeholder="Digite o conteúdo da nota com formatação Markdown..."
          />
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddNote}
          disabled={!newNoteTitle.trim()}
          fullWidth={isMobile}
          startIcon={editingNote !== null ? <EditIcon /> : <AddIcon />}
          sx={{ px: 3 }}
        >
          {editingNote !== null ? 'Atualizar Nota' : 'Adicionar Nota'}
        </Button>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="500">
            Suas Notas
          </Typography>
          
          <Box>
            <Tooltip title="Alterar modo de visualização das notas">
              <Button
                size="small"
                variant="outlined"
                onClick={() => setViewMode(viewMode === 'html' ? 'markdown' : 'html')}
                startIcon={viewMode === 'html' ? <CodeIcon /> : <VisibilityIcon />}
              >
                {viewMode === 'html' ? 'Ver como Markdown' : 'Ver como HTML'}
              </Button>
            </Tooltip>
          </Box>
        </Box>
        
        {filteredNotes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Nenhuma nota encontrada. Adicione uma nova nota acima.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={isMobile ? 2 : 3}>
            {filteredNotes.map((note) => (
              <Grid item xs={12} sm={6} md={4} key={note.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    ...(note.pinned && {
                      borderTop: '3px solid',
                      borderColor: 'warning.main',
                    }),
                  }}
                  elevation={1}
                >
                  <CardContent sx={{ p: isMobile ? 2 : 3, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                        {note.title}
                      </Typography>
                      <Box>
                        <Tooltip title={note.pinned ? "Desfixar" : "Fixar"}>
                          <IconButton
                            size="small"
                            onClick={() => handleTogglePin(note.id)}
                            sx={{ color: note.pinned ? 'warning.main' : 'action.active' }}
                          >
                            {note.pinned ? <BookmarkIcon fontSize="small" /> : <BookmarkBorder fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    {note.content && renderNoteContent(note.content)}
                    
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 'auto',
                        pt: 1,
                      }}
                    >
                      <Box>
                        <Chip
                          size="small"
                          label={new Date(note.updatedAt).toLocaleDateString()}
                          sx={{ fontSize: '0.7rem' }}
                          variant="outlined"
                        />
                      </Box>
                      <Box>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleEditNote(note)}
                            sx={{ mr: 1, color: 'primary.main' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteNote(note.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
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

export default Notes; 