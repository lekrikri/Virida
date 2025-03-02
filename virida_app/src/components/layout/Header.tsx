import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: '#FFFFFF',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
}));

const LogoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& .logo-icon': {
    color: '#2AD388',
    fontSize: '2rem',
  },
  '& .logo-text': {
    color: '#121A21',
    fontWeight: 700,
    fontSize: '1.5rem',
  },
}));

const Header: React.FC = () => {
  return (
    <StyledAppBar position="static">
      <Toolbar>
        <LogoBox>
          <LocalFloristIcon className="logo-icon" />
          <Typography variant="h6" className="logo-text">
            VIRIDA
          </Typography>
        </LogoBox>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton sx={{ color: '#121A21' }}>
            <NotificationsIcon />
          </IconButton>
          <IconButton sx={{ color: '#121A21' }}>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
