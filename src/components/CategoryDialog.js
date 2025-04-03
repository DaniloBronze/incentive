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
import categoryService from '../services/categoryService';

// Lista de cores predefinidas para escolher
const colorOptions = [
  '#6200ee', // Roxo
  '#03DAC5', // Turquesa
  '#F2C94C', // Amarelo
  '#EB5757', // Vermelho
  '#2F80ED', // Azul
  '#9B51E0', // Roxo claro
  '#219653', // Verde
  '#F2994A', // Laranja
];

function CategoryDialog({ open, onClose, category = null, onSave }) {
  const [name, setName] = useState(category ? category.name : '');
  const [color, setColor] = useState(category ? category.color : colorOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const isEditing = Boolean(category);
  
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
      setError('Nome da categoria é obrigatório');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (isEditing) {
        // Atualizar categoria existente
        result = await categoryService.updateCategory(category.id, {
          name: name.trim(),
          color
        });
      } else {
        // Criar nova categoria
        result = await categoryService.createCategory({
          name: name.trim(),
          color
        });
      }
      
      if (result.success) {
        onSave(result.category);
        handleClose();
      } else {
        setError(result.message || 'Erro ao salvar categoria');
      }
    } catch (err) {
      console.error('Erro ao salvar categoria:', err);
      setError('Ocorreu um erro ao salvar a categoria');
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
        {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
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
          label="Nome da Categoria"
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

export default CategoryDialog; 