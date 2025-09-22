import { useMutation, useQuery } from '@tanstack/react-query';
import React from 'react';
import { useSelector } from 'react-redux';
import { api, type ApiError } from '../../../api/client';
import { toast } from 'react-toastify';
import type { RootState } from '../../../store';
import { FlashSalesListView, type FlashSale } from './FlashSalesListView';
import { Router } from '../../../../router';
import { qk } from '../../../api/query-keys';

type ListResponse = { flashSales: FlashSale[] };

export const FlashSalesListPage: React.FC = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const navigate = (name: 'Login') => Router.replace(name);
  const [orderingProductId, setOrderingProductId] = React.useState<string | null>(null);
  const { data, isLoading, error } = useQuery<ListResponse>({
    queryKey: qk.flashSales.list(),
    queryFn: () => api.get<ListResponse>('/flash-sales/list', {}),
    // Fetch once only
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const orderMutation = useMutation({
    mutationFn: async (productId: string) =>
      api.post<{ order: unknown }>(`/orders/${productId}/order`, undefined, {
        headers: token ? { 'x-auth-token': token } : undefined,
      }),
    onMutate: (productId) => setOrderingProductId(productId),
    onSuccess: (data: any) => {
      if (data && (data.queued || data.order)) {
        toast.success(data.queued ? 'Order queued' : 'Order placed');
      } else {
        toast.success('Order submitted');
      }
    },
    onError: (err) => {
      const isApiError = (v: unknown): v is ApiError =>
        !!v && typeof v === 'object' && 'status' in v && typeof (v as any).status === 'number';
      if (isApiError(err)) {
        // Friendly messages
        if (err.message === 'rate_limited' || err.status === 429) {
          toast.error('Too many requests. Please wait a moment and try again.');
        } else if (err.status === 401) {
          navigate('Login');
        } else if (err.status === 400) {
          toast.error("You're not allowed to order twice for the same flash sale.");
        } else {
          toast.error(err.message || 'Order failed. Please try again.');
        }
      } else {
        toast.error('Order failed. Please try again.');
      }
    },
    onSettled: () => setOrderingProductId(null),
  });

  const handleOrder = (productId: string) => {
    if (!token) {
      navigate('Login');
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
