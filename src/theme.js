import { createTheme } from '@mui/material/styles';

// Temas para modo claro e escuro
export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light' 
      ? {
          // Tema claro
          primary: {
            main: '#7047EB',
            dark: '#5B38C5',
            light: '#9B80F2',
          },
          secondary: {
            main: '#FF5E5B',
          },
          background: {
            default: '#F7F9FC',
            paper: '#FFFFFF',
          },
          divider: 'rgba(0, 0, 0, 0.08)',
          text: {
            primary: '#333333',
            secondary: '#666666',
          }
        }
      : {
          // Tema escuro
          primary: {
            main: '#9370FF', // Versão mais clara do roxo para modo escuro
            dark: '#7047EB',
            light: '#B396FF',
          },
          secondary: {
            main: '#FF7270',
          },
          background: {
            default: '#121212',
            paper: '#1E1E1E',
          },
          divider: 'rgba(255, 255, 255, 0.08)',
          text: {
            primary: '#FFFFFF',
            secondary: '#B0B0B0',
          }
        }),
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: mode === 'light' 
            ? '0 4px 10px rgba(112, 71, 235, 0.25)' 
            : '0 4px 10px rgba(147, 112, 255, 0.25)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light'
            ? '0 4px 20px rgba(0, 0, 0, 0.05)'
            : '0 4px 20px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: mode === 'light' ? '#f1f1f1' : '#2e2e2e',
          },
          '&::-webkit-scrollbar-thumb': {
            background: mode === 'light' ? '#c1c1c1' : '#555555',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: mode === 'light' ? '#a8a8a8' : '#666666',
          }
        },
      },
    },
  },
});

// Exportar o tema padrão (light)
export default getTheme('light'); 