import React from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import type { RootState } from '../../store';
import { api } from '../../api/client';
import { OrdersListView } from './OrdersListView';
import { useRedirectOn401 } from '../../../modules/shared/hooks/use-redirect-on-401';
import { qk } from '../../api/query-keys';

export type OrderRow = {
  id: string;
  userId: string;
  flashSaleId?: string | null;
  productId: string;
  quantity: number;
  createdAt: string;
};

type ListResponse = { orders: OrderRow[]; limit: number; offset: number };

export const OrdersListPage: React.FC = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const [limit, setLimit] = React.useState(20);
  const [offset, setOffset] = React.useState(0);

  const { data, isLoading, error, refetch, isFetching } = useQuery<ListResponse, Error, ListResponse>({
    queryKey: qk.orders.list(limit, offset),
    queryFn: () =>
      api.get<ListResponse>(`/orders/list?limit=${limit}&offset=${offset}`, {
        headers: token ? { 'x-auth-token': token } : undefined,
      }),
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  useRedirectOn401(error as any);

  const nextPage = () => setOffset((o) => o + limit);
  const prevPage = () => setOffset((o) => Math.max(0, o - limit));

  return (
    <OrdersListView
      loading={isLoading || isFetching}
      error={(error as any)?.message ?? null}
      orders={(data as ListResponse | undefined)?.orders ?? []}
      page={{ limit, offset, setLimit, nextPage, prevPage, refetch }}
    />
  );
};
