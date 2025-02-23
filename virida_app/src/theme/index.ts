import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#27ae60',
      light: '#2ecc71',
      dark: '#219a52',
    },
    secondary: {
      main: '#2ecc71',
    },
    background: {
      default: '#0a192f',
      paper: '#112240',
    },
    text: {
      primary: '#e6f1ff',
      secondary: '#8892b0',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(17, 34, 64, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(46, 204, 113, 0.1)',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(17, 34, 64, 0.7)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#e6f1ff',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#e6f1ff',
    },
    h6: {
      color: '#27ae60',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16,
  },
});

export default theme;
