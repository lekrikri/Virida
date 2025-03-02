import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2AD388',
      light: '#CBED82',
      dark: '#052E1C',
    },
    secondary: {
      main: '#CBED82',
      light: '#CBED82',
      dark: '#052E1C',
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
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          background: '#FFFFFF',
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
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#052E1C',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#041E13',
          },
        },
      },
    },
  },
});