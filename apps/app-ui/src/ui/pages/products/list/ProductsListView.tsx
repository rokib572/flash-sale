import React from 'react';
import { Text } from '@radix-ui/themes';
import { Container } from '../../../layout/Container';
import { PageHeader } from '../../../layout/PageHeader';
import { Button } from '../../../components/ui/button';
import { Router } from '../../../../router';

export type Product = { id: string; name: string } & Partial<{ quantity: number; disabled: boolean }>;

export type ProductsListViewProps = {
  products: Product[];
  isLoading?: boolean;
  error?: string | null;
};

export const ProductsListView: React.FC<ProductsListViewProps> = ({ products, isLoading, error }) => {
  return (
    <>
      <PageHeader
        title="Products"
        actions={<Button onClick={() => Router.push('ProductsCreate')}>Create Product</Button>}
      />
      <Container className="mt-6">
      {isLoading && <Text>Loading…</Text>}
      {error && (
        <Text color="red" as="p">
          {error}
        </Text>
      )}
      {!isLoading && !error && products.length === 0 && <Text>No products.</Text>}
      {!isLoading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
              <Text as="div" weight="bold">
                {p.name}
              </Text>
              {p.quantity != null && (
                <Text as="div" color="gray">
                  Quantity: {p.quantity}
                </Text>
              )}
              {p.disabled != null && (
                <Text as="div" color={p.disabled ? 'red' : 'green'}>
                  {p.disabled ? 'Disabled' : 'Active'}
                </Text>
              )}
            </div>
          ))}
        </div>
      )}
      </Container>
    </>
  );
};
