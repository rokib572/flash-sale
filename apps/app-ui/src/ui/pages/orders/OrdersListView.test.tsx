import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { OrdersListView } from './OrdersListView';

describe('OrdersListView', () => {
  it('renders header and table', () => {
    const html = renderToString(
      <OrdersListView
        orders={[{ id: 'o1', userId: 'u1', productId: 'p1', flashSaleId: null, quantity: 1, createdAt: new Date().toISOString() }]}
        page={{ limit: 10, offset: 0, setLimit: () => {}, nextPage: () => {}, prevPage: () => {}, refetch: () => {} }}
      />,
    );
    expect(html).toContain('My Orders');
    expect(html).toContain('Order ID');
  });
});
