import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  LocalOffer as TagIcon,
  AddCircleOutline as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import tagService from '../services/tagService';

function TagSelector({ selectedTags = [], onChange, onAddNew }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const result = await tagService.getTags();
        if (result.success) {
          setTags(result.tags);
          setError(null);
        } else {
          setError(result.message || 'Erro ao carregar etiquetas');
        }
      } catch (error) {
        console.error('Erro ao carregar etiquetas:', error);
        setError('Falha ao carregar etiquetas');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    // Quando as etiquetas selecionadas externamente mudam, atualizamos o estado local
    setSelectedIds(selectedTags.map(tag => tag.id));
  }, [selectedTags]);

  const handleToggleTag = (tagId) => {
    const currentIndex = selectedIds.indexOf(tagId);
    const newSelectedIds = [...selectedIds];

    if (currentIndex === -1) {
      newSelectedIds.push(tagId);
    } else {
      newSelectedIds.splice(currentIndex, 1);
    }

    setSelectedIds(newSelectedIds);
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleSave = () => {
    // Converter IDs selecionados de volta para objetos de etiqueta
    const selectedTagObjects = tags.filter(tag => selectedIds.includes(tag.id));
    onChange(selectedTagObjects);
    setOpen(false);
  };

  const handleRemoveTag = (tagId) => {
    const newSelectedIds = selectedIds.filter(id => id !== tagId);
    setSelectedIds(newSelectedIds);
    const selectedTagObjects = tags.filter(tag => newSelectedIds.includes(tag.id));
    onChange(selectedTagObjects);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Carregando etiquetas...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body2" color="error" sx={{ my: 2 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Etiquetas
        </Typography>
        <Button 
          size="small" 
          startIcon={<AddIcon />} 
          onClick={handleOpenDialog}
          sx={{ textTransform: 'none' }}
        >
          Selecionar
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {selectedTags.length === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
            Nenhuma etiqueta selecionada
          </Typography>
        ) : (
          selectedTags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              size="small"
              onDelete={() => handleRemoveTag(tag.id)}
              sx={{
                bgcolor: `${tag.color}20`,
                color: tag.color,
                '& .MuiChip-deleteIcon': {
                  color: tag.color,
                },
              }}
            />
          ))
        )}
      </Box>

      <Dialog open={open} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          Selecionar Etiquetas
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {tags.map((tag) => (
              <ListItem 
                key={tag.id} 
                dense 
                button 
                onClick={() => handleToggleTag(tag.id)}
                sx={{ borderRadius: 1 }}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedIds.indexOf(tag.id) !== -1}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      bgcolor: tag.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TagIcon sx={{ fontSize: 10, color: 'white' }} />
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <span>{tag.name}</span>
                  } 
                />
              </ListItem>
            ))}
          </List>

          {tags.length === 0 && (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Nenhuma etiqueta disponível.
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => {
                  handleCloseDialog();
                  onAddNew && onAddNew();
                }}
                sx={{ mt: 1 }}
              >
                Criar uma etiqueta
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TagSelector; 