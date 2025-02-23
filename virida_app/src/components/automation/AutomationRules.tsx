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
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Automation Rules
      </Typography>
      <List>
        {automationRules.map((rule) => (
          <StyledCard key={rule.id}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{rule.name}</Typography>
                <Box>
                  <Switch
                    checked={rule.enabled}
                    onChange={() => toggleAutomationRule(rule.id)}
                    color="primary"
                  />
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Box mt={1}>
                <Typography variant="body2" color="text.secondary">
                  Condition: {rule.condition}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Action: {rule.action}
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        ))}
      </List>
    </Box>
  );
};

export default AutomationRules;
