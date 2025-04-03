import React, { forwardRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import MarkdownShortcuts from 'quill-markdown-shortcuts';

// Registrar o módulo Markdown para o Quill
if (typeof window !== 'undefined') {
  ReactQuill.Quill.register('modules/markdownShortcuts', MarkdownShortcuts);
}

// Configurações do editor Quill
const defaultModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'code-block'],
    ['clean']
  ],
  markdownShortcuts: {},
};

const defaultFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'code-block'
];

// Função para verificar se o conteúdo parece ser Markdown puro
const isMarkdown = (text) => {
  if (!text) return false;
  
  // Verifica padrões comuns de Markdown
  const markdownPatterns = [
    /^#+ /, // Headers
    /\*\*.*\*\*/, // Bold
    /\*.*\*/, // Italic
    /```.*```/, // Code blocks
    /\[.*\]\(.*\)/, // Links
    /^\s*[-+*]\s/, // List items
    /^\s*\d+\.\s/, // Ordered list
    /^\s*>\s/, // Blockquote
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text)) && 
         !text.includes('<p>') && 
         !text.includes('<div>') && 
         !text.includes('<br>');
};

// Componente que encapsula o ReactQuill para evitar o aviso de findDOMNode
const RichTextEditor = forwardRef(({
  value,
  onChange,
  placeholder = "Digite o conteúdo...",
  modules = defaultModules,
  formats = defaultFormats,
  style = { height: '150px', marginBottom: '40px' }
}, ref) => {
  const [content, setContent] = useState(value || '');
  
  // Detectar quando valor externo muda e atualizar o editor
  useEffect(() => {
    // Se o valor externo é diferente do conteúdo atual do editor
    if (value !== content) {
      setContent(value || '');
    }
  }, [value]);
  
  // Quando o conteúdo muda, notificar o pai
  const handleChange = (newContent) => {
    setContent(newContent);
    if (onChange) {
      // Se o conteúdo for vazio ou apenas HTML vazio, envie string vazia
      if (!newContent || newContent === '<p><br></p>') {
        onChange('');
      } else {
        onChange(newContent);
      }
    }
  };
  
  return (
    <div ref={ref} className="rich-text-editor-container">
      <ReactQuill
        value={content}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        theme="snow"
        style={style}
      />
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor; 