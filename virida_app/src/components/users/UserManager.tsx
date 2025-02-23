import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  Switch,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ScienceIcon from '@mui/icons-material/Science';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid rgba(46, 204, 113, 0.1)',
  color: theme.palette.text.secondary,
}));

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: string;
  lastActive: string;
  avatar?: string;
}

const UserManager: React.FC = () => {
  const [users, setUsers] = React.useState<User[]>([
    {
      id: 1,
      name: 'John Admin',
      email: 'john@virida.com',
      role: 'admin',
      permissions: ['all'],
      status: 'active',
      lastActive: '2025-02-18T12:30:00',
    },
    {
      id: 2,
      name: 'Sarah Technician',
      email: 'sarah@virida.com',
      role: 'technician',
      permissions: ['monitor', 'maintain', 'operate'],
      status: 'active',
      lastActive: '2025-02-18T11:45:00',
    },
  ]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [newUser, setNewUser] = React.useState<Partial<User>>({
    role: 'operator',
    status: 'active',
    permissions: ['monitor'],
  });

  const roles = {
    admin: {
      icon: <AdminPanelSettingsIcon />,
      color: '#e74c3c',
      label: 'Administrator',
    },
    technician: {
      icon: <EngineeringIcon />,
      color: '#3498db',
      label: 'Technician',
    },
    scientist: {
      icon: <ScienceIcon />,
      color: '#9b59b6',
      label: 'Scientist',
    },
    operator: {
      icon: <PersonIcon />,
      color: '#2ecc71',
      label: 'Operator',
    },
  };

  const permissions = [
    { value: 'monitor', label: 'Monitor Systems' },
    { value: 'operate', label: 'Operate Equipment' },
    { value: 'maintain', label: 'Maintain Systems' },
    { value: 'manage_users', label: 'Manage Users' },
    { value: 'view_reports', label: 'View Reports' },
    { value: 'edit_settings', label: 'Edit Settings' },
    { value: 'all', label: 'Full Access' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#2ecc71';
      case 'inactive':
        return '#95a5a6';
      case 'suspended':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setNewUser({
      role: 'operator',
      status: 'active',
      permissions: ['monitor'],
    });
    setOpenDialog(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser(user);
    setOpenDialog(true);
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleSaveUser = () => {
    const currentTime = new Date().toISOString();
    
    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? { ...u, ...newUser, lastActive: currentTime }
            : u
        )
      );
    } else {
      setUsers([
        ...users,
        {
          ...newUser,
          id: users.length + 1,
          lastActive: currentTime,
        } as User,
      ]);
    }
    setOpenDialog(false);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <StyledCard>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">User Management</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddUser}
              >
                Add User
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>User</StyledTableCell>
                    <StyledTableCell>Role</StyledTableCell>
                    <StyledTableCell>Permissions</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell>Last Active</StyledTableCell>
                    <StyledTableCell>Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={user.avatar}
                            sx={{
                              bgcolor: roles[user.role as keyof typeof roles].color,
                            }}
                          >
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">{user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {roles[user.role as keyof typeof roles].icon}
                          {roles[user.role as keyof typeof roles].label}
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {user.permissions.map((permission) => (
                            <Chip
                              key={permission}
                              label={
                                permissions.find((p) => p.value === permission)
                                  ?.label
                              }
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                                borderColor: 'primary.main',
                              }}
                            />
                          ))}
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(user.status)}20`,
                            color: getStatusColor(user.status),
                            borderColor: getStatusColor(user.status),
                          }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        {getTimeAgo(user.lastActive)}
                      </StyledTableCell>
                      <StyledTableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user.id)}
                          sx={{ color: 'error.main' }}
                          disabled={user.role === 'admin'}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </StyledTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </StyledCard>
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(17, 34, 64, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(46, 204, 113, 0.1)',
          },
        }}
      >
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Full Name"
              value={newUser.name || ''}
              onChange={(e) =>
                setNewUser((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={newUser.email || ''}
              onChange={(e) =>
                setNewUser((prev) => ({ ...prev, email: e.target.value }))
              }
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role || 'operator'}
                label="Role"
                onChange={(e) =>
                  setNewUser((prev) => ({
                    ...prev,
                    role: e.target.value,
                    permissions:
                      e.target.value === 'admin' ? ['all'] : ['monitor'],
                  }))
                }
              >
                {Object.entries(roles).map(([role, data]) => (
                  <MenuItem key={role} value={role}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {data.icon}
                      {data.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {newUser.role !== 'admin' && (
              <FormControl fullWidth>
                <InputLabel>Permissions</InputLabel>
                <Select
                  multiple
                  value={newUser.permissions || []}
                  label="Permissions"
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      permissions: e.target.value as string[],
                    }))
                  }
                  renderValue={(selected) => (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={
                            permissions.find((p) => p.value === value)?.label
                          }
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {permissions
                    .filter((p) => p.value !== 'all')
                    .map((permission) => (
                      <MenuItem key={permission.value} value={permission.value}>
                        {permission.label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newUser.status || 'active'}
                label="Status"
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default UserManager;
