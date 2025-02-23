import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Button,
  Chip,
  Divider,
  Snackbar,
  Alert,
  styled,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { mockAlerts } from '../../data/mockData';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#e74c3c',
    color: '#fff',
  },
}));

const NotificationItem = styled(ListItem)(({ theme }) => ({
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  '&:last-child': {
    borderBottom: 'none',
  },
}));

interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  zone?: string;
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: 'critical' | 'warning' | 'info' | 'success';
  }>({
    open: false,
    message: '',
    type: 'info',
  });

  // Initialize with mock data
  useEffect(() => {
    const initialNotifications = mockAlerts.map(alert => ({
      ...alert,
      type: alert.type as 'critical' | 'warning' | 'info' | 'success',
    }));
    setNotifications(initialNotifications);
    updateUnreadCount(initialNotifications);
  }, []);

  // Simulate receiving new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const types: ('critical' | 'warning' | 'info' | 'success')[] = [
        'critical',
        'warning',
        'info',
        'success',
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const zones = ['Zone 1', 'Zone 2', 'Zone 3'];
      const randomZone = zones[Math.floor(Math.random() * zones.length)];

      // 20% chance to generate a new notification
      if (Math.random() < 0.2) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: randomType,
          message: generateRandomMessage(randomType, randomZone),
          timestamp: new Date().toISOString(),
          acknowledged: false,
          zone: randomZone,
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 50));
        showSnackbar(newNotification.message, newNotification.type);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const updateUnreadCount = (notifs: Notification[]) => {
    setUnreadCount(notifs.filter(n => !n.acknowledged).length);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAcknowledge = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, acknowledged: true } : n
      )
    );
  }, []);

  const handleAcknowledgeAll = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, acknowledged: true }))
    );
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
    handleClose();
  }, []);

  const showSnackbar = (message: string, type: Notification['type']) => {
    setSnackbar({
      open: true,
      message,
      type,
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const generateRandomMessage = (type: string, zone: string) => {
    const messages = {
      critical: [
        `High temperature alert in ${zone}`,
        `Critical pH level in ${zone}`,
        `System failure detected in ${zone}`,
        `Water pressure critical in ${zone}`,
      ],
      warning: [
        `Humidity levels above optimal in ${zone}`,
        `CO2 levels decreasing in ${zone}`,
        `Light intensity fluctuating in ${zone}`,
        `Nutrient levels low in ${zone}`,
      ],
      info: [
        `Maintenance check scheduled for ${zone}`,
        `System update available`,
        `Daily report generated for ${zone}`,
        `Backup completed for ${zone}`,
      ],
      success: [
        `Temperature normalized in ${zone}`,
        `System recovery successful in ${zone}`,
        `Maintenance completed in ${zone}`,
        `Calibration successful in ${zone}`,
      ],
    };

    const typeMessages = messages[type as keyof typeof messages] || messages.info;
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Update unread count when notifications change
  useEffect(() => {
    updateUnreadCount(notifications);
  }, [notifications]);

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleNotificationClick}
        aria-describedby={id}
      >
        <StyledBadge badgeContent={unreadCount} max={99}>
          <NotificationsIcon />
        </StyledBadge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            backgroundColor: 'rgba(17, 34, 64, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(46, 204, 113, 0.1)',
          },
        }}
      >
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Notifications
            {unreadCount > 0 && (
              <Chip
                size="small"
                label={`${unreadCount} new`}
                sx={{ ml: 1 }}
                color="primary"
              />
            )}
          </Typography>
          <Box>
            <Button size="small" onClick={handleAcknowledgeAll}>
              Mark all read
            </Button>
            <Button size="small" onClick={handleClearAll} color="error">
              Clear all
            </Button>
          </Box>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No notifications"
                secondary="You're all caught up!"
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                sx={{
                  backgroundColor: notification.acknowledged
                    ? 'transparent'
                    : 'rgba(46, 204, 113, 0.1)',
                }}
              >
                <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(notification.timestamp)}
                      </Typography>
                      {notification.zone && (
                        <Chip
                          label={notification.zone}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                />
                {!notification.acknowledged && (
                  <IconButton
                    size="small"
                    onClick={() => handleAcknowledge(notification.id)}
                  >
                    <CheckCircleIcon fontSize="small" />
                  </IconButton>
                )}
              </NotificationItem>
            ))
          )}
        </List>
      </Popover>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.type === 'critical' ? 'error' : snackbar.type}
          sx={{
            backgroundColor: 'rgba(17, 34, 64, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(46, 204, 113, 0.1)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationSystem;
