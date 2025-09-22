import { createRouter } from '@swan-io/chicane';

export const Router = createRouter({
  Home: '/',
  Login: '/login',
  FlashSalesCreate: '/flash-sales/create',
  FlashSalesList: '/flash-sales',
  ProductsList: '/products',
  ProductsCreate: '/products/create',
  OrdersList: '/orders',
});
