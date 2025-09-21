import { useMutation, useQuery } from '@tanstack/react-query';
import React from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../../api/client';
import type { RootState } from '../../../store';
import { FlashSalesListView, type FlashSale } from './FlashSalesListView';
import { useNavigate } from 'react-router-dom';

type ListResponse = { flashSales: FlashSale[] };

export const FlashSalesListPage: React.FC = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const navigate = useNavigate();
  const [orderingProductId, setOrderingProductId] = React.useState<string | null>(null);
  const { data, isLoading, error } = useQuery<ListResponse>({
    queryKey: ['flash-sales-list'],
    queryFn: () => api.get<ListResponse>('/flash-sales/list', {}),
    // Fetch once only
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const orderMutation = useMutation({
    mutationFn: async (productId: string) =>
      api.post<{ order: unknown }>(`/orders/${productId}/order`, undefined, {
        headers: token ? { 'x-auth-token': token } : undefined,
      }),
    onMutate: (productId) => setOrderingProductId(productId),
    onSettled: () => setOrderingProductId(null),
  });

  const handleOrder = (productId: string) => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (orderingProductId) return; // prevent rapid double submit
    orderMutation.mutate(productId);
  };

  return (
    <FlashSalesListView
      sales={data?.flashSales ?? []}
      isLoading={isLoading}
      error={(error as any)?.message ?? null}
      onOrder={handleOrder}
      orderingProductId={orderingProductId}
    />
  );
};
