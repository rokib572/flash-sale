import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import { Providers } from './ui/providers';
import '@radix-ui/themes/styles.css';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './ui/pages/login/LoginPage';
import { CreateFlashSalePage } from './ui/pages/flash-sales/create/CreateFlashSalePage';
import { ProductsListPage } from './ui/pages/products/list/ProductsListPage';
import { CreateProductPage } from './ui/pages/products/create/CreateProductPage';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/flash-sales/create" element={<CreateFlashSalePage />} />
          <Route path="/flash-sales" element={<App />} />
          <Route path="/products" element={<ProductsListPage />} />
          <Route path="/products/create" element={<CreateProductPage />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  </React.StrictMode>
);
