import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Dashboard from './components/dashboard/Dashboard';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import PlantConfiguration from './components/plants/PlantConfiguration';
import SystemStats from './components/statistics/SystemStats';
import IrrigationSchedule from './components/schedules/IrrigationSchedule';
import AutomationRules from './components/automation/AutomationRules';
import MonitoringView from './components/monitoring/MonitoringView';
import EnergyManagement from './components/energy/EnergyManagement';
import SettingsPanel from './components/settings/SettingsPanel';
import theme from './theme';

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [currentView, setCurrentView] = React.useState('dashboard');
  const [configureOpen, setConfigureOpen] = React.useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'plants':
        return (
          <>
            <PlantConfiguration
              open={configureOpen}
              onClose={() => setConfigureOpen(false)}
            />
            <SystemStats />
          </>
        );
      case 'irrigation':
        return <IrrigationSchedule />;
      case 'automation':
        return <AutomationRules />;
      case 'monitoring':
        return <MonitoringView />;
      case 'energy':
        return <EnergyManagement />;
      case 'settings':
        return <SettingsPanel />;
      case 'reports':
        return <Box p={3}>Cette fonctionnalité sera bientôt disponible</Box>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex',
        minHeight: '100vh',
        background: '#FFFFFF',
      }}>
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          currentView={currentView}
          onViewChange={setCurrentView}
        />
        <Box
          sx={{
            flexGrow: 1,
            marginLeft: sidebarOpen ? '240px' : '72px',
            transition: (theme) =>
              theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }}
        >
          <Header />
          <Box sx={{ p: 3 }}>
            {renderView()}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
