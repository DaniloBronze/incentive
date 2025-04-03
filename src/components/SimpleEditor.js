import React, { useState, useEffect } from 'react';
import { Box, TextField, Paper, Typography, useTheme } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const SimpleEditor = ({ 
  value, 
  onChange, 
  placeholder = "Digite o conteúdo...",
  isMarkdown = true,
  rows = 7,
  preview = false
}) => {
  const theme = useTheme();
  const [content, setContent] = useState(value || '');
  const [showPreview, setShowPreview] = useState(preview);

  useEffect(() => {
    if (value !== content) {
      setContent(value || '');
    }
  }, [value]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        multiline
        rows={rows}
        value={content}
        onChange={handleChange}
        placeholder={placeholder}
        variant="outlined"
        InputProps={{
          style: isMarkdown ? { 
            fontFamily: 'monospace',
            fontSize: '14px'
          } : undefined
        }}
      />
      
      {isMarkdown && showPreview && content && (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            mt: 2, 
            maxHeight: '200px', 
            overflow: 'auto',
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#f9f9f9'
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Prévia:
          </Typography>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {content}
          </ReactMarkdown>
        </Paper>
      )}
    </Box>
  );
};

export default SimpleEditor; 