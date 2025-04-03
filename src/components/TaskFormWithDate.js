import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  InputAdornment,
  FormControl,
  FormControlLabel,
  Checkbox,
  useMediaQuery,
  useTheme,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Description as DescriptionIcon,
  CalendarMonth as CalendarIcon,
  Notifications as NotificationsIcon,
  Folder as FolderIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Tag as TagIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import CategoryDialog from './CategoryDialog';
import TagDialog from './TagDialog';
import categoryService from '../services/categoryService';
import tagService from '../services/tagService';
import MarkdownEditor from './MarkdownEditor';

function TaskFormWithDate({ 
  editingTask, 
  title, 
  description, 
  dueDate,
  categoryId,
  tags = [], 
  setTitle, 
  setDescription, 
  setDueDate,
  setCategoryId,
  setTags,
  handleSubmit,
  sendReminder,
  setSendReminder
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const editorRef = useRef(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [editorMode, setEditorMode] = useState(0); // 0 = editor visual, 1 = markdown
  const [markdownSource, setMarkdownSource] = useState('');

  // Sincronizar markdown e editor visual
  useEffect(() => {
    if (description && !markdownSource) {
      setMarkdownSource(description);
    }
  }, [description, markdownSource]);

  // Carregar categorias e tags
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar categorias
        const categoriesResult = await categoryService.getCategories();
        if (categoriesResult.success) {
          setCategories(categoriesResult.categories);
          
          // Verificar se a categoria atual existe na lista
          if (categoryId && !categoriesResult.categories.some(cat => cat.id === categoryId)) {
            console.warn(`Categoria com ID ${categoryId} não encontrada, resetando para nulo`);
            setCategoryId(null);
          }
        }
        
        // Carregar tags
        const tagsResult = await tagService.getTags();
        if (tagsResult.success) {
          setAvailableTags(tagsResult.tags);
          
          // Verificar se todas as tags existem
          if (tags && tags.length > 0) {
            const validTags = tags.filter(tag => 
              tagsResult.tags.some(t => t.id === tag.id)
            );
            
            if (validTags.length !== tags.length) {
              console.warn('Algumas tags não foram encontradas, removendo tags inválidas');
              setTags(validTags);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do formulário:', error);
      }
    };
    
    loadData();
  }, [categoryId, setCategoryId, tags, setTags]);

  // Formatar a data para o input date
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    // Formato YYYY-MM-DD para input type="date"
    return d.toISOString().split('T')[0];
  };

  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    if (dateValue) {
      setDueDate(new Date(dateValue));
    } else {
      setDueDate(null);
    }
  };

  const handleCategoryCreated = (newCategory) => {
    setCategoryId(newCategory.id);
    setCategoryDialogOpen(false);
  };

  const handleTagCreated = (newTag) => {
    setTags([...tags, newTag]);
    setTagDialogOpen(false);
  };

  // Manipular mudanças nas tags
  const handleTagChange = (tagId) => {
    const tag = availableTags.find(t => t.id === tagId);
    if (!tag) return;
    
    const tagExists = tags.some(t => t.id === tagId);
    if (tagExists) {
      // Remover a tag
      setTags(tags.filter(t => t.id !== tagId));
    } else {
      // Adicionar a tag
      setTags([...tags, tag]);
    }
  };

  const handleEditorModeChange = (event, newValue) => {
    setEditorMode(newValue);
  };

  const handleMarkdownChange = (e) => {
    const value = e.target.value;
    setMarkdownSource(value);
    setDescription(value);
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="500" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        {editingTask !== null ? (
          <>
            <EditIcon sx={{ mr: 1, color: 'primary.main' }} />
            Editar Tarefa
          </>
        ) : (
          <>
            <AddIcon sx={{ mr: 1, color: 'primary.main' }} />
            Nova Tarefa
          </>
        )}
      </Typography>
      <Divider sx={{ my: 2 }} />
        
      <TextField
        fullWidth
        variant="outlined"
        label="Título da Tarefa"
        placeholder="Adicione uma nova tarefa..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
        required
      />
          
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ ml: 1 }}>
          Descrição (opcional)
        </Typography>
        <MarkdownEditor
          value={description}
          onChange={setDescription}
          placeholder="Adicione detalhes da tarefa com formatação Markdown..."
        />
      </Box>

      <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
        <InputLabel id="category-select-label">Categoria</InputLabel>
        <Select
          labelId="category-select-label"
          id="category-select"
          value={categoryId || ''}
          label="Categoria"
          onChange={(e) => setCategoryId(e.target.value || null)}
          startAdornment={
            <InputAdornment position="start">
              <FolderIcon fontSize="small" />
            </InputAdornment>
          }
        >
          <MenuItem value="">
            <em>Nenhuma</em>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: category.color,
                    mr: 1,
                  }}
                />
                {category.name}
              </Box>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={() => setCategoryDialogOpen(true)}>
            <AddCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
            Nova categoria
          </MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mt: 2, mb: 4 }}>
        <InputLabel id="tags-label">Etiquetas</InputLabel>
        <Select
          labelId="tags-label"
          id="tags-select"
          multiple
          value={tags.map(tag => tag.id)}
          label="Etiquetas"
          onChange={(e) => {
            const selectedIds = e.target.value;
            const selectedTags = availableTags.filter(tag => selectedIds.includes(tag.id));
            setTags(selectedTags);
          }}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((tagId) => {
                const tag = availableTags.find(t => t.id === tagId);
                return tag ? (
                  <Chip 
                    key={tag.id} 
                    label={tag.name} 
                    size="small"
                    sx={{ 
                      bgcolor: `${tag.color}20`,
                      color: tag.color,
                      borderRadius: 1
                    }}
                  />
                ) : null;
              })}
            </Box>
          )}
          startAdornment={
            <InputAdornment position="start">
              <TagIcon fontSize="small" />
            </InputAdornment>
          }
        >
          {availableTags.map((tag) => (
            <MenuItem key={tag.id} value={tag.id}>
              <Checkbox checked={tags.some(t => t.id === tag.id)} />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: tag.color,
                    mr: 1,
                  }}
                />
                {tag.name}
              </Box>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={() => setTagDialogOpen(true)}>
            <AddCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
            Nova etiqueta
          </MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        variant="outlined"
        label="Data de Vencimento (opcional)"
        type="date"
        value={formatDateForInput(dueDate)}
        onChange={handleDateChange}
        sx={{ mb: 2 }}
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <CalendarIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={sendReminder}
            onChange={(e) => setSendReminder(e.target.checked)}
            color="primary"
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2">Enviar lembrete</Typography>
          </Box>
        }
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!title.trim()}
          startIcon={editingTask !== null ? <EditIcon /> : <AddIcon />}
        >
          {editingTask !== null ? 'Salvar Alterações' : 'Adicionar Tarefa'}
        </Button>
      </Box>

      {/* Dialog para criar nova categoria */}
      <CategoryDialog 
        open={categoryDialogOpen} 
        onClose={() => setCategoryDialogOpen(false)} 
        onSave={handleCategoryCreated} 
      />
      
      {/* Dialog para criar nova etiqueta */}
      <TagDialog 
        open={tagDialogOpen} 
        onClose={() => setTagDialogOpen(false)} 
        onSave={handleTagCreated} 
      />
    </Box>
  );
}

export default TaskFormWithDate; 