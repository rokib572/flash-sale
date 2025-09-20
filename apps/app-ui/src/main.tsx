import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import { Providers } from './ui/providers';
import '@radix-ui/themes/styles.css';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './ui/pages/login/LoginPage';
import { RequireAuth } from './ui/auth/RequireAuth';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RequireAuth><App /></RequireAuth>} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  </React.StrictMode>
);
