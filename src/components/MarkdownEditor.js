import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Tooltip,
  Tab,
  Tabs,
  useTheme,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Title,
  Link,
  Visibility,
  Edit,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const MarkdownEditor = ({
  value,
  onChange,
  placeholder = "Digite conteúdo em Markdown...",
  rows = 7,
  height = '200px',
}) => {
  const theme = useTheme();
  const [content, setContent] = useState(value || '');
  const [viewMode, setViewMode] = useState(0); // 0 = edit, 1 = preview
  const editorRef = useRef(null);

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

  const handleFormat = (type) => {
    if (!editorRef.current) return;

    const textarea = editorRef.current.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let formattedText = '';
    let newCursorPos = start;

    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = start + 1;
        break;
      case 'header':
        formattedText = `## ${selectedText}`;
        newCursorPos = start + 3;
        break;
      case 'link':
        formattedText = `[${selectedText || 'link'}](url)`;
        newCursorPos = start + 1;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        newCursorPos = start + 2;
        break;
      case 'code':
        formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
        newCursorPos = start + 4;
        break;
      case 'bullet':
        formattedText = selectedText
          .split('\n')
          .map(line => `- ${line}`)
          .join('\n');
        newCursorPos = start + 2;
        break;
      case 'numbered':
        formattedText = selectedText
          .split('\n')
          .map((line, i) => `${i + 1}. ${line}`)
          .join('\n');
        newCursorPos = start + 3;
        break;
      default:
        return;
    }

    const newText =
      content.substring(0, start) + formattedText + content.substring(end);
    setContent(newText);
    if (onChange) {
      onChange(newText);
    }

    // Restabelecer o foco após a inserção
    setTimeout(() => {
      textarea.focus();
      if (selectedText.length > 0) {
        textarea.setSelectionRange(
          start + formattedText.length - selectedText.length,
          start + formattedText.length
        );
      } else {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 1 }}>
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ minHeight: 0 }}
        >
          <Tab
            icon={<Edit fontSize="small" />}
            iconPosition="start"
            label="Editor"
            sx={{ minHeight: 'auto', py: 0.5 }}
          />
          <Tab
            icon={<Visibility fontSize="small" />}
            iconPosition="start"
            label="Prévia"
            sx={{ minHeight: 'auto', py: 0.5 }}
          />
        </Tabs>
      </Box>
      
      {viewMode === 0 ? (
        <>
          <Box sx={{ mb: 1 }}>
            <ToggleButtonGroup size="small" aria-label="Formatação de texto">
              <Tooltip title="Título">
                <ToggleButton
                  value="header"
                  onClick={() => handleFormat('header')}
                >
                  <Title fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Negrito">
                <ToggleButton
                  value="bold"
                  onClick={() => handleFormat('bold')}
                >
                  <FormatBold fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Itálico">
                <ToggleButton
                  value="italic"
                  onClick={() => handleFormat('italic')}
                >
                  <FormatItalic fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
              <Tooltip title="Lista com marcadores">
                <ToggleButton
                  value="bullet"
                  onClick={() => handleFormat('bullet')}
                >
                  <FormatListBulleted fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Lista numerada">
                <ToggleButton
                  value="numbered"
                  onClick={() => handleFormat('numbered')}
                >
                  <FormatListNumbered fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
              <Tooltip title="Citação">
                <ToggleButton
                  value="quote"
                  onClick={() => handleFormat('quote')}
                >
                  <FormatQuote fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Código">
                <ToggleButton
                  value="code"
                  onClick={() => handleFormat('code')}
                >
                  <Code fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Link">
                <ToggleButton
                  value="link"
                  onClick={() => handleFormat('link')}
                >
                  <Link fontSize="small" />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Box>
          <Box ref={editorRef}>
            <TextField
              fullWidth
              multiline
              rows={rows}
              value={content}
              onChange={handleChange}
              placeholder={placeholder}
              variant="outlined"
              InputProps={{
                style: {
                  fontFamily: 'monospace',
                  fontSize: '14px',
                },
              }}
            />
          </Box>
        </>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            minHeight: height,
            maxHeight: '400px',
            overflow: 'auto',
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#f9f9f9',
          }}
        >
          {content ? (
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {content}
            </ReactMarkdown>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Sem conteúdo para visualizar
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default MarkdownEditor; 