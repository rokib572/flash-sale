import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { FlashSalesListView } from './FlashSalesListView';

describe('FlashSalesListView', () => {
  it('renders header and sales', () => {
    const html = renderToString(
      <FlashSalesListView
        sales={[{ id: 's1', name: 'Sale 1', description: '', productId: 'p1', startDate: '2099-01-01T00:00:00Z', endDate: '2099-01-01T01:00:00Z', createdAt: '2024-01-01T00:00:00Z' }]}
      />,
    );
    expect(html).toContain('Flash Sales');
    expect(html).toContain('Sale 1');
  });
});
