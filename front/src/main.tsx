// src/main.tsx
if (import.meta.env.DEV) { await import('./wdyr'); }
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';          // React 18+ の新API
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';

import store from './User/features/login/store';
import Router from './router/Router';

const theme = createTheme();

const container = document.getElementById('root')!;
createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
