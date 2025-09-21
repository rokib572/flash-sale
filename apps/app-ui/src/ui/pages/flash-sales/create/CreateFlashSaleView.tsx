import React from 'react';
import { Container, Heading, Separator, Text } from '@radix-ui/themes';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Link } from 'react-router-dom';

export type Product = { id: string; name: string };

export type CreateFlashSaleViewProps = {
  products: Product[];
  values: {
    name: string;
    description: string;
    productId: string;
    startDate: string; // datetime-local
    endDate: string;   // datetime-local
  };
  loading?: boolean;
  error?: string | null;
  onChange: (patch: Partial<CreateFlashSaleViewProps['values']>) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export const CreateFlashSaleView: React.FC<CreateFlashSaleViewProps> = ({
  products,
  values,
  loading,
  error,
  onChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <Container size="2" style={{ marginTop: '2rem' }}>
      <div className="flex items-center justify-between">
        <Heading>Create Flash Sale</Heading>
        <Button asChild variant="secondary">
          <Link to="/flash-sales">Back to list</Link>
        </Button>
      </div>
      <Separator my="3" size="4" />
      {error && (
        <Text color="red" as="p" mb="2">
          {error}
        </Text>
      )}
      <form
        className="space-y-3 max-w-xl"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={values.name} onChange={(e) => onChange({ name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={values.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product">Product</Label>
          <div className="flex gap-2 items-stretch">
            <select
              id="product"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={values.productId}
              onChange={(e) => onChange({ productId: e.target.value })}
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button asChild variant="secondary">
              <Link to="/products/create">Create Product</Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="start">Start</Label>
            <Input
              id="start"
              type="datetime-local"
              value={values.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end">End</Label>
            <Input
              id="end"
              type="datetime-local"
              value={values.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Flash Sale'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  );
};
