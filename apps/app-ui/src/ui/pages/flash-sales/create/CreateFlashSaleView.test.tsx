import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CreateFlashSaleView } from './CreateFlashSaleView';

describe('CreateFlashSaleView', () => {
  it('renders header and fields', () => {
    const html = renderToString(
      <CreateFlashSaleView
        products={[{ id: 'p1', name: 'P1' }]}
        values={{ name: '', description: '', productId: '', startDate: '2024-01-01T00:00', endDate: '2024-01-01T01:00' }}
        onChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(html).toContain('Create Flash Sale');
    expect(html).toContain('Product');
  });
});
