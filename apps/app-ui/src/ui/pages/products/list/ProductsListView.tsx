import React from 'react';
import { Container, Heading, Separator, Text } from '@radix-ui/themes';
import { Button } from '../../../components/ui/button';
import { Link } from 'react-router-dom';

export type Product = { id: string; name: string } & Partial<{ quantity: number; disabled: boolean }>;

export type ProductsListViewProps = {
  products: Product[];
  isLoading?: boolean;
  error?: string | null;
};

export const ProductsListView: React.FC<ProductsListViewProps> = ({ products, isLoading, error }) => {
  return (
    <Container size="2" style={{ marginTop: '2rem' }}>
      <div className="flex items-center justify-between">
        <Heading>Products</Heading>
        <Button asChild>
          <Link to="/products/create">Create Product</Link>
        </Button>
      </div>
      <Separator my="3" size="4" />
      {isLoading && <Text>Loading…</Text>}
      {error && (
        <Text color="red" as="p">
          {error}
        </Text>
      )}
      {!isLoading && !error && products.length === 0 && <Text>No products.</Text>}
      {!isLoading && !error && products.length > 0 && (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="rounded-md border p-3">
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
  );
};

