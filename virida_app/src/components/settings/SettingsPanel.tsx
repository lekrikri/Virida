import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  styled,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import BackupIcon from '@mui/icons-material/Backup';
import StorageIcon from '@mui/icons-material/Storage';

const StyledCard = styled(Card)(({ theme }) => ({
  background: '#FFFFFF',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  height: '100%',
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [showSavedAlert, setShowSavedAlert] = useState(false);

  const [settings, setSettings] = useState({
    general: {
      language: 'en',
      timezone: 'UTC+1',
      dateFormat: 'DD/MM/YYYY',
      temperatureUnit: 'celsius',
    },
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      alertThreshold: 'medium',
      dailyReports: true,
      maintenanceAlerts: true,
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordExpiration: 90,
      ipWhitelist: ['192.168.1.0/24'],
    },
    display: {
      theme: 'dark',
      dashboardLayout: 'compact',
      refreshRate: 5,
      showGridLines: true,
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionPeriod: 30,
      lastBackup: '2025-02-18T10:00:00',
    },
    storage: {
      dataRetention: 90,
      compressionEnabled: true,
      archiveOldData: true,
      storageLocation: 'local',
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type: string) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleSaveSettings = () => {
    setShowSavedAlert(true);
    setTimeout(() => setShowSavedAlert(false), 3000);
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Settings</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Save All Changes
        </Button>
      </Box>

      {showSavedAlert && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      {/* Settings Tabs */}
      <StyledCard>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<LanguageIcon />} label="General" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<SecurityIcon />} label="Security" />
            <Tab icon={<DisplaySettingsIcon />} label="Display" />
            <Tab icon={<BackupIcon />} label="Backup" />
            <Tab icon={<StorageIcon />} label="Storage" />
          </Tabs>
        </Box>

        {/* General Settings */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.general.language}
                  label="Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.general.timezone}
                  label="Timezone"
                >
                  <MenuItem value="UTC+0">UTC+0</MenuItem>
                  <MenuItem value="UTC+1">UTC+1</MenuItem>
                  <MenuItem value="UTC+2">UTC+2</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={settings.general.dateFormat}
                  label="Date Format"
                >
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Temperature Unit</InputLabel>
                <Select
                  value={settings.general.temperatureUnit}
                  label="Temperature Unit"
                >
                  <MenuItem value="celsius">Celsius</MenuItem>
                  <MenuItem value="fahrenheit">Fahrenheit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={activeTab} index={1}>
          <List>
            <ListItem>
              <ListItemText
                primary="Email Alerts"
                secondary="Receive important alerts via email"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.notifications.emailAlerts}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Push Notifications"
                secondary="Receive alerts in your browser"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.notifications.pushNotifications}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Alert Threshold"
                secondary="Set the minimum severity level for alerts"
              />
              <ListItemSecondaryAction>
                <Select
                  value={settings.notifications.alertThreshold}
                  size="small"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Daily Reports"
                secondary="Receive daily summary reports"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.notifications.dailyReports}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </TabPanel>

        {/* Security Settings */}
        <TabPanel value={activeTab} index={2}>
          <List>
            <ListItem>
              <ListItemText
                primary="Two-Factor Authentication"
                secondary="Enable 2FA for additional security"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.security.twoFactorAuth}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Session Timeout (minutes)"
                secondary="Automatically log out after inactivity"
              />
              <ListItemSecondaryAction>
                <TextField
                  type="number"
                  value={settings.security.sessionTimeout}
                  size="small"
                  sx={{ width: 100 }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="IP Whitelist"
                secondary="Restrict access to specific IP addresses"
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleOpenDialog('ipWhitelist')}>
                  <EditIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </TabPanel>

        {/* Display Settings */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={settings.display.theme}
                  label="Theme"
                >
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Dashboard Layout</InputLabel>
                <Select
                  value={settings.display.dashboardLayout}
                  label="Dashboard Layout"
                >
                  <MenuItem value="compact">Compact</MenuItem>
                  <MenuItem value="comfortable">Comfortable</MenuItem>
                  <MenuItem value="spacious">Spacious</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Refresh Rate (seconds)</InputLabel>
                <Select
                  value={settings.display.refreshRate}
                  label="Refresh Rate"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Backup Settings */}
        <TabPanel value={activeTab} index={4}>
          <List>
            <ListItem>
              <ListItemText
                primary="Automatic Backup"
                secondary="Enable scheduled backups"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.backup.autoBackup}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Backup Frequency"
                secondary="How often to create backups"
              />
              <ListItemSecondaryAction>
                <Select
                  value={settings.backup.backupFrequency}
                  size="small"
                >
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Retention Period (days)"
                secondary="How long to keep backups"
              />
              <ListItemSecondaryAction>
                <TextField
                  type="number"
                  value={settings.backup.retentionPeriod}
                  size="small"
                  sx={{ width: 100 }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Last Backup"
                secondary={new Date(settings.backup.lastBackup).toLocaleString()}
              />
              <ListItemSecondaryAction>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<BackupIcon />}
                >
                  Backup Now
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </TabPanel>

        {/* Storage Settings */}
        <TabPanel value={activeTab} index={5}>
          <List>
            <ListItem>
              <ListItemText
                primary="Data Retention (days)"
                secondary="How long to keep historical data"
              />
              <ListItemSecondaryAction>
                <TextField
                  type="number"
                  value={settings.storage.dataRetention}
                  size="small"
                  sx={{ width: 100 }}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Compression"
                secondary="Enable data compression to save space"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.storage.compressionEnabled}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Archive Old Data"
                secondary="Automatically archive data older than retention period"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.storage.archiveOldData}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Storage Location"
                secondary="Where to store data and backups"
              />
              <ListItemSecondaryAction>
                <Select
                  value={settings.storage.storageLocation}
                  size="small"
                >
                  <MenuItem value="local">Local</MenuItem>
                  <MenuItem value="cloud">Cloud</MenuItem>
                  <MenuItem value="hybrid">Hybrid</MenuItem>
                </Select>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </TabPanel>
      </StyledCard>
    </Box>
  );
};

export default SettingsPanel;
