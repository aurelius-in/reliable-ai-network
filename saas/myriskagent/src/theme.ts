import { createTheme } from '@mui/material/styles'

const noirBlack = '#000000'
const noirRed = '#B30700'
const noirYellow = '#F1A501'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: noirRed },
    secondary: { main: noirYellow },
    background: { default: noirBlack, paper: '#111111' },
    text: { primary: noirYellow },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Century Gothic, Arial, sans-serif',
    h1: { color: noirRed, fontFamily: 'Special Elite, serif' },
    h2: { color: noirRed, fontFamily: 'Special Elite, serif' },
    h3: { color: noirRed, fontFamily: 'Special Elite, serif' },
    h4: { color: noirRed, fontFamily: 'Special Elite, serif' },
    h5: { color: noirRed, fontFamily: 'Special Elite, serif' },
    h6: { color: noirRed, fontFamily: 'Special Elite, serif' },
  },
  components: {
    MuiAppBar: {
      styleOverrides: { root: { backgroundColor: noirBlack, borderBottom: `1px solid ${noirRed}` } },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: 0.3,
          borderRadius: 10,
          transition: 'all 180ms ease',
          '&:hover': { transform: 'translateY(-1px)' },
          '&.Mui-focusVisible': { outline: `2px solid ${noirYellow}`, outlineOffset: 2 },
        },
        contained: {
          color: '#ffffff',
          background: `linear-gradient(90deg, ${noirRed}, #7a0500)`,
          boxShadow: '0 4px 14px rgba(179,7,0,0.35)',
          '&:hover': { background: `linear-gradient(90deg, #c80902, #5f0400)`, boxShadow: '0 6px 18px rgba(179,7,0,0.45)' },
          '&:active': { transform: 'translateY(0px) scale(0.99)' },
          '&.Mui-disabled': { opacity: 0.5, boxShadow: 'none' },
        },
        outlined: {
          color: noirYellow,
          borderColor: noirRed,
          backgroundColor: 'rgba(179,7,0,0.08)',
          '&:hover': { backgroundColor: 'rgba(179,7,0,0.16)', borderColor: noirRed },
        },
      },
      defaultProps: { variant: 'contained', size: 'medium' },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundColor: '#111111', border: `1px solid ${noirRed}` } },
    },
    MuiTab: {
      styleOverrides: { root: { color: noirYellow } },
    },
    MuiTabs: {
      styleOverrides: { indicator: { backgroundColor: noirYellow } },
    },
    MuiInputBase: {
      styleOverrides: { input: { color: noirYellow } },
    },
    MuiFormLabel: {
      styleOverrides: { root: { color: noirYellow } },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiToggleButton: {
      styleOverrides: { root: { color: noirYellow, borderColor: noirRed } },
    },
  },
})

export default theme


