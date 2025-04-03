import React, { createContext, useState, useContext, useEffect } from 'react';

// Criando o contexto do tema
const ThemeContext = createContext();

// Hook personalizado para acessar o contexto do tema
export const useThemeMode = () => useContext(ThemeContext);

// Chave para armazenar a preferência de tema no localStorage
const THEME_STORAGE_KEY = 'notion_pro_theme_mode';

export const ThemeProvider = ({ children }) => {
  // Verificar o tema no localStorage ou usar o tema do sistema
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Usar preferência do sistema como fallback
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  };

  const [themeMode, setThemeMode] = useState(getInitialTheme);

  // Alternar entre temas claro e escuro
  const toggleTheme = () => {
    setThemeMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, newMode);
      return newMode;
    });
  };

  // Atualizar tema quando as preferências do sistema mudarem
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Apenas aplicar mudança se o usuário não definiu uma preferência
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setThemeMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 