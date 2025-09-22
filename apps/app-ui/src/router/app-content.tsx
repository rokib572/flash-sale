import React from 'react';
import { Router } from '.';
import { LoginPage } from '../ui/pages/login/LoginPage';
import { CreateFlashSalePage } from '../ui/pages/flash-sales/create/CreateFlashSalePage';
import { ProductsListPage } from '../ui/pages/products/list/ProductsListPage';
import { CreateProductPage } from '../ui/pages/products/create/CreateProductPage';
import { OrdersListPage } from '../ui/pages/orders/OrdersListPage';
import { FlashSalesListPage } from '../ui/pages/flash-sales/list/FlashSalesListPage';

export const AppContent: React.FC = () => {
  const route = Router.useRoute([
    'Home',
    'Login',
    'FlashSalesCreate',
    'FlashSalesList',
    'ProductsList',
    'ProductsCreate',
    'OrdersList',
  ]);
  const name = (route?.name ?? 'Home') as
    | 'Home'
    | 'Login'
    | 'FlashSalesCreate'
    | 'FlashSalesList'
    | 'ProductsList'
    | 'ProductsCreate'
    | 'OrdersList';

  switch (name) {
    case 'Home':
      return <FlashSalesListPage />;
    case 'Login':
      return <LoginPage />;
    case 'FlashSalesCreate':
      return <CreateFlashSalePage />;
    case 'FlashSalesList':
      return <FlashSalesListPage />;
    case 'ProductsList':
      return <ProductsListPage />;
    case 'ProductsCreate':
      return <CreateProductPage />;
    case 'OrdersList':
      return <OrdersListPage />;
    default:
      return <FlashSalesListPage />;
  }
};
