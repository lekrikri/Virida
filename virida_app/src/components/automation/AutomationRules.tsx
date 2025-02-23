import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Switch,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useViridaStore } from '../../store/useViridaStore';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  marginBottom: theme.spacing(2),
}));

const AutomationRules: React.FC = () => {
  const { automationRules, toggleAutomationRule } = useViridaStore();

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Automation Rules
        </Typography>
        <List>
          {automationRules.map((rule) => (
            <ListItem
              key={rule.id}
              sx={{
                borderBottom: '1px solid rgba(46, 204, 113, 0.1)',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <ListItemText
                primary={rule.name}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      If: {rule.condition}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Then: {rule.action}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  size="small"
                  sx={{ color: 'primary.main', mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  size="small"
                  sx={{ color: 'error.main', mr: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
                <Switch
                  checked={rule.enabled}
                  onChange={() => toggleAutomationRule(rule.id)}
                  color="primary"
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </StyledCard>
  );
};

export default AutomationRules;
