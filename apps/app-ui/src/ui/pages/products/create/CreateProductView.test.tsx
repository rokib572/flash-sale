import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CreateProductView } from './CreateProductView';

describe('CreateProductView', () => {
  it('renders header and form', () => {
    const html = renderToString(
      <CreateProductView
        values={{ name: '', quantity: 0, disabled: false }}
        onChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(html).toContain('Create Product');
    expect(html).toContain('Name');
    expect(html).toContain('Quantity');
  });
});
