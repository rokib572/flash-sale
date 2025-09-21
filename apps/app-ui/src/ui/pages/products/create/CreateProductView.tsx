import { Container, Heading, Separator, Text } from '@radix-ui/themes';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

export type CreateProductValues = {
  name: string;
  quantity: number;
  disabled: boolean;
};

export type CreateProductViewProps = {
  values: CreateProductValues;
  loading?: boolean;
  error?: string | null;
  onChange: (patch: Partial<CreateProductValues>) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export const CreateProductView: React.FC<CreateProductViewProps> = ({
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
        <Heading>Create Product</Heading>
        <Button asChild variant="secondary">
          <Link to="/products">Back to products</Link>
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
          <Input
            id="name"
            value={values.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min={0}
            value={values.quantity}
            onChange={(e) => onChange({ quantity: parseInt(e.target.value) })}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="disabled"
            type="checkbox"
            checked={values.disabled}
            onChange={(e) => onChange({ disabled: e.target.checked })}
          />
          <Label htmlFor="disabled">Disabled</Label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Product'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  );
};
