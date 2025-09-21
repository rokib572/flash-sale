import { Container, Heading, Separator, Text } from '@radix-ui/themes';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';

export type FlashSale = {
  id: string;
  name: string;
  description: string;
  productId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export type FlashSalesListViewProps = {
  sales: FlashSale[];
  isLoading?: boolean;
  error?: string | null;
};

export const FlashSalesListView: React.FC<FlashSalesListViewProps> = ({
  sales,
  isLoading,
  error,
}) => {
  const getStatus = (s: FlashSale) => {
    const now = new Date();
    const start = new Date(s.startDate);
    const end = new Date(s.endDate);
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'active';
  };

  return (
    <Container size="2" style={{ marginTop: '2rem' }}>
      <div className="flex items-center justify-between">
        <Heading>Flash Sales</Heading>
        <Button asChild>
          <Link to="/flash-sales/create">Create Flash Sale</Link>
        </Button>
      </div>
      <Separator my="3" size="4" />
      {isLoading && <Text>Loading…</Text>}
      {error && (
        <Text color="red" as="p">
          {error}
        </Text>
      )}
      {!isLoading && !error && sales.length === 0 && <Text>No flash sales found.</Text>}
      {!isLoading && !error && sales.length > 0 && (
        <div className="space-y-3">
          {sales.map((s) => (
            <div key={s.id} className="rounded-md border p-3">
              <Text as="div" weight="bold">
                {s.name}
              </Text>
              <Text
                as="div"
                color={
                  getStatus(s) === 'active'
                    ? 'green'
                    : getStatus(s) === 'upcoming'
                      ? 'orange'
                      : 'gray'
                }
              >
                Status: {getStatus(s)}
              </Text>
              <Text as="div">
                Window: {new Date(s.startDate).toLocaleString()} →{' '}
                {new Date(s.endDate).toLocaleString()}
              </Text>
              {s.description ? (
                <Text as="p" mt="2">
                  {s.description}
                </Text>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};
