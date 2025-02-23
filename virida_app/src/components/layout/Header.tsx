import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.8)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(46, 204, 113, 0.1)',
}));

const LogoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& .logo-icon': {
    color: theme.palette.primary.main,
    fontSize: '2rem',
  },
  '& .logo-text': {
    background: 'linear-gradient(45deg, #27ae60 30%, #2ecc71 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
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
          <IconButton color="primary">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="primary">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
