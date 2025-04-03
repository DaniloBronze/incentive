import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import * as authService from '../services/authService';

const PrivateRoute = () => {
  const currentUser = authService.getCurrentUser();
  
  if (!currentUser) {
    // Redirecionar para login se não estiver autenticado
    return <Navigate to="/login" replace />;
  }
  
  // Renderizar rota protegida
  return <Outlet />;
};

export default PrivateRoute; 