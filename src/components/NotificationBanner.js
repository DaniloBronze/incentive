import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Alert, 
  Button, 
  Collapse,
  IconButton,
  Typography 
} from '@mui/material';
import { 
  Close as CloseIcon,
  Notifications as NotificationsIcon 
} from '@mui/icons-material';
import * as notificationService from '../services/notificationService';

function NotificationBanner() {
  const [open, setOpen] = useState(false);
  const [showAgainKey] = useState('notion_pro_notification_dont_show_again');
  
  useEffect(() => {
    // Verificar se o banner deve ser exibido
    const shouldShow = () => {
      // Se o navegador não suporta notificações, não mostrar
      if (!('Notification' in window)) return false;
      
      // Se o usuário já permitiu notificações, não mostrar
      if (Notification.permission === 'granted') return false;
      
      // Se o usuário já negou notificações, não mostrar
      if (Notification.permission === 'denied') return false;
      
      // Se o usuário escolheu não ver novamente, não mostrar
      if (localStorage.getItem(showAgainKey) === 'false') return false;
      
      // Em todos os outros casos, mostrar
      return true;
    };
    
    setOpen(shouldShow());
  }, [showAgainKey]);
  
  const handleRequestPermission = async () => {
    const result = await notificationService.requestNotificationPermission();
    
    if (result.success && result.permission === 'granted') {
      // Iniciar o serviço de notificações
      notificationService.startNotificationService();
      setOpen(false);
    } else {
      // Fechar de qualquer forma, para não ficar incomodando
      setOpen(false);
    }
  };
  
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };
  
  const handleDontShowAgain = () => {
    localStorage.setItem(showAgainKey, 'false');
    setOpen(false);
  };
  
  if (!open) return null;
  
  return (
    <Collapse in={open}>
      <Alert
        severity="info"
        icon={<NotificationsIcon />}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              size="small" 
              color="inherit" 
              onClick={handleDontShowAgain}
              sx={{ mr: 1, fontSize: '0.7rem' }}
            >
              Não mostrar novamente
            </Button>
            <Button 
              size="small" 
              variant="outlined" 
              color="info" 
              onClick={handleRequestPermission}
              sx={{ mr: 1 }}
            >
              Permitir
            </Button>
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Box>
        }
        sx={{ mb: 2 }}
      >
        <Typography variant="body2">
          Receba lembretes sobre tarefas com prazos próximos. Ative as notificações para não perder datas importantes!
        </Typography>
      </Alert>
    </Collapse>
  );
}

export default NotificationBanner; 