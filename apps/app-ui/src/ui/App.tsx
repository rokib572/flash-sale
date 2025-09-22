import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import { Router } from '../router';
import { AppContent } from '../router/app-content';
import { Topbar } from '../router/topbar';

export const App: React.FC = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const route = Router.useRoute(["Home", "Login", "FlashSalesCreate", "FlashSalesList", "ProductsList", "ProductsCreate"]);
  const name = (route?.name ?? 'Home') as 'Home' | 'Login' | 'FlashSalesCreate' | 'FlashSalesList' | 'ProductsList' | 'ProductsCreate';

  React.useEffect(() => {
    // Redirect to home when required auth is missing (except on Login)
    if (!token && name !== 'Login') {
      Router.replace('Home');
    }
  }, [token, name]);

  return (
    <div className="flex h-svh w-full flex-col">
      <nav className="z-20 h-16 border-b">
        <Topbar />
      </nav>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <AppContent />
      </div>
    </div>
  );
};
