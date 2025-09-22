import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ProductsListView } from './ProductsListView';

describe('ProductsListView', () => {
  it('renders products and header', () => {
    const html = renderToString(
      <ProductsListView products={[{ id: 'p1', name: 'Prod' }]} />,
    );
    expect(html).toContain('Products');
    expect(html).toContain('Prod');
  });
});
