import { useMutation, useQuery } from '@tanstack/react-query';
import React from 'react';
import { useSelector } from 'react-redux';
import { api, type ApiError } from '../../../api/client';
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
    onError: (err) => {
      const isApiError = (v: unknown): v is ApiError =>
        !!v && typeof v === 'object' && 'status' in v && typeof (v as any).status === 'number';
      if (isApiError(err)) {
        // Friendly messages
        if (err.message === 'rate_limited' || err.status === 429) {
          alert(`Too many requests. Please wait a moment and try again.${err.traceId ? `\nRef: ${err.traceId}` : ''}`);
        } else if (err.status === 401) {
          navigate('/login');
        } else if (err.status === 400) {
          alert(`You're not allowed to order twice for the same flash sale.${err.traceId ? `\nRef: ${err.traceId}` : ''}`);
        } else {
          alert(`${err.message || 'Order failed. Please try again.'}${err.traceId ? `\nRef: ${err.traceId}` : ''}`);
        }
      } else {
        alert('Order failed. Please try again.');
      }
    },
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
