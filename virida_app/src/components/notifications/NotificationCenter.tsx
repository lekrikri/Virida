import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import { useViridaStore } from '../../store/useViridaStore';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 320,
    background: '#FFFFFF',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    border: 'none',
  },
}));

const NotificationItem = styled(ListItem)<{ type: string }>(({ theme, type }) => ({
  borderLeft: `4px solid ${
    type === 'error'
      ? theme.palette.error.main
      : type === 'warning'
      ? theme.palette.warning.main
      : '#2AD388'
  }`,
  margin: '8px 0',
  background: '#FFFFFF',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  '&:hover': {
    background: '#F5F5F5',
  },
}));

const NotificationCenter: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const { notifications } = useViridaStore();
  const unreadCount = notifications.length;

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <>
      <IconButton color="primary" onClick={toggleDrawer}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <StyledDrawer anchor="right" open={open} onClose={toggleDrawer}>
        <Box sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Notifications</Typography>
            <IconButton onClick={toggleDrawer} sx={{ color: 'primary.main' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List>
            {notifications.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No notifications
              </Typography>
            ) : (
              notifications.map((notification) => (
                <NotificationItem key={notification.id} type={notification.type}>
                  <ListItemText
                    primary={notification.message}
                    secondary={formatTimestamp(notification.timestamp)}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { color: 'text.primary' },
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      sx: { color: 'text.secondary' },
                    }}
                  />
                </NotificationItem>
              ))
            )}
          </List>
        </Box>
      </StyledDrawer>
    </>
  );
};

export default NotificationCenter;
