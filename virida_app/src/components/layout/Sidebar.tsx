import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  useTheme,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SettingsIcon from '@mui/icons-material/Settings';
import AutomationIcon from '@mui/icons-material/SmartToy';
import BoltIcon from '@mui/icons-material/Bolt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuIcon from '@mui/icons-material/Menu';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    background: '#2AD388',
    border: 'none',
    width: 240,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const StyledListItem = styled(ListItem)<{ active?: boolean }>(({ theme, active }) => ({
  margin: '8px 16px',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: active ? 'rgba(5, 46, 28, 0.2)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(5, 46, 28, 0.1)',
  },
}));

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'plants', label: 'Plants', icon: <LocalFloristIcon /> },
  { id: 'monitoring', label: 'Monitoring', icon: <ShowChartIcon /> },
  { id: 'irrigation', label: 'Irrigation', icon: <WaterDropIcon /> },
  { id: 'automation', label: 'Automation', icon: <AutomationIcon /> },
  { id: 'energy', label: 'Energy', icon: <BoltIcon /> },
  { id: 'reports', label: 'Reports', icon: <AssessmentIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onToggle,
  currentView,
  onViewChange,
}) => {
  const theme = useTheme();

  return (
    <StyledDrawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? 240 : 72,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: open ? 240 : 72,
          overflowX: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-end' : 'center',
          p: 2,
        }}
      >
        <IconButton onClick={onToggle} sx={{ color: '#121A21' }}>
          <MenuIcon />
        </IconButton>
      </Box>

      <List>
        {menuItems.map((item) => (
          <Tooltip
            key={item.id}
            title={!open ? item.label : ''}
            placement="right"
          >
            <StyledListItem
              button
              active={currentView === item.id}
              onClick={() => onViewChange(item.id)}
            >
              <ListItemIcon
                sx={{
                  minWidth: open ? 36 : 'auto',
                  color: currentView === item.id ? '#121A21' : 'rgba(18, 26, 33, 0.7)',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary={item.label}
                  sx={{
                    color:
                      currentView === item.id ? '#121A21' : 'rgba(18, 26, 33, 0.7)',
                  }}
                />
              )}
            </StyledListItem>
          </Tooltip>
        ))}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
