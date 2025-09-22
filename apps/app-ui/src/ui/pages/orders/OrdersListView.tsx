import { Text } from '@radix-ui/themes';
import React from 'react';
import { Button } from '../../components/ui/button';
import { Container } from '../../layout/Container';
import { PageHeader } from '../../layout/PageHeader';

import type { OrdersListViewProps } from './types';

export const OrdersListView: React.FC<OrdersListViewProps> = ({ orders, loading, error, page }) => {
  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '-');
  return (
    <>
      <PageHeader title="My Orders" />
      <Container className="mt-6">
        {loading && <Text>Loading…</Text>}
        {error && (
          <Text color="red" as="p" mb="2">
            {error}
          </Text>
        )}

        {!loading && !error && orders.length === 0 && <Text>No orders yet.</Text>}

        {!loading && !error && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-600">
                  <th className="py-2 pr-3">Order ID</th>
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Flash Sale</th>
                  <th className="py-2 pr-3">Qty</th>
                  <th className="py-2 pr-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="py-2 pr-3">{o.id}</td>
                    <td className="py-2 pr-3">{o.productId}</td>
                    <td className="py-2 pr-3">{o.flashSaleId || '-'}</td>
                    <td className="py-2 pr-3">{o.quantity}</td>
                    <td className="py-2 pr-3">{fmt(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <Button variant="secondary" onClick={page.prevPage} disabled={page.offset <= 0}>
            Previous
          </Button>
          <Button variant="secondary" onClick={page.nextPage}>
            Next
          </Button>
          <div className="ml-auto flex items-center gap-2 text-xs text-neutral-600">
            <span>Page size</span>
            <select
              className="rounded border px-2 py-1"
              value={page.limit}
              onChange={(e) =>
                page.setLimit(Math.max(1, Math.min(100, parseInt(e.target.value) || 20)))
              }
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <Button variant="secondary" onClick={() => page.refetch()}>
              Refresh
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
};
