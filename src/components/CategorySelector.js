import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  FolderOutlined as FolderIcon,
  AddCircleOutline as AddIcon
} from '@mui/icons-material';
import categoryService from '../services/categoryService';

function CategorySelector({ value, onChange, onAddNew }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const result = await categoryService.getCategories();
        if (result.success) {
          setCategories(result.categories);
          setError(null);
        } else {
          setError(result.message || 'Erro ao carregar categorias');
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setError('Falha ao carregar categorias');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Carregando categorias...
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
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel id="category-select-label">Categoria</InputLabel>
      <Select
        labelId="category-select-label"
        id="category-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
        label="Categoria"
        displayEmpty
        endAdornment={
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onAddNew && onAddNew();
            }}
            sx={{ mr: 1 }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        }
      >
        <MenuItem value="">
          <em>Nenhuma categoria</em>
        </MenuItem>
        
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%', 
                  bgcolor: category.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FolderIcon sx={{ fontSize: 10, color: 'white' }} />
              </Box>
            </ListItemIcon>
            <ListItemText primary={<span>{category.name}</span>} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default CategorySelector; 