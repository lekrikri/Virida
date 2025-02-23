import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  styled,
} from '@mui/material';
import UpdateIcon from '@mui/icons-material/Update';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(17, 34, 64, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(46, 204, 113, 0.1)',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  maxWidth: 600,
  margin: '0 auto',
  marginTop: theme.spacing(8),
}));

const ComingSoon: React.FC = () => {
  return (
    <Box p={3}>
      <StyledPaper>
        <UpdateIcon sx={{ fontSize: 60, color: '#2ecc71' }} />
        <Typography variant="h4" align="center" gutterBottom>
          Cette fonctionnalité sera bientôt disponible
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Notre équipe travaille activement sur le développement de fonctionnalités de monitoring avancées. 
          Restez à l'écoute pour des mises à jour importantes !
        </Typography>
        <Box display="flex" gap={2} mt={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<NotificationsActiveIcon />}
          >
            M'alerter quand c'est prêt
          </Button>
        </Box>
      </StyledPaper>
    </Box>
  );
};

export default ComingSoon;
