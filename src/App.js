import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme';
import { ThemeProvider, useThemeMode } from './contexts/ThemeContext';
import * as notificationService from './services/notificationService';
import * as authService from './services/authService';

// Layouts
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import Register from './pages/Register';

// Components
import PrivateRoute from './components/PrivateRoute';

// Componente intermediário que aplica o tema do MUI
function ThemeWrapper({ children }) {
  const { themeMode } = useThemeMode();
  const theme = getTheme(themeMode);

  // Iniciar o serviço de notificações se o usuário estiver logado
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && notificationService.areNotificationsEnabled()) {
      notificationService.startNotificationService();
    }

    return () => {
      notificationService.stopNotificationService();
    };
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemeWrapper>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<PrivateRoute />}>
              <Route 
                path="/" 
                element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                } 
              />
              <Route 
                path="/notes" 
                element={
                  <Layout>
                    <Notes />
                  </Layout>
                } 
              />
              <Route 
                path="/tasks" 
                element={
                  <Layout>
                    <Tasks />
                  </Layout>
                } 
              />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeWrapper>
    </ThemeProvider>
  );
}

export default App;
