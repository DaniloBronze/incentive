import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  InputLabel,
  CircularProgress,
  Typography
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import tagService from '../services/tagService';

// Lista de cores predefinidas para escolher
const colorOptions = [
  '#EB5757', // Vermelho
  '#F2C94C', // Amarelo
  '#27AE60', // Verde
  '#2F80ED', // Azul
  '#9B51E0', // Roxo
  '#F2994A', // Laranja
  '#219653', // Verde escuro
  '#03DAC5', // Turquesa
];

function TagDialog({ open, onClose, tag = null, onSave }) {
  const [name, setName] = useState(tag ? tag.name : '');
  const [color, setColor] = useState(tag ? tag.color : colorOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const isEditing = Boolean(tag);
  
  const handleClose = () => {
    onClose();
    // Limpar o formulário ao fechar
    if (!isEditing) {
      setName('');
      setColor(colorOptions[0]);
    }
    setError(null);
  };
  
  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Nome da etiqueta é obrigatório');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (isEditing) {
        // Atualizar etiqueta existente
        result = await tagService.updateTag(tag.id, {
          name: name.trim(),
          color
        });
      } else {
        // Criar nova etiqueta
        result = await tagService.createTag({
          name: name.trim(),
          color
        });
      }
      
      if (result.success) {
        onSave(result.tag);
        handleClose();
      } else {
        setError(result.message || 'Erro ao salvar etiqueta');
      }
    } catch (err) {
      console.error('Erro ao salvar etiqueta:', err);
      setError('Ocorreu um erro ao salvar a etiqueta');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {isEditing ? 'Editar Etiqueta' : 'Nova Etiqueta'}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={loading}
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
        <TextField
          autoFocus
          margin="dense"
          label="Nome da Etiqueta"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          required
          sx={{ mb: 3 }}
        />
        
        <Box>
          <InputLabel sx={{ mb: 1 }}>Cor</InputLabel>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {colorOptions.map((colorOption) => (
              <Box
                key={colorOption}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: colorOption,
                  cursor: 'pointer',
                  border: color === colorOption ? '2px solid black' : '2px solid transparent',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
                onClick={() => setColor(colorOption)}
              />
            ))}
          </Box>
        </Box>
        
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !name.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TagDialog; 