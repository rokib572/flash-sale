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
  onOrder?: (productId: string) => void;
  orderingProductId?: string | null;
};

export const FlashSalesListView: React.FC<FlashSalesListViewProps> = ({
  sales,
  isLoading,
  error,
  onOrder,
  orderingProductId,
}) => {
  // Dates are already local; compare directly by exact timestamps
  // Compare timestamps as local strings to avoid any timezone conversion
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const nowStringLike = (len: number) => {
    const d = new Date();
    const full = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes(),
    )}:${pad(d.getSeconds())}`;
    return full.slice(0, len);
  };

  const getStatus = (s: FlashSale) => {
    const patternLen = s.startDate.length; // e.g., 16 (YYYY-MM-DDTHH:mm) or 19 (..:ss)
    const nowStr = nowStringLike(patternLen);
    if (nowStr < s.startDate) return 'upcoming';
    if (nowStr > s.endDate) return 'ended';
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
          {sales.map((s) => {
            const status = getStatus(s);
            const canOrder = status === 'active' && orderingProductId !== s.productId;
            return (
              <div key={s.id} className="rounded-md border p-3">
                <Text as="div" weight="bold">
                  {s.name}
                </Text>
                <Text
                  as="div"
                  color={status === 'active' ? 'green' : status === 'upcoming' ? 'orange' : 'gray'}
                >
                  Status: {status}
                </Text>
                <Text as="div">
                  Window: {s.startDate} → {s.endDate}
                </Text>
                {s.description ? (
                  <Text as="p" mt="2">
                    {s.description}
                  </Text>
                ) : null}
                <div className="mt-3">
                  <Button
                    disabled={!canOrder}
                    onClick={() => onOrder?.(s.productId)}
                    title={
                      canOrder
                        ? 'Place order for this sale'
                        : 'Ordering available only during active sale'
                    }
                  >
                    Order Now
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
};
