import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2AD388',
      light: '#CBED82',
      dark: '#052E1C',
    },
    secondary: {
      main: '#CBED82',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#121A21',
      secondary: '#121A21',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#FFFFFF',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: '#FFFFFF',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#FFFFFF',
          color: '#121A21',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#052E1C',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#041E13',
          },
        },
        outlinedPrimary: {
          borderColor: '#2AD388',
          color: '#2AD388',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#121A21',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#121A21',
    },
    h6: {
      color: '#2AD388',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16,
  },
});

export default theme;
