import { getSaleStatus } from '@flash-sale/shared/date-utils';
import { Text } from '@radix-ui/themes';
import React from 'react';
import { Router } from '../../../../router';
import { Button } from '../../../components/ui/button';
import { Container } from '../../../layout/Container';
import { PageHeader } from '../../../layout/PageHeader';

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
  const getStatus = (s: FlashSale) => getSaleStatus({ start: s.startDate, end: s.endDate });

  const orderedSales = React.useMemo(() => {
    const priority: Record<'active' | 'upcoming' | 'ended', number> = {
      active: 0,
      upcoming: 1,
      ended: 2,
    };
    return [...sales].sort((a, b) => {
      const pa = priority[getStatus(a) as 'active' | 'upcoming' | 'ended'];
      const pb = priority[getStatus(b) as 'active' | 'upcoming' | 'ended'];
      if (pa !== pb) return pa - pb;
      // Secondary sort by startDate ascending
      return a.startDate.localeCompare(b.startDate);
    });
  }, [sales]);

  return (
    <>
      <PageHeader
        title="Flash Sales"
        actions={<Button onClick={() => Router.push('FlashSalesCreate')}>Create Flash Sale</Button>}
      />
      <Container className="mt-6">
        {isLoading && <Text>Loading…</Text>}
        {error && (
          <Text color="red" as="p">
            {error}
          </Text>
        )}
        {!isLoading && !error && sales.length === 0 && <Text>No flash sales found.</Text>}
        {!isLoading && !error && sales.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {orderedSales.map((s) => {
              const status = getStatus(s);
              const canOrder = status === 'active' && orderingProductId !== s.productId;
              return (
                <div
                  key={s.id}
                  className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <Text as="div" weight="bold">
                    {s.name}
                  </Text>
                  <Text
                    as="div"
                    color={
                      status === 'active' ? 'green' : status === 'upcoming' ? 'orange' : 'gray'
                    }
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
    </>
  );
};
