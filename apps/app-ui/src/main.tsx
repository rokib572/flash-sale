import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import { Providers } from './ui/providers';
import '@radix-ui/themes/styles.css';
import './index.css';
import { ThemeStateProvider } from './modules/app-theme';
import { AppErrorBoundary } from './ui/components/error-boundary';
import { Toasts } from './ui/components/toast-container';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <ThemeStateProvider>
        <AppErrorBoundary>
          <App />
          <Toasts />
        </AppErrorBoundary>
      </ThemeStateProvider>
    </Providers>
  </React.StrictMode>,
);
