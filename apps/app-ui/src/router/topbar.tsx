import React from 'react';
import { Router } from '.';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../ui/store';
import { useThemeState } from '../modules/app-theme';
import { Container } from '../ui/layout/Container';
import { logout } from '../ui/store';
import { toast } from 'react-toastify';

export const Topbar: React.FC = () => {
  const { theme, toggle } = useThemeState();
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  const route = Router.useRoute(['Home', 'FlashSalesList', 'ProductsList', 'OrdersList', 'Login', 'FlashSalesCreate', 'ProductsCreate']);
  const current = (route?.name ?? 'Home') as 'Home' | 'FlashSalesList' | 'ProductsList' | 'OrdersList' | 'Login' | 'FlashSalesCreate' | 'ProductsCreate';

  const linkClass = (active: boolean) =>
    [
      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
      active
        ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200'
        : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800',
    ].join(' ');

  return (
    <div className="sticky top-0 z-50 h-16 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-neutral-900/80 dark:supports-[backdrop-filter]:bg-neutral-900/60">
      <Container className="h-full" padded>
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="font-semibold tracking-tight text-neutral-900 dark:text-white" onClick={() => Router.replace('Home')}>
              Flash Sale
            </button>
            <nav className="flex items-center gap-2">
              <button className={linkClass(current === 'FlashSalesList' || current === 'Home')} onClick={() => Router.push('FlashSalesList')}>
                Sales
              </button>
              <button className={linkClass(current === 'ProductsList')} onClick={() => Router.push('ProductsList')}>
                Products
              </button>
              <button className={linkClass(current === 'OrdersList')} onClick={() => Router.push('OrdersList')}>
                Orders
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm px-2 py-1 rounded-md text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white" onClick={toggle}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-700 dark:text-neutral-200">{user.givenName}</span>
                <button
                  className="text-sm px-2 py-1 rounded-md text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                  onClick={() => {
                    dispatch(logout());
                    toast.info('Signed out');
                    Router.replace('Login');
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                className="text-sm px-2 py-1 rounded-md text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                onClick={() => Router.push('Login')}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};
